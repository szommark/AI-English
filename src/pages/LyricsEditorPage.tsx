import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Presentation, Printer, Trash2 } from 'lucide-react'
import PageHeading from '../components/PageHeading'
import GapPickerPanel from '../components/TeacherTools/Lyrics/GapPickerPanel'
import WorksheetPanel from '../components/TeacherTools/Lyrics/WorksheetPanel'
import LyricsPreview from '../components/TeacherTools/Lyrics/LyricsPreview'
import ChoiceEditor from '../components/TeacherTools/Lyrics/ChoiceEditor'
import ClassMode from '../components/TeacherTools/Lyrics/ClassMode'
import { cardClass, hintClass, inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from '../components/TeacherTools/ui'
import { useLanguage, type MessageKey } from '../lib/i18n'
import { printLyricsWorksheet } from '../lib/lyricsWorksheet'
import { TeacherToolsError, deleteLyricsActivity, fetchLyricsActivity, saveLyricsActivity } from '../lib/teacherToolsApi'
import {
  DEFAULT_AUTO_PICK,
  DEFAULT_WORKSHEET,
  LYRICS_ARTIST_MAX_LENGTH,
  LYRICS_MAX_GAPS,
  LYRICS_MAX_LENGTH,
  LYRICS_TITLE_MAX_LENGTH,
  LYRICS_URL_MAX_LENGTH,
  autoPickGaps,
  buildGapGroups,
  groupsByWord,
  remapWordIndices,
  targetGapCount,
  tokenizeLyrics,
  type AutoPickOptions,
  type LyricsActivity,
  type LyricsActivityInput,
  type LyricsGapSuggestion,
  type WorksheetOptions,
} from '../lib/lyricsGapFill'

interface Draft {
  title: string
  artist: string
  videoUrl: string
  lyrics: string
  gaps: number[]
  distractors: Record<string, string[]>
  auto: AutoPickOptions
  sheet: WorksheetOptions
}

const EMPTY_DRAFT: Draft = {
  title: '',
  artist: '',
  videoUrl: '',
  lyrics: '',
  gaps: [],
  distractors: {},
  auto: DEFAULT_AUTO_PICK,
  sheet: DEFAULT_WORKSHEET,
}

function draftFrom(a: LyricsActivity): Draft {
  const c = a.content
  return {
    title: a.title,
    artist: a.artist,
    videoUrl: a.videoUrl,
    lyrics: c.lyrics,
    gaps: c.gaps,
    distractors: c.distractors ?? {},
    auto: { ...DEFAULT_AUTO_PICK, ...c.auto },
    sheet: { ...DEFAULT_WORKSHEET, ...c.sheet },
  }
}

function toInput(d: Draft): LyricsActivityInput {
  return {
    title: d.title.trim(),
    artist: d.artist.trim(),
    videoUrl: d.videoUrl.trim(),
    content: { version: 1, lyrics: d.lyrics, gaps: d.gaps, distractors: d.distractors, auto: d.auto, sheet: d.sheet },
  }
}

/** Create (/teacher/tools/lyrics/new) or edit (/teacher/tools/lyrics/:activityId) a lyrics gap-fill. */
export default function LyricsEditorPage() {
  const { activityId } = useParams<{ activityId: string }>()
  const navigate = useNavigate()
  const { t } = useLanguage()

  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'notFound' | 'error'>(activityId ? 'loading' : 'ready')
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT)
  const [savedSnapshot, setSavedSnapshot] = useState(() => JSON.stringify(toInput(EMPTY_DRAFT)))
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null)
  const [pickMessage, setPickMessage] = useState<string | null>(null)
  const [classMode, setClassMode] = useState(false)
  // Stable, so class mode's keyboard/fullscreen effect doesn't re-run on every render.
  const closeClassMode = useCallback(() => setClassMode(false), [])
  // Remounts the choice editor when options change from outside it (AI suggestions).
  const [choiceVersion, setChoiceVersion] = useState(0)

  useEffect(() => {
    if (!activityId) return
    let cancelled = false
    setLoadState('loading')
    fetchLyricsActivity(activityId)
      .then((a) => {
        if (cancelled) return
        const d = draftFrom(a)
        setDraft(d)
        setSavedSnapshot(JSON.stringify(toInput(d)))
        setLoadState('ready')
      })
      .catch((err) => !cancelled && setLoadState(err instanceof TeacherToolsError && err.status === 404 ? 'notFound' : 'error'))
    return () => {
      cancelled = true
    }
  }, [activityId])

  const doc = useMemo(() => tokenizeLyrics(draft.lyrics), [draft.lyrics])
  const groups = useMemo(() => buildGapGroups(doc, draft.gaps, draft.sheet.phraseGaps), [doc, draft.gaps, draft.sheet.phraseGaps])
  const byWord = useMemo(() => groupsByWord(groups), [groups])
  const input = useMemo(() => toInput(draft), [draft])
  const dirty = JSON.stringify(input) !== savedSnapshot

  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const update = (patch: Partial<Draft>) => {
    setDraft((d) => ({ ...d, ...patch }))
    setMessage(null)
  }

  /** Keeps gaps (and their options) on the same words when the lyrics are edited. */
  function changeLyrics(lyrics: string) {
    setDraft((d) => {
      const before = tokenizeLyrics(d.lyrics)
      const after = tokenizeLyrics(lyrics)
      const map = remapWordIndices(before.words, after.words)
      const gaps = d.gaps.map((g) => map.get(g)).filter((g): g is number => g !== undefined)
      const distractors: Record<string, string[]> = {}
      for (const [key, list] of Object.entries(d.distractors)) {
        const moved = map.get(Number(key))
        if (moved !== undefined) distractors[String(moved)] = list
      }
      return { ...d, lyrics, gaps, distractors }
    })
    setMessage(null)
  }

  function toggleWord(word: number) {
    const group = byWord.get(word)
    if (group) {
      const remove = new Set(group.words)
      update({ gaps: draft.gaps.filter((g) => !remove.has(g)) })
    } else if (draft.gaps.length < LYRICS_MAX_GAPS) {
      update({ gaps: [...draft.gaps, word].sort((a, b) => a - b) })
    }
  }

  function pick(auto: AutoPickOptions) {
    const { gaps, target, relaxed } = autoPickGaps(doc, auto, draft.sheet.phraseGaps)
    let note: string | null = null
    if (doc.words.length > 0 && gaps.length === 0) note = t('lyPickedNone')
    else if (gaps.length < target && auto.exact) note = t('lyTooFewWords', { n: gaps.length })
    else if (gaps.length < target) note = t('lyShortOfTarget', { got: gaps.length, target })
    else if (relaxed.length) {
      note = t('lyRelaxed', { target, rules: relaxed.map((r) => t(`lyRelax_${r}` as MessageKey)).join(', ') })
    }
    setPickMessage(note)
    update({ auto, gaps })
  }

  const applySuggestions = useCallback((suggestions: LyricsGapSuggestion[]) => {
    setDraft((d) => {
      const gaps = [...new Set(suggestions.flatMap((s) => s.words))].sort((a, b) => a - b).slice(0, LYRICS_MAX_GAPS)
      const distractors: Record<string, string[]> = {}
      for (const s of suggestions) if (s.distractors.length) distractors[String(s.words[0])] = s.distractors
      // A multi-word suggestion only reads as one gap with phrase gaps on.
      const phrase = suggestions.some((s) => s.words.length > 1)
      return { ...d, gaps, distractors, sheet: phrase ? { ...d.sheet, phraseGaps: true } : d.sheet }
    })
    setChoiceVersion((v) => v + 1)
    setPickMessage(null)
  }, [])

  async function handleSave() {
    if (!input.title) {
      setMessage({ text: t('lyNeedTitle'), error: true })
      return
    }
    setSaving(true)
    setMessage(null)
    try {
      const saved = await saveLyricsActivity(input, activityId)
      setSavedSnapshot(JSON.stringify(toInput(draftFrom(saved))))
      setMessage({ text: t('lySaved'), error: false })
      if (!activityId) navigate(`/teacher/tools/lyrics/${saved.id}`, { replace: true })
    } catch {
      setMessage({ text: t('lySaveError'), error: true })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!activityId || !window.confirm(t('lyDeleteConfirm'))) return
    try {
      await deleteLyricsActivity(activityId)
      setSavedSnapshot(JSON.stringify(input))
      navigate('/teacher/tools/lyrics', { replace: true })
    } catch {
      setMessage({ text: t('lySaveError'), error: true })
    }
  }

  function handlePrint() {
    if (!input.title) {
      setMessage({ text: t('lyNeedTitle'), error: true })
      return
    }
    if (!printLyricsWorksheet(input)) setMessage({ text: t('lyPopupBlocked'), error: true })
  }

  if (loadState === 'loading') return <p className="text-sm text-muted-foreground">Loading...</p>
  if (loadState === 'notFound' || loadState === 'error') {
    return (
      <div className="space-y-3">
        <p className="text-sm text-red-600">{t(loadState === 'notFound' ? 'lyNotFound' : 'lyLoadError')}</p>
        <Link to="/teacher/tools/lyrics" className="text-sm text-primary hover:underline">
          {t('lyBackToList')}
        </Link>
      </div>
    )
  }

  const actions = (
    <div className="flex flex-wrap items-center gap-2">
      {message ? (
        <span className={`text-sm ${message.error ? 'text-red-600' : 'text-emerald-700'}`}>{message.text}</span>
      ) : (
        dirty && <span className="text-sm text-muted-foreground">{t('lyUnsaved')}</span>
      )}
      <button
        type="button"
        onClick={() => setClassMode(true)}
        disabled={groups.length === 0}
        className={`${secondaryButtonClass} inline-flex items-center gap-1.5`}
      >
        <Presentation className="h-4 w-4" />
        {t('lyClassMode')}
      </button>
      <button type="button" onClick={handlePrint} className={`${secondaryButtonClass} inline-flex items-center gap-1.5`}>
        <Printer className="h-4 w-4" />
        {t('lyPrint')}
      </button>
      <button type="button" onClick={handleSave} disabled={saving} className={primaryButtonClass}>
        {saving ? t('lySaving') : t('lySave')}
      </button>
    </div>
  )

  return (
    <div className="space-y-6">
      <PageHeading title={draft.title.trim() || t(activityId ? 'lyCrumbEdit' : 'lyNew')} subtitle={t('ttLyricsTitle')} actions={actions} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        <div className="space-y-6">
          <section className={cardClass}>
            <h2 className="font-semibold text-foreground">{t('lySong')}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1">
                <span className={labelClass}>{t('lySongTitle')}</span>
                <input value={draft.title} maxLength={LYRICS_TITLE_MAX_LENGTH} onChange={(e) => update({ title: e.target.value })} className={inputClass} />
              </label>
              <label className="space-y-1">
                <span className={labelClass}>{t('lyArtist')}</span>
                <input value={draft.artist} maxLength={LYRICS_ARTIST_MAX_LENGTH} onChange={(e) => update({ artist: e.target.value })} className={inputClass} />
              </label>
            </div>
            <label className="block space-y-1">
              <span className={labelClass}>{t('lyVideo')}</span>
              <input
                type="url"
                value={draft.videoUrl}
                maxLength={LYRICS_URL_MAX_LENGTH}
                onChange={(e) => update({ videoUrl: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=…"
                className={inputClass}
              />
              <span className={hintClass}>{t('lyVideoHint')}</span>
            </label>
            <label className="block space-y-1">
              <span className="flex items-baseline justify-between gap-2">
                <span className={labelClass}>{t('lyLyrics')}</span>
                <span className={hintClass}>{t('lyWordCount', { n: doc.words.length })}</span>
              </span>
              <textarea
                rows={12}
                value={draft.lyrics}
                maxLength={LYRICS_MAX_LENGTH}
                onChange={(e) => changeLyrics(e.target.value)}
                placeholder={t('lyLyricsPlaceholder')}
                className={`${inputClass} font-mono text-[13px] leading-6`}
              />
            </label>
            <p className={hintClass}>{t('lyRightsNote')}</p>
          </section>

          <GapPickerPanel
            auto={draft.auto}
            onChange={(auto) => update({ auto })}
            onPick={() => pick(draft.auto)}
            onShuffle={() => pick({ ...draft.auto, seed: (draft.auto.seed + 1) % 2 ** 31 })}
            onClear={() => {
              setPickMessage(null)
              update({ gaps: [] })
            }}
            pickMessage={pickMessage}
            lyrics={draft.lyrics}
            targetCount={targetGapCount(doc, draft.auto) || draft.auto.amount}
            onSuggested={applySuggestions}
          />

          <WorksheetPanel sheet={draft.sheet} onChange={(sheet) => update({ sheet })} />
        </div>

        <div className="space-y-6">
          <section className={`${cardClass} lg:sticky lg:top-20`}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-semibold text-foreground">{t('lyPreview')}</h2>
              <span className="text-sm text-muted-foreground">{t('lyGapCount', { n: groups.length })}</span>
            </div>
            <p className={hintClass}>{t('lyPreviewHint')}</p>
            <div className="max-h-[70vh] overflow-y-auto pr-1">
              <LyricsPreview doc={doc} byWord={byWord} numberGaps={draft.sheet.numberGaps} onToggleWord={toggleWord} />
            </div>
          </section>

          {draft.sheet.answerMode === 'choice' && (
            <ChoiceEditor
              key={choiceVersion}
              groups={groups}
              distractors={draft.distractors}
              choiceCount={draft.sheet.choiceCount}
              seed={draft.auto.seed}
              onChange={(distractors) => update({ distractors })}
            />
          )}

          {activityId && (
            <button type="button" onClick={handleDelete} className="inline-flex items-center gap-1.5 text-sm text-red-600 hover:underline">
              <Trash2 className="h-4 w-4" />
              {t('lyDelete')}
            </button>
          )}
        </div>
      </div>

      {classMode && <ClassMode activity={input} onClose={closeClassMode} />}
    </div>
  )
}
