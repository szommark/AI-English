import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
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
import ModelPicker from '../components/ModelPicker'

const HUNGARIAN_NARRATION_LEVELS: CefrLevel[] = ['A1', 'A2']

export default function GrammarCoachPage() {
  const [selected, setSelected] = useState<{ level: CefrLevel; item: GrammarItem } | null>(null)
  const [lesson, setLesson] = useState<GrammarLesson | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [theme, setTheme] = useState<BoardTheme>('green')

  // Guards against a stale async response landing after the learner has already picked
  // a different grammar item (fast clicks, slow network, etc.).
  const selectionTokenRef = useRef(0)
  const pendingAutoPlayRef = useRef(false)

  const narrationLang = selected && HUNGARIAN_NARRATION_LEVELS.includes(selected.level) ? 'hu-HU' : 'en-US'
  const player = useSegmentPlayer(lesson?.segments ?? [], narrationLang)

  const handleSelectItem = useCallback((level: CefrLevel, item: GrammarItem) => {
    const token = ++selectionTokenRef.current
    pendingAutoPlayRef.current = false
    player.reset()
    setSelected({ level, item })
    setLesson(null)
    setIsGenerating(false)

    fetchCachedGrammarLesson(level, item.id).then((cached) => {
      if (selectionTokenRef.current !== token || !cached) return
      setLesson(cached)
    })
    // player.reset intentionally omitted from deps — it's stable enough for this handler's purpose.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
      const generated = await requestGrammarLesson(selected.level, selected.item.id)
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
    <div className="min-h-screen bg-slate-50">
      <header className="max-w-6xl mx-auto flex items-center justify-between px-4 py-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Grammar Coach</h1>
          <p className="text-sm text-slate-500">Nyelvtani segítő — válassz egy nyelvtani témát</p>
        </div>
        <div className="flex items-center gap-4">
          <ModelPicker feature="grammarCoach" />
          <Link to="/" className="text-sm text-indigo-600 hover:underline">
            ← Vissza a főoldalra
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pb-12 grid gap-6 lg:grid-cols-[280px_1fr]">
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

          <ChalkBoard status={boardStatus} theme={theme} title={selected?.item.title} titleHu={selected?.item.titleHu}>
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
            <p className="text-center text-sm text-slate-400">Pick a grammar point from the list to get started.</p>
          )}
        </div>
      </main>
    </div>
  )
}
