import { Pause, Play, SkipBack, SkipForward } from 'lucide-react'
import type { PlaybackRate } from '../../hooks/useSegmentPlayer'

const RATES: PlaybackRate[] = [0.75, 1, 1.25]

export default function VoiceBar({
  segmentCount,
  currentIndex,
  isPlaying,
  isGenerating,
  hasLesson,
  rate,
  onTogglePlay,
  onPrev,
  onNext,
  onSeekSegment,
  onSetRate,
}: {
  segmentCount: number
  currentIndex: number
  isPlaying: boolean
  isGenerating: boolean
  hasLesson: boolean
  rate: PlaybackRate
  onTogglePlay: () => void
  onPrev: () => void
  onNext: () => void
  onSeekSegment: (index: number) => void
  onSetRate: (rate: PlaybackRate) => void
}) {
  const canNavigate = hasLesson && segmentCount > 0

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm px-4 py-3 flex items-center gap-4">
      <div className="flex items-center gap-1.5">
        <button
          onClick={onPrev}
          disabled={!canNavigate || currentIndex === 0}
          aria-label="Previous segment"
          className="h-8 w-8 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 disabled:opacity-30"
        >
          <SkipBack className="h-4 w-4" />
        </button>

        <button
          onClick={onTogglePlay}
          disabled={isGenerating}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className="h-10 w-10 flex items-center justify-center rounded-full bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50 shrink-0"
        >
          {isGenerating ? (
            <span className="h-4 w-4 rounded-full border-2 border-white/60 border-t-white animate-spin" />
          ) : isPlaying ? (
            <Pause className="h-5 w-5" fill="currentColor" />
          ) : (
            <Play className="h-5 w-5 ml-0.5" fill="currentColor" />
          )}
        </button>

        <button
          onClick={onNext}
          disabled={!canNavigate || currentIndex >= segmentCount - 1}
          aria-label="Next segment"
          className="h-8 w-8 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 disabled:opacity-30"
        >
          <SkipForward className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center gap-1.5 min-w-0">
        {canNavigate ? (
          Array.from({ length: segmentCount }).map((_, i) => (
            <button
              key={i}
              onClick={() => onSeekSegment(i)}
              aria-label={`Go to segment ${i + 1}`}
              className={`h-2 w-2 rounded-full transition ${
                i === currentIndex ? 'bg-amber-500 scale-125' : i < currentIndex ? 'bg-amber-300' : 'bg-slate-200'
              }`}
            />
          ))
        ) : (
          <span className="text-xs text-slate-400">Press play to begin</span>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {RATES.map((r) => (
          <button
            key={r}
            onClick={() => onSetRate(r)}
            className={`rounded-md px-2 py-1 text-xs font-medium ${
              rate === r ? 'bg-amber-100 text-amber-700' : 'text-slate-400 hover:bg-slate-100'
            }`}
          >
            {r}×
          </button>
        ))}
      </div>
    </div>
  )
}
