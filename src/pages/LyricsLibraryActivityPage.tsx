import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Copy, Pencil, Presentation, Printer } from 'lucide-react'
import PageHeading from '../components/PageHeading'
import LyricsPreview from '../components/TeacherTools/Lyrics/LyricsPreview'
import ClassMode from '../components/TeacherTools/Lyrics/ClassMode'
import { cardClass, hintClass, primaryButtonClass, secondaryButtonClass } from '../components/TeacherTools/ui'
import { useLanguage } from '../lib/i18n'
import { printLyricsWorksheet } from '../lib/lyricsWorksheet'
import { TeacherToolsError, fetchLyricsLibraryActivity, saveLyricsActivity, setLyricsHidden } from '../lib/teacherToolsApi'
import { buildGapGroups, groupsByWord, tokenizeLyrics, type LyricsActivityInput, type LyricsLibraryActivity } from '../lib/lyricsGapFill'

/**
 * A public activity from the library (/teacher/tools/lyrics/library/:activityId), read-only:
 * print it, project it in class mode, or copy it to the caller's own (private) activities to edit.
 * Admins can hide it from the library or put it back.
 */
export default function LyricsLibraryActivityPage() {
  const { activityId } = useParams<{ activityId: string }>()
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [data, setData] = useState<LyricsLibraryActivity | null>(null)
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'notFound' | 'error'>('loading')
  const [message, setMessage] = useState<string | null>(null)
  const [copying, setCopying] = useState(false)
  const [hiding, setHiding] = useState(false)
  const [classMode, setClassMode] = useState(false)
  const closeClassMode = useCallback(() => setClassMode(false), [])

  useEffect(() => {
    if (!activityId) return
    let cancelled = false
    setLoadState('loading')
    fetchLyricsLibraryActivity(activityId)
      .then((d) => {
        if (cancelled) return
        setData(d)
        setLoadState('ready')
      })
      .catch((err) => !cancelled && setLoadState(err instanceof TeacherToolsError && err.status === 404 ? 'notFound' : 'error'))
    return () => {
      cancelled = true
    }
  }, [activityId])

  const activity = data?.activity
  const input: LyricsActivityInput | null = useMemo(
    () => (activity ? { title: activity.title, artist: activity.artist, videoUrl: activity.videoUrl, content: activity.content } : null),
    [activity],
  )
  const doc = useMemo(() => tokenizeLyrics(activity?.content.lyrics ?? ''), [activity])
  const groups = useMemo(() => buildGapGroups(doc, activity?.content.gaps ?? [], activity?.content.sheet.phraseGaps ?? true), [doc, activity])
  const byWord = useMemo(() => groupsByWord(groups), [groups])

  async function handleCopy() {
    if (!input) return
    setCopying(true)
    setMessage(null)
    try {
      const copy = await saveLyricsActivity(input)
      navigate(`/teacher/tools/lyrics/${copy.id}`)
    } catch {
      setMessage(t('lyCopyError'))
      setCopying(false)
    }
  }

  async function handleHidden() {
    if (!activity) return
    const hide = !activity.adminHidden
    if (hide && !window.confirm(t('lyAdminHideConfirm'))) return
    setHiding(true)
    setMessage(null)
    try {
      await setLyricsHidden(activity.id, hide)
      setData((d) => d && { ...d, activity: { ...d.activity, adminHidden: hide } })
    } catch {
      setMessage(t('lyVisibilityError'))
    } finally {
      setHiding(false)
    }
  }

  const back = (
    <Link to="/teacher/tools/lyrics?tab=library" className="text-sm text-primary hover:underline">
      {t('lyBackToLibrary')}
    </Link>
  )

  if (loadState === 'loading') return <p className="text-sm text-muted-foreground">Loading...</p>
  if (loadState !== 'ready' || !data || !activity || !input) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-red-600">{t(loadState === 'notFound' ? 'lyNotFound' : 'lyLoadError')}</p>
        {back}
      </div>
    )
  }

  const actions = (
    <div className="flex flex-wrap items-center gap-2">
      {message && <span className="text-sm text-red-600">{message}</span>}
      <button type="button" onClick={() => setClassMode(true)} disabled={groups.length === 0} className={`${secondaryButtonClass} inline-flex items-center gap-1.5`}>
        <Presentation className="h-4 w-4" />
        {t('lyClassMode')}
      </button>
      <button
        type="button"
        onClick={() => !printLyricsWorksheet(input) && setMessage(t('lyPopupBlocked'))}
        className={`${secondaryButtonClass} inline-flex items-center gap-1.5`}
      >
        <Printer className="h-4 w-4" />
        {t('lyPrint')}
      </button>
      {data.mine ? (
        <Link to={`/teacher/tools/lyrics/${activity.id}`} className={`${primaryButtonClass} inline-flex items-center gap-1.5`}>
          <Pencil className="h-4 w-4" />
          {t('lyEditMine')}
        </Link>
      ) : (
        <button type="button" onClick={() => void handleCopy()} disabled={copying} className={`${primaryButtonClass} inline-flex items-center gap-1.5`}>
          <Copy className="h-4 w-4" />
          {copying ? t('lyCopying') : t('lyCopyToMine')}
        </button>
      )}
    </div>
  )

  const subtitle = [activity.artist, activity.authorName && t('lyByAuthor', { name: activity.authorName })].filter(Boolean).join(' · ')

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeading title={activity.title} subtitle={subtitle || t('ttLyricsTitle')} actions={actions} />

      {!data.mine && <p className={hintClass}>{t('lyReadOnlyNote', { name: activity.authorName || '—' })}</p>}

      {data.admin && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900">
          {activity.adminHidden && <span>{t('lyAdminHiddenNote')}</span>}
          <button type="button" onClick={() => void handleHidden()} disabled={hiding} className="font-medium text-red-700 hover:underline disabled:opacity-50">
            {t(activity.adminHidden ? 'lyAdminUnhide' : 'lyAdminHide')}
          </button>
        </div>
      )}

      <section className={cardClass}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-semibold text-foreground">{t('lyPreview')}</h2>
          <span className="text-sm text-muted-foreground">{t('lyGapCount', { n: groups.length })}</span>
        </div>
        <LyricsPreview doc={doc} byWord={byWord} numberGaps={activity.content.sheet.numberGaps} />
      </section>

      {classMode && <ClassMode activity={input} onClose={closeClassMode} />}
    </div>
  )
}
