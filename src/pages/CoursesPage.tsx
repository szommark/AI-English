import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Globe, GraduationCap } from 'lucide-react'
import CourseLibrary from '../components/Courses/CourseLibrary'
import PageHeading from '../components/PageHeading'
import { primaryButtonClass } from '../components/TeacherTools/ui'
import { useCourseCopy } from '../data/courseCopy'
import { fetchCourses } from '../lib/courseApi'
import type { CourseSummary } from '../lib/courses'

/** /teacher/tools/courses: the teacher's mini courses, and (?tab=library) the library of public ones. */
export default function CoursesPage() {
  const { c } = useCourseCopy()
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') === 'library' ? 'library' : 'mine'

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeading
        title={c('pageTitle')}
        subtitle={c('pageSubtitle')}
        actions={
          <Link to="/teacher/tools/courses/new" className={primaryButtonClass}>
            {c('newCourse')}
          </Link>
        }
      />
      <Link to="/teacher?tab=tools" className="inline-block text-sm text-muted-foreground hover:underline">
        {c('backToToolkit')}
      </Link>
      <div className="flex gap-2" role="tablist">
        {(['mine', 'library'] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setParams(t === 'library' ? { tab: t } : {}, { replace: true })}
            className={`rounded-lg border-2 px-3 py-1.5 text-sm ${tab === t ? 'border-[var(--teal-accent)] bg-[var(--teal-accent-soft)] font-medium' : 'border-border bg-card'}`}
          >
            {c(t === 'mine' ? 'tabMine' : 'tabLibrary')}
          </button>
        ))}
      </div>
      {tab === 'library' ? <CourseLibrary /> : <MyCourseList />}
    </div>
  )
}

function MyCourseList() {
  const { c, lang } = useCourseCopy()
  const [courses, setCourses] = useState<CourseSummary[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetchCourses()
      .then(setCourses)
      .catch(() => setError(true))
  }, [])

  const date = (iso: string) => new Date(iso).toLocaleDateString(lang)

  return (
    <>
      {error && <p className="text-sm text-red-600">{c('loadError')}</p>}
      {!error && !courses && <p className="text-sm text-muted-foreground">{c('loading')}</p>}
      {courses && courses.length === 0 && <p className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">{c('empty')}</p>}

      {courses && courses.length > 0 && (
        <ul className="space-y-2">
          {courses.map((course) => (
            <li key={course.id}>
              <Link to={`/teacher/tools/courses/${course.id}`} className="flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-3 hover:border-[var(--teal-accent-border)]">
                <GraduationCap className="mt-0.5 h-5 w-5 shrink-0 text-[var(--teal-accent-strong)]" />
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-foreground">{course.title}</span>
                  <span className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span>
                      {course.level} · {c('unitCount', { n: course.unitCount })} · {c('moduleCount', { n: course.moduleCount })}
                    </span>
                    <span>{course.enrolledCount ? c('enrolledCount', { n: course.enrolledCount }) : c('notAssigned')}</span>
                    <span>{c('updated', { date: date(course.updatedAt) })}</span>
                  </span>
                </span>
                {course.visibility === 'public' && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[var(--teal-accent-soft)] px-2 py-0.5 text-xs font-medium text-[var(--teal-accent-strong)]">
                    <Globe className="h-3 w-3" />
                    {c('visibility_public')}
                  </span>
                )}
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${course.status === 'published' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200' : 'bg-secondary text-muted-foreground'}`}
                >
                  {c(`status_${course.status}`)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
