import { useState } from 'react'
import { Globe, Lock } from 'lucide-react'
import { cardClass, hintClass, inputClass, labelClass, primaryButtonClass } from '../TeacherTools/ui'
import { useCourseCopy } from '../../data/courseCopy'
import { useAuth } from '../../lib/AuthContext'
import { setCourseVisibility } from '../../lib/courseApi'
import { AUTHOR_NAME_MAX, authorNameFromEmail, type Course } from '../../lib/courses'

/**
 * Private (the teacher's own students) or public (the library, credited by a name the teacher
 * types). Shows what an admin decided about a public course.
 */
export default function CourseVisibilityPanel({ course, onCourse }: { course: Course; onCourse: (c: Course) => void }) {
  const { c } = useCourseCopy()
  const { user } = useAuth()
  const [name, setName] = useState(course.authorName || authorNameFromEmail(user?.email ?? ''))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)
  const isPublic = course.visibility === 'public'
  const trimmed = name.trim()

  async function save(visibility: Course['visibility']) {
    if (visibility === 'private' && !window.confirm(c('makePrivateConfirm'))) return
    setBusy(true)
    setError(false)
    try {
      onCourse(await setCourseVisibility(course.id, visibility, trimmed))
    } catch {
      setError(true)
    } finally {
      setBusy(false)
    }
  }

  const option = (v: Course['visibility'], Icon: typeof Globe) => (
    <button
      type="button"
      role="radio"
      aria-checked={course.visibility === v}
      disabled={busy || (v === 'public' && !trimmed)}
      onClick={() => course.visibility !== v && void save(v)}
      className={`inline-flex items-center gap-1.5 rounded-lg border-2 px-3 py-1.5 text-sm disabled:opacity-50 ${course.visibility === v ? 'border-[var(--teal-accent)] bg-[var(--teal-accent-soft)] font-medium text-foreground' : 'border-border bg-card text-muted-foreground hover:border-[var(--teal-accent-border)]'}`}
    >
      <Icon className="h-4 w-4" />
      {c(`visibility_${v}`)}
    </button>
  )

  return (
    <section className={cardClass}>
      <h2 className="font-semibold text-foreground">{c('visibilityHeading')}</h2>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={c('visibilityHeading')}>
        {option('private', Lock)}
        {option('public', Globe)}
      </div>
      <ul className={`space-y-1 ${hintClass}`}>
        <li>
          <span className="font-semibold">{c('visibility_private')}:</span> {c('visibilityPrivateHint')}
        </li>
        <li>
          <span className="font-semibold">{c('visibility_public')}:</span> {c('visibilityPublicHint')}
        </li>
      </ul>

      <label className="block space-y-1">
        <span className={labelClass}>{c('authorName')}</span>
        <input className={inputClass} value={name} maxLength={AUTHOR_NAME_MAX} onChange={(e) => setName(e.target.value)} />
        <span className={hintClass}>{c('authorNameHint')}</span>
      </label>

      {isPublic && (
        <p className="text-sm text-foreground">
          {course.adminHidden ? c('adminHiddenNote') : course.status === 'published' ? c('inLibraryNow') : c('publicNeedsPublish')}
          {!course.adminHidden && course.selfEnroll && <> {c('selfEnrollNote')}</>}
        </p>
      )}
      {error && <p className="text-sm text-red-600">{c('saveError')}</p>}

      {isPublic && trimmed !== course.authorName && (
        <button type="button" className={primaryButtonClass} disabled={busy || !trimmed} onClick={() => void save('public')}>
          {c('saveName')}
        </button>
      )}
    </section>
  )
}
