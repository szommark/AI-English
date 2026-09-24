import { useEffect, useMemo, useRef, useState } from 'react'
import { useLanguage } from '../../lib/i18n'
import { submitReview } from '../../lib/vocabPracticeApi'
import { chooseExercise } from '../../lib/vocabPractice'
import type { PracticeCard } from '../../lib/vocab'
import Exercise, { type ExerciseOutcome, type Speech } from './Exercise'
import ProgressBar from '../VocabLists/ProgressBar'
import { SpeakerIcon } from '../icons/AudioIcons'

export interface SessionSummary {
  reviewed: number
  correct: number
  newStarted: number
  learned: number
  completedLists: string[]
  saveFailures: number
}

interface Feedback {
  outcome: ExerciseOutcome
  saving: boolean
  saveFailed: boolean
  completedLists: string[]
}

/**
 * Runs one practice session over a fixed queue of cards (design §7): an exercise per
 * card, chosen from its ladder step; each answer is posted for scheduling right away.
 */
export default function PracticeSession({
  cards,
  speech,
  onFinish,
}: {
  cards: PracticeCard[]
  speech: Speech
  onFinish: (summary: SessionSummary) => void
}) {
  const { t } = useLanguage()
  const [index, setIndex] = useState(0)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const summary = useRef<SessionSummary>({ reviewed: 0, correct: 0, newStarted: 0, learned: 0, completedLists: [], saveFailures: 0 })
  const nextRef = useRef<HTMLButtonElement>(null)
  /** Reviews still being saved; the summary waits for them so its counts are complete. */
  const pending = useRef<Promise<void>[]>([])
  const [finishing, setFinishing] = useState(false)

  const card = cards[index]
  const exercise = useMemo(() => chooseExercise(card, speech.supported), [card, speech.supported])

  useEffect(() => {
    if (feedback) nextRef.current?.focus()
  }, [feedback])

  function handleDone(outcome: ExerciseOutcome) {
    const s = summary.current
    s.reviewed += 1
    if (outcome.correct) s.correct += 1
    if (card.state === 0) s.newStarted += 1
    setFeedback({ outcome, saving: true, saveFailed: false, completedLists: [] })

    const cardId = card.cardId
    const save = submitReview({
      cardId,
      exercise,
      correct: outcome.correct,
      usedHint: outcome.usedHint,
      responseMs: Math.round(outcome.responseMs),
    })
      .then((result) => {
        if (result.learnedNow) s.learned += 1
        s.completedLists.push(...result.completedLists)
        setFeedback((f) => f && { ...f, saving: false, completedLists: result.completedLists })
      })
      .catch((err) => {
        console.error('Failed to save vocab review', { cardId, err })
        s.saveFailures += 1
        setFeedback((f) => f && { ...f, saving: false, saveFailed: true })
      })
    pending.current.push(save)
  }

  async function finish() {
    setFinishing(true)
    await Promise.allSettled(pending.current)
    onFinish({ ...summary.current })
  }

  function next() {
    if (index + 1 >= cards.length) {
      void finish()
      return
    }
    setFeedback(null)
    setIndex(index + 1)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <ProgressBar value={index + (feedback ? 1 : 0)} max={cards.length} />
        </div>
        <span className="text-xs tabular-nums text-muted-foreground">
          {index + 1} / {cards.length}
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
        {card.state === 0 && (
          <span className="inline-block rounded-md bg-[var(--teal-accent-soft)] px-2 py-0.5 text-xs font-medium text-[var(--teal-accent-strong)]">
            {t('vcNewTag')}
          </span>
        )}

        {feedback ? (
          <FeedbackPanel card={card} feedback={feedback} speech={speech} />
        ) : (
          <Exercise key={card.cardId} card={card} exercise={exercise} speech={speech} onDone={handleDone} />
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

function FeedbackPanel({ card, feedback, speech }: { card: PracticeCard; feedback: Feedback; speech: Speech }) {
  const { t } = useLanguage()
  const { check } = feedback.outcome
  const tone =
    check === 'exact'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
      : check === 'typo'
        ? 'border-amber-200 bg-amber-50 text-amber-800'
        : 'border-red-200 bg-red-50 text-red-800'

  return (
    <div className="space-y-4" aria-live="polite">
      <div className={`rounded-xl border px-4 py-3 text-sm font-medium ${tone}`}>
        {check === 'exact' ? t('vcCorrect') : check === 'typo' ? t('vcTypo') : t('vcWrong')}
      </div>
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-2xl font-semibold text-foreground">{card.term}</p>
          {speech.supported && (
            <button
              type="button"
              onClick={() => speech.speak(card.term)}
              aria-label={t('vcPlay')}
              className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-secondary"
            >
              <SpeakerIcon className="h-4 w-4" />
            </button>
          )}
        </div>
        {card.meaningHu && <p className="text-foreground">{card.meaningHu}</p>}
        {card.exampleEn && <p className="text-sm italic text-muted-foreground">{card.exampleEn}</p>}
      </div>
      {feedback.completedLists.map((title) => (
        <p key={title} className="rounded-xl bg-[var(--teal-accent-soft)] px-4 py-3 text-sm font-medium text-foreground" role="status">
          🎉 {t('vcListCompleted', { title })}
        </p>
      ))}
      {feedback.saveFailed && <p className="text-sm text-red-600">{t('vcSaveFailed')}</p>}
    </div>
  )
}
