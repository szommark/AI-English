import { useEffect, useState } from 'react'
import { CheckCircle2, FileText, Headphones, Loader2, Trophy, X, XCircle } from 'lucide-react'
import StepView, { TextStep } from './StepView'
import FlagButton from './FlagButton'
import { learnerTurns } from './RoleplayStep'
import { useCourseCopy } from '../../data/courseCopy'
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis'
import {
  FLAGGABLE_TYPES,
  OPEN_TYPES,
  QUESTION_TYPES,
  countWords,
  isOpenAnswer,
  stepMax,
  stepScore,
  type CourseStep,
  type ModuleAnswers,
  type ModuleContent,
  type FlagReason,
  type FlagResult,
  type OpenFeedback,
  type RoleplayLine,
  type StepAnswer,
} from '../../lib/courses'

/** What the results screen shows after the last step. */
export interface PlayerResult {
  score: number
  max: number
  xp?: number
  unitCompleted?: boolean
  courseCompleted?: boolean
}

interface Props {
  title: string
  content: ModuleContent
  /** Seeds the shuffles, so tiles and options stay put across reloads. */
  seed: string
  initialStep?: number
  initialAnswers?: ModuleAnswers
  /** Autosave after each finished step. */
  onProgress?: (stepIndex: number, answers: ModuleAnswers) => void
  /** Called after the last step; resolves to the result to show (rejects: an error with a retry). */
  onFinish: (answers: ModuleAnswers) => Promise<PlayerResult>
  onExit: () => void
  /** Buttons under the result (next module, back to the course, restart…). */
  resultActions: (result: PlayerResult) => React.ReactNode
  /** Listening: the module's recording. */
  audioUrl?: string | null
  /** Writing/speaking: asks the AI to mark the answer (rejects with an error code). */
  onEvaluate?: (stepId: string, text: string) => Promise<OpenFeedback>
  /** Role-play: the Tutor Bot's next line. */
  onRoleplayTurn?: (stepId: string, history: RoleplayLine[]) => Promise<{ reply: string; done: boolean }>
  /** Flags an exercise: the AI checks it and returns the fixed exercise when it was wrong (students only). */
  onFlag?: (stepId: string, reason: FlagReason, note: string, answer: StepAnswer | undefined) => Promise<FlagResult>
}

function answered(step: CourseStep, answer: StepAnswer | undefined): boolean {
  if (answer === undefined) return false
  switch (step.type) {
    case 'choice':
      return typeof answer === 'number'
    case 'gap':
      return typeof answer === 'string' && answer.trim().length > 0
    case 'match':
      return Array.isArray(answer) && answer.length === step.pairs.length && (answer as number[]).every((x) => x >= 0)
    case 'order':
      return Array.isArray(answer) && answer.length > 0
    default:
      return true
  }
}

function rightAnswerText(step: CourseStep): string | null {
  if (step.type === 'choice') return step.options[step.answer]
  if (step.type === 'gap') return step.accepted[0]
  return null
}

/** The question steps right after a listen step: answered on one screen while the recording plays. */
function listenGroup(steps: CourseStep[], at: number): CourseStep[] {
  if (steps[at]?.type !== 'listen') return []
  const group: CourseStep[] = []
  for (let i = at + 1; i < steps.length && QUESTION_TYPES.has(steps[i].type); i++) group.push(steps[i])
  return group
}

