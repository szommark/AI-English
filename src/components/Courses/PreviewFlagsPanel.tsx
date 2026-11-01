import { useState } from 'react'
import { Flag, Loader2, Wand2, X } from 'lucide-react'
import { secondaryButtonClass, primaryButtonClass } from '../TeacherTools/ui'
import { useCourseCopy } from '../../data/courseCopy'
import { useLanguage, type MessageKey } from '../../lib/i18n'
import { TeacherToolsError } from '../../lib/teacherToolsApi'
import { fixFlaggedItems, removePreviewFlag } from '../../lib/courseApi'
import { stepSummary, type Course, type CourseModule, type FlagReason } from '../../lib/courses'

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
 * The items the author flagged while previewing a module: each with its reason and note (removable),
 * and "Fix flagged items", which has the AI correct just those items and leaves the rest as it is.
 */
export default function PreviewFlagsPanel({
  module,
  onCourse,
  onRemaining,
  disabled,
}: {
  module: CourseModule
  onCourse: (c: Course) => void
  onRemaining: (n: number) => void
  disabled: boolean
}) {
  const { c } = useCourseCopy()
  const { t } = useLanguage()
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const flags = module.previewFlags
  if (flags.length === 0 && !message) return null

  async function fix() {
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const r = await fixFlaggedItems(module.id)
      onCourse(r.course)
      onRemaining(r.remaining)
      setMessage(r.left ? c('previewFixPartly', { n: r.fixed, m: r.left }) : c('previewFixDone', { n: r.fixed }))
    } catch (err) {
      setError(err instanceof TeacherToolsError && err.code === 'daily_limit' ? c('dailyLimit') : c('previewFixError'))
    } finally {
      setBusy(false)
    }
  }

  async function remove(stepId: string) {
    setError(null)
    try {
      onCourse(await removePreviewFlag(module.id, stepId))
    } catch {
      setError(c('saveError'))
    }
  }

  return (
    <div className="space-y-2 rounded-lg border border-amber-300 bg-amber-50/60 p-3 dark:border-amber-700 dark:bg-amber-950/30">
      {flags.length > 0 && (
        <>
          <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <Flag className="h-4 w-4 text-amber-600" />
            {c('previewFlagsHeading', { n: flags.length })}
          </p>
          <ul className="space-y-1.5">
            {flags.map((f) => (
              <li key={f.stepId} className="flex items-start gap-2 rounded-md bg-background/80 p-2 text-sm">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">{t(REASON_LABEL[f.reason])}</p>
                  {f.note && <p className="text-foreground/90">“{f.note}”</p>}
                  <p className="truncate text-xs text-muted-foreground">{stepSummary(f.step)}</p>
                </div>
                <button type="button" aria-label={c('remove')} title={c('remove')} disabled={busy} onClick={() => void remove(f.stepId)} className="rounded p-1 text-muted-foreground hover:bg-secondary disabled:opacity-40">
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className={`${primaryButtonClass} inline-flex items-center gap-1.5`} disabled={disabled || busy} onClick={() => void fix()}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
              {busy ? c('previewFixing') : c('previewFix', { n: flags.length })}
            </button>
            <span className="text-xs text-muted-foreground">{c('previewFixHint')}</span>
          </div>
        </>
      )}
      {message && (
        <p role="status" className="flex items-center gap-2 text-sm text-foreground">
          {message}
          <button type="button" className={`${secondaryButtonClass} ml-auto px-2 py-0.5 text-xs`} onClick={() => setMessage(null)}>
            OK
          </button>
        </p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
