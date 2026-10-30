import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle2, GraduationCap, Loader2 } from 'lucide-react'
import { KIND_ICONS } from '../components/Courses/kindMeta'
import PageHeading from '../components/PageHeading'
import { useCourseCopy } from '../data/courseCopy'
import { enrollInCourse, fetchCourseShelf, fetchMyCourses } from '../lib/courseApi'
import type { MyCourseSummary, ShelfCourse } from '../lib/courses'

/**
 * /my-courses: the mini courses the learner's teachers assigned or they started, with where to
 * continue, and the "Start a course" shelf of public courses an admin picked.
 */
export default function MyCoursesPage() {
  const { c, kind, credit } = useCourseCopy()
  const [courses, setCourses] = useState<MyCourseSummary[] | null>(null)
  const [error, setError] = useState(false)
  const [shelf, setShelf] = useState<ShelfCourse[]>([])

  useEffect(() => {
    fetchMyCourses()
      .then(setCourses)
      .catch(() => setError(true))
    // The shelf is extra: without it the page still works.
    fetchCourseShelf()
      .then(setShelf)
      .catch(() => setShelf([]))
  }, [])

  const toStart = shelf.filter((s) => !s.enrollmentId)

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeading title={c('myCoursesTitle')} subtitle={c('myCoursesSubtitle')} />
      {error && <p className="text-sm text-red-600">{c('loadError')}</p>}
      {!error && !courses && <p className="text-sm text-muted-foreground">{c('loading')}</p>}
      {courses && courses.length === 0 && toStart.length === 0 && <p className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">{c('myCoursesEmpty')}</p>}
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
                        {course.level} · {c('unitCount', { n: course.unitCount })} · {credit(course)}
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
      {courses && toStart.length > 0 && <Shelf courses={toStart} />}
    </div>
  )
}

function Shelf({ courses }: { courses: ShelfCourse[] }) {
  const { c, kind } = useCourseCopy()
  const navigate = useNavigate()
  const [starting, setStarting] = useState<string | null>(null)
  const [error, setError] = useState(false)

  async function start(course: ShelfCourse) {
    setStarting(course.id)
    setError(false)
    try {
      navigate(`/my-courses/${await enrollInCourse(course.id)}`)
    } catch {
      setError(true)
      setStarting(null)
    }
  }

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{c('shelfTitle')}</h2>
        <p className="text-sm text-muted-foreground">{c('shelfHint')}</p>
      </div>
      {error && <p className="text-sm text-red-600">{c('shelfError')}</p>}
      <ul className="grid gap-3 sm:grid-cols-2">
        {courses.map((course) => (
          <li key={course.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
            <div className="min-w-0 flex-1 space-y-1">
              <p className="font-semibold text-foreground">{course.title}</p>
              <p className="text-xs text-muted-foreground">
                {course.level} · {c('unitCount', { n: course.unitCount })} · {c('minutes', { n: course.estMinutes })}
                {course.authorName && <> · {c('byAuthor', { name: course.authorName })}</>}
              </p>
              {course.topic && <p className="text-sm text-muted-foreground">{course.topic}</p>}
              <p className="flex flex-wrap gap-1.5 pt-1">
                {course.kinds.map((k) => {
                  const Icon = KIND_ICONS[k]
                  return (
                    <span key={k} title={kind(k)} className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--teal-accent-soft)] text-[var(--teal-accent-strong)]">
                      <Icon className="h-4 w-4" aria-label={kind(k)} />
                    </span>
                  )
                })}
              </p>
            </div>
            <button
              type="button"
              disabled={starting !== null}
              onClick={() => void start(course)}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--teal-accent)] px-4 py-2.5 font-semibold text-primary hover:bg-[var(--teal-accent-strong)] disabled:opacity-60"
            >
              {starting === course.id && <Loader2 className="h-4 w-4 animate-spin" />}
              {c('shelfStart')}
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
