// Asks a sequence of questions one by one (chat: typed; oral: read aloud and answered by voice),
// has the AI check each answer and drops the good ones into their time-frame column. A wrong
// answer gets a hint and one retry; a second miss shows a model answer. Used by the quick round
// and by story mode, which also passes the fact card and keeps missed lines in the columns.
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Lightbulb, Mic, Square, Volume2 } from 'lucide-react'
import { useLanguage, type MessageKey } from '../../../lib/i18n'
import { useSpeechRecognition } from '../../../hooks/useSpeechRecognition'
import { checkTenseGameAnswer, TenseGameCheckFailed, type TenseGameCheckError } from '../../../lib/tenseGameApi'
import type { QuestionOutcome } from '../../../lib/tenseGame'
import { TENSE_GAME_ANSWER_MAX_LENGTH, type TenseGameMode, type TenseGameVerdict } from '../../../data/tenseGameQuestions'
import type { TenseStoryId } from '../../../data/tenseStories'
import TimeColumns, { FRAME_LABEL, frameTotals, type GameQuestion, type PlacedAnswer } from './TimeColumns'
import ModelAnswer from './ModelAnswer'

/** retry = the first answer was wrong and the learner has one more go. */
type Status = 'answering' | 'checking' | 'retry' | 'correct' | 'missed'
export type GameError = TenseGameCheckError | 'no-speech'

export interface QuestionResult {
  question: GameQuestion
  outcome: QuestionOutcome
  /** The last answer sent for checking ('' when skipped). */
  answer: string
  corrected: string
  model: string
  /** Story mode: some answer to this question contradicted the fact card. */
  contradicted: boolean
}

export function placedAnswers(results: QuestionResult[], keepMissed: boolean): PlacedAnswer[] {
  return results
    .filter((r) => keepMissed || r.outcome !== 'missed')
    .map((r) => {
      const missed = r.outcome === 'missed'
      // A missed line shows the model answer the learner was given, so the story stays complete.
      return { question: r.question, answer: missed ? r.model : r.answer, corrected: r.corrected, secondTry: r.outcome === 'retry', missed }
    })
}

export const GAME_ERROR_MESSAGE: Record<GameError, MessageKey> = {
  daily_limit: 'tenseGameDailyLimit',
  failed: 'tenseGameError',
  'no-speech': 'tenseGameNoSpeech',
}

