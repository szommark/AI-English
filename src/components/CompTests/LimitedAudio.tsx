import { useEffect, useRef, useState } from 'react'
import { Headphones, Play } from 'lucide-react'
import { useCompCopy } from '../../data/compTestCopy'

function clock(sec: number): string {
  if (!Number.isFinite(sec)) return '–:––'
  const s = Math.max(0, Math.floor(sec))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

function readPlays(key: string): number {
  try {
    return Number(localStorage.getItem(key)) || 0
  } catch {
    return 0
  }
}

/**
 * The test's recording. With no limit it is a normal player. With a limit the student starts it
 * with one button and it plays straight through (no pausing or seeking); each full play counts,
 * remembered in this browser.
 */
export default function LimitedAudio({ url, maxPlays, storageKey }: { url: string; maxPlays: number; storageKey: string }) {
  const { c } = useCompCopy()
  const ref = useRef<HTMLAudioElement>(null)
  const [plays, setPlays] = useState(() => readPlays(storageKey))
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState({ at: 0, total: NaN })

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, String(plays))
    } catch {
      // Private mode: the count lasts for this page only.
    }
  }, [plays, storageKey])

  if (maxPlays === 0) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
        <Headphones className="h-5 w-5 shrink-0 text-muted-foreground" />
        <audio controls src={url} className="w-full" preload="metadata" />
      </div>
    )
  }

  const left = Math.max(0, maxPlays - plays)

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-4">
      <audio
        ref={ref}
        src={url}
        preload="auto"
        onTimeUpdate={(e) => setTime({ at: e.currentTarget.currentTime, total: e.currentTarget.duration })}
        onLoadedMetadata={(e) => setTime({ at: 0, total: e.currentTarget.duration })}
        onEnded={() => {
          setPlaying(false)
          setPlays((n) => n + 1)
        }}
      />
      <button
        type="button"
        disabled={playing || left === 0}
        onClick={() => {
          const el = ref.current
          if (!el) return
          el.currentTime = 0
          void el.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
        }}
        className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[var(--teal-accent)] px-4 text-sm font-semibold text-primary hover:bg-[var(--teal-accent-strong)] disabled:opacity-50"
      >
        <Play className="h-4 w-4" />
        {playing ? c('audioPlaying') : plays === 0 ? c('audioPlay') : c('audioPlayAgain')}
      </button>
      <span className="text-sm tabular-nums text-muted-foreground">
        {clock(time.at)} / {clock(time.total)}
      </span>
      <span className="text-sm text-muted-foreground">{left === 0 ? c('audioNoPlaysLeft') : c('audioPlaysLeft', { n: left })}</span>
    </div>
  )
}
