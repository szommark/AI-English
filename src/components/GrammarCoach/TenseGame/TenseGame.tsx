// Grammar Coach "Past · Present · Future" game: a question about the past, the present or the
// future is asked (read in chat mode, heard in oral mode); the learner answers about their own
// life, the AI checks the tense, and a good answer drops into that time frame's column together
// with the question. A wrong answer gets a hint and one retry; a second miss shows a model answer.
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Lightbulb, MessageSquare, Mic, Square, Volume2 } from 'lucide-react'
import { useLanguage } from '../../../lib/i18n'
import { useSpeechRecognition } from '../../../hooks/useSpeechRecognition'
import { useSpeechSynthesis } from '../../../hooks/useSpeechSynthesis'
import { getAccentPreference, type AccentPreference } from '../../../lib/voiceSelection'
import { awardClientXp } from '../../../lib/gamificationApi'
import { checkTenseGameAnswer, TenseGameCheckFailed, type TenseGameCheckError } from '../../../lib/tenseGameApi'
import { buildRound, roundScore, type QuestionOutcome } from '../../../lib/tenseGame'
import {
  TENSE_GAME_ANSWER_MAX_LENGTH,
  TENSE_GAME_LEVELS,
  type TenseGameLevel,
  type TenseGameMode,
  type TenseGameQuestion,
  type TenseGameVerdict,
} from '../../../data/tenseGameQuestions'
import TimeColumns, { FRAME_LABEL, type PlacedAnswer } from './TimeColumns'

type Phase = 'setup' | 'playing' | 'done'
/** retry = the first answer was wrong and the learner has one more go. */
type Status = 'answering' | 'checking' | 'retry' | 'correct' | 'missed'
type GameError = TenseGameCheckError | 'no-speech'

interface MissedQuestion {
  question: TenseGameQuestion
  answer: string
  model: string
}

const PREFS_KEY = 'aiEnglish:tenseGame'

function loadPrefs(): { mode: TenseGameMode; level: TenseGameLevel } {
  try {
    const raw = JSON.parse(window.localStorage.getItem(PREFS_KEY) ?? '{}') as Record<string, unknown>
    return {
      mode: raw.mode === 'oral' ? 'oral' : 'chat',
      level: TENSE_GAME_LEVELS.includes(raw.level as TenseGameLevel) ? (raw.level as TenseGameLevel) : 'A2',
    }
  } catch {
    return { mode: 'chat', level: 'A2' }
  }
}

function savePrefs(prefs: { mode: TenseGameMode; level: TenseGameLevel }) {
  try {
    window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
  } catch {
    // A remembered choice is a convenience only.
  }
}

function readAccent(): AccentPreference {
  try {
    return getAccentPreference()
  } catch {
    return 'gb'
  }
}

