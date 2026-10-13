import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Music } from 'lucide-react'
import PageHeading from '../components/PageHeading'
import { primaryButtonClass } from '../components/TeacherTools/ui'
import { useLanguage } from '../lib/i18n'
import { fetchLyricsActivities } from '../lib/teacherToolsApi'
import type { LyricsActivitySummary } from '../lib/lyricsGapFill'

/** The teacher's saved lyrics gap-fill activities (/teacher/tools/lyrics). */
export default function LyricsActivitiesPage() {
  const { t, lang } = useLanguage()
  const [activities, setActivities] = useState<LyricsActivitySummary[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetchLyricsActivities()
      .then(setActivities)
      .catch(() => setError(true))
  }, [])

  const newButton = (
    <Link to="/teacher/tools/lyrics/new" className={primaryButtonClass}>
      {t('lyNew')}
    </Link>
  )

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeading title={t('ttLyricsTitle')} subtitle={t('ttLyricsDesc')} actions={newButton} />

      {error && <p className="text-sm text-red-600">{t('lyLoadError')}</p>}
      {!error && activities === null && <p className="text-sm text-muted-foreground">Loading...</p>}

      {activities?.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <Music className="mx-auto h-8 w-8 text-[var(--teal-accent-strong)]" />
          <h2 className="mt-3 font-semibold text-foreground">{t('lyEmptyTitle')}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t('lyEmptyBody')}</p>
          <div className="mt-4">{newButton}</div>
        </div>
      )}

      {activities && activities.length > 0 && (
        <ul className="space-y-2">
          {activities.map((a) => (
            <li key={a.id}>
              <Link
                to={`/teacher/tools/lyrics/${a.id}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card px-4 py-3 hover:border-[var(--teal-accent-border)]"
              >
                <span className="min-w-0">
                  <span className="font-medium text-foreground">{a.title}</span>
                  {a.artist && <span className="text-muted-foreground"> — {a.artist}</span>}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t('lyGapCount', { n: a.gapCount })} · {t('lyUpdated', { date: new Date(a.updatedAt).toLocaleDateString(lang) })}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
