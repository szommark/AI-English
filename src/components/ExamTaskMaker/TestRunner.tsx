import { useMemo, useState } from 'react'
import { CheckCircle2, OctagonX, TriangleAlert, XCircle } from 'lucide-react'
import TaskView from '../Exam/TaskView'
import { CRITERIA_BY_ID, GROUP_LABEL, itemReasons, OTHER_REASON, taskReasons, type Criterion, type CriterionGroup } from '../../data/examTaskCriteria'
import { pick, useExamTaskCopy } from '../../data/examTaskCopy'
import { saveTaskReview } from '../../lib/examTaskApi'
import { itemIds, TASK_REVIEW_KEY, type ExamTask, type ExamTaskReview, type ItemReview, type TaskRecommendation } from '../../lib/examTasks'
import { checkListeningTask, type Finding } from '../../lib/listeningChecks'
import { isCorrect, itemText, keyText, toPaperTask } from '../../lib/listeningTaskExam'
import type { AnswerValue } from '../../lib/examScoring'
import { cardClass, hintClass, inputClass, primaryButtonClass, secondaryButtonClass } from '../TeacherTools/ui'
import { DistanceChart } from './ChecksPanel'
import ScriptView, { MarkedText, markerExcerpt } from './ScriptView'
import TaskPlayer from './TaskPlayer'

const PAPER_TASK_ID = 'task'

function ReasonPicker({
  reasons,
  value,
  onChange,
  flagged,
}: {
  reasons: Criterion[]
  value: ItemReview
  onChange: (v: ItemReview) => void
  /** Criteria the automatic checks flagged here (shown with a marker). */
  flagged: Set<string>
}) {
  const { c, lang } = useExamTaskCopy()
  const groups = [...new Set(reasons.map((r) => r.group))] as CriterionGroup[]
  const toggle = (id: string) =>
    onChange({ ...value, reasons: value.reasons.includes(id) ? value.reasons.filter((x) => x !== id) : [...value.reasons, id] })
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-foreground">{c('why')}</legend>
      {groups.map((g) => (
        <div key={g}>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{pick(GROUP_LABEL[g], lang)}</p>
          <div className="mt-1 grid gap-x-4 sm:grid-cols-2">
            {reasons
              .filter((r) => r.group === g)
              .map((r) => (
                <label key={r.id} className="flex min-h-8 items-start gap-2 text-sm" title={pick(r.test, lang)}>
                  <input type="checkbox" className="mt-1 h-4 w-4 shrink-0" checked={value.reasons.includes(r.id)} onChange={() => toggle(r.id)} />
                  <span>
                    {pick(r.label, lang)}
                    {flagged.has(r.id) && <TriangleAlert className="ml-1 inline h-3.5 w-3.5 text-amber-600" aria-label={c('autoFlags')} />}
                  </span>
                </label>
              ))}
          </div>
        </div>
      ))}
      <label className="flex min-h-8 items-start gap-2 text-sm">
        <input type="checkbox" className="mt-1 h-4 w-4" checked={value.reasons.includes(OTHER_REASON)} onChange={() => toggle(OTHER_REASON)} />
        {c('other')}
      </label>
      <input
        className={`${inputClass} text-sm`}
        placeholder={c('note')}
        maxLength={600}
        value={value.note ?? ''}
        onChange={(e) => onChange({ ...value, note: e.target.value })}
      />
    </fieldset>
  )
}