export default function TenseGame() {
  const { lang, t } = useLanguage()
  const recognition = useSpeechRecognition()
  const [accent] = useState(readAccent)
  const synth = useSpeechSynthesis('female', accent)
  const [prefs] = useState(loadPrefs)
  const [mode, setMode] = useState<TenseGameMode>(prefs.mode)
  const [level, setLevel] = useState<TenseGameLevel>(prefs.level)
  const playMode: TenseGameMode = mode === 'oral' && recognition.supported ? 'oral' : 'chat'

  const [phase, setPhase] = useState<Phase>('setup')
  const [round, setRound] = useState<TenseGameQuestion[]>([])
  const [index, setIndex] = useState(0)
  const [status, setStatus] = useState<Status>('answering')
  const [attempt, setAttempt] = useState<1 | 2>(1)
  const [draft, setDraft] = useState('')
  /** The question index the current speech transcript belongs to (the hook keeps the last one). */
  const [listenedAt, setListenedAt] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState('')
  const [verdict, setVerdict] = useState<TenseGameVerdict | null>(null)
  const [error, setError] = useState<GameError | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [showText, setShowText] = useState(false)
  const [outcomes, setOutcomes] = useState<QuestionOutcome[]>([])
  const [placed, setPlaced] = useState<PlacedAnswer[]>([])
  const [missed, setMissed] = useState<MissedQuestion[]>([])
  const [latestId, setLatestId] = useState<string | null>(null)
  const lastRoundIdsRef = useRef<string[]>([])
  // Bumped on quit / new round so a late check result can't land in the wrong question.
  const requestRef = useRef(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const nextRef = useRef<HTMLButtonElement>(null)

  const question = round[index] as TenseGameQuestion | undefined
  const answerText = playMode === 'oral' ? (listenedAt === index ? recognition.transcript : '') : draft
  const canAnswer = status === 'answering' || status === 'retry'
  const { speak, cancel: cancelSpeech } = synth
  const canSpeak = synth.supported

  useEffect(() => () => cancelSpeech(), [cancelSpeech])

  // Oral mode reads each new question aloud.
  useEffect(() => {
    if (phase === 'playing' && playMode === 'oral' && question) speak(question.text, { rate: level === 'A1' || level === 'A2' ? 0.9 : 1 })
    // Only a new question should be spoken; Listen again covers repeats.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, index, round])

  useEffect(() => {
    if (phase !== 'playing') return
    if (canAnswer && playMode === 'chat') inputRef.current?.focus()
    if (status === 'correct' || status === 'missed') nextRef.current?.focus()
  }, [phase, index, status, canAnswer, playMode])

  // A listening window that ended without any words.
  const wasListeningRef = useRef(false)
  useEffect(() => {
    if (wasListeningRef.current && !recognition.listening && listenedAt === index && !recognition.transcript.trim()) {
      setError('no-speech')
    }
    wasListeningRef.current = recognition.listening
  }, [recognition.listening, recognition.transcript, listenedAt, index])

  function resetQuestion() {
    setStatus('answering')
    setAttempt(1)
    setDraft('')
    setListenedAt(null)
    setSubmitted('')
    setVerdict(null)
    setError(null)
    setShowHint(false)
    setShowText(false)
  }

  function startRound() {
    requestRef.current++
    savePrefs({ mode, level })
    setRound(buildRound(level, lastRoundIdsRef.current))
    setIndex(0)
    setOutcomes([])
    setPlaced([])
    setMissed([])
    setLatestId(null)
    resetQuestion()
    setPhase('playing')
  }

  function quit() {
    requestRef.current++
    recognition.stop()
    cancelSpeech()
    setPhase('setup')
  }

  function finishRound(finalOutcomes: QuestionOutcome[]) {
    lastRoundIdsRef.current = round.map((q) => q.id)
    setPhase('done')
    awardClientXp({ activityType: 'grammar-coach.exercise', itemRef: `tense-game/${level}`, performanceScore: roundScore(finalOutcomes) })
  }

  function next() {
    recognition.stop()
    cancelSpeech()
    if (index + 1 >= round.length) {
      finishRound(outcomes)
      return
    }
    setIndex(index + 1)
    resetQuestion()
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
    if (!question || !canAnswer || !answer) return
    if (recognition.listening) recognition.stop()
    const token = ++requestRef.current
    const statusBefore = status
    setStatus('checking')
    setError(null)
    setSubmitted(answer)
    try {
      const result = await checkTenseGameAnswer({ questionId: question.id, answer, mode: playMode, lang })
      if (token !== requestRef.current) return
      setVerdict(result)
      if (result.ok) {
        setPlaced((prev) => [...prev, { question, answer, corrected: result.corrected, secondTry: attempt === 2 }])
        setLatestId(question.id)
        setOutcomes((prev) => [...prev, attempt === 1 ? 'first-try' : 'retry'])
        setStatus('correct')
      } else if (attempt === 1) {
        setAttempt(2)
        setShowHint(true)
        // A new recording for the second go; the first one is quoted in the feedback.
        if (playMode === 'oral') setListenedAt(null)
        setStatus('retry')
      } else {
        setMissed((prev) => [...prev, { question, answer, model: result.model || question.sample }])
        setOutcomes((prev) => [...prev, 'missed'])
        setStatus('missed')
      }
    } catch (err) {
      if (token !== requestRef.current) return
      setError(err instanceof TenseGameCheckFailed ? err.reason : 'failed')
      setStatus(statusBefore)
    }
  }

  function skip() {
    if (!question || !canAnswer) return
    recognition.stop()
    requestRef.current++
    setVerdict(null)
    setError(null)
    setMissed((prev) => [...prev, { question, answer: '', model: question.sample }])
    setOutcomes((prev) => [...prev, 'missed'])
    setStatus('missed')
  }

  if (phase === 'setup') {
    return (
      <div className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-5">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-slate-800">{t('tenseGameTitle')}</h2>
          <p className="text-sm text-slate-500">{t('tenseGameIntro')}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {(['chat', 'oral'] as const).map((option) => {
            const disabled = option === 'oral' && !recognition.supported
            const selected = playMode === option
            const Icon = option === 'chat' ? MessageSquare : Mic
            return (
              <button
                key={option}
                type="button"
                aria-pressed={selected}
                disabled={disabled}
                onClick={() => setMode(option)}
                className={`flex items-start gap-3 rounded-lg border p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  selected ? 'border-amber-400 bg-amber-50 ring-1 ring-amber-300' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${selected ? 'text-amber-600' : 'text-slate-400'}`} aria-hidden />
                <span>
                  <span className="block text-sm font-semibold text-slate-800">
                    {t(option === 'chat' ? 'tenseGameModeChat' : 'tenseGameModeOral')}
                  </span>
                  <span className="block text-xs text-slate-500">
                    {disabled ? t('tenseGameOralUnsupported') : t(option === 'chat' ? 'tenseGameModeChatDesc' : 'tenseGameModeOralDesc')}
                  </span>
                </span>
              </button>
            )
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t('tenseGameLevel')}</span>
          {TENSE_GAME_LEVELS.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={level === option}
              onClick={() => setLevel(option)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                level === option ? 'border-amber-400 bg-amber-100 text-amber-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={startRound}
          className="rounded-lg bg-amber-500 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-amber-600"
        >
          {t('tenseGameStart')}
        </button>
      </div>
    )
  }

  if (phase === 'done') {
    return (
      <div className="space-y-5">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-slate-800">{t('tenseGameDoneTitle')}</h2>
            <p className="text-sm text-slate-600">{t('tenseGameDoneScore', { n: placed.length, total: round.length })}</p>
          </div>
          {missed.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t('tenseGameMissedList')}</p>
              <ul className="space-y-2">
                {missed.map((m) => (
                  <li key={m.question.id} className="rounded-lg border border-slate-200 p-2.5">
                    <p className="text-xs text-slate-500">
                      {t(FRAME_LABEL[m.question.frame])} · {m.question.text}
                    </p>
                    <ModelAnswer text={m.model} onListen={canSpeak ? () => speak(m.model) : undefined} />
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={startRound}
              className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-amber-600"
            >
              {t('tenseGamePlayAgain')}
            </button>
            <button
              type="button"
              onClick={() => setPhase('setup')}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              {t('tenseGameChangeSettings')}
            </button>
          </div>
        </div>
        <TimeColumns placed={placed} latestId={null} />
      </div>
    )
  }

  if (!question) return null
  const questionVisible = playMode === 'chat' || !canSpeak || showText || status === 'correct' || status === 'missed'
  const isLast = index + 1 >= round.length

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
            {t('tenseGameProgress', { n: index + 1, total: round.length })} · {level}
          </p>
          <button type="button" onClick={quit} className="text-xs font-medium text-slate-400 hover:text-slate-600">
            {t('tenseGameQuit')}
          </button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          {questionVisible ? (
            <p className="min-w-0 flex-1 text-lg font-medium text-slate-800">{question.text}</p>
          ) : (
            <p className="min-w-0 flex-1 text-sm italic text-slate-400">{t('tenseGameHiddenText')}</p>
          )}
          {playMode === 'oral' && canSpeak && (
            <div className="flex shrink-0 gap-1">
              <button
                type="button"
                onClick={() => speak(question.text, { rate: level === 'A1' || level === 'A2' ? 0.9 : 1 })}
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
            {playMode === 'chat' ? (
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
              <button
                type="button"
                onClick={skip}
                disabled={status === 'checking'}
                className="font-medium text-slate-400 hover:text-slate-600 disabled:opacity-50"
              >
                {t('tenseGameSkip')}
              </button>
            </div>
          </div>
        )}

        {error && (
          <p role="alert" className="text-sm text-rose-600">
            {t(error === 'daily_limit' ? 'tenseGameDailyLimit' : error === 'no-speech' ? 'tenseGameNoSpeech' : 'tenseGameError')}
          </p>
        )}

        {status === 'retry' && verdict && (
          <div role="status" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 space-y-1">
            <p className="font-semibold">{t('tenseGameTryAgain')}</p>
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

        {status === 'missed' && (
          <div role="status" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900 space-y-1">
            {verdict && <p>{verdict.feedback}</p>}
            {submitted && verdict && (
              <p className="text-xs text-rose-800/80">
                <span className="font-medium">{t('tenseGameYourAnswer')}</span> {submitted}
              </p>
            )}
            <p className="font-semibold">{t('tenseGameMissed')}</p>
            <ModelAnswer
              text={missed[missed.length - 1]?.model ?? question.sample}
              onListen={canSpeak ? () => speak(missed[missed.length - 1]?.model ?? question.sample) : undefined}
            />
          </div>
        )}

        {(status === 'correct' || status === 'missed') && (
          <button
            ref={nextRef}
            type="button"
            onClick={next}
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-amber-600"
          >
            {isLast ? t('tenseGameFinish') : t('tenseGameNext')}
          </button>
        )}
      </div>

      <TimeColumns placed={placed} latestId={latestId} />
    </div>
  )
}

function ModelAnswer({ text, onListen }: { text: string; onListen?: () => void }) {
  const { t } = useLanguage()
  return (
    <p className="flex items-center gap-2 text-sm font-medium text-slate-800">
      <span className="min-w-0 break-words">{text}</span>
      {onListen && (
        <button
          type="button"
          onClick={onListen}
          aria-label={t('tenseGameListenModel')}
          title={t('tenseGameListenModel')}
          className="shrink-0 rounded-full p-1 text-indigo-600 hover:bg-indigo-50"
        >
          <Volume2 className="h-4 w-4" aria-hidden />
        </button>
      )}
    </p>
  )
}
