import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Check, Mic } from 'lucide-react'
import PageHeading from '../components/PageHeading'
import ExaminerSession from '../components/ExamSpeaking/ExaminerSession'
import SpeakingResults from '../components/ExamSpeaking/SpeakingResults'
import SpeakingTaskSheet from '../components/ExamSpeaking/SpeakingTaskSheet'
import { getExamPaperMeta } from '../data/exams/catalog'
import { getSpeakingExam, type SpeakingExam } from '../data/exams/speaking'
import type { ExamPaperMeta } from '../data/exams/types'
import { examPaperLabel } from '../lib/examLabels'
import { assessSpeakingExam } from '../lib/examSpeakingApi'
import {
  clearSpeakingAttempt,
  loadSpeakingAttempt,
  newSpeakingAttempt,
  saveSpeakingAttempt,
  type SpeakingAttempt,
} from '../lib/examSpeakingAttempt'
import { useLanguage } from '../lib/i18n'
import type { ChatMessage } from '../lib/types'

/** `/exams/:paperId/speaking`: a nyelvvizsga speaking exam with the AI examiner. */
export default function ExamSpeakingPage() {
  const { paperId } = useParams()
  const meta = paperId ? getExamPaperMeta(paperId) : undefined
  const exam = meta ? getSpeakingExam(meta.id) : undefined
  if (!meta || !exam) return <Navigate to={meta ? `/exams/${meta.id}` : '/exams'} replace />
  return <SpeakingRunner key={meta.id} meta={meta} exam={exam} />
}

function PrimaryButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="min-h-12 rounded-xl bg-primary px-6 text-base font-semibold text-primary-foreground hover:opacity-90">
      {children}
    </button>
  )
}

function SecondaryButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="min-h-12 rounded-xl border border-border bg-card px-6 text-base font-medium text-foreground hover:bg-muted">
      {children}
    </button>
  )
}

/** Time spent on a task so far, against roughly how long it takes in the exam. */
function Elapsed({ since, minutes }: { since: number; minutes: number }) {
  const { t } = useLanguage()
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  const sec = Math.max(0, Math.floor((now - since) / 1000))
  const time = `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`
  return (
    <span className={`text-sm tabular-nums ${sec > minutes * 60 ? 'text-amber-700' : 'text-muted-foreground'}`}>
      {t('exSpkElapsed', { time, n: minutes })}
    </span>
  )
}

function hasLearnerTurns(turns: ChatMessage[] | undefined): boolean {
  return !!turns?.some((m) => m.role === 'user')
}

