import { useEffect, useState } from 'react'
import { Send } from 'lucide-react'
import { cardClass, hintClass, primaryButtonClass, secondaryButtonClass } from '../TeacherTools/ui'
import { useCourseCopy } from '../../data/courseCopy'
import { fetchTeacherRoster, type RosterEntry } from '../../lib/teacherApi'
import { assignCourse, fetchEnrollments, withdrawEnrollment } from '../../lib/courseApi'
import type { CourseEnrollment } from '../../lib/courses'

/** Assign a published course to connected students and follow how far each one has got. */
export default function CourseAssignPanel({ courseId, published }: { courseId: string; published: boolean }) {
  const { c, lang } = useCourseCopy()
  const [roster, setRoster] = useState<RosterEntry[] | null>(null)
  const [enrollments, setEnrollments] = useState<CourseEnrollment[] | null>(null)
  const [picked, setPicked] = useState<Set<string>>(new Set())
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([fetchTeacherRoster(), fetchEnrollments(courseId)])
      .then(([r, e]) => {
        setRoster(r)
        setEnrollments(e)
      })
      .catch(() => setError(c('loadError')))
  }, [courseId, c])

  const enrolledIds = new Set(enrollments?.map((e) => e.studentId) ?? [])
  const free = roster?.filter((s) => !enrolledIds.has(s.studentId)) ?? []
  const date = (iso: string) => new Date(iso).toLocaleDateString(lang)

  async function assign() {
    setBusy(true)
    setError(null)
    try {
      setEnrollments(await assignCourse(courseId, [...picked]))
      setPicked(new Set())
    } catch {
      setError(c('assignError'))
    } finally {
      setBusy(false)
    }
  }

  async function withdraw(e: CourseEnrollment) {
    if (!window.confirm(c('withdrawConfirm', { email: e.studentEmail }))) return
    try {
      setEnrollments(await withdrawEnrollment(courseId, e.id))
    } catch {
      setError(c('saveError'))
    }
  }

  return (
    <section className={cardClass}>
      <h2 className="font-semibold text-foreground">{c('assignHeading')}</h2>
      {!published && <p className={hintClass}>{c('assignNeedsPublish')}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {published && roster && (
        <div className="space-y-2">
          {roster.length === 0 ? (
            <p className={hintClass}>{c('noStudents')}</p>
          ) : free.length === 0 ? (
            <p className={hintClass}>{c('allAssigned')}</p>
          ) : (
            <>
              <ul className="max-h-56 space-y-1 overflow-y-auto">
                {free.map((s) => (
                  <li key={s.studentId}>
                    <label className="flex items-center gap-2 text-sm text-foreground">
                      <input
                        type="checkbox"
                        checked={picked.has(s.studentId)}
                        onChange={(ev) =>
                          setPicked((prev) => {
                            const next = new Set(prev)
                            if (ev.target.checked) next.add(s.studentId)
                            else next.delete(s.studentId)
                            return next
                          })
                        }
                      />
                      {s.email}
                    </label>
                  </li>
                ))}
              </ul>
              <button type="button" className={`${primaryButtonClass} inline-flex items-center gap-1.5`} disabled={busy || picked.size === 0} onClick={() => void assign()}>
                <Send className="h-4 w-4" />
                {c('assign', { n: picked.size })}
              </button>
            </>
          )}
        </div>
      )}

      {enrollments && enrollments.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">{c('enrolledHeading')}</h3>
          <ul className="divide-y divide-border">
            {enrollments.map((e) => (
              <li key={e.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2 text-sm">
                <span className="min-w-0 flex-1 truncate text-foreground">{e.studentEmail}</span>
                <span className="text-muted-foreground">{c('modulesDone', { n: e.modulesDone, m: e.modulesTotal })}</span>
                {e.scorePct !== null && <span className="font-medium text-foreground">{e.scorePct}%</span>}
                <span className="text-xs text-muted-foreground">{e.completedAt ? c('completedOn', { date: date(e.completedAt) }) : c('since', { date: date(e.startedAt) })}</span>
                <button type="button" className={secondaryButtonClass} onClick={() => void withdraw(e)}>
                  {c('withdraw')}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
