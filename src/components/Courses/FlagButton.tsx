import { useState } from 'react'
import { Flag, Loader2 } from 'lucide-react'
import { useCourseCopy } from '../../data/courseCopy'
import { useLanguage, type MessageKey } from '../../lib/i18n'
import { FLAG_REASONS, type FlagReason, type FlagResult } from '../../lib/courses'
import { FeedbackRateLimitError } from '../../lib/feedbackApi'

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
 * "Is this exercise wrong?": the student picks a reason (the Grammar Coach flag reasons, plus
 * several answers fitting) and an optional note; the AI checks the exercise at once and fixes it
 * when it really is wrong. "Hard to use / layout" (every screen, also the teacher's preview)
 * goes to the team's feedback inbox instead.
 */
export default function FlagButton({
  onFlag,
  onLayout,
}: {
  /** Content flags (students, question steps only). */
  onFlag?: (reason: FlagReason, note: string) => Promise<FlagResult>
  onLayout: (note: string) => Promise<void>
}) {
  const { c } = useCourseCopy()
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState<FlagReason | null>(null)
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<FlagResult | null>(null)
  const reasons: readonly FlagReason[] = onFlag ? FLAG_REASONS : ['layout']
  const [error, setError] = useState<string | null>(null)

  async function send() {
    if (!reason) return
    setBusy(true)
    setError(null)
    try {
      if (reason === 'layout' || !onFlag) {
        await onLayout(note.trim())
        setResult({ wrong: false, explanation: c('flagLayoutSent'), step: null })
      } else {
        setResult(await onFlag(reason, note.trim()))
      }
    } catch (err) {
      const code = err instanceof FeedbackRateLimitError ? 'daily_limit' : (err as { code?: string })?.code
      setError(code === 'daily_limit' ? c('flagLimit') : code === 'already_flagged' ? c('flagAlready') : c('flagError'))
    } finally {
      setBusy(false)
    }
  }

  if (result)
    return (
      <p role="status" className={`rounded-lg p-2.5 text-sm ${result.wrong ? 'bg-[var(--teal-accent-soft)] text-foreground' : 'bg-secondary text-foreground'}`}>
        {reason !== 'layout' && <span className="font-semibold">{result.wrong ? c('flagFixed') : c('flagKept')}</span>} {result.explanation}
      </p>
    )

  if (!open)
    return (
      <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <Flag className="h-3.5 w-3.5" />
        {onFlag ? c('flagThis') : c('flagLayoutThis')}
      </button>
    )

  return (
    <div className="space-y-2 rounded-lg border border-border bg-card p-3 text-sm">
      <p className="font-medium text-foreground">{t('flagReasonLabel')}</p>
      <div className="space-y-1">
        {reasons.map((r) => (
          <label key={r} className="flex items-center gap-2 text-foreground">
            <input type="radio" name="course-flag" checked={reason === r} onChange={() => setReason(r)} />
            {t(REASON_LABEL[r])}
          </label>
        ))}
      </div>
      <input
        value={note}
        maxLength={500}
        onChange={(e) => setNote(e.target.value)}
        placeholder={c('flagNote')}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={!reason || busy}
          onClick={() => void send()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--teal-accent)] px-3 py-1.5 text-sm font-semibold text-primary disabled:opacity-50"
        >
          {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {busy ? c('flagChecking') : c('flagSend')}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-muted-foreground hover:underline">
          {c('cancel')}
        </button>
      </div>
    </div>
  )
}
