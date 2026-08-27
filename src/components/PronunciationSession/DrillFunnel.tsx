import { useEffect, useRef, useState } from 'react'
import type { PronunciationSoundItem } from '../../data/pronunciationCurriculum'
import { accentToLangTag, type AccentPreference } from '../../lib/voiceSelection'
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis'
import { matchWords } from '../../lib/wordMatch'
import { recordPronunciationAttempt } from '../../lib/pronunciationProgressApi'
import type { PronunciationCheckResult } from '../../lib/types'
import DrillCard from './DrillCard'
import DrillControls from './DrillControls'
import ForcedChoiceStage from './ForcedChoiceStage'
import OddOneOutStage from './OddOneOutStage'
import DictationStage from './DictationStage'
import ProductionStage from './ProductionStage'

type Stage = 'intro' | 'forced-choice' | 'odd-one-out' | 'dictation' | 'production'

const ROUNDS = 3
const DICTATION_MAX_PLAYS = 3
const ADVANCE_DELAY_MS = 800

const STAGE_INDEX: Record<Exclude<Stage, 'intro'>, number> = {
  'forced-choice': 0,
  'odd-one-out': 1,
  dictation: 2,
  production: 3,
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * Drives one sound item through the brief's fixed 4-stage funnel
 * (forced-choice → odd-one-out → dictation → production). Perception score is the
 * average of the three free stages' accuracy ratios; production score comes straight
 * from Azure's overall pronunciation score. Both are recorded once, together, when
 * production finishes — see docs/pronunciation-session-brief.md.
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
  const fcCorrectRef = useRef(0)

  const [ooRound, setOoRound] = useState(0)
  const [ooFeedback, setOoFeedback] = useState<{ chosenIndex: 0 | 1 | 2; oddIndex: 0 | 1 | 2 } | null>(null)
  const ooCorrectRef = useRef(0)

  const [dictationSentence] = useState(() => pickRandom(soundItem.dictationSentences))
  const [dictationPlaysRemaining, setDictationPlaysRemaining] = useState(DICTATION_MAX_PLAYS)
  const [dictationSubmitted, setDictationSubmitted] = useState(false)
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

  function replayForcedChoice() {
    synth.speak(soundItem.minimalPairs[fcRound].words[fcSpokenIndex], { rate })
  }

  function answerForcedChoice(choiceIndex: 0 | 1) {
    if (fcFeedback) return
    setFcFeedback({ chosenIndex: choiceIndex, correctIndex: fcSpokenIndex })
    if (choiceIndex === fcSpokenIndex) fcCorrectRef.current += 1
    setTimeout(() => {
      if (fcRound < ROUNDS - 1) {
        setFcRound((r) => r + 1)
        setFcFeedback(null)
      } else {
        setStage('odd-one-out')
      }
    }, ADVANCE_DELAY_MS)
  }

  function playOddOneOut(index: 0 | 1 | 2) {
    synth.speak(soundItem.oddOneOutSets[ooRound].words[index], { rate })
  }

  function answerOddOneOut(index: 0 | 1 | 2) {
    if (ooFeedback) return
    const oddIndex = soundItem.oddOneOutSets[ooRound].oddIndex
    setOoFeedback({ chosenIndex: index, oddIndex })
    if (index === oddIndex) ooCorrectRef.current += 1
    setTimeout(() => {
      if (ooRound < ROUNDS - 1) {
        setOoRound((r) => r + 1)
        setOoFeedback(null)
      } else {
        setStage('dictation')
      }
    }, ADVANCE_DELAY_MS)
  }

  function replayDictation() {
    if (dictationPlaysRemaining <= 0) return
    synth.speak(dictationSentence, { rate })
    setDictationPlaysRemaining((p) => p - 1)
  }

  function submitDictation(typed: string) {
    const matches = matchWords(dictationSentence, typed)
    dictationRatioRef.current = matches.length > 0 ? matches.filter((m) => m.matched).length / matches.length : 0
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
    try {
      await recordPronunciationAttempt(soundItem.id, {
        perceptionScore: perceptionScoreRef.current,
        productionScore: Math.round(result.scores.pronunciation),
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
            onAnswer={answerForcedChoice}
          />
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
        {stage === 'dictation' && (
          <DictationStage
            sentence={dictationSentence}
            submitted={dictationSubmitted}
            onSubmit={submitDictation}
            onContinue={continueFromDictation}
          />
        )}
        {stage === 'production' && (
          <ProductionStage
            soundItemId={soundItem.id}
            sentence={productionSentence}
            locale={locale}
            done={productionResult !== null}
            onResult={handleProductionResult}
            onFinish={onItemComplete}
          />
        )}
      </DrillCard>

      <DrillControls
        stageIndex={STAGE_INDEX[stage]}
        rate={rate}
        onSetRate={setRate}
        onReplay={
          stage === 'forced-choice'
            ? replayForcedChoice
            : stage === 'dictation'
              ? replayDictation
              : stage === 'production'
                ? replayProduction
                : undefined
        }
        replayLabel={stage === 'dictation' ? `Lejátszás (${dictationPlaysRemaining} hátra)` : 'Lejátszás'}
        replayDisabled={stage === 'dictation' && dictationPlaysRemaining <= 0}
      />
    </div>
  )
}