function SpeakingRunner({ meta, exam }: { meta: ExamPaperMeta; exam: SpeakingExam }) {
  const { t, lang } = useLanguage()
  const [attempt, setAttempt] = useState<SpeakingAttempt>(() => {
    const saved = loadSpeakingAttempt(meta.id)
    if (!saved) return newSpeakingAttempt()
    // A saved task that is no longer in the exam: back to the overview.
    const view = saved.view
    return view.name === 'task' && !exam.tasks.some((x) => x.id === view.taskId) ? { ...saved, view: { name: 'overview' } } : saved
  })
  // The task the learner just clicked into: it starts by itself (speech needs a click first).
  const [autoStart, setAutoStart] = useState<string | null>(null)
  const [assessing, setAssessing] = useState(false)
  const [assessError, setAssessError] = useState<'failed' | 'empty' | null>(null)
  const title = examPaperLabel(t, meta)
  const language = meta.language

  useEffect(() => saveSpeakingAttempt(meta.id, attempt), [attempt, meta.id])

  const viewKey = JSON.stringify(attempt.view)
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [viewKey])

  const update = useCallback((fn: (a: SpeakingAttempt) => SpeakingAttempt) => setAttempt(fn), [])

  function openTask(taskId: string, start: boolean) {
    setAutoStart(start ? taskId : null)
    update((a) => ({
      ...a,
      view: { name: 'task', taskId },
      startedAt: a.startedAt[taskId] || !start ? a.startedAt : { ...a.startedAt, [taskId]: Date.now() },
    }))
  }

  async function assess(current: SpeakingAttempt) {
    if (!exam.tasks.some((task) => hasLearnerTurns(current.transcripts[task.id]))) {
      setAssessError('empty')
      return
    }
    setAssessError(null)
    setAssessing(true)
    try {
      const assessment = await assessSpeakingExam({ paperId: meta.id, transcripts: current.transcripts, uiLang: lang })
      update((a) => ({ ...a, assessment }))
    } catch (err) {
      console.error('Speaking exam assessment failed', err)
      setAssessError('failed')
    } finally {
      setAssessing(false)
    }
  }

  function finishExam() {
    update((a) => ({ ...a, view: { name: 'results' } }))
    if (!attempt.assessment) assess(attempt)
  }

  function startOver() {
    clearSpeakingAttempt(meta.id)
    setAssessError(null)
    setAutoStart(null)
    setAttempt(newSpeakingAttempt())
  }

  const firstOpen = exam.tasks.find((task) => !attempt.done.includes(task.id))
  const inProgress = exam.tasks.some((task) => (attempt.transcripts[task.id]?.length ?? 0) > 0)
  const totalMinutes = exam.tasks.reduce((n, task) => n + task.minutes, 0)

  // --- Overview: the whole speaking exam at once --------------------------------------
  if (attempt.view.name === 'overview') {
    return (
      <div className="space-y-6">
        <PageHeading title={title} subtitle={t('exSpeaking')} />
        <section className="space-y-3 rounded-2xl border border-border bg-card p-5 sm:p-6">
          <h2 className="font-semibold text-foreground">{t('exSpkOverviewTitle')}</h2>
          <p className="text-base leading-relaxed text-foreground">{t('exSpkHowItWorks')}</p>
          <p className="flex items-start gap-2 text-sm text-muted-foreground">
            <Mic className="mt-0.5 h-4 w-4 shrink-0" />
            {t('exSpkMicNote')}
          </p>
          <p className="text-sm font-medium text-foreground">{t('exSpeakingTaskCount', { n: exam.tasks.length, min: totalMinutes })}</p>
          <div className="flex flex-col gap-2 pt-1 sm:flex-row">
            {attempt.assessment ? (
              <PrimaryButton onClick={() => update((a) => ({ ...a, view: { name: 'results' } }))}>{t('exSpkResults')}</PrimaryButton>
            ) : firstOpen ? (
              <PrimaryButton onClick={() => openTask(firstOpen.id, true)}>{inProgress ? t('exContinue') : t('exSpkStart')}</PrimaryButton>
            ) : (
              <PrimaryButton onClick={finishExam}>{t('exSpkFinish')}</PrimaryButton>
            )}
            {inProgress && <SecondaryButton onClick={startOver}>{t('exStartOver')}</SecondaryButton>}
          </div>
        </section>
        <div className="space-y-4">
          {exam.tasks.map((task) => (
            <SpeakingTaskSheet key={task.id} task={task} language={language} compact headingLevel="h3" />
          ))}
        </div>
      </div>
    )
  }

  // --- Results ------------------------------------------------------------------------
  if (attempt.view.name === 'results') {
    return (
      <div className="space-y-6">
        <PageHeading title={title} subtitle={t('exSpkResults')} />
        {assessing && <p className="py-12 text-center text-muted-foreground" role="status">{t('exSpkAssessing')}</p>}
        {assessError && (
          <div className="space-y-3 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-800" role="alert">
            <p>{assessError === 'empty' ? t('exSpkNothingSaid') : t('exSpkAssessFailed')}</p>
            {assessError === 'failed' && <SecondaryButton onClick={() => assess(attempt)}>{t('exRetry')}</SecondaryButton>}
          </div>
        )}
        {attempt.assessment && (
          <SpeakingResults exam={exam} language={language} assessment={attempt.assessment} transcripts={attempt.transcripts} />
        )}
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            to={`/exams/${meta.id}`}
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-6 text-base font-semibold text-primary-foreground hover:opacity-90"
          >
            {t('exBackToExams')}
          </Link>
          {assessError === 'empty' && <SecondaryButton onClick={() => update((a) => ({ ...a, view: { name: 'overview' } }))}>{t('exSpkOverviewTitle')}</SecondaryButton>}
          <SecondaryButton onClick={startOver}>{t('exStartOver')}</SecondaryButton>
        </div>
      </div>
    )
  }

  // --- One task: its sheet next to the examiner ------------------------------------------
  const taskId = attempt.view.taskId
  const index = exam.tasks.findIndex((task) => task.id === taskId)
  const task = exam.tasks[index]
  if (!task) return null
  const done = attempt.done.includes(task.id)
  const next = exam.tasks.slice(index + 1).find((x) => !attempt.done.includes(x.id)) ?? exam.tasks.find((x) => !attempt.done.includes(x.id) && x.id !== task.id)

  return (
    <div className="space-y-5">
      <PageHeading title={title} subtitle={t('exSpeaking')} />

      <nav className="flex flex-wrap gap-2" aria-label={t('exSpkSteps')}>
        <button
          type="button"
          onClick={() => update((a) => ({ ...a, view: { name: 'overview' } }))}
          className="inline-flex min-h-11 items-center rounded-full border border-border bg-card px-4 text-sm font-medium text-foreground hover:bg-muted"
        >
          {t('exSpkOverviewTitle')}
        </button>
        {exam.tasks.map((x) => {
          const current = x.id === task.id
          return (
            <button
              key={x.id}
              type="button"
              aria-current={current ? 'step' : undefined}
              onClick={() => !current && openTask(x.id, false)}
              className={`inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-sm font-medium ${
                current ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-foreground hover:bg-muted'
              }`}
            >
              {attempt.done.includes(x.id) && <Check className="h-4 w-4" aria-label={t('exSubmitted')} />}
              {x.label}
            </button>
          )
        })}
      </nav>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start">
        <SpeakingTaskSheet task={task} language={language} />
        <div className="space-y-4 rounded-2xl border border-border bg-card p-4 sm:p-5 lg:sticky lg:top-4">
          {attempt.startedAt[task.id] && !done && <Elapsed since={attempt.startedAt[task.id]} minutes={task.minutes} />}
          <ExaminerSession
            key={task.id}
            paperId={meta.id}
            task={task}
            messages={attempt.transcripts[task.id] ?? []}
            done={done}
            autoStart={autoStart === task.id}
            onMessages={(messages) =>
              update((a) => ({
                ...a,
                transcripts: { ...a.transcripts, [task.id]: messages },
                startedAt: a.startedAt[task.id] ? a.startedAt : { ...a.startedAt, [task.id]: Date.now() },
              }))
            }
            onDone={() => update((a) => (a.done.includes(task.id) ? a : { ...a, done: [...a.done, task.id] }))}
          />
          {done && (
            <div className="flex flex-col gap-2">
              {next ? (
                <PrimaryButton onClick={() => openTask(next.id, true)}>{t('exSpkNextTask', { task: `${next.label}: ${next.title}` })}</PrimaryButton>
              ) : (
                <PrimaryButton onClick={finishExam}>{t('exSpkFinish')}</PrimaryButton>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
