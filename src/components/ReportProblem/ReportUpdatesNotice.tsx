import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { CheckCircle2, MessageSquare, X } from 'lucide-react'
import { useLanguage } from '../../lib/i18n'
import type { MyFeedbackReport } from '../../lib/feedback'
import { fetchMyFeedbackUpdates, markMyFeedbackSeen } from '../../lib/feedbackApi'
import { noticeTitle } from './reportLabels'

const CHECKED_KEY = 'avalon:report-updates-checked'

function alreadyChecked(userId: string): boolean {
  try {
    return sessionStorage.getItem(CHECKED_KEY) === userId
  } catch {
    return false
  }
}

function markChecked(userId: string) {
  try {
    sessionStorage.setItem(CHECKED_KEY, userId)
  } catch {
    // Without storage the check simply runs again on the next load.
  }
}

/**
 * One-time notice when a report the user sent was fixed, closed or answered since they last
 * looked. Checked once per tab session; "View" opens /my-reports (which marks everything seen),
 * the close button marks just these reports seen.
 */
export default function ReportUpdatesNotice({ userId }: { userId: string }) {
  const { t } = useLanguage()
  const { pathname } = useLocation()
  const [updates, setUpdates] = useState<MyFeedbackReport[]>([])

  useEffect(() => {
    if (alreadyChecked(userId) || pathname === '/my-reports') return
    markChecked(userId)
    fetchMyFeedbackUpdates()
      .then(setUpdates)
      .catch(() => {})
    // Once per session and user, not on every navigation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  // My reports marks them seen itself; drop the notice when the user gets there.
  useEffect(() => {
    if (pathname === '/my-reports') setUpdates([])
  }, [pathname])

  if (updates.length === 0) return null
  const [latest] = updates
  const fixed = latest.status === 'fixed'

  function dismiss() {
    markMyFeedbackSeen(updates.map((u) => u.id)).catch(() => {})
    setUpdates([])
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-4 bottom-16 z-50 rounded-xl border border-border bg-card p-4 shadow-lg sm:inset-x-auto sm:bottom-4 sm:left-6 sm:w-96"
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label={t('reportClose')}
        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
      <div className="flex gap-3 pr-5">
        {fixed ? (
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
        ) : (
          <MessageSquare className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand-navy)]" aria-hidden="true" />
        )}
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-semibold text-foreground">{t(noticeTitle(latest))}</p>
          <p className="truncate text-xs text-muted-foreground">„{latest.description}”</p>
          {updates.length > 1 && <p className="text-xs text-muted-foreground">{t('fnMore', { n: updates.length - 1 })}</p>}
          <Link
            to="/my-reports"
            className="inline-block pt-1 text-sm font-semibold text-[var(--brand-navy)] hover:underline"
          >
            {t('fnView')} →
          </Link>
        </div>
      </div>
    </div>
  )
}
