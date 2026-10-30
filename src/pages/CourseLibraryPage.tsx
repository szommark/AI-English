import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Eye } from 'lucide-react'
import PageHeading from '../components/PageHeading'
import ModulePreview from '../components/Courses/ModulePreview'
import CourseAssignPanel from '../components/Courses/CourseAssignPanel'
import { KIND_ICONS } from '../components/Courses/kindMeta'
import { cardClass, hintClass, primaryButtonClass, secondaryButtonClass } from '../components/TeacherTools/ui'
import { useCourseCopy } from '../data/courseCopy'
import { getGrammarItem } from '../data/grammarCurriculum'
import { TeacherToolsError } from '../lib/teacherToolsApi'
import { fetchLibraryCourse } from '../lib/courseApi'
import type { Course, CourseModule } from '../lib/courses'

/**
 * /teacher/tools/courses/library/:courseId: a library course to read through, preview module by
 * module (the real player, nothing saved) and assign to the teacher's own students.
 */
export default function CourseLibraryPage() {
  const { courseId = '' } = useParams()
  // Another course starts a fresh page (no preview or data left over).
  return <LibraryCourseView key={courseId} courseId={courseId} />
}

function LibraryCourseView({ courseId }: { courseId: string }) {
  const { c, kind, lang } = useCourseCopy()
  const [data, setData] = useState<{ course: Course; mine: boolean; listed: boolean } | null>(null)
  const [error, setError] = useState<'load' | 'missing' | null>(null)
  const [preview, setPreview] = useState<CourseModule | null>(null)

  useEffect(() => {
    fetchLibraryCourse(courseId)
      .then(setData)
      .catch((err) => setError(err instanceof TeacherToolsError && err.status === 404 ? 'missing' : 'load'))
  }, [courseId])

  const back = (
    <Link to="/teacher/tools/courses?tab=library" className="inline-block text-sm text-muted-foreground hover:underline">
      {c('backToLibrary')}
    </Link>
  )
  if (error)
    return (
      <div className="space-y-3">
        <p className="text-sm text-red-600">{error === 'missing' ? c('courseMissing') : c('loadError')}</p>
        {back}
      </div>
    )
  if (!data) return <p className="text-sm text-muted-foreground">{c('loading')}</p>

  const { course, mine, listed } = data
  const units = mine ? course.units.filter((u) => u.status === 'published') : course.units
  const minutes = units.reduce((s, u) => s + u.modules.reduce((t, m) => t + m.estMinutes, 0), 0)
  const grammarTitle = (id: string) => {
    const item = getGrammarItem(id)?.item
    return item ? (lang === 'hu' ? item.titleHu : item.title) : id
  }

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeading
        title={course.title}
        subtitle={[course.level, c('unitCount', { n: units.length }), c('minutes', { n: minutes }), course.authorName && c('byAuthor', { name: course.authorName })].filter(Boolean).join(' · ')}
        actions={
          mine ? (
            <Link to={`/teacher/tools/courses/${course.id}`} className={primaryButtonClass}>
              {c('editMine')}
            </Link>
          ) : undefined
        }
      />
      {back}
      {course.topic && <p className="text-sm text-muted-foreground">{course.topic}</p>}
      {!mine && <p className={hintClass}>{listed ? c('libraryReadOnly') : c('notListedHint')}</p>}

      {units.map((unit) => (
        <section key={unit.id} className={cardClass}>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--teal-accent-strong)]">{c('unitN', { n: unit.position })}</p>
            <h2 className="text-lg font-semibold text-foreground">{unit.title}</h2>
            <p className={hintClass}>
              {unit.topic}
              {unit.grammarIds.length > 0 && <> · {unit.grammarIds.map(grammarTitle).join(' · ')}</>}
            </p>
          </div>
          {unit.canDos.length > 0 && (
            <div className="text-sm">
              <p className="text-muted-foreground">{c('canDosShort')}</p>
              <ul className="ml-5 list-disc text-foreground">
                {unit.canDos.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </div>
          )}
          <ol className="space-y-2">
            {unit.modules.map((m) => {
              const Icon = KIND_ICONS[m.kind]
              return (
                <li key={m.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-background p-3">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--teal-accent-soft)] text-[var(--teal-accent-strong)]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-foreground">
                      {m.position}. {m.title}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {kind(m.kind)} · {c('minutes', { n: m.estMinutes })}
                    </span>
                  </span>
                  {m.content && (
                    <button type="button" className={`${secondaryButtonClass} inline-flex items-center gap-1`} onClick={() => setPreview(m)}>
                      <Eye className="h-3.5 w-3.5" />
                      {c('preview')}
                    </button>
                  )}
                </li>
              )
            })}
          </ol>
        </section>
      ))}

      <CourseAssignPanel courseId={course.id} published={course.status === 'published'} unlisted={!mine && !listed} />

      {preview && <ModulePreview module={preview} onClose={() => setPreview(null)} />}
    </div>
  )
}
