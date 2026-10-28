import { Flag } from 'lucide-react'
import { useLanguage } from '../../lib/i18n'
import type { ContentFlagTarget } from '../../lib/feedback'
import { useContentFlag } from '../AppLayout'

/**
 * The small flag on an exercise panel: opens Report a problem as a content flag with the
 * panel's label and what was on it (built when clicked, so it includes the learner's latest
 * answer). Renders nothing when signed out or outside AppLayout.
 */
export default function ContentFlagButton({ target, className = '' }: { target: () => ContentFlagTarget; className?: string }) {
  const { t } = useLanguage()
  const flagContent = useContentFlag()
  if (!flagContent) return null
  return (
    <button
      type="button"
      onClick={() => flagContent(target())}
      title={t('flagButton')}
      aria-label={t('flagButton')}
      className={`shrink-0 rounded-md p-1 text-slate-300 transition hover:bg-rose-50 hover:text-rose-500 focus-visible:text-rose-500 ${className}`}
    >
      <Flag className="h-3.5 w-3.5" aria-hidden="true" />
    </button>
  )
}