export default function QuestionRunner({
  questions,
  mode,
  label,
  speaker,
  speechRate,
  storyId,
  aside,
  speak,
  cancelSpeech,
  onQuit,
  onFinish,
  finishLabel,
}: {
  questions: GameQuestion[]
  mode: TenseGameMode
  /** Shown after the progress, e.g. the level or the story's title. */
  label: string
  /** Who asks, in a story (e.g. "Inspector Hart"). */
  speaker?: string
  speechRate: number
  storyId?: TenseStoryId
  /** Shown beside the question (the story's fact card). */
  aside?: ReactNode
  /** Text-to-speech, or undefined when the browser has none. */
  speak?: (text: string, options?: { rate?: number }) => void
  cancelSpeech: () => void
  onQuit: () => void
  onFinish: (results: QuestionResult[]) => void
  finishLabel: MessageKey
}) {
  const { lang, t } = useLanguage()
  const recognition = useSpeechRecognition()
  const [index, setIndex] = useState(0)
  const [status, setStatus] = useState<Status>('answering')
  const [attempt, setAttempt] = useState<1 | 2>(1)
  const [draft, setDraft] = useState('')
  /** The question index the current speech transcript belongs to (the hook keeps the last one). */
  const [listenedAt, setListenedAt] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState('')
  const [verdict, setVerdict] = useState<TenseGameVerdict | null>(null)
  const [contradicted, setContradicted] = useState(false)
  const [error, setError] = useState<GameError | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [showText, setShowText] = useState(false)
  const [results, setResults] = useState<QuestionResult[]>([])
  const [latestId, setLatestId] = useState<string | null>(null)
  // Bumped on skip / unmount so a late check result can't land in the wrong question.
  const requestRef = useRef(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const nextRef = useRef<HTMLButtonElement>(null)

  const question = questions[index]
  const answerText = mode === 'oral' ? (listenedAt === index ? recognition.transcript : '') : draft
  const canAnswer = status === 'answering' || status === 'retry'
  const isLast = index + 1 >= questions.length
  const keepMissed = Boolean(storyId)
  const lastResult = results[results.length - 1]

  useEffect(
    () => () => {
      requestRef.current++
      recognition.stop()
    },
    // Only on unmount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  // Oral mode reads each new question aloud.
  useEffect(() => {
    if (mode === 'oral') speak?.(question.text, { rate: speechRate })
    // Only a new question should be spoken; Listen again covers repeats.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index])

  useEffect(() => {
    if (canAnswer && mode === 'chat') inputRef.current?.focus()
    if (status === 'correct' || status === 'missed') nextRef.current?.focus()
  }, [index, status, canAnswer, mode])

  // A listening window that ended without any words.
  const wasListeningRef = useRef(false)
  useEffect(() => {
    if (wasListeningRef.current && !recognition.listening && listenedAt === index && !recognition.transcript.trim()) {
      setError('no-speech')
    }
    wasListeningRef.current = recognition.listening
  }, [recognition.listening, recognition.transcript, listenedAt, index])

  function record(result: QuestionResult) {
    setResults((prev) => [...prev, result])
    setLatestId(result.question.id)
  }

  function next() {
    recognition.stop()
    cancelSpeech()
    if (isLast) {
      onFinish(results)
      return
    }
    setIndex(index + 1)
    setStatus('answering')
    setAttempt(1)
    setDraft('')
    setListenedAt(null)
    setSubmitted('')
    setVerdict(null)
    setContradicted(false)
    setError(null)
    setShowHint(false)
    setShowText(false)
  }

  function startListening() {
    cancelSpeech()
    setError(null)
    setListenedAt(index)
    recognition.start()
  }

  async function submit(e?: FormEvent) {
    e?.preventDefault()
    const answer = answerText.trim()
    if (!canAnswer || !answer) return
    if (recognition.listening) recognition.stop()
    const token = ++requestRef.current
    const statusBefore = status
    setStatus('checking')
    setError(null)
    setSubmitted(answer)
    try {
      const result = await checkTenseGameAnswer({ questionId: question.id, answer, mode, lang, storyId })
      if (token !== requestRef.current) return
      setVerdict(result)
      const contradictedNow = contradicted || !result.factsOk
      setContradicted(contradictedNow)
      const base = { question, answer, corrected: result.corrected, model: result.model || question.sample, contradicted: contradictedNow }
      if (result.ok) {
        record({ ...base, outcome: attempt === 1 ? 'first-try' : 'retry' })
        setStatus('correct')
      } else if (attempt === 1) {
        setAttempt(2)
        setShowHint(true)
        // A new recording for the second go; the first one is quoted in the feedback.
        if (mode === 'oral') setListenedAt(null)
        setStatus('retry')
      } else {
        record({ ...base, outcome: 'missed' })
        setStatus('missed')
      }
    } catch (err) {
      if (token !== requestRef.current) return
      setError(err instanceof TenseGameCheckFailed ? err.reason : 'failed')
      setStatus(statusBefore)
    }
  }

  function skip() {
    if (!canAnswer) return
    recognition.stop()
    requestRef.current++
    setVerdict(null)
    setError(null)
    record({ question, outcome: 'missed', answer: '', corrected: '', model: question.sample, contradicted })
    setStatus('missed')
  }

  const questionVisible = mode === 'chat' || !speak || showText || status === 'correct' || status === 'missed'

  const card = (
    <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
          {t('tenseGameProgress', { n: index + 1, total: questions.length })} · {label}
        </p>
        <button type="button" onClick={onQuit} className="text-xs font-medium text-slate-400 hover:text-slate-600">
          {t('tenseGameQuit')}
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1">
          {speaker && <p className="text-xs font-semibold text-slate-400">{speaker}:</p>}
          {questionVisible ? (
            <p className="text-lg font-medium text-slate-800">{question.text}</p>
          ) : (
            <p className="text-sm italic text-slate-400">{t('tenseGameHiddenText')}</p>
          )}
        </div>
        {mode === 'oral' && speak && (
          <div className="flex shrink-0 gap-1">
            <button
              type="button"
              onClick={() => speak(question.text, { rate: speechRate })}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              <Volume2 className="h-3.5 w-3.5" aria-hidden />
              {t('tenseGameListen')}
            </button>
            {!questionVisible && (
              <button
                type="button"
                onClick={() => setShowText(true)}
                className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                {t('tenseGameShowText')}
              </button>
            )}
          </div>
        )}
      </div>

      {(canAnswer || status === 'checking') && (
        <div className="space-y-3">
          {mode === 'chat' ? (
            <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row">
              <input
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                maxLength={TENSE_GAME_ANSWER_MAX_LENGTH}
                disabled={status === 'checking'}
                placeholder={t('tenseGameAnswerPlaceholder')}
                aria-label={t('tenseGameAnswerPlaceholder')}
                className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 disabled:bg-slate-50"
              />
              <button
                type="submit"
                disabled={status === 'checking' || !draft.trim()}
                className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-amber-600 disabled:opacity-50"
              >
                {status === 'checking' ? t('tenseGameChecking') : t('tenseGameCheck')}
              </button>
            </form>
          ) : (
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={recognition.listening ? recognition.stop : startListening}
                  disabled={status === 'checking'}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-sm transition disabled:opacity-50 ${
                    recognition.listening ? 'bg-rose-500 text-white hover:bg-rose-600' : 'bg-amber-500 text-white hover:bg-amber-600'
                  }`}
                >
                  {recognition.listening ? <Square className="h-4 w-4" aria-hidden /> : <Mic className="h-4 w-4" aria-hidden />}
                  {recognition.listening ? t('tenseGameStopListening') : answerText ? t('tenseGameRecordAgain') : t('tenseGameSpeak')}
                </button>
                {answerText && !recognition.listening && (
                  <button
                    type="button"
                    onClick={() => submit()}
                    disabled={status === 'checking'}
                    className="rounded-full border border-amber-400 px-4 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-50 disabled:opacity-50"
                  >
                    {status === 'checking' ? t('tenseGameChecking') : t('tenseGameCheck')}
                  </button>
                )}
                {recognition.listening && <span className="text-xs text-rose-500 animate-pulse">{t('tenseGameListening')}</span>}
              </div>
              {answerText && (
                <p className="text-sm text-slate-700">
                  <span className="text-xs font-medium text-slate-400">{t('tenseGameYouSaid')}</span> {answerText}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 text-xs">
            {showHint ? (
              <span className="inline-flex items-center gap-1 text-amber-700">
                <Lightbulb className="h-3.5 w-3.5" aria-hidden />
                {t('tenseGameHintText', { focus: question.focus })}
              </span>
            ) : (
              <button type="button" onClick={() => setShowHint(true)} className="inline-flex items-center gap-1 font-medium text-slate-400 hover:text-amber-600">
                <Lightbulb className="h-3.5 w-3.5" aria-hidden />
                {t('tenseGameHint')}
              </button>
            )}
            <button type="button" onClick={skip} disabled={status === 'checking'} className="font-medium text-slate-400 hover:text-slate-600 disabled:opacity-50">
              {t('tenseGameSkip')}
            </button>
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-rose-600">
          {t(GAME_ERROR_MESSAGE[error])}
        </p>
      )}

      {status === 'retry' && verdict && (
        <div role="status" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 space-y-1">
          <p className="font-semibold">{t(verdict.factsOk ? 'tenseGameTryAgain' : 'tenseStoryCheckCard')}</p>
          <p>{verdict.feedback}</p>
          <p className="text-xs text-amber-800/80">
            <span className="font-medium">{t('tenseGameYourAnswer')}</span> {submitted}
          </p>
        </div>
      )}

      {status === 'correct' && verdict && (
        <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900 space-y-1">
          <p className="font-semibold">{t('tenseGameCorrect', { column: t(FRAME_LABEL[question.frame]) })}</p>
          <p>{verdict.feedback}</p>
        </div>
      )}

      {status === 'missed' && lastResult && (
        <div role="status" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900 space-y-1">
          {verdict && <p>{verdict.feedback}</p>}
          {submitted && verdict && (
            <p className="text-xs text-rose-800/80">
              <span className="font-medium">{t('tenseGameYourAnswer')}</span> {submitted}
            </p>
          )}
          <p className="font-semibold">{t('tenseGameMissed')}</p>
          <ModelAnswer text={lastResult.model} onListen={speak ? () => speak(lastResult.model) : undefined} />
        </div>
      )}

      {(status === 'correct' || status === 'missed') && (
        <button
          ref={nextRef}
          type="button"
          onClick={next}
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-amber-600"
        >
          {isLast ? t(finishLabel) : t('tenseGameNext')}
        </button>
      )}
    </div>
  )

  return (
    <div className="space-y-5">
      {aside ? (
        // The fact card comes first on a phone (it's needed for every answer), beside the question on a wide screen.
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <div className="min-w-0 lg:order-2">{aside}</div>
          <div className="min-w-0 lg:order-1">{card}</div>
        </div>
      ) : (
        card
      )}
      <TimeColumns placed={placedAnswers(results, keepMissed)} latestId={latestId} totals={frameTotals(questions)} />
    </div>
  )
}
