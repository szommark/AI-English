import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Check, Headphones } from 'lucide-react'
import PageHeading from '../components/PageHeading'
import ExamSummary from '../components/Exam/ExamSummary'
import SectionResults from '../components/Exam/SectionResults'
import SectionView from '../components/Exam/SectionView'
import { getExamPaperMeta, loadExamPaper } from '../data/exams/catalog'
import type { ExamPaper, ExamSection } from '../data/exams/types'
import { clearAttempt, loadAttempt, newAttempt, saveAttempt, type ExamAttempt, type ExamMode } from '../lib/examAttempt'
import { examPaperLabel } from '../lib/examLabels'
import { answerKey, scorePaper, scoreSection, type AnswerValue } from '../lib/examScoring'
import { useLanguage } from '../lib/i18n'

export default function ExamPaperPage() {
  const { paperId } = useParams()
  const meta = paperId ? getExamPaperMeta(paperId) : undefined
  if (!meta) return <Navigate to="/exams" replace />
  return <PaperLoader key={meta.id} id={meta.id} />
}

function PaperLoader({ id }: { id: string }) {
  const { t } = useLanguage()
  const [paper, setPaper] = useState<ExamPaper | null>(null)
  const [failed, setFailed] = useState(false)
  const [reload, setReload] = useState(0)

  useEffect(() => {
    let cancelled = false
    setFailed(false)
    loadExamPaper(id)
      .then((p) => !cancelled && setPaper(p))
      .catch((err) => {
        console.error('Failed to load exam paper', { id, err })
        if (!cancelled) setFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [id, reload])

  if (failed) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700" role="alert">
        <p>{t('exLoadFailed')}</p>
        <button type="button" onClick={() => setReload((n) => n + 1)} className="mt-3 min-h-11 rounded-lg border border-rose-300 bg-white px-4 font-medium">
          {t('exRetry')}
        </button>
      </div>
    )
  }
  if (!paper) return <div className="flex items-center justify-center py-24 text-muted-foreground">{t('loading')}</div>
  return <ExamRunner paper={paper} />
}

function sectionDeadline(section: ExamSection, attempt: ExamAttempt): number | undefined {
  if (attempt.mode !== 'exam' || section.timeLimitMin === undefined) return undefined
  // A listening section's clock starts with its recording (which includes the reading time).
  const start = section.audio ? attempt.audioStartedAt[section.id] : attempt.sectionStartedAt[section.id]
  return start === undefined ? undefined : start + section.timeLimitMin * 60_000
}

/** Exam mode: start a non-listening section's clock when it is opened. */
function enterSection(attempt: ExamAttempt, section: ExamSection): ExamAttempt {
  const view = { name: 'section' as const, sectionId: section.id }
  if (attempt.mode !== 'exam' || section.audio || attempt.sectionStartedAt[section.id] !== undefined) return { ...attempt, view }
  return { ...attempt, view, sectionStartedAt: { ...attempt.sectionStartedAt, [section.id]: Date.now() } }
}

function ExamRunner({ paper }: { paper: ExamPaper }) {
  const { t } = useLanguage()
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null)
  const title = examPaperLabel(t, paper)

  // Keep the attempt in sessionStorage until it is finished.
  useEffect(() => {
    if (!attempt) return
    if (attempt.view.name === 'summary') clearAttempt(paper.id, attempt.mode)
    else saveAttempt(paper.id, attempt)
  }, [attempt, paper.id])

  const viewKey = attempt ? JSON.stringify(attempt.view) : 'intro'
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [viewKey])

  const update = useCallback((fn: (a: ExamAttempt) => ExamAttempt) => setAttempt((a) => (a ? fn(a) : a)), [])

  function start(mode: ExamMode, fresh: boolean) {
    const saved = fresh ? null : loadAttempt(paper.id, mode)
    if (fresh) clearAttempt(paper.id, mode)
    setAttempt(saved ?? enterSection(newAttempt(mode, paper.sections[0].id), paper.sections[0]))
  }

  const submit = useCallback(
    (sectionId: string, reason?: 'timeUp' | 'recordingEnded') =>
      update((a) => {
        // A timer or the recording may fire after a manual submit; ignore it then.
        if (a.view.name !== 'section' || a.view.sectionId !== sectionId || a.submitted.includes(sectionId)) return a
        return { ...a, submitted: [...a.submitted, sectionId], view: { name: 'result', sectionId, reason } }
      }),
    [update],
  )

  const onAnswer = useCallback(
    (taskId: string, itemId: string, value: AnswerValue) =>
      update((a) => ({ ...a, answers: { ...a.answers, [answerKey(taskId, itemId)]: value } })),
    [update],
  )

  if (!attempt) return <ExamIntro paper={paper} title={title} onStart={start} />

  const sectionIndex = attempt.view.name === 'summary' ? -1 : paper.sections.findIndex((s) => s.id === (attempt.view as { sectionId: string }).sectionId)
  const section = sectionIndex >= 0 ? paper.sections[sectionIndex] : undefined
  const allSubmitted = paper.sections.every((s) => attempt.submitted.includes(s.id))
  const nextSection = paper.sections.find((s, i) => i > sectionIndex && !attempt.submitted.includes(s.id)) ?? paper.sections.find((s) => !attempt.submitted.includes(s.id))
  const modeLabel = attempt.mode === 'exam' ? t('exModeExam') : t('exModePractice')

  function goTo(s: ExamSection) {
    update((a) => (a.submitted.includes(s.id) ? { ...a, view: { name: 'result', sectionId: s.id } } : enterSection(a, s)))
  }

  return (
    <div className="space-y-6">
      <PageHeading title={title} subtitle={modeLabel} />

      {attempt.mode === 'practice' && (
        <nav className="flex flex-wrap gap-2" aria-label={t('exSections')}>
          {paper.sections.map((s) => {
            const current = section?.id === s.id
            const done = attempt.submitted.includes(s.id)
            return (
              <button
                key={s.id}
                type="button"
                aria-current={current ? 'step' : undefined}
                onClick={() => goTo(s)}
                className={`inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-sm font-medium ${
                  current ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-foreground hover:bg-muted'
                }`}
              >
                {done && <Check className="h-4 w-4" aria-label={t('exSubmitted')} />}
                {s.titleHu}
              </button>
            )
          })}
          {allSubmitted && (
            <button
              type="button"
              onClick={() => update((a) => ({ ...a, view: { name: 'summary' } }))}
              className={`inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-semibold ${
                attempt.view.name === 'summary' ? 'border-primary bg-primary text-primary-foreground' : 'border-sky-300 bg-sky-50 text-sky-800'
              }`}
            >
              {t('exToSummary')}
            </button>
          )}
        </nav>
      )}

      {attempt.view.name === 'section' && section && (
        <SectionView
          key={section.id}
          paper={paper}
          section={section}
          mode={attempt.mode}
          answers={attempt.answers}
          onAnswer={onAnswer}
          onSubmit={() => submit(section.id)}
          deadline={sectionDeadline(section, attempt)}
          onTimeUp={() => submit(section.id, 'timeUp')}
          audioStartedAt={attempt.mode === 'exam' ? attempt.audioStartedAt[section.id] : undefined}
          onAudioStart={(at) => update((a) => ({ ...a, audioStartedAt: { ...a.audioStartedAt, [section.id]: at } }))}
          onAudioEnded={() => {
            if (attempt.mode === 'exam' && section.timeLimitMin !== undefined) submit(section.id, 'recordingEnded')
          }}
        />
      )}

      {attempt.view.name === 'result' && section && (
        <div className="space-y-5">
          <h2 className="text-xl font-semibold text-foreground">
            {section.titleHu} — {t('exResults')}
          </h2>
          {attempt.view.reason && (
            <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900" role="status">
              {attempt.view.reason === 'timeUp' ? t('exTimeUp') : t('exRecordingEnded')}
            </p>
          )}
          <ResultBody paper={paper} section={section} attempt={attempt} />
          <div className="flex flex-col gap-2 sm:flex-row">
            {attempt.mode === 'exam' ? (
              nextSection ? (
                <PrimaryButton onClick={() => update((a) => enterSection(a, nextSection))}>
                  {t('exNextSection')}: {nextSection.titleHu}
                </PrimaryButton>
              ) : (
                <PrimaryButton onClick={() => update((a) => ({ ...a, view: { name: 'summary' } }))}>{t('exToSummary')}</PrimaryButton>
              )
            ) : allSubmitted ? (
              <PrimaryButton onClick={() => update((a) => ({ ...a, view: { name: 'summary' } }))}>{t('exToSummary')}</PrimaryButton>
            ) : (
              nextSection && <PrimaryButton onClick={() => goTo(nextSection)}>{t('exNextSection')}: {nextSection.titleHu}</PrimaryButton>
            )}
          </div>
        </div>
      )}

      {attempt.view.name === 'summary' && (
        <div className="space-y-6">
          <ExamSummary paper={paper} result={scorePaper(paper, attempt.answers)} answers={attempt.answers} />
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              to="/exams"
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-6 text-base font-semibold text-primary-foreground hover:opacity-90"
            >
              {t('exBackToExams')}
            </Link>
            <button
              type="button"
              onClick={() => setAttempt(null)}
              className="min-h-12 rounded-xl border border-border bg-card px-6 text-base font-medium text-foreground hover:bg-muted"
            >
              {t('exStartOver')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function ResultBody({ paper, section, attempt }: { paper: ExamPaper; section: ExamSection; attempt: ExamAttempt }) {
  const result = useMemo(() => scoreSection(section, attempt.answers), [section, attempt.answers])
  const texts = useMemo(
    () => Object.fromEntries(Object.entries(attempt.answers).filter(([, v]) => typeof v === 'string')) as Record<string, string>,
    [attempt.answers],
  )
  return <SectionResults paper={paper} section={section} result={result} writingTexts={texts} />
}

function PrimaryButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-12 rounded-xl bg-primary px-6 text-base font-semibold text-primary-foreground hover:opacity-90"
    >
      {children}
    </button>
  )
}

function ExamIntro({ paper, title, onStart }: { paper: ExamPaper; title: string; onStart: (mode: ExamMode, fresh: boolean) => void }) {
  const { t } = useLanguage()
  const untimed = paper.sections.every((s) => s.timeLimitMin === undefined)
  const saved = { exam: loadAttempt(paper.id, 'exam'), practice: loadAttempt(paper.id, 'practice') }

  return (
    <div className="space-y-6">
      <PageHeading title={title} />

      <section className="space-y-3 rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h2 className="font-semibold text-foreground">{t('exSections')}</h2>
        <ol className="divide-y divide-border">
          {paper.sections.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-base">
              <span className="text-foreground">{s.titleHu}</span>
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                {s.audio && (
                  <span className="inline-flex items-center gap-1">
                    <Headphones className="h-4 w-4" />
                    {t('exWithAudio')}
                  </span>
                )}
                <span>{s.timeLimitMin !== undefined ? t('exMinutes', { n: s.timeLimitMin }) : t('exUntimed')}</span>
              </span>
            </li>
          ))}
        </ol>
        {paper.noticesHu && (
          <div lang="hu" className="space-y-1 rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">{t('exNotices')}</p>
            {paper.noticesHu.map((n) => (
              <p key={n}>{n}</p>
            ))}
          </div>
        )}
        <p className="text-sm text-muted-foreground">{t('exWritingPhaseNote')}</p>
        {untimed && <p className="text-sm text-muted-foreground">{t('exUntimedPaperNote')}</p>}
        <p className="text-xs text-muted-foreground">
          {t('exSource')}: {paper.source}
        </p>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {(['exam', 'practice'] as const).map((mode) => (
          <section key={mode} className="flex flex-col rounded-2xl border border-border bg-card p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-foreground">{mode === 'exam' ? t('exModeExam') : t('exModePractice')}</h2>
            <p className="mt-2 flex-1 text-sm text-muted-foreground">{mode === 'exam' ? t('exModeExamDesc') : t('exModePracticeDesc')}</p>
            {saved[mode] && <p className="mt-3 text-sm font-medium text-sky-800">{t('exSavedProgress')}</p>}
            <div className="mt-4 flex flex-col gap-2">
              <PrimaryButton onClick={() => onStart(mode, false)}>{saved[mode] ? t('exContinue') : t('exBegin')}</PrimaryButton>
              {saved[mode] && (
                <button
                  type="button"
                  onClick={() => onStart(mode, true)}
                  className="min-h-12 rounded-xl border border-border bg-card px-6 text-base font-medium text-foreground hover:bg-muted"
                >
                  {t('exStartOver')}
                </button>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
