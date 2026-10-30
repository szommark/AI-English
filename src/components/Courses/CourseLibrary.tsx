import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'
import { KIND_ICONS } from './kindMeta'
import { hintClass, inputClass, labelClass } from '../TeacherTools/ui'
import { useCourseCopy } from '../../data/courseCopy'
import { fetchLibrary } from '../../lib/courseApi'
import { COURSE_LEVELS, SKILL_FOCUSES, matchesLibraryFilter, type CourseLevel, type LibraryCourse, type SkillFocus } from '../../lib/courses'

/** The library tab of /teacher/tools/courses: public courses to preview and assign, with filters. */
export default function CourseLibrary() {
  const { c, kind } = useCourseCopy()
  const [courses, setCourses] = useState<LibraryCourse[] | null>(null)
  const [error, setError] = useState(false)
  const [level, setLevel] = useState<CourseLevel | ''>('')
  const [focus, setFocus] = useState<SkillFocus | ''>('')
  const [query, setQuery] = useState('')
  const [onlyMine, setOnlyMine] = useState(false)

  useEffect(() => {
    fetchLibrary()
      .then(setCourses)
      .catch(() => setError(true))
  }, [])

  const shown = useMemo(() => (courses ?? []).filter((x) => matchesLibraryFilter(x, { level, focus, query }) && (!onlyMine || x.assignedByMe > 0)), [courses, level, focus, query, onlyMine])

  if (error) return <p className="text-sm text-red-600">{c('loadError')}</p>
  if (!courses) return <p className="text-sm text-muted-foreground">{c('loading')}</p>

  return (
    <div className="space-y-4">
      <p className={hintClass}>{c('libraryHint')}</p>
      {courses.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">{c('libraryEmpty')}</p>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-[8rem_12rem_1fr]">
            <label className="block space-y-1">
              <span className={labelClass}>{c('filterLevel')}</span>
              <select className={inputClass} value={level} onChange={(e) => setLevel(e.target.value as CourseLevel | '')}>
                <option value="">{c('filterAllLevels')}</option>
                {COURSE_LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-1">
              <span className={labelClass}>{c('filterFocus')}</span>
              <select className={inputClass} value={focus} onChange={(e) => setFocus(e.target.value as SkillFocus | '')}>
                <option value="">{c('filterAllFocus')}</option>
                {SKILL_FOCUSES.map((f) => (
                  <option key={f} value={f}>
                    {c(`focus_${f}`)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-1">
              <span className={labelClass}>{c('filterSearch')}</span>
              <input className={inputClass} type="search" value={query} placeholder={c('filterSearchPlaceholder')} onChange={(e) => setQuery(e.target.value)} />
            </label>
          </div>
          {courses.some((x) => x.assignedByMe > 0) && (
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input type="checkbox" checked={onlyMine} onChange={(e) => setOnlyMine(e.target.checked)} />
              {c('filterOnlyMine')}
            </label>
          )}

          {shown.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">{c('libraryNoMatch')}</p>
          ) : (
            <ul className="space-y-2">
              {shown.map((course) => {
                const kinds = [...new Set(course.units.flatMap((u) => u.modules.map((m) => m.kind)))]
                return (
                  <li key={course.id}>
                    <Link to={`/teacher/tools/courses/library/${course.id}`} className="flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-3 hover:border-[var(--teal-accent-border)]">
                      <GraduationCap className="mt-0.5 h-5 w-5 shrink-0 text-[var(--teal-accent-strong)]" />
                      <span className="min-w-0 flex-1 space-y-1">
                        <span className="block font-medium text-foreground">{course.title}</span>
                        <span className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span>
                            {course.level} · {c('unitCount', { n: course.units.length })} · {c('minutes', { n: course.estMinutes })}
                          </span>
                          {course.authorName && <span>{c('byAuthor', { name: course.authorName })}</span>}
                          {course.assignedByMe > 0 && <span>{c('assignedByMe', { n: course.assignedByMe })}</span>}
                        </span>
                        {course.topic && <span className="block text-sm text-muted-foreground">{course.topic}</span>}
                        <span className="flex flex-wrap gap-1 pt-0.5">
                          {kinds.map((k) => {
                            const Icon = KIND_ICONS[k]
                            return <Icon key={k} className="h-4 w-4 text-[var(--teal-accent-strong)]" aria-label={kind(k)} />
                          })}
                        </span>
                      </span>
                      {course.mine && <span className="shrink-0 rounded-full bg-[var(--teal-accent-soft)] px-2 py-0.5 text-xs font-medium text-[var(--teal-accent-strong)]">{c('yours')}</span>}
                      {!course.listed && <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">{c('notListed')}</span>}
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </>
      )}
    </div>
  )
}
