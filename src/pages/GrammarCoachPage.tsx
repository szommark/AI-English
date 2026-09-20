import { useCallback, useEffect, useRef, useState } from 'react'
import PageHeading from '../components/PageHeading'
import { localizeFeature, useLanguage } from '../lib/i18n'
import { getFeature } from '../data/features'
import { type CefrLevel, type GrammarItem } from '../data/grammarCurriculum'
import type { GrammarLesson } from '../lib/types'
import { fetchCachedGrammarLesson, requestGrammarLesson } from '../lib/grammarCoachApi'
import { useSegmentPlayer } from '../hooks/useSegmentPlayer'
import type { BoardTheme } from '../components/GrammarCoach/boardTheme'
import GrammarRail from '../components/GrammarCoach/GrammarRail'
import ChalkBoard from '../components/GrammarCoach/ChalkBoard'
import GrammarWidgetView from '../components/GrammarCoach/GrammarWidgetView'
import VoiceBar from '../components/GrammarCoach/VoiceBar'
import PracticeCheck from '../components/GrammarCoach/PracticeCheck'
import { boardThemes } from '../components/GrammarCoach/boardTheme'

const grammarFeature = getFeature('grammar-coach')!

// At these levels the lesson is narrated in the learner's UI language instead of English.
const SUPPORT_LANGUAGE_LEVELS: CefrLevel[] = ['A1', 'A2']

const NARRATION_LOCALES = { hu: 'hu-HU', en: 'en-US', de: 'de-DE' } as const

export default function GrammarCoachPage() {
  const { lang, t: tr } = useLanguage()
  const [selected, setSelected] = useState<{ level: CefrLevel; item: GrammarItem } | null>(null)
  const [lesson, setLesson] = useState<GrammarLesson | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [theme, setTheme] = useState<BoardTheme>('green')

  // Guards against a stale async response landing after the learner has already picked
  // a different grammar item (fast clicks, slow network, etc.).
  const selectionTokenRef = useRef(0)
  const pendingAutoPlayRef = useRef(false)

  const narrationLang = selected && SUPPORT_LANGUAGE_LEVELS.includes(selected.level) ? NARRATION_LOCALES[lang] : 'en-US'
  const player = useSegmentPlayer(lesson?.segments ?? [], narrationLang)

  const handleSelectItem = useCallback((level: CefrLevel, item: GrammarItem) => {
    const token = ++selectionTokenRef.current
    pendingAutoPlayRef.current = false
    player.reset()
    setSelected({ level, item })
    setLesson(null)
    setIsGenerating(false)

    fetchCachedGrammarLesson(level, item.id, lang).then((cached) => {
      if (selectionTokenRef.current !== token || !cached) return
      setLesson(cached)
    })
    // player.reset intentionally omitted from deps — it's stable enough for this handler's purpose.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang])

  // Lessons are written in the UI language, so switching it swaps in (or clears) the lesson for the same item.
  useEffect(() => {
    if (selected) handleSelectItem(selected.level, selected.item)
    // Only a language change should re-select the current item.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang])

  const handlePlay = useCallback(async () => {
    if (!selected) return

    if (lesson) {
      player.play()
      return
    }

    const token = selectionTokenRef.current
    pendingAutoPlayRef.current = true
    setIsGenerating(true)
    try {
      const generated = await requestGrammarLesson(selected.level, selected.item.id, lang)
      if (selectionTokenRef.current !== token) return
      setLesson(generated)
    } catch (err) {
      console.error('Grammar lesson request failed', err)
      if (selectionTokenRef.current !== token) return
      pendingAutoPlayRef.current = false
    } finally {
      if (selectionTokenRef.current === token) setIsGenerating(false)
    }
  }, [selected, lesson, player])

  useEffect(() => {
    if (lesson && pendingAutoPlayRef.current) {
      pendingAutoPlayRef.current = false
      player.play()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson])

  function handleTogglePlay() {
    if (player.isPlaying) {
      player.pause()
    } else if (player.isPaused) {
      player.resume()
    } else {
      handlePlay()
    }
  }

  const boardStatus = isGenerating ? 'loading' : lesson ? 'content' : 'idle'
  const currentSegment = lesson?.segments[player.currentIndex]
  const t = boardThemes[theme]

  return (
    <div className="space-y-6">
      <PageHeading title={localizeFeature(lang, grammarFeature).title} subtitle={tr('grammarSubtitle')} />

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <GrammarRail selectedItemId={selected?.item.id ?? null} onSelectItem={handleSelectItem} />

        <div className="space-y-4 min-w-0">
          <div className="flex items-center justify-end">
            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-sm">
              {(['green', 'black'] as const).map((option) => (
                <button
                  key={option}
                  onClick={() => setTheme(option)}
                  className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition ${
                    theme === option ? 'bg-amber-100 text-amber-700' : 'text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  {option === 'green' ? 'Green board' : 'Black board'}
                </button>
              ))}
            </div>
          </div>

          <ChalkBoard status={boardStatus} theme={theme} title={selected?.item.title} titleGloss={lang === 'hu' ? selected?.item.titleHu : undefined}>
            {currentSegment && <GrammarWidgetView widget={currentSegment.widget} theme={t} />}
          </ChalkBoard>

          <VoiceBar
            segmentCount={lesson?.segments.length ?? 0}
            currentIndex={player.currentIndex}
            isPlaying={player.isPlaying}
            isGenerating={isGenerating}
            hasLesson={Boolean(lesson)}
            rate={player.rate}
            onTogglePlay={handleTogglePlay}
            onPrev={() => player.goToSegment(player.currentIndex - 1)}
            onNext={() => player.goToSegment(player.currentIndex + 1)}
            onSeekSegment={player.goToSegment}
            onSetRate={player.setRate}
          />

          {player.isFinished && lesson && <PracticeCheck practice={lesson.practice} />}

          {!selected && (
            <p className="text-center text-sm text-slate-400">{tr('pickGrammarPoint')}</p>
          )}
        </div>
      </div>
    </div>
  )
}
