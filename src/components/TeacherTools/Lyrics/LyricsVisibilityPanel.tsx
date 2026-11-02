import { useState } from 'react'
import { Globe, Lock } from 'lucide-react'
import { cardClass, hintClass, inputClass, labelClass, primaryButtonClass } from '../ui'
import { useAuth } from '../../../lib/AuthContext'
import { useLanguage } from '../../../lib/i18n'
import { authorNameFromEmail } from '../../../lib/courses'
import { setLyricsVisibility } from '../../../lib/teacherToolsApi'
import { LYRICS_AUTHOR_NAME_MAX, type LyricsActivity, type LyricsVisibility } from '../../../lib/lyricsGapFill'

export type LyricsSharing = Pick<LyricsActivity, 'visibility' | 'authorName' | 'adminHidden'>

/**
 * Private (only the author) or public (every teacher's library, credited by a name the teacher
 * types), like a mini course's CourseVisibilityPanel. Publishing is instant; shows when an admin
 * hid the activity. activityId is null until the activity is saved.
 */
export default function LyricsVisibilityPanel({
  activityId,
  sharing,
  onSharing,
}: {
  activityId: string | null
  sharing: LyricsSharing
  onSharing: (s: LyricsSharing) => void
}) {
  const { t } = useLanguage()
  const { user } = useAuth()
  const [name, setName] = useState(sharing.authorName || authorNameFromEmail(user?.email ?? ''))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)
  const isPublic = sharing.visibility === 'public'
  const trimmed = name.trim()

  async function save(visibility: LyricsVisibility) {
    if (!activityId) return
    if (visibility === 'private' && !window.confirm(t('lyMakePrivateConfirm'))) return
    setBusy(true)
    setError(false)
    try {
      const a = await setLyricsVisibility(activityId, visibility, trimmed)
      onSharing({ visibility: a.visibility, authorName: a.authorName, adminHidden: a.adminHidden })
    } catch {
      setError(true)
    } finally {
      setBusy(false)
    }
  }

  const option = (v: LyricsVisibility, Icon: typeof Globe) => (
    <button
      type="button"
      role="radio"
      aria-checked={sharing.visibility === v}
      disabled={busy || !activityId || (v === 'public' && !trimmed)}
      onClick={() => sharing.visibility !== v && void save(v)}
      className={`inline-flex items-center gap-1.5 rounded-lg border-2 px-3 py-1.5 text-sm disabled:opacity-50 ${sharing.visibility === v ? 'border-[var(--teal-accent)] bg-[var(--teal-accent-soft)] font-medium text-foreground' : 'border-border bg-card text-muted-foreground hover:border-[var(--teal-accent-border)]'}`}
    >
      <Icon className="h-4 w-4" />
      {t(v === 'public' ? 'lyVisibility_public' : 'lyVisibility_private')}
    </button>
  )

  return (
    <section className={cardClass}>
      <h2 className="font-semibold text-foreground">{t('lyVisibilityHeading')}</h2>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t('lyVisibilityHeading')}>
        {option('private', Lock)}
        {option('public', Globe)}
      </div>
      <ul className={`space-y-1 ${hintClass}`}>
        <li>
          <span className="font-semibold">{t('lyVisibility_private')}:</span> {t('lyVisibilityPrivateHint')}
        </li>
        <li>
          <span className="font-semibold">{t('lyVisibility_public')}:</span> {t('lyVisibilityPublicHint')}
        </li>
      </ul>

      {activityId ? (
        <label className="block space-y-1">
          <span className={labelClass}>{t('lyAuthorName')}</span>
          <input className={inputClass} value={name} maxLength={LYRICS_AUTHOR_NAME_MAX} onChange={(e) => setName(e.target.value)} />
          <span className={hintClass}>{t('lyAuthorNameHint')}</span>
        </label>
      ) : (
        <p className={hintClass}>{t('lyVisibilitySaveFirst')}</p>
      )}

      {isPublic && <p className="text-sm text-foreground">{sharing.adminHidden ? t('lyAdminHiddenNote') : t('lyInLibraryNow')}</p>}
      {error && <p className="text-sm text-red-600">{t('lyVisibilityError')}</p>}

      {isPublic && trimmed !== sharing.authorName && (
        <button type="button" className={primaryButtonClass} disabled={busy || !trimmed} onClick={() => void save('public')}>
          {t('lySaveName')}
        </button>
      )}
    </section>
  )
}
