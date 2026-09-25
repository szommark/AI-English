import { useEffect, useRef, useState } from 'react'
import { useLanguage, type MessageKey } from '../../lib/i18n'
import { finishDrill, submitDrillAnswer } from '../../lib/vocabPracticeApi'
import { DRILL_ROUNDS, drillQueue } from '../../lib/vocabPractice'
import type { DrillCard, PracticeExercise } from '../../lib/vocab'
import Exercise, { type ExerciseOutcome, type Speech } from './Exercise'
import { FeedbackPanel, type Feedback } from './PracticeSession'
import ProgressBar from '../VocabLists/ProgressBar'

export const ROUND_LABEL: Record<PracticeExercise, MessageKey> = {
  recognition: 'vcRoundRecognition',
  recall: 'vcRoundRecall',
  context: 'vcRoundContext',
  listening: 'vcRoundListening',
}

export interface DrillSummary {
  words: number
  /** Answers per exercise type, for the rounds that ran. */
  rounds: { exercise: PracticeExercise; correct: number; total: number }[]
  saveFailures: number
}

/**
 * Fast practice (design §7.1): every exercise for every chosen word, round by round.
 * Answers are recorded for the run but never reschedule a card.
 */
export default function DrillSession({
  runId,
  cards,
  speech,
  onFinish,
}: {
  runId: string
  cards: DrillCard[]
  speech: Speech
  onFinish: (summary: DrillSummary) => void
}) {
  const { t } = useLanguage()
  // Fixed for the whole run: reshuffling on a re-render would jump around.
  const [queue] = useState(() => drillQueue(cards, speech.supported))
  const [index, setIndex] = useState(0)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const results = useRef(new Map<PracticeExercise, { correct: number; total: number }>())
  const saveFailures = useRef(0)
  const nextRef = useRef<HTMLButtonElement>(null)
  /** Answers still being saved; the summary waits for them. */
  const pending = useRef<Promise<void>[]>([])
  const [finishing, setFinishing] = useState(false)

  const step = queue[index]
  const roundCount = new Set(queue.map((s) => s.round)).size
  const roundNumber = step ? new Set(queue.slice(0, index + 1).map((s) => s.round)).size : roundCount

  useEffect(() => {
    if (feedback) nextRef.current?.focus()
  }, [feedback])

  function handleDone(outcome: ExerciseOutcome) {
    const r = results.current.get(step.exercise) ?? { correct: 0, total: 0 }
    r.total += 1
    if (outcome.correct) r.correct += 1
    results.current.set(step.exercise, r)
    setFeedback({ outcome, saving: true, saveFailed: false, completedLists: [] })

    const itemId = step.card.itemId
    const save = submitDrillAnswer({
      runId,
      itemId,
      exercise: step.exercise,
      correct: outcome.correct,
      usedHint: outcome.usedHint,
      responseMs: Math.round(outcome.responseMs),
    })
      .then(() => setFeedback((f) => f && { ...f, saving: false }))
      .catch((err) => {
        console.error('Failed to save fast practice answer', { runId, itemId, err })
        saveFailures.current += 1
        setFeedback((f) => f && { ...f, saving: false, saveFailed: true })
      })
    pending.current.push(save)
  }

  async function finish() {
    setFinishing(true)
    await Promise.allSettled(pending.current)
    // Only marks the run's end time; the answers are already saved.
    await finishDrill(runId).catch((err) => console.error('Failed to finish fast practice run', { runId, err }))
    onFinish({
      words: cards.length,
      rounds: DRILL_ROUNDS.flatMap((exercise) => {
        const r = results.current.get(exercise)
        return r ? [{ exercise, ...r }] : []
      }),
      saveFailures: saveFailures.current,
    })
  }

  function next() {
    if (index + 1 >= queue.length) {
      void finish()
      return
    }
    setFeedback(null)
    setIndex(index + 1)
  }

  // No exercise can run (no meanings, no sentences, no speech): nothing to show.
  useEffect(() => {
    if (queue.length === 0) void finish()
    // Once, on mount.
  }, [])
  if (!step) return null

  const newRound = index > 0 && queue[index - 1].round !== step.round && !feedback

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <ProgressBar value={index + (feedback ? 1 : 0)} max={queue.length} />
        </div>
        <span className="text-xs tabular-nums text-muted-foreground">
          {index + 1} / {queue.length}
        </span>
        <button
          type="button"
          onClick={() => void finish()}
          disabled={finishing}
          className="text-xs text-muted-foreground hover:text-foreground hover:underline"
        >
          {t('vcEndSession')}
        </button>
      </div>

      <div className="space-y-5 rounded-2xl border border-border bg-card p-5 sm:p-6">
        <p className={`text-xs font-medium ${newRound ? 'text-[var(--teal-accent-strong)]' : 'text-muted-foreground'}`}>
          {t('vcRoundOf', { n: roundNumber, total: roundCount })} · {t(ROUND_LABEL[step.exercise])}
        </p>

        {feedback ? (
          <FeedbackPanel card={step.card} feedback={feedback} speech={speech} />
        ) : (
          <Exercise
            key={`${step.card.itemId}-${step.exercise}`}
            card={step.card}
            exercise={step.exercise}
            speech={speech}
            onDone={handleDone}
          />
        )}

        {feedback && (
          <button
            ref={nextRef}
            type="button"
            onClick={next}
            disabled={finishing}
            className="rounded-lg bg-[var(--teal-accent)] px-5 py-2.5 text-sm font-semibold text-primary hover:bg-[var(--teal-accent-strong)]"
          >
            {t('next')}
          </button>
        )}
      </div>
    </div>
  )
}
