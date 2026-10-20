import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { BookOpenText, CheckCircle2, Headphones, Mic, PenLine, type LucideIcon } from 'lucide-react'
import PageHeading from '../components/PageHeading'
import PoolsPanel from '../components/ExamTaskMaker/PoolsPanel'
import StatusChip from '../components/ExamTaskMaker/StatusChip'
import { primaryButtonClass, secondaryButtonClass } from '../components/TeacherTools/ui'
import { useExamTaskCopy } from '../data/examTaskCopy'
import { fetchExamTasks } from '../lib/examTaskApi'
import { EXAM_PARTS, READY_PARTS, type ExamPart, type ExamTaskSummary } from '../lib/examTasks'

const PART_ICON: Record<ExamPart, LucideIcon> = {
  listening: Headphones,
  reading: BookOpenText,
  writing: PenLine,
  speaking: Mic,
}

/**
 * /teacher/tools/exam-tasks: the exam task maker's home. One tab per exam part (only listening
 * works so far), the teacher's own tasks, the tasks other teachers sent them to test, and their
 * saved teacher pools.
 */
export default function ExamTasksPage() {
  const { c, lang } = useExamTaskCopy()
  const [params, setParams] = useSearchParams()
  const part = (EXAM_PARTS.find((p) => p === params.get('part')) ?? 'listening') as ExamPart
  const ready = READY_PARTS.includes(part)
  const [data, setData] = useState<{ owned: ExamTaskSummary[]; assigned: ExamTaskSummary[] } | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetchExamTasks()
      .then(setData)
      .catch(() => setError(true))
  }, [])

  const owned = data?.owned.filter((t) => t.examPart === part) ?? []
  const assigned = data?.assigned.filter((t) => t.examPart === part) ?? []
  const date = (iso: string) => new Date(iso).toLocaleDateString(lang)

  return (
    <div className="max-w-5xl space-y-6">
      <PageHeading
        title={c('title')}
        subtitle={c('subtitle')}
        actions={
          ready && (
            <div className="flex flex-wrap gap-2">
              <Link to={`/teacher/tools/exam-tasks/new?part=${part}&mode=check`} className={secondaryButtonClass}>
                {c('checkExisting')}
              </Link>
              <Link to={`/teacher/tools/exam-tasks/new?part=${part}`} className={primaryButtonClass}>
                {c('newTask')}
              </Link>
            </div>
          )
        }
      />

      <div role="tablist" aria-label={c('title')} className="flex flex-wrap gap-2">
        {EXAM_PARTS.map((p) => {
          const Icon = PART_ICON[p]
          const active = p === part
          return (
            <button
              key={p}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setParams(p === 'listening' ? {} : { part: p }, { replace: true })}
              className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium ${
                active ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-foreground hover:bg-muted'
              }`}
            >
              <Icon className="h-4 w-4" />
              {c(`part_${p}`)}
              {!READY_PARTS.includes(p) && (
                <span className={`rounded-full px-2 py-0.5 text-[11px] ${active ? 'bg-white/20' : 'bg-muted text-muted-foreground'}`}>{c('comingSoon')}</span>
              )}
            </button>
          )
        })}
      </div>

      {!ready && (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">{c('partSoonBody')}</div>
      )}

      {ready && (
        <>
          {error && <p className="text-sm text-red-600">{c('loadError')}</p>}
          {!error && !data && <p className="text-sm text-muted-foreground">{c('loading')}</p>}

          {data && (
            <div className="grid gap-6 lg:grid-cols-2">
              <section className="space-y-3">
                <h2 className="font-semibold text-foreground">{c('myTasks')}</h2>
                {owned.length === 0 && <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">{c('myTasksEmpty')}</p>}
                <ul className="space-y-2">
                  {owned.map((t) => (
                    <li key={t.id}>
                      <Link
                        to={`/teacher/tools/exam-tasks/${t.id}`}
                        className="block rounded-xl border border-border bg-card px-4 py-3 hover:border-[var(--teal-accent-border)]"
                      >
                        <span className="block font-medium text-foreground">{t.title}</span>
                        <span className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span>
                            {t.level} · {c(t.format === 'notes' ? 'format_notes' : 'format_true_false')} · {c(`origin_${t.origin}`)}
                          </span>
                          <StatusChip task={t} />
                          <span>{t.reviewerCount ? c('testedCount', { n: t.submittedCount, m: t.reviewerCount }) : c('notSent')}</span>
                          <span>{c('updated', { date: date(t.updatedAt) })}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="font-semibold text-foreground">{c('sentToMe')}</h2>
                {assigned.length === 0 && <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">{c('sentToMeEmpty')}</p>}
                <ul className="space-y-2">
                  {assigned.map((t) => (
                    <li key={t.id}>
                      <Link
                        to={`/teacher/tools/exam-tasks/${t.id}`}
                        className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 hover:border-[var(--teal-accent-border)]"
                      >
                        <span className="min-w-0">
                          <span className="block font-medium text-foreground">{t.title}</span>
                          <span className="mt-1 block text-xs text-muted-foreground">
                            {t.level} · {c(t.format === 'notes' ? 'format_notes' : 'format_true_false')} · {c('fromTeacher', { email: t.ownerEmail ?? '' })}
                          </span>
                        </span>
                        {t.myReviewSubmitted ? (
                          <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-emerald-700">
                            <CheckCircle2 className="h-4 w-4" />
                            {c('tested')}
                          </span>
                        ) : (
                          <span className="shrink-0 rounded-lg bg-[var(--teal-accent-soft)] px-3 py-1.5 text-sm font-semibold text-[var(--teal-accent-strong)]">{c('testNow')}</span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          )}

          <PoolsPanel />
        </>
      )}
    </div>
  )
}
