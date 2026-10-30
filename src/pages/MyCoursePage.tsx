import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CheckCircle2, ChevronRight, Lock } from 'lucide-react'
import PageHeading from '../components/PageHeading'
import { KIND_ICONS } from '../components/Courses/kindMeta'
import { useCourseCopy } from '../data/courseCopy'
import { fetchMyCourse } from '../lib/courseApi'
import type { MyCourse } from '../lib/courses'

/** /my-courses/:enrollmentId: the course's units as chapters, each module locked, open or done. */
export default function MyCoursePage() {
  const { enrollmentId = '' } = useParams()
  const { c, kind, credit } = useCourseCopy()
  const [course, setCourse] = useState<MyCourse | null>(null)
  const [error, setError] = useState<'load' | 'missing' | null>(null)

  useEffect(() => {
    fetchMyCourse(enrollmentId)
      .then(setCourse)
      .catch((err: { status?: number }) => setError(err?.status === 404 ? 'missing' : 'load'))
  }, [enrollmentId])

  if (error) return <p className="text-sm text-red-600">{error === 'missing' ? c('courseMissing') : c('loadError')}</p>
  if (!course) return <p className="text-sm text-muted-foreground">{c('loading')}</p>

  const pct = course.modulesTotal ? Math.round((course.modulesDone / course.modulesTotal) * 100) : 0

  return (
    <div className="max-w-3xl space-y-6">
      <Link to="/my-courses" className="inline-block text-sm text-muted-foreground hover:underline">
        {c('backToMyCourses')}
      </Link>
      <PageHeading title={course.title} subtitle={`${course.level} · ${credit(course)}`} />
      <div className="flex items-center gap-3">
        <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-secondary">
          <span className="block h-full rounded-full bg-[var(--teal-accent)]" style={{ width: `${pct}%` }} />
        </span>
        <span className="text-sm text-muted-foreground">{c('modulesDone', { n: course.modulesDone, m: course.modulesTotal })}</span>
      </div>
      {course.completedAt && <p className="rounded-xl bg-[var(--teal-accent-soft)] p-4 text-foreground">{c('courseDone')}</p>}

      {course.units.map((unit) => (
        <section key={unit.id} className="space-y-3 rounded-2xl border border-border bg-card p-4 sm:p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--teal-accent-strong)]">{c('unitN', { n: unit.position })}</p>
            <h2 className="text-lg font-semibold text-foreground">{unit.title}</h2>
          </div>
          {unit.canDos.length > 0 && (
            <div className="text-sm">
              <p className="font-medium text-foreground">{c('canDoHeading')}</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-5 text-muted-foreground">
                {unit.canDos.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </div>
          )}
          <ol className="space-y-2">
            {unit.modules.map((m) => {
              const Icon = KIND_ICONS[m.kind]
              const inner = (
                <>
                  <span
                    className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${m.state === 'locked' ? 'bg-secondary text-muted-foreground' : 'bg-[var(--teal-accent-soft)] text-[var(--teal-accent-strong)]'}`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-foreground">{m.title}</span>
                    <span className="block text-xs text-muted-foreground">
                      {kind(m.kind)} · {c('minutes', { n: m.estMinutes })}
                    </span>
                  </span>
                  {m.state === 'done' && (
                    <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" />
                      {m.max ? `${Math.round(((m.score ?? 0) / m.max) * 100)}%` : ''}
                    </span>
                  )}
                  {m.state === 'open' && (
                    <span className="shrink-0 rounded-lg bg-[var(--teal-accent)] px-3 py-1.5 text-sm font-semibold text-primary">{m.inProgress ? c('resume') : c('start')}</span>
                  )}
                  {m.state === 'locked' && <Lock className="h-4 w-4 shrink-0 text-muted-foreground" aria-label={c('locked')} />}
                  {m.state === 'done' && <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />}
                </>
              )
              return (
                <li key={m.id}>
                  {m.state === 'locked' ? (
                    <div className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5 opacity-60">{inner}</div>
                  ) : (
                    <Link
                      to={`/my-courses/${course.enrollmentId}/${m.id}`}
                      className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5 hover:border-[var(--teal-accent-border)]"
                    >
                      {inner}
                    </Link>
                  )}
                </li>
              )
            })}
          </ol>
        </section>
      ))}
    </div>
  )
}
