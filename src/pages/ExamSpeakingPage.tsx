import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Check, ChevronRight, Mic } from 'lucide-react'
import PageHeading from '../components/PageHeading'
import ExaminerSession from '../components/ExamSpeaking/ExaminerSession'
import SpeakingPracticeRunner from '../components/ExamSpeaking/SpeakingPractice'
import SpeakingResults from '../components/ExamSpeaking/SpeakingResults'
import SpeakingTaskSheet from '../components/ExamSpeaking/SpeakingTaskSheet'
import { Elapsed, PrimaryButton, SecondaryButton, StepPill } from '../components/ExamSpeaking/SpeakingControls'
import { getExamPaperMeta } from '../data/exams/catalog'
import { getSpeakingExam, type SpeakingExam } from '../data/exams/speaking'
import type { ExamPaperMeta } from '../data/exams/types'
import { examPaperLabel } from '../lib/examLabels'
import { assessSpeakingExam } from '../lib/examSpeakingApi'
import {
  clearSpeakingAttempt,
  clearSpeakingPractice,
  loadSpeakingAttempt,
  loadSpeakingMode,
  loadSpeakingPractice,
  newSpeakingAttempt,
  newSpeakingPractice,
  saveSpeakingAttempt,
  saveSpeakingMode,
  saveSpeakingPractice,
  type SpeakingAttempt,
  type SpeakingPageMode,
} from '../lib/examSpeakingAttempt'
import { useLanguage } from '../lib/i18n'
import type { ChatMessage } from '../lib/types'

/**
 * `/exams/:paperId/speaking`: a nyelvvizsga speaking exam with the AI examiner — either the
 * whole exam in a row (exam mode) or each task on its own with a rehearsal and a test
 * (practice mode).
 */
export default function ExamSpeakingPage() {
  const { paperId } = useParams()
  const meta = paperId ? getExamPaperMeta(paperId) : undefined
  const exam = meta ? getSpeakingExam(meta.id) : undefined
  if (!meta || !exam) return <Navigate to={meta ? `/exams/${meta.id}` : '/exams'} replace />
  return <SpeakingPage key={meta.id} meta={meta} exam={exam} />
}

function hasLearnerTurns(turns: ChatMessage[] | undefined): boolean {
  return !!turns?.some((m) => m.role === 'user')
}

/** Where a saved exam attempt picks up: its first unfinished task, or the results. */
function resumeExam(attempt: SpeakingAttempt, exam: SpeakingExam): { attempt: SpeakingAttempt; autoStart: string | null } {
  const view = attempt.view
  if (view.name === 'results' || (view.name === 'task' && exam.tasks.some((x) => x.id === view.taskId))) return { attempt, autoStart: null }
  const firstOpen = exam.tasks.find((task) => !attempt.done.includes(task.id))
  if (!firstOpen) return { attempt: { ...attempt, view: { name: 'results' } }, autoStart: null }
  return {
    attempt: {
      ...attempt,
      view: { name: 'task', taskId: firstOpen.id },
      startedAt: attempt.startedAt[firstOpen.id] ? attempt.startedAt : { ...attempt.startedAt, [firstOpen.id]: Date.now() },
    },
    autoStart: firstOpen.id,
  }
}

function SpeakingPage({ meta, exam }: { meta: ExamPaperMeta; exam: SpeakingExam }) {
  const { t } = useLanguage()
  const [mode, setModeState] = useState<SpeakingPageMode | null>(() => {
    const saved = loadSpeakingMode(meta.id)
    if (saved === 'exam' && !loadSpeakingAttempt(meta.id)) return null
    if (saved === 'practice' && !loadSpeakingPractice(meta.id)) return null
    return saved
  })
  // The exam task the learner just clicked into: it starts by itself (speech needs a click first).
  const [examAutoStart, setExamAutoStart] = useState<string | null>(null)
  const title = examPaperLabel(t, meta)

  function setMode(next: SpeakingPageMode | null) {
    saveSpeakingMode(meta.id, next)
    setModeState(next)
    window.scrollTo({ top: 0 })
  }

  function startExam(fresh: boolean) {
    if (fresh) clearSpeakingAttempt(meta.id)
    const { attempt, autoStart } = resumeExam((!fresh && loadSpeakingAttempt(meta.id)) || newSpeakingAttempt(), exam)
    saveSpeakingAttempt(meta.id, attempt)
    setExamAutoStart(autoStart)
    setMode('exam')
  }

  function startPractice(taskId: string) {
    const saved = loadSpeakingPractice(meta.id)
    saveSpeakingPractice(meta.id, saved ? { ...saved, taskId, tab: 'rehearsal' } : newSpeakingPractice(taskId))
    setMode('practice')
  }

  if (mode === 'exam') {
    return <SpeakingRunner meta={meta} exam={exam} title={title} initialAutoStart={examAutoStart} onExit={() => setMode(null)} />
  }
  if (mode === 'practice') {
    return <SpeakingPracticeRunner paperId={meta.id} title={title} language={meta.language} exam={exam} onExit={() => setMode(null)} />
  }
  return <SpeakingIntro meta={meta} exam={exam} title={title} onExam={startExam} onPractice={startPractice} />
}

