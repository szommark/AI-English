import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, GraduationCap } from 'lucide-react'
import PageHeading from '../components/PageHeading'
import { useCourseCopy } from '../data/courseCopy'
import { fetchMyCourses } from '../lib/courseApi'
import type { MyCourseSummary } from '../lib/courses'

/** /my-courses: the mini courses the learner's teachers assigned, with where to continue. */
export default function MyCoursesPage() {
  const { c, kind } = useCourseCopy()
  const [courses, setCourses] = useState<MyCourseSummary[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetchMyCourses()
      .then(setCourses)
      .catch(() => setError(true))
  }, [])

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeading title={c('myCoursesTitle')} subtitle={c('myCoursesSubtitle')} />
      {error && <p className="text-sm text-red-600">{c('loadError')}</p>}
      {!error && !courses && <p className="text-sm text-muted-foreground">{c('loading')}</p>}
      {courses && courses.length === 0 && <p className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">{c('myCoursesEmpty')}</p>}
      {courses && courses.length > 0 && (
        <ul className="space-y-3">
          {courses.map((course) => {
            const pct = course.modulesTotal ? Math.round((course.modulesDone / course.modulesTotal) * 100) : 0
            return (
              <li key={course.enrollmentId}>
                <Link
                  to={`/my-courses/${course.enrollmentId}`}
                  className="block space-y-3 rounded-2xl border border-border bg-card p-4 hover:border-[var(--teal-accent-border)] sm:p-5"
                >
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--teal-accent-soft)] text-[var(--teal-accent-strong)]">
                      <GraduationCap className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-foreground">{course.title}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {course.level} · {c('unitCount', { n: course.unitCount })} · {c('fromTeacher', { email: course.teacherEmail })}
                      </span>
                    </span>
                    {course.completedAt && <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-600" aria-label={c('completed')} />}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                      <span className="block h-full rounded-full bg-[var(--teal-accent)]" style={{ width: `${pct}%` }} />
                    </span>
                    <span className="text-xs text-muted-foreground">{c('modulesDone', { n: course.modulesDone, m: course.modulesTotal })}</span>
                  </div>
                  {course.next && (
                    <p className="rounded-xl bg-[var(--teal-accent-soft)] px-3 py-2 text-sm text-foreground">
                      <span className="font-semibold">{course.modulesDone ? c('continueWith') : c('startWith')}</span> {course.next.unitTitle} · {kind(course.next.kind)} ·{' '}
                      {c('minutes', { n: course.next.estMinutes })}
                    </p>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
