import { useEffect, useRef, useState } from 'react'
import type { PronunciationSoundItem } from '../../data/pronunciationCurriculum'
import { accentToLangTag, type AccentPreference } from '../../lib/voiceSelection'
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis'
import { scoreDictation } from '../../lib/wordMatch'
import { recordPronunciationAttempt } from '../../lib/pronunciationProgressApi'
import type { PronunciationCheckResult } from '../../lib/types'
import DrillCard from './DrillCard'
import DrillControls from './DrillControls'
import ForcedChoiceStage from './ForcedChoiceStage'
import OddOneOutStage from './OddOneOutStage'
import DictationStage from './DictationStage'
import ProductionStage from './ProductionStage'
import StageSummary, { type RoundResult } from './StageSummary'
import SessionSummaryStage from './SessionSummaryStage'

type Stage =
  | 'intro'
  | 'forced-choice'
  | 'forced-choice-summary'
  | 'odd-one-out'
  | 'odd-one-out-summary'
  | 'dictation'
  | 'production'
  | 'session-summary'

const ROUNDS = 3
const DICTATION_MAX_PLAYS = 3
const ADVANCE_DELAY_MS = 800

const STAGE_INDEX: Record<Exclude<Stage, 'intro'>, number> = {
  'forced-choice': 0,
  'forced-choice-summary': 0,
  'odd-one-out': 1,
  'odd-one-out-summary': 1,
  dictation: 2,
  production: 3,
  'session-summary': 3,
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/** Fisher-Yates shuffle of [0, 1, ..., n-1] — used to randomize which on-screen slot holds
 * which original word, since the curriculum always authors the correct answer last. */
function shuffleIndices(n: number): number[] {
  const arr = Array.from({ length: n }, (_, i) => i)
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * Drives one sound item through the brief's fixed 4-stage funnel
 * (forced-choice → odd-one-out → dictation → production), with a tick/cross recap after each
 * multi-round stage and a combined score summary at the end. Perception score is the average
 * of the three free stages' accuracy ratios; production score comes straight from Azure's
 * overall pronunciation score. Both are recorded once, together, when production finishes —
 * see docs/pronunciation-session-brief.md.
 */
export default function DrillFunnel({
  soundItem,
  accent,
  hasPriorAttempt,
  onItemComplete,
}: {
  soundItem: PronunciationSoundItem
  accent: AccentPreference
  hasPriorAttempt: boolean
  onItemComplete: () => void
}) {
  const [stage, setStage] = useState<Stage>(hasPriorAttempt ? 'intro' : 'forced-choice')
  const [rate, setRate] = useState<1 | 0.75>(1)
  const synth = useSpeechSynthesis('female', accent)
  const locale = accentToLangTag(accent)

  const [fcRound, setFcRound] = useState(0)
  const [fcSpokenIndex, setFcSpokenIndex] = useState<0 | 1>(0)
  const [fcFeedback, setFcFeedback] = useState<{ chosenIndex: 0 | 1; correctIndex: 0 | 1 } | null>(null)
  const [fcResults, setFcResults] = useState<RoundResult[]>([])
  const fcCorrectRef = useRef(0)

  const [ooRound, setOoRound] = useState(0)
  const [ooOrder, setOoOrder] = useState<number[]>([0, 1, 2])
  const [ooFeedback, setOoFeedback] = useState<{ chosenIndex: 0 | 1 | 2; oddIndex: 0 | 1 | 2 } | null>(null)
  const [ooResults, setOoResults] = useState<RoundResult[]>([])
  const ooCorrectRef = useRef(0)

  const [dictationSentence] = useState(() => pickRandom(soundItem.dictationSentences))
  const [dictationPlaysRemaining, setDictationPlaysRemaining] = useState(DICTATION_MAX_PLAYS)
  const [dictationSubmitted, setDictationSubmitted] = useState(false)
  const [dictationStats, setDictationStats] = useState({ matched: 0, total: 0, keyMatched: 0, keyTotal: 0 })
  const dictationRatioRef = useRef(0)

  const [productionSentence] = useState(() => pickRandom(soundItem.productionSentences))
  const [productionResult, setProductionResult] = useState<PronunciationCheckResult | null>(null)

  const perceptionScoreRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    return () => synth.cancel()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Randomizes which word of the pair actually plays for the current forced-choice round.
  useEffect(() => {
    if (stage === 'forced-choice') setFcSpokenIndex(Math.random() < 0.5 ? 0 : 1)
  }, [stage, fcRound])

  // Randomizes which on-screen card (A/B/C) holds the target word — the curriculum always
  // authors it last (oddIndex: 2), so without this it'd always be card C.
  useEffect(() => {
    if (stage === 'odd-one-out') setOoOrder(shuffleIndices(3))
  }, [stage, ooRound])

  function replayForcedChoice() {
    synth.speak(soundItem.minimalPairs[fcRound].words[fcSpokenIndex], { rate })
  }

  function answerForcedChoice(choiceIndex: 0 | 1) {
    if (fcFeedback) return
    setFcFeedback({ chosenIndex: choiceIndex, correctIndex: fcSpokenIndex })
    const isCorrect = choiceIndex === fcSpokenIndex
    if (isCorrect) fcCorrectRef.current += 1
    setFcResults((r) => [...r, { word: soundItem.minimalPairs[fcRound].words[fcSpokenIndex], correct: isCorrect }])
    setTimeout(() => {
      if (fcRound < ROUNDS - 1) {
        setFcRound((r) => r + 1)
        setFcFeedback(null)
      } else {
        setStage('forced-choice-summary')
      }
    }, ADVANCE_DELAY_MS)
  }

  function playOddOneOut(displayIndex: 0 | 1 | 2) {
    const originalIndex = ooOrder[displayIndex]
    synth.speak(soundItem.oddOneOutSets[ooRound].words[originalIndex], { rate })
  }

  function answerOddOneOut(displayIndex: 0 | 1 | 2) {
    if (ooFeedback) return
    const originalOddIndex = soundItem.oddOneOutSets[ooRound].oddIndex
    const correctDisplayIndex = ooOrder.indexOf(originalOddIndex) as 0 | 1 | 2
    setOoFeedback({ chosenIndex: displayIndex, oddIndex: correctDisplayIndex })
    const isCorrect = displayIndex === correctDisplayIndex
    if (isCorrect) ooCorrectRef.current += 1
    setOoResults((r) => [...r, { word: soundItem.oddOneOutSets[ooRound].words[originalOddIndex], correct: isCorrect }])
    setTimeout(() => {
      if (ooRound < ROUNDS - 1) {
        setOoRound((r) => r + 1)
        setOoFeedback(null)
      } else {
        setStage('odd-one-out-summary')
      }
    }, ADVANCE_DELAY_MS)
  }

  function replayDictation() {
    if (dictationPlaysRemaining <= 0) return
    synth.speak(dictationSentence.text, { rate })
    setDictationPlaysRemaining((p) => p - 1)
  }

  function submitDictation(typed: string) {
    const { words, matchedCount, keyWordMatchedCount } = scoreDictation(dictationSentence.text, typed, dictationSentence.keyWords)
    dictationRatioRef.current = words.length > 0 ? matchedCount / words.length : 0
    setDictationStats({
      matched: matchedCount,
      total: words.length,
      keyMatched: keyWordMatchedCount,
      keyTotal: dictationSentence.keyWords.length,
    })
    setDictationSubmitted(true)
  }

  function continueFromDictation() {
    const perception = Math.round(
      ((fcCorrectRef.current / ROUNDS + ooCorrectRef.current / ROUNDS + dictationRatioRef.current) / 3) * 100,
    )
    perceptionScoreRef.current = perception
    setStage('production')
  }

  async function handleProductionResult(result: PronunciationCheckResult) {
    setProductionResult(result)
    const flaggedWords = result.words.filter((w) => w.errorType !== 'None').map((w) => w.word)
    try {
      await recordPronunciationAttempt(soundItem.id, {
        perceptionScore: perceptionScoreRef.current,
        productionScore: Math.round(result.scores.pronunciation),
        flaggedWords,
      })
    } catch (err) {
      console.error('Failed to record pronunciation progress', err)
    }
  }

  function replayProduction() {
    synth.speak(productionSentence, { rate })
  }

  if (stage === 'intro') {
    return (
      <DrillCard title={soundItem.title} titleHu={soundItem.titleHu}>
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Már gyakoroltad ezt a hangot. Kezded elölről, vagy egyből a kiejtésellenőrzésre ugrasz?
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setStage('forced-choice')}
              className="rounded-lg border border-rose-300 text-rose-700 text-sm font-medium px-4 py-2 hover:bg-rose-50"
            >
              Kezdés elölről
            </button>
            <button
              onClick={() => setStage('production')}
              className="rounded-lg bg-rose-600 text-white text-sm font-medium px-4 py-2 hover:bg-rose-700"
            >
              Ugrás a kiejtéshez
            </button>
          </div>
        </div>
      </DrillCard>
    )
  }

  return (
    <div className="space-y-4">
      <DrillCard title={soundItem.title} titleHu={soundItem.titleHu}>
        {stage === 'forced-choice' && (
          <ForcedChoiceStage
            words={soundItem.minimalPairs[fcRound].words}
            roundNumber={fcRound + 1}
            totalRounds={ROUNDS}
            feedback={fcFeedback}
            onReplay={replayForcedChoice}
            onAnswer={answerForcedChoice}
          />
        )}
        {stage === 'forced-choice-summary' && (
          <StageSummary title="Melyik szót hallottad?" results={fcResults} onContinue={() => setStage('odd-one-out')} />
        )}
        {stage === 'odd-one-out' && (
          <OddOneOutStage
            roundNumber={ooRound + 1}
            totalRounds={ROUNDS}
            feedback={ooFeedback}
            onPlay={playOddOneOut}
            onAnswer={answerOddOneOut}
          />
        )}
        {stage === 'odd-one-out-summary' && (
          <StageSummary title="Melyikben van a hang?" results={ooResults} onContinue={() => setStage('dictation')} />
        )}
        {stage === 'dictation' && (
          <DictationStage
            sentence={dictationSentence.text}
            keyWords={dictationSentence.keyWords}
            label={soundItem.dictationLabel}
            submitted={dictationSubmitted}
            onSubmit={submitDictation}
            onContinue={continueFromDictation}
            onReplay={replayDictation}
            replayLabel={`Lejátszás (${dictationPlaysRemaining} hátra)`}
            replayDisabled={dictationPlaysRemaining <= 0}
          />
        )}
        {stage === 'production' && (
          <ProductionStage
            soundItemId={soundItem.id}
            sentence={productionSentence}
            locale={locale}
            done={productionResult !== null}
            onResult={handleProductionResult}
            onContinue={() => setStage('session-summary')}
          />
        )}
        {stage === 'session-summary' && productionResult && (
          <SessionSummaryStage
            fcResults={fcResults}
            ooResults={ooResults}
            dictationStats={dictationStats}
            productionResult={productionResult}
            onFinish={onItemComplete}
          />
        )}
      </DrillCard>

      <DrillControls
        stageIndex={STAGE_INDEX[stage]}
        rate={rate}
        onSetRate={setRate}
        onReplay={stage === 'production' ? replayProduction : undefined}
      />
    </div>
  )
}
