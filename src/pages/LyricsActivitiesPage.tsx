import { useEffect, useState, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Globe, Music } from 'lucide-react'
import PageHeading from '../components/PageHeading'
import { inputClass, primaryButtonClass } from '../components/TeacherTools/ui'
import { useLanguage, type MessageKey } from '../lib/i18n'
import { fetchLyricsActivities, fetchLyricsLibrary, setLyricsHidden } from '../lib/teacherToolsApi'
import { matchesLyricsLibraryQuery, type LyricsActivitySummary, type LyricsLibraryItem } from '../lib/lyricsGapFill'

type Tab = 'mine' | 'library'

/** The teacher's saved lyrics gap-fill activities and the library of public ones (/teacher/tools/lyrics). */
export default function LyricsActivitiesPage() {
  const { t } = useLanguage()
  const [params, setParams] = useSearchParams()
  const tab: Tab = params.get('tab') === 'library' ? 'library' : 'mine'

  const newButton = (
    <Link to="/teacher/tools/lyrics/new" className={primaryButtonClass}>
      {t('lyNew')}
    </Link>
  )

  const tabButton = (id: Tab, label: MessageKey) => (
    <button
      type="button"
      role="tab"
      aria-selected={tab === id}
      onClick={() => setParams(id === 'library' ? { tab: 'library' } : {}, { replace: true })}
      className={`-mb-px border-b-2 px-3 py-2 text-sm ${tab === id ? 'border-[var(--teal-accent)] font-medium text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
    >
      {t(label)}
    </button>
  )

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeading title={t('ttLyricsTitle')} subtitle={t('ttLyricsDesc')} actions={newButton} />
      <div role="tablist" className="flex gap-1 border-b border-border">
        {tabButton('mine', 'lyTabMine')}
        {tabButton('library', 'lyTabLibrary')}
      </div>
      {tab === 'mine' ? <MyActivities newButton={newButton} /> : <Library />}
    </div>
  )
}

function MyActivities({ newButton }: { newButton: ReactNode }) {
  const { t, lang } = useLanguage()
  const [activities, setActivities] = useState<LyricsActivitySummary[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetchLyricsActivities()
      .then(setActivities)
      .catch(() => setError(true))
  }, [])

  return (
    <>
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
                  {a.visibility === 'public' && (
                    <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-[var(--teal-accent-soft)] px-2 py-0.5 align-middle text-xs font-medium text-[var(--teal-accent-strong)]">
                      <Globe className="h-3 w-3" />
                      {t('lyPublicBadge')}
                    </span>
                  )}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t('lyGapCount', { n: a.gapCount })} · {t('lyUpdated', { date: new Date(a.updatedAt).toLocaleDateString(lang) })}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

function Library() {
  const { t, lang } = useLanguage()
  const [data, setData] = useState<{ activities: LyricsLibraryItem[]; admin: boolean } | null>(null)
  const [error, setError] = useState(false)
  const [query, setQuery] = useState('')
  const [busy, setBusy] = useState<string | null>(null)

  useEffect(() => {
    fetchLyricsLibrary()
      .then(setData)
      .catch(() => setError(true))
  }, [])

  async function toggleHidden(item: LyricsLibraryItem) {
    if (!item.hidden && !window.confirm(t('lyAdminHideConfirm'))) return
    setBusy(item.id)
    try {
      setData(await setLyricsHidden(item.id, !item.hidden))
    } catch {
      window.alert(t('lyVisibilityError'))
    } finally {
      setBusy(null)
    }
  }

  const shown = data?.activities.filter((a) => matchesLyricsLibraryQuery(a, query)) ?? []

  return (
    <>
      <p className="text-sm text-muted-foreground">{t('lyLibraryIntro')}</p>
      {error && <p className="text-sm text-red-600">{t('lyLibraryLoadError')}</p>}
      {!error && data === null && <p className="text-sm text-muted-foreground">Loading...</p>}
      {data && data.activities.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <Globe className="mx-auto h-8 w-8 text-[var(--teal-accent-strong)]" />
          <p className="mt-3 text-sm text-muted-foreground">{t('lyLibraryEmpty')}</p>
        </div>
      )}
      {data && data.activities.length > 0 && (
        <>
          <input type="search" className={inputClass} value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('lyLibrarySearch')} aria-label={t('lyLibrarySearch')} />
          {shown.length === 0 && <p className="text-sm text-muted-foreground">{t('lyLibraryNoMatch')}</p>}
          <ul className="space-y-2">
            {shown.map((a) => (
              <li key={a.id} className={`flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 hover:border-[var(--teal-accent-border)] ${a.hidden ? 'opacity-60' : ''}`}>
                <Link to={a.mine ? `/teacher/tools/lyrics/${a.id}` : `/teacher/tools/lyrics/library/${a.id}`} className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-2">
                  <span className="min-w-0">
                    <span className="font-medium text-foreground">{a.title}</span>
                    {a.artist && <span className="text-muted-foreground"> — {a.artist}</span>}
                    {a.mine && <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 align-middle text-xs font-medium text-foreground">{t('lyYours')}</span>}
                    {a.hidden && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 align-middle text-xs font-medium text-amber-800">{t('lyHiddenBadge')}</span>}
                    {a.authorName && <span className="block text-xs text-muted-foreground">{t('lyByAuthor', { name: a.authorName })}</span>}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {t('lyGapCount', { n: a.gapCount })} · {t(`lyMode_${a.answerMode}` as MessageKey)} · {t('lyUpdated', { date: new Date(a.updatedAt).toLocaleDateString(lang) })}
                  </span>
                </Link>
                {data.admin && (
                  <button type="button" disabled={busy === a.id} onClick={() => void toggleHidden(a)} className="text-xs text-red-600 hover:underline disabled:opacity-50">
                    {t(a.hidden ? 'lyAdminUnhide' : 'lyAdminHide')}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  )
}
