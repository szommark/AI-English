import { useMemo, useRef, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import type { Phoneme } from '../../data/phonemes'
import { anchorHighlight, type PhonemePractice } from '../../data/phonemePractice'
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis'
import { useLanguage } from '../../lib/i18n'
import { focusSoundResult } from '../../lib/phonemeLabels'
import { SOUND_CHECK_PREFIX } from '../../lib/pronunciationConfig'
import { recordPronunciationAttempt } from '../../lib/pronunciationProgressApi'
import { playSoundClip } from '../../lib/soundClip'
import type { PronunciationCheckResult } from '../../lib/types'
import { PRODUCTION_ASSESSMENT_ACCENT } from '../../lib/voiceSelection'
import ShadowingRunner, { type ShadowItem } from '../PronunciationPractice/ShadowingRunner'
import { HighlightedWord } from './PhonemeTile'
import SoundSheetCard, { ResultBars, SoundSymbol, StepMarkers } from './SoundSheetCard'
import { FocusSoundResultView, PractiseTooLinks, WordResultsView } from './SoundResults'

interface Stage {
  label: string
  items: ShadowItem[]
}

interface StageOutcome {
  score: number
  results: PronunciationCheckResult[]
}

const average = (scores: number[]) => scores.reduce((sum, s) => sum + s, 0) / scores.length

/**
 * The sheet's Pronunciation exercises as three sessions in the Wordlist practice format
 * (play → beep → repeat → result): Words (opening with the sound itself, said in the anchor word with
 * only the focus sound scored, then 3 words), Minimal pairs (3) and Sentence (1). Each session ends with
 * its own result; after the last comes the overall result: each session's bar with the other sounds that
 * went wrong in it underneath, and the sessions' average. Assessed and modelled in en-US, like every Azure check.
 */
export default function SoundPronunciationTab({
  phoneme,
  practice,
  soundItemId,
}: {
  phoneme: Phoneme
  practice: PhonemePractice
  /** The drill-funnel item this sound belongs to, if any: gets the production score and the sentence's XP. */
  soundItemId?: string
}) {
  const { t } = useLanguage()
  const tts = useSpeechSynthesis('female', PRODUCTION_ASSESSMENT_ACCENT)
  const highlight = anchorHighlight(practice, phoneme.exampleWords.map((ex) => ex.highlight))

  /** The session on screen; `stages.length` is the overall result. */
  const [current, setCurrent] = useState(0)
  const [outcomes, setOutcomes] = useState<Record<number, StageOutcome>>({})
  // The runner reports from a closure taken when its run started, so read the latest outcomes here.
  const outcomesRef = useRef<Record<number, StageOutcome>>({})
  /** Set when a session is opened from the previous one's Next button, so it starts playing at once. */
  const [autoStart, setAutoStart] = useState(false)
  const [round, setRound] = useState(0)

  const { stages, anchorItem } = useMemo(() => {
    const speakWord = (text: string) =>
      new Promise<void>((resolve) => {
        const fallback = setTimeout(resolve, text.length * 90 + 3000)
        tts.speak(text, {
          rate: 0.9,
          onEnd: () => {
            clearTimeout(fallback)
            resolve()
          },
        })
      })
    const anchor: ShadowItem = {
      text: practice.anchorWord,
      speaker: t('sndSoundItem'),
      display: (
        <span>
          /{phoneme.ipaSymbol}/{' '}
          <span className="font-normal text-muted-foreground">
            · <HighlightedWord word={practice.anchorWord} highlight={highlight} />
          </span>
        </span>
      ),
      play: async () => {
        await playSoundClip(phoneme.id).catch((err) => console.error('Sound clip failed:', err))
        await speakWord(practice.anchorWord)
      },
    }
    const list: Stage[] = [
      { label: t('sndStageWords'), items: [anchor, ...practice.words.map((word) => ({ text: word }))] },
      {
        label: t('sndStagePairs'),
        items: practice.minimalPairs.map(([a, b]) => ({ text: `${a}, ${b}`, display: `${a} – ${b}` })),
      },
      // The drill item's id makes the sentence count as its Deep Check (XP), as the old production stage did.
      { label: t('sndStageSentence'), items: [{ text: practice.sentence, checkId: soundItemId }] },
    ]
    return { stages: list, anchorItem: anchor }
    // tts.speak is stable per accent; t changes with the UI language.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phoneme, practice, soundItemId, t])

  function renderResult(item: ShadowItem, result: PronunciationCheckResult) {
    return item === anchorItem ? (
      <FocusSoundResultView result={result} focusId={phoneme.id} />
    ) : (
      <WordResultsView result={result} targetText={item.text} />
    )
  }

  function scoreOf(item: ShadowItem, result: PronunciationCheckResult) {
    if (item !== anchorItem) return result.scores.pronunciation
    const focus = focusSoundResult(result.words[0], phoneme.id)
    return focus ? (focus.heardAs ? 0 : focus.score) : result.scores.pronunciation
  }

  function handleStageFinished(stageIndex: number, results: PronunciationCheckResult[]) {
    if (results.length === 0) return
    const items = stages[stageIndex].items
    const outcome = { score: average(results.map((r, i) => scoreOf(items[i], r))), results }
    const next = { ...outcomesRef.current, [stageIndex]: outcome }
    outcomesRef.current = next
    setOutcomes(next)
    const done = stages.map((_, i) => next[i])
    if (soundItemId && done.every(Boolean)) {
      recordPronunciationAttempt(soundItemId, { productionScore: Math.round(average(done.map((o) => o.score))) }).catch(
        (err) => console.error('Failed to record pronunciation progress', err),
      )
    }
  }

  function goTo(stageIndex: number) {
    setAutoStart(stageIndex < stages.length)
    setCurrent(stageIndex)
  }

  function startOver() {
    outcomesRef.current = {}
    setOutcomes({})
    setAutoStart(false)
    setCurrent(0)
    setRound((r) => r + 1)
  }

  const showingOverall = current >= stages.length
  const finishedScores = stages.flatMap((_, i) => (outcomes[i] ? [outcomes[i].score] : []))

  return (
    <SoundSheetCard className="space-y-5">
      <SoundSymbol phonemeId={phoneme.id} ipaSymbol={phoneme.ipaSymbol} />
      <p className="text-sm text-muted-foreground">{t('sndPronIntro')}</p>

      <StepMarkers
        steps={stages.map((stage, i) => ({
          label: stage.label,
          done: Boolean(outcomes[i]),
          detail: outcomes[i] ? `${Math.round(outcomes[i].score)}%` : undefined,
        }))}
        current={current}
        finalLabel={t('sndOverall')}
      />

      {showingOverall ? (
        <ResultBars
          rows={stages.map((stage, i) => ({
            label: stage.label,
            score: outcomes[i]?.score ?? null,
            // The sounds that went wrong in this session, right under its bar.
            below: outcomes[i] && <PractiseTooLinks results={outcomes[i].results} focusId={phoneme.id} compact />,
          }))}
          overall={finishedScores.length > 0 ? average(finishedScores) : null}
        >
          <button
            type="button"
            onClick={startOver}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-secondary"
          >
            <RotateCcw className="h-4 w-4" />
            {t('pronRestart')}
          </button>
        </ResultBars>
      ) : (
        <ShadowingRunner
          key={`${round}/${current}`}
          items={stages[current].items}
          checkId={`${SOUND_CHECK_PREFIX}${phoneme.id}`}
          renderResult={renderResult}
          scoreOf={scoreOf}
          autoStart={autoStart}
          split
          finishedLabel={t('sndStageResult', { stage: stages[current].label })}
          onFinished={(results) => handleStageFinished(current, results)}
          renderFinished={() => (
            <button
              type="button"
              onClick={() => goTo(current + 1)}
              className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
            >
              {current + 1 < stages.length ? t('sndStageNext', { stage: stages[current + 1].label }) : t('sndToOverall')}
            </button>
          )}
        />
      )}
    </SoundSheetCard>
  )
}