/** A checked question's verdict, under the question (listening screen). */
function InlineResult({ step, answer }: { step: CourseStep; answer: StepAnswer | undefined }) {
  const { c } = useCourseCopy()
  const score = stepScore(step, answer)
  const full = score === stepMax(step)
  const right = rightAnswerText(step)
  const explain = 'explain' in step ? step.explain : undefined
  return (
    <div className={`mt-2 rounded-lg p-2.5 text-sm ${full ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-100' : 'bg-red-50 text-red-900 dark:bg-red-950/50 dark:text-red-100'}`}>
      <p className="flex items-center gap-1.5 font-semibold">
        {full ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
        {full ? c('correct') : step.type === 'match' && score > 0 ? c('partly', { n: score, m: stepMax(step) }) : c('notQuite')}
      </p>
      {!full && right && (
        <p className="mt-0.5">
          {c('rightAnswer')}: <span className="font-semibold">{right}</span>
        </p>
      )}
      {explain && <p className="mt-0.5 opacity-90">{explain}</p>}
    </div>
  )
}

/**
 * A module, one step per screen (mobile first): Check marks a question once and locks it,
 * Continue moves on and autosaves; after the last step the module is scored and the result
 * shown. Used by the student's player and the teacher's preview.
 */
export default function ModulePlayer({
  title,
  content,
  seed,
  initialStep = 0,
  initialAnswers = {},
  onProgress,
  onFinish,
  onExit,
  resultActions,
  audioUrl,
  onEvaluate,
  onRoleplayTurn,
  onFlag,
}: Props) {
  const { c } = useCourseCopy()
  const { speak } = useSpeechSynthesis()
  // Exercises the AI fixed after a flag replace the originals in this attempt.
  const [fixedSteps, setFixedSteps] = useState<Record<string, CourseStep>>({})
  const steps = content.steps.map((s) => fixedSteps[s.id] ?? s)
  const [index, setIndex] = useState(Math.min(initialStep, steps.length))
  const [answers, setAnswers] = useState<ModuleAnswers>(initialAnswers)
  const [checked, setChecked] = useState(false)
  const [textOpen, setTextOpen] = useState(false)
  const [result, setResult] = useState<PlayerResult | null>(null)
  const [finishing, setFinishing] = useState(false)
  const [finishError, setFinishError] = useState(false)
  const [audioOpen, setAudioOpen] = useState(false)
  const [marking, setMarking] = useState(false)
  const [markError, setMarkError] = useState<string | null>(null)

  const step = steps[index] as CourseStep | undefined
  // The Text button only once the text has been shown (modules without a text step: always).
  const textAt = steps.findIndex((s) => s.type === 'text')
  // "Listen again" once the recording has been played.
  const listenAt = steps.findIndex((s) => s.type === 'listen')
  const isQuestion = !!step && QUESTION_TYPES.has(step.type)
  const isOpen = !!step && OPEN_TYPES.has(step.type)
  const answer = step ? answers[step.id] : undefined
  const marked = isOpen && isOpenAnswer(answer)

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [index])

  async function finish(final: ModuleAnswers) {
    setFinishing(true)
    setFinishError(false)
    try {
      setResult(await onFinish(final))
    } catch {
      setFinishError(true)
    } finally {
      setFinishing(false)
    }
  }

  // Resuming at the end (everything answered, not yet scored).
  useEffect(() => {
    if (initialStep >= steps.length && steps.length > 0) void finish(initialAnswers)
    // Only on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function next() {
    // From the listening screen, past all of its questions.
    const nextIndex = index + 1 + listenGroup(steps, index).length
    setChecked(false)
    setTextOpen(false)
    setAudioOpen(false)
    setMarkError(null)
    if (nextIndex >= steps.length) {
      setIndex(steps.length)
      onProgress?.(steps.length, answers)
      void finish(answers)
      return
    }
    setIndex(nextIndex)
    onProgress?.(nextIndex, answers)
  }

  function flagControl(s: CourseStep) {
    if (!onFlag || !FLAGGABLE_TYPES.has(s.type)) return null
    return (
      <div className="pt-2">
        <FlagButton
          key={s.id}
          onFlag={async (reason, note) => {
            const result = await onFlag(s.id, reason, note, answers[s.id])
            if (result.step) setFixedSteps((prev) => ({ ...prev, [s.id]: result.step as CourseStep }))
            return result
          }}
        />
      </div>
    )
  }

  async function mark() {
    if (!step || !onEvaluate || typeof answer !== 'string') return
    setMarking(true)
    setMarkError(null)
    try {
      const feedback = await onEvaluate(step.id, answer.trim())
      setAnswers((prev) => ({ ...prev, [step.id]: { text: answer.trim(), ...feedback } }))
    } catch (err) {
      setMarkError((err as { code?: string })?.code === 'daily_limit' ? c('feedbackLimit') : c('feedbackError'))
    } finally {
      setMarking(false)
    }
  }

  function primary() {
    if (!step) return
    if (isQuestion && !checked) setChecked(true)
    else if (isOpen && !marked) void mark()
    else next()
  }

  if (index >= steps.length) {
    const pct = result && result.max ? Math.round((result.score / result.max) * 100) : 0
    return (
      <div className="mx-auto max-w-xl space-y-6 py-6 text-center">
        {finishing && (
          <p className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            {c('saving')}
          </p>
        )}
        {finishError && (
          <div className="space-y-3">
            <p className="text-red-600">{c('finishError')}</p>
            <button type="button" onClick={() => void finish(answers)} className="rounded-xl bg-[var(--teal-accent)] px-5 py-3 font-semibold text-primary">
              {c('tryAgain')}
            </button>
          </div>
        )}
        {result && (
          <>
            <Trophy className="mx-auto h-12 w-12 text-[var(--teal-accent-strong)]" />
            <div>
              <p className="text-sm uppercase tracking-wide text-muted-foreground">{title}</p>
              <h2 className="mt-1 text-2xl font-semibold text-foreground">{pct >= 80 ? c('resultGreat') : pct >= 50 ? c('resultGood') : c('resultKeepGoing')}</h2>
            </div>
            {result.max > 0 && (
              <p className="text-4xl font-bold text-foreground">
                {result.score}/{result.max}
                <span className="ml-2 text-lg font-medium text-muted-foreground">{pct}%</span>
              </p>
            )}
            {!!result.xp && <p className="font-semibold text-[var(--teal-accent-strong)]">{c('xpEarned', { n: result.xp })}</p>}
            {result.courseCompleted ? (
              <p className="rounded-xl bg-[var(--teal-accent-soft)] p-4 text-foreground">{c('courseDone')}</p>
            ) : result.unitCompleted ? (
              <p className="rounded-xl bg-[var(--teal-accent-soft)] p-4 text-foreground">{c('unitDone')}</p>
            ) : null}
            <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:justify-center">{resultActions(result)}</div>
          </>
        )}
      </div>
    )
  }

  if (!step) return null

  const group = listenGroup(steps, index)
  if (group.length > 0) {
    const unanswered = group.filter((s) => !answered(s, answers[s.id])).length
    return (
      <div className="mx-auto flex min-h-[calc(100dvh-9rem)] max-w-xl flex-col">
        <div className="flex items-center gap-3 py-2">
          <button type="button" onClick={onExit} aria-label={c('exit')} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary">
            <X className="h-5 w-5" />
          </button>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary" role="progressbar" aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={index}>
            <div className="h-full rounded-full bg-[var(--teal-accent)] transition-all" style={{ width: `${(index / steps.length) * 100}%` }} />
          </div>
        </div>
        <div className="sticky top-0 z-10 -mx-4 space-y-2 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
          <h2 className="text-lg font-semibold text-foreground">{c('listenAndAnswer')}</h2>
          {audioUrl ? <audio controls preload="auto" src={audioUrl} className="w-full" /> : <p className="text-sm text-red-600">{c('noRecording')}</p>}
        </div>
        <p className="pt-3 text-sm text-muted-foreground">{c('listenAndAnswerHint')}</p>
        <ol className="flex-1 space-y-6 py-4">
          {group.map((s, n) => (
            <li key={s.id} className="space-y-1">
              <p className="text-xs font-semibold text-[var(--teal-accent-strong)]">{c('questionN', { n: n + 1, m: group.length })}</p>
              <StepView
                step={s}
                answer={answers[s.id]}
                onAnswer={(a) => setAnswers((prev) => ({ ...prev, [s.id]: a }))}
                checked={checked}
                passage={content.passage}
                seed={seed}
                speak={(t) => speak(t)}
                audioUrl={audioUrl}
              />
              {checked && <InlineResult step={s} answer={answers[s.id]} />}
              {flagControl(s)}
            </li>
          ))}
        </ol>
        <div className="sticky bottom-0 -mx-4 space-y-2 border-t border-border bg-background/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
          {!checked && unanswered > 0 && <p className="text-xs text-muted-foreground">{c('unansweredLeft', { n: unanswered })}</p>}
          <button
            type="button"
            disabled={!checked && unanswered === group.length}
            onClick={() => (checked ? next() : setChecked(true))}
            className="w-full rounded-xl bg-[var(--teal-accent)] px-5 py-3.5 text-base font-semibold text-primary hover:bg-[var(--teal-accent-strong)] disabled:opacity-40"
          >
            {checked ? c('continue') : c('checkAll')}
          </button>
        </div>
      </div>
    )
  }

  const score = checked && isQuestion ? stepScore(step, answer) : 0
  const full = checked && isQuestion && score === stepMax(step)
  const right = rightAnswerText(step)
  // A written answer needs at least half the minimum length before it's worth an AI call.
  const longEnough =
    typeof answer === 'string' &&
    (step.type === 'write' ? countWords(answer) >= Math.ceil(step.minWords / 2) : step.type === 'roleplay' ? learnerTurns(answer) >= Math.min(2, step.turns) : answer.trim().length > 0)
  const canGo = isOpen ? marked || (!marking && longEnough) : !isQuestion || checked || answered(step, answer)
  const explain = 'explain' in step ? step.explain : undefined

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-9rem)] max-w-xl flex-col">
      <div className="flex items-center gap-3 py-2">
        <button type="button" onClick={onExit} aria-label={c('exit')} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary">
          <X className="h-5 w-5" />
        </button>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary" role="progressbar" aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={index}>
          <div className="h-full rounded-full bg-[var(--teal-accent)] transition-all" style={{ width: `${(index / steps.length) * 100}%` }} />
        </div>
        {audioUrl && listenAt >= 0 && index > listenAt && (
          <button
            type="button"
            onClick={() => setAudioOpen((v) => !v)}
            aria-pressed={audioOpen}
            className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-secondary"
          >
            <Headphones className="h-4 w-4" />
            {c('listenAgain')}
          </button>
        )}
        {content.passage && step.type !== 'text' && (textAt < 0 || index > textAt) && (
          <button
            type="button"
            onClick={() => setTextOpen(true)}
            className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-secondary"
          >
            <FileText className="h-4 w-4" />
            {c('showText')}
          </button>
        )}
      </div>
      {audioOpen && audioUrl && <audio controls autoPlay src={audioUrl} className="w-full" />}

      <form
        className="flex flex-1 flex-col"
        onSubmit={(e) => {
          e.preventDefault()
          if (canGo) primary()
        }}
      >
        <div className="flex-1 py-4">
          <StepView
            step={step}
            answer={answer}
            onAnswer={(a) => setAnswers((prev) => ({ ...prev, [step.id]: a }))}
            checked={checked}
            passage={content.passage}
            seed={seed}
            speak={(t) => speak(t)}
            audioUrl={audioUrl}
            onTurn={onRoleplayTurn ? (history) => onRoleplayTurn(step.id, history) : undefined}
          />
          {flagControl(step)}
        </div>

        <div className="sticky bottom-0 -mx-4 space-y-3 border-t border-border bg-background/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
          {checked && isQuestion && (
            <div
              role="status"
              className={`rounded-xl p-3 text-sm ${full ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-100' : 'bg-red-50 text-red-900 dark:bg-red-950/50 dark:text-red-100'}`}
            >
              <p className="flex items-center gap-2 font-semibold">
                {full ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                {full ? c('correct') : step.type === 'match' && score > 0 ? c('partly', { n: score, m: stepMax(step) }) : c('notQuite')}
              </p>
              {!full && right && (
                <p className="mt-1">
                  {c('rightAnswer')}: <span className="font-semibold">{right}</span>
                </p>
              )}
              {explain && <p className="mt-1 opacity-90">{explain}</p>}
            </div>
          )}
          {markError && (
            <p role="alert" className="text-sm text-red-600">
              {markError}
            </p>
          )}
          <button
            type="submit"
            disabled={!canGo}
            className="w-full rounded-xl bg-[var(--teal-accent)] px-5 py-3.5 text-base font-semibold text-primary hover:bg-[var(--teal-accent-strong)] disabled:opacity-40"
          >
            {marking ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {c('marking')}
              </span>
            ) : isQuestion && !checked ? (
              c('check')
            ) : isOpen && !marked ? (
              c('getFeedback')
            ) : index === steps.length - 1 ? (
              c('finish')
            ) : (
              c('continue')
            )}
          </button>
        </div>
      </form>

      {textOpen && content.passage && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background" role="dialog" aria-modal="true" aria-label={c('showText')}>
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="font-semibold text-foreground">{c('showText')}</span>
            <button type="button" onClick={() => setTextOpen(false)} aria-label={c('closeText')} className="rounded-lg p-2 hover:bg-secondary">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="mx-auto max-w-xl">
              <TextStep passage={content.passage} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