function FlagList({ findings }: { findings: Finding[] }) {
  const { c, lang } = useExamTaskCopy()
  if (findings.length === 0) return null
  return (
    <div className="rounded-lg bg-muted px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{c('autoFlags')}</p>
      <ul className="mt-1 space-y-0.5 text-sm">
        {findings.map((f, i) => {
          const Icon = f.status === 'fail' ? OctagonX : TriangleAlert
          return (
            <li key={i} className="flex gap-1.5">
              <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${f.status === 'fail' ? 'text-rose-600' : 'text-amber-600'}`} />
              <span>
                {pick(CRITERIA_BY_ID.get(f.criterionId)?.label ?? { en: f.criterionId, hu: f.criterionId }, lang)}: {pick(f.detail, lang)}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/**
 * Test mode: the teacher first answers the task as a candidate (Exam Prep's TaskView and an
 * exam-style recording), then reviews every item — accept, or reject with reasons taken from the
 * publication criteria — and the task as a whole, ending with a recommendation.
 */
export default function TestRunner({
  task,
  myReview,
  onSaved,
}: {
  task: ExamTask
  myReview: ExamTaskReview | null
  onSaved: (review: ExamTaskReview) => void
}) {
  const { c, lang } = useExamTaskCopy()
  const content = task.content
  const paperTask = useMemo(() => toPaperTask(content, task.level), [content, task.level])
  const report = useMemo(() => checkListeningTask(content, task.level), [content, task.level])
  const ids = itemIds(content)
  const live = ids.filter((id) => id !== '0')

  const [phase, setPhase] = useState<'answer' | 'review'>(myReview ? 'review' : 'answer')
  const [answers, setAnswers] = useState<Record<string, boolean | string>>(myReview?.answers ?? {})
  const [verdicts, setVerdicts] = useState<Record<string, ItemReview>>(myReview?.verdicts ?? {})
  const [recommendation, setRecommendation] = useState<TaskRecommendation | null>(myReview?.recommendation ?? null)
  const [overallNote, setOverallNote] = useState(myReview?.overallNote ?? '')
  const [submittedAt, setSubmittedAt] = useState(myReview?.submittedAt ?? null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const examAnswers = Object.fromEntries(Object.entries(answers).map(([id, v]) => [`${PAPER_TASK_ID}/${id}`, v]))
  const onAnswer = (_taskId: string, itemId: string, value: AnswerValue) => {
    if (typeof value === 'boolean' || typeof value === 'string') setAnswers((a) => ({ ...a, [itemId]: value }))
  }

  const taskVerdict: ItemReview = verdicts[TASK_REVIEW_KEY] ?? { verdict: 'accept', reasons: [] }
  const setVerdict = (id: string, v: ItemReview) => setVerdicts((all) => ({ ...all, [id]: v }))

  const missing = live.filter((id) => !verdicts[id]).length
  const reasonless = Object.entries(verdicts).some(([id, v]) => id !== TASK_REVIEW_KEY && v.verdict === 'reject' && v.reasons.length === 0 && !v.note?.trim())

  async function save(submit: boolean) {
    if (submit) {
      if (missing) return setMessage(c('needVerdicts', { n: missing }))
      if (reasonless) return setMessage(c('needReason'))
      if (!recommendation) return setMessage(c('needRecommendation'))
    }
    setBusy(true)
    setMessage(null)
    try {
      const whole: ItemReview = { ...taskVerdict, verdict: taskVerdict.reasons.length ? 'reject' : 'accept' }
      const review = await saveTaskReview(task.id, { answers, verdicts: { ...verdicts, [TASK_REVIEW_KEY]: whole }, recommendation, overallNote, submit })
      setSubmittedAt(review.submittedAt)
      setMessage(c('reviewSaved'))
      onSaved(review)
    } catch {
      setMessage(c('err_generic'))
    } finally {
      setBusy(false)
    }
  }

  if (phase === 'answer') {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl bg-[var(--teal-accent-soft)] px-4 py-3 text-sm text-foreground">
          <p className="font-semibold">{c('testIntroTitle')}</p>
          <p className="mt-1">{c('testIntro')}</p>
        </div>
        <TaskPlayer taskId={task.id} />
        <TaskView task={paperTask} language="en" answers={examAnswers} onAnswer={onAnswer} />
        <button type="button" className={`${primaryButtonClass} min-h-12 px-6 text-base`} onClick={() => setPhase('review')}>
          {c('finishAnswering')}
        </button>
      </div>
    )
  }

  const flagsFor = (id: string) => report.findings.filter((f) => f.itemId === id)
  const taskFlags = report.findings.filter((f) => f.itemId === undefined)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold text-foreground">{c('reviewTitle')}</h2>
          <p className="text-sm text-muted-foreground">{c('reviewIntro')}</p>
        </div>
        <button type="button" className={secondaryButtonClass} onClick={() => setPhase('answer')}>
          {c('answerAgain')}
        </button>
      </div>

      {ids.map((id) => {
        const v = verdicts[id]
        const given = answers[id]
        const right = isCorrect(content, id, given)
        const excerpt = markerExcerpt(content.script, id)
        const flags = flagsFor(id)
        return (
          <article key={id} className={cardClass}>
            <header className="flex flex-wrap items-start justify-between gap-2">
              <p lang="en" className="text-base text-foreground">
                <span className="mr-2 font-semibold tabular-nums text-muted-foreground">{id === '0' ? `${c('example')} (0)` : `${id}.`}</span>
                {itemText(content, id)}
              </p>
            </header>

            {id !== '0' && (
              <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <span>{c('yourAnswer', { a: given === undefined || given === '' ? c('noAnswer') : typeof given === 'boolean' ? (given ? 'T' : 'F') : given })}</span>
                <span className="font-medium">{c('keyAnswer', { a: keyText(content, id) })}</span>
                {right !== null && (
                  <span className={`inline-flex items-center gap-1 font-medium ${right ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {right ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    {right ? c('correct') : c('incorrect')}
                  </span>
                )}
              </p>
            )}

            {excerpt && (
              <div className="rounded-lg border border-border px-3 py-2 text-sm">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{c('whereSpoken')}</p>
                <p lang="en" className="mt-1 leading-relaxed">
                  <MarkedText text={excerpt} focusId={id} />
                </p>
                {report.distances.find((d) => d.id === id)?.gapSyllables != null && (
                  <p className="mt-1 text-xs text-muted-foreground">{c('gapSince', { n: report.distances.find((d) => d.id === id)?.gapSyllables ?? 0 })}</p>
                )}
              </div>
            )}

            <FlagList findings={flags} />

            <div className="flex flex-wrap gap-2" role="group" aria-label={c('itemN', { n: id })}>
              {(['accept', 'reject'] as const).map((verdict) => (
                <button
                  key={verdict}
                  type="button"
                  aria-pressed={v?.verdict === verdict}
                  onClick={() => setVerdict(id, { verdict, reasons: v?.reasons ?? [], ...(v?.note ? { note: v.note } : {}) })}
                  className={`inline-flex min-h-10 items-center gap-2 rounded-lg border px-4 text-sm font-semibold ${
                    v?.verdict === verdict
                      ? verdict === 'accept'
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'border-rose-600 bg-rose-600 text-white'
                      : 'border-border bg-card text-foreground hover:bg-muted'
                  }`}
                >
                  {verdict === 'accept' ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  {c(verdict)}
                </button>
              ))}
            </div>

            {v?.verdict === 'reject' && (
              <ReasonPicker
                reasons={itemReasons(content.format)}
                value={v}
                onChange={(next) => setVerdict(id, next)}
                flagged={new Set(flags.map((f) => f.criterionId))}
              />
            )}
          </article>
        )
      })}

      <section className={cardClass}>
        <h2 className="font-semibold text-foreground">{c('wholeTask')}</h2>
        <p className={hintClass}>{c('wholeTaskHint')}</p>
        <details className="rounded-lg border border-border px-3 py-2">
          <summary className="cursor-pointer text-sm font-medium">{c('script')}</summary>
          <div className="mt-2 space-y-3">
            <ScriptView script={content.script} distances={report.distances} />
            <DistanceChart distances={report.distances} />
          </div>
        </details>
        <FlagList findings={taskFlags} />
        <ReasonPicker
          reasons={taskReasons(content.format)}
          value={taskVerdict}
          onChange={(next) => setVerdict(TASK_REVIEW_KEY, next)}
          flagged={new Set(taskFlags.map((f) => f.criterionId))}
        />

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-foreground">{c('recommendation')}</legend>
          <div className="flex flex-wrap gap-2">
            {(['publish', 'revise', 'reject'] as const).map((r) => (
              <label
                key={r}
                className={`flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border px-4 text-sm font-medium ${
                  recommendation === r ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card'
                }`}
              >
                <input type="radio" name="recommendation" className="sr-only" checked={recommendation === r} onChange={() => setRecommendation(r)} />
                {c(`rec_${r}`)}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="block text-sm font-medium text-foreground">
          {c('overallNote')}
          <textarea className={`${inputClass} mt-1 min-h-24`} maxLength={2000} value={overallNote} onChange={(e) => setOverallNote(e.target.value)} />
        </label>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className={`${primaryButtonClass} min-h-12 px-6 text-base`} disabled={busy} onClick={() => save(true)}>
          {c('submitTest')}
        </button>
        <button type="button" className={secondaryButtonClass} disabled={busy} onClick={() => save(false)}>
          {c('saveDraft')}
        </button>
        {missing > 0 && <span className="text-sm text-muted-foreground">{c('needVerdicts', { n: missing })}</span>}
        {message && <span className="text-sm font-medium text-foreground">{message}</span>}
      </div>
      {submittedAt && <p className="text-sm text-emerald-700">{c('submitted', { date: new Date(submittedAt).toLocaleString(lang) })}</p>}
    </div>
  )
}