// --- Intro: the speaking exam at a glance, and the choice of mode ------------------------
function SpeakingIntro({
  meta,
  exam,
  title,
  onExam,
  onPractice,
}: {
  meta: ExamPaperMeta
  exam: SpeakingExam
  title: string
  onExam: (fresh: boolean) => void
  onPractice: (taskId: string) => void
}) {
  const { t } = useLanguage()
  const [savedExam, setSavedExam] = useState(() => loadSpeakingAttempt(meta.id))
  const [savedPractice, setSavedPractice] = useState(() => loadSpeakingPractice(meta.id))
  const examInProgress = !!savedExam && (Object.values(savedExam.transcripts).some((m) => m.length > 0) || !!savedExam.assessment)
  const practised = (taskId: string) => !!savedPractice?.runs[`${taskId}:test`]?.assessment
  const totalMinutes = exam.tasks.reduce((n, task) => n + task.minutes, 0)

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
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <section className="flex flex-col rounded-2xl border border-border bg-card p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-foreground">{t('exModeExam')}</h2>
          <p className="mt-2 flex-1 text-sm text-muted-foreground">{t('exSpkModeExamDesc')}</p>
          {examInProgress && <p className="mt-3 text-sm font-medium text-sky-800">{t('exSavedProgress')}</p>}
          <div className="mt-4 flex flex-col gap-2">
            <PrimaryButton onClick={() => onExam(false)}>
              {savedExam?.assessment ? t('exSpkResults') : examInProgress ? t('exContinue') : t('exSpkStart')}
            </PrimaryButton>
            {examInProgress && (
              <SecondaryButton
                onClick={() => {
                  clearSpeakingAttempt(meta.id)
                  setSavedExam(null)
                }}
              >
                {t('exStartOver')}
              </SecondaryButton>
            )}
          </div>
        </section>

        <section className="flex flex-col rounded-2xl border border-border bg-card p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-foreground">{t('exModePractice')}</h2>
          <p className="mt-2 flex-1 text-sm text-muted-foreground">{t('exSpkModePracticeDesc')}</p>
          <ul className="mt-4 space-y-2">
            {exam.tasks.map((task) => (
              <li key={task.id}>
                <button
                  type="button"
                  onClick={() => onPractice(task.id)}
                  className="group flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border border-border px-4 py-2 text-left transition-colors hover:border-sky-200 hover:bg-sky-50"
                >
                  <span className="flex items-center gap-2 text-base text-foreground">
                    {practised(task.id) && <Check className="h-4 w-4 text-emerald-600" aria-label={t('exSubmitted')} />}
                    <span>
                      {task.label}: <span lang={meta.language}>{task.title}</span>
                    </span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-sky-700 transition-transform group-hover:translate-x-0.5" />
                </button>
              </li>
            ))}
          </ul>
          {savedPractice && (
            <div className="mt-2">
              <button
                type="button"
                onClick={() => {
                  clearSpeakingPractice(meta.id)
                  setSavedPractice(null)
                }}
                className="min-h-11 text-sm font-medium text-muted-foreground underline-offset-2 hover:underline"
              >
                {t('exStartOver')}
              </button>
            </div>
          )}
        </section>
      </div>

      <div className="space-y-4">
        {exam.tasks.map((task) => (
          <SpeakingTaskSheet key={task.id} task={task} language={meta.language} compact headingLevel="h3" />
        ))}
      </div>
    </div>
  )
}

// --- Exam mode: every task in a row, then the assessment --------------------------------
function SpeakingRunner({
  meta,
  exam,
  title,
  initialAutoStart,
  onExit,
}: {
  meta: ExamPaperMeta
  exam: SpeakingExam
  title: string
  initialAutoStart: string | null
  onExit: () => void
}) {
  const { t, lang } = useLanguage()
  const [attempt, setAttempt] = useState<SpeakingAttempt>(() => resumeExam(loadSpeakingAttempt(meta.id) ?? newSpeakingAttempt(), exam).attempt)
  const [autoStart, setAutoStart] = useState<string | null>(initialAutoStart)
  const [assessing, setAssessing] = useState(false)
  const [assessError, setAssessError] = useState<'failed' | 'empty' | null>(null)
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

  // Results reached without an assessment (every task closed, or a reload mid-request).
  const assessStartedRef = useRef(false)
  useEffect(() => {
    if (attempt.view.name !== 'results' || attempt.assessment || assessStartedRef.current) return
    assessStartedRef.current = true
    assess(attempt)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt.view.name])

  function finishExam() {
    update((a) => ({ ...a, view: { name: 'results' } }))
  }

  function startOver() {
    clearSpeakingAttempt(meta.id)
    onExit()
  }

  // --- Results ------------------------------------------------------------------------
  if (attempt.view.name !== 'task') {
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
          <SecondaryButton onClick={onExit}>{t('exSpkOverviewTitle')}</SecondaryButton>
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
      <PageHeading title={title} subtitle={`${t('exSpeaking')} · ${t('exModeExam')}`} />

      <nav className="flex flex-wrap gap-2" aria-label={t('exSpkSteps')}>
        <StepPill onClick={onExit}>{t('exSpkOverviewTitle')}</StepPill>
        {exam.tasks.map((x) => (
          <StepPill key={x.id} current={x.id === task.id} onClick={() => x.id !== task.id && openTask(x.id, false)}>
            {attempt.done.includes(x.id) && <Check className="h-4 w-4" aria-label={t('exSubmitted')} />}
            {x.label}
          </StepPill>
        ))}
      </nav>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start">
        <SpeakingTaskSheet task={task} language={language} />
        <div className="space-y-4 rounded-2xl border border-border bg-card p-4 sm:p-5 lg:sticky lg:top-20">
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
