import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { cardClass, hintClass, secondaryButtonClass } from '../TeacherTools/ui'
import { useCourseCopy } from '../../data/courseCopy'
import { useLanguage, type MessageKey } from '../../lib/i18n'
import { fetchFixes, undoFix } from '../../lib/courseApi'
import { stepParts, stepSummary, type Course, type CourseItemFix, type CourseStep, type FlagReason } from '../../lib/courses'

const REASON_LABEL: Record<FlagReason, MessageKey> = {
  answer_rejected: 'flagReasonAnswerRejected',
  wrong_key: 'flagReasonWrongKey',
  faulty_logic: 'flagReasonFaultyLogic',
  several_fit: 'flagReasonSeveralFit',
  unclear: 'flagReasonUnclear',
  typo: 'flagReasonTypo',
  layout: 'flagReasonLayout',
  other: 'flagReasonOther',
}

/**
 * Before and after, part by part (prompt, answer, other correct orders…): a changed part shows
 * both versions and is marked; an unchanged one is shown once, muted.
 */
function FixDiff({ before, after, undone }: { before: CourseStep; after: CourseStep; undone: boolean }) {
  const { c } = useCourseCopy()
  const was = stepParts(before)
  const now = stepParts(after)
  const labels = [...new Set([...was, ...now].map((p) => p.label))]
  return (
    <dl className="space-y-1">
      {labels.map((label) => {
        const a = was.find((p) => p.label === label)?.text ?? ''
        const b = now.find((p) => p.label === label)?.text ?? ''
        const changed = a !== b
        return (
          <div key={label} className={changed ? 'rounded-md border-l-2 border-[var(--teal-accent-strong)] bg-[var(--teal-accent-soft)] px-2 py-1' : 'px-2'}>
            <dt className="text-xs font-medium text-muted-foreground">
              {c(`fixPart_${label}`)}
              {changed && <span className="ml-1.5 rounded bg-[var(--teal-accent)] px-1.5 py-px text-[0.65rem] uppercase tracking-wide text-primary">{c('fixChanged')}</span>}
            </dt>
            {changed ? (
              <dd className="space-y-0.5">
                <p className={undone ? 'text-foreground' : 'text-red-700 line-through dark:text-red-300'}>
                  <span className="sr-only">{c('fixBefore')}: </span>
                  {a || '—'}
                </p>
                <p className={undone ? 'text-muted-foreground line-through' : 'font-medium text-emerald-800 dark:text-emerald-200'}>
                  <span className="sr-only">{c('fixAfter')}: </span>
                  {b || '—'}
                </p>
              </dd>
            ) : (
              <dd className="text-muted-foreground">{a}</dd>
            )}
          </div>
        )
      })}
    </dl>
  )
}

/**
 * Exercises students flagged and the AI checked: what it changed (with Undo) or why it kept them.
 * Hidden until there is at least one; opening the course marks them seen.
 */
export default function CourseFixesPanel({ courseId, onCourse }: { courseId: string; onCourse: (course: Course) => void }) {
  const { c, lang } = useCourseCopy()
  const { t } = useLanguage()
  const [fixes, setFixes] = useState<CourseItemFix[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  useEffect(() => {
    fetchFixes(courseId)
      .then(setFixes)
      .catch(() => setFixes([]))
  }, [courseId])

  if (!fixes || fixes.length === 0) return null
  const fresh = fixes.filter((f) => !f.seen).length

  async function undo(f: CourseItemFix) {
    if (!window.confirm(c('undoFixConfirm'))) return
    setBusy(f.id)
    setError(null)
    try {
      const r = await undoFix(courseId, f.id)
      setFixes(r.fixes)
      onCourse(r.course)
    } catch (err) {
      setError((err as { code?: string })?.code === 'changed_since' ? c('undoChanged') : c('saveError'))
    } finally {
      setBusy(null)
    }
  }

  return (
    <section className={cardClass}>
      <h2 className="flex items-center gap-2 font-semibold text-foreground">
        <Sparkles className="h-4 w-4 text-[var(--teal-accent-strong)]" />
        {c('fixesHeading')}
        {fresh > 0 && <span className="rounded-full bg-[var(--teal-accent)] px-2 py-0.5 text-xs text-primary">{c('fixesNew', { n: fresh })}</span>}
      </h2>
      <p className={hintClass}>{c('fixesHint')}</p>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <ul className="divide-y divide-border">
        {fixes.map((f) => (
          <li key={f.id} className="space-y-1 py-3 text-sm">
            <p className="text-xs text-muted-foreground">
              {c('unitN', { n: f.unitPosition })} · {f.moduleTitle} · {t(REASON_LABEL[f.reason])} · {new Date(f.createdAt).toLocaleDateString(lang)}
            </p>
            {f.note && <p className="italic text-muted-foreground">“{f.note}”</p>}
            {f.stepAfter ? <FixDiff before={f.stepBefore} after={f.stepAfter} undone={f.status === 'undone'} /> : <p className="text-foreground">{stepSummary(f.stepBefore)}</p>}
            <p className="text-muted-foreground">
              <span className={f.status === 'unresolved' ? 'font-medium text-amber-700 dark:text-amber-300' : 'font-medium text-foreground'}>{c(`fixStatus_${f.status}`)}:</span> {f.verdict}
            </p>
            {f.status === 'fixed' && (
              <button type="button" className={secondaryButtonClass} disabled={busy === f.id} onClick={() => void undo(f)}>
                {c('undoFix')}
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
