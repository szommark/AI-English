import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../../lib/i18n'
import { finishTest, submitTestAnswer } from '../../lib/vocabPracticeApi'
import { testScore, type DrillCard, type ListTestScores, type TestResult } from '../../lib/vocab'
import Exercise, { type ExerciseOutcome, type Speech } from './Exercise'
import { FeedbackPanel, type Feedback } from './PracticeSession'
import ProgressBar from '../VocabLists/ProgressBar'

export interface TestSummary {
  /** From the server; when finishing failed, counted here from the answers instead. */
  result: TestResult
  /** False when finishing failed, so the score wasn't saved. */
  saved: boolean
  missed: DrillCard[]
}

/**
 * A Fast practice test (design §7.1): each word once, as recall, strictly — no hint, one
 * try, a typo is wrong. Answers are saved as they come; the server scores the test.
 */
export default function TestSession({
  testId,
  cards,
  speech,
  onFinish,
}: {
  testId: string
  cards: DrillCard[]
  speech: Speech
  onFinish: (summary: TestSummary) => void
}) {
  const { t } = useLanguage()
  const [index, setIndex] = useState(0)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const answers = useRef(new Map<string, boolean>())
  const nextRef = useRef<HTMLButtonElement>(null)
  /** Answers still being saved; finishing waits for them so the score counts them all. */
  const pending = useRef<Promise<void>[]>([])
  const [finishing, setFinishing] = useState(false)

  const card = cards[index]

  useEffect(() => {
    if (feedback) nextRef.current?.focus()
  }, [feedback])

  function handleDone(outcome: ExerciseOutcome) {
    answers.current.set(card.itemId, outcome.correct)
    setFeedback({ outcome, saving: true, saveFailed: false, completedLists: [] })
    const itemId = card.itemId
    const save = submitTestAnswer({ testId, itemId, correct: outcome.correct })
      .then(() => setFeedback((f) => f && { ...f, saving: false }))
      .catch((err) => {
        console.error('Failed to save test answer', { testId, itemId, err })
        setFeedback((f) => f && { ...f, saving: false, saveFailed: true })
      })
    pending.current.push(save)
  }

  /** Ending early is allowed: the words not reached count as wrong. */
  async function finish() {
    setFinishing(true)
    await Promise.allSettled(pending.current)
    const missed = cards.filter((c) => answers.current.get(c.itemId) !== true)
    try {
      onFinish({ result: await finishTest(testId), saved: true, missed })
    } catch (err) {
      console.error('Failed to finish test', { testId, err })
      const correct = cards.length - missed.length
      onFinish({ result: { correct, total: cards.length, score: testScore(correct, cards.length) }, saved: false, missed })
    }
  }

  function next() {
    if (index + 1 >= cards.length) {
      void finish()
      return
    }
    setFeedback(null)
    setIndex(index + 1)
  }

  if (!card) return null

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
          onClick={() => {
            if (window.confirm(t('vcTestConfirmEnd'))) void finish()
          }}
          disabled={finishing}
          className="text-xs text-muted-foreground hover:text-foreground hover:underline"
        >
          {t('vcEndSession')}
        </button>
      </div>

      <div className="space-y-5 rounded-2xl border border-border bg-card p-5 sm:p-6">
        <p className="text-xs font-medium text-muted-foreground">{t('vcTestRules')}</p>

        {feedback ? (
          <FeedbackPanel card={card} feedback={feedback} speech={speech} />
        ) : (
          <Exercise key={card.itemId} card={card} exercise="recall" speech={speech} strict onDone={handleDone} />
        )}

        {feedback && (
          <button
            ref={nextRef}
            type="button"
            onClick={next}
            disabled={finishing}
            className="rounded-lg bg-[var(--teal-accent)] px-5 py-2.5 text-sm font-semibold text-primary hover:bg-[var(--teal-accent-strong)] disabled:opacity-40"
          >
            {index + 1 >= cards.length ? t('vcTestSeeScore') : t('next')}
          </button>
        )}
      </div>
    </div>
  )
}

/** Last and best score of a list's tests, e.g. "Test: last 80% · best 90%". */
export function TestScoresLine({ tests }: { tests: ListTestScores | null }) {
  const { t } = useLanguage()
  if (!tests) return null
  return <span>{t('vcTestScores', { last: tests.last, best: tests.best })}</span>
}

/** The test's result: the score, then the words missed with their answers. */
export function TestSummaryCard({
  summary,
  listTitle,
  starting,
  onAgain,
  onDone,
}: {
  summary: TestSummary
  listTitle: string
  starting: boolean
  onAgain: () => void
  onDone: () => void
}) {
  const { t } = useLanguage()
  const { result, missed } = summary
  return (
    <div className="space-y-4 rounded-2xl border border-[var(--teal-accent-border)] bg-[var(--teal-accent-soft)] p-5">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground">{t('vcTestResultTitle')}</h2>
        <p className="break-words text-sm text-muted-foreground">{listTitle}</p>
      </div>
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span className="text-5xl font-semibold tabular-nums text-foreground">{result.score}%</span>
        <span className="text-sm text-muted-foreground">{t('vcTestCorrectOf', { correct: result.correct, total: result.total })}</span>
      </div>
      {!summary.saved && <p className="text-sm text-red-600">{t('vcTestSaveFailed')}</p>}
      {missed.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-foreground">{t('vcTestMissed')}</p>
          <ul className="space-y-1 text-sm">
            {missed.map((c) => (
              <li key={c.itemId} className="break-words">
                <span className="font-medium text-foreground">{c.term}</span>
                <span className="text-muted-foreground"> — {c.meaningHu}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onAgain}
          disabled={starting}
          className="rounded-lg bg-[var(--teal-accent)] px-5 py-2.5 text-sm font-semibold text-primary hover:bg-[var(--teal-accent-strong)] disabled:opacity-40"
        >
          {starting ? t('vcStarting') : t('vcTestAgain')}
        </button>
        <button
          type="button"
          onClick={onDone}
          disabled={starting}
          className="rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground hover:bg-secondary"
        >
          {t('vcClose')}
        </button>
      </div>
    </div>
  )
}
