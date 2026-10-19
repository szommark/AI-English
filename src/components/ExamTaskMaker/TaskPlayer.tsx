import { useEffect, useRef, useState } from 'react'
import { Headphones, Pause, Play } from 'lucide-react'
import { useExamTaskCopy } from '../../data/examTaskCopy'
import { fetchTaskAudio, renderTaskAudio } from '../../lib/examTaskApi'
import { primaryButtonClass, secondaryButtonClass } from '../TeacherTools/ui'

const READING_SEC = 60
const BETWEEN_SEC = 30

type Phase = { name: 'ready' } | { name: 'reading'; left: number } | { name: 'playing'; play: 1 | 2 } | { name: 'between'; left: number } | { name: 'done' }

/**
 * Test mode's recording. Exam-style playback is the Zöld Út routine — reading time, the text
 * twice with a pause between, no seeking; free playback is a normal player. A reviewer who opens
 * the test first may create the TTS recording.
 */
export default function TaskPlayer({ taskId }: { taskId: string }) {
  const { c } = useExamTaskCopy()
  const [url, setUrl] = useState<string | null | undefined>(undefined)
  const [mode, setMode] = useState<'exam' | 'free'>('exam')
  const [phase, setPhase] = useState<Phase>({ name: 'ready' })
  const [making, setMaking] = useState(false)
  const [failed, setFailed] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    fetchTaskAudio(taskId)
      .then((r) => setUrl(r.url))
      .catch(() => setUrl(null))
  }, [taskId])

  // Countdown phases.
  useEffect(() => {
    if (phase.name !== 'reading' && phase.name !== 'between') return
    if (phase.left <= 0) {
      startPlay(phase.name === 'reading' ? 1 : 2)
      return
    }
    const t = setTimeout(() => setPhase({ ...phase, left: phase.left - 1 }), 1000)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  function startPlay(play: 1 | 2) {
    const el = audioRef.current
    if (!el) return
    el.currentTime = 0
    void el.play()
    setPhase({ name: 'playing', play })
  }

  function onEnded() {
    if (mode !== 'exam' || phase.name !== 'playing') return
    setPhase(phase.play === 1 ? { name: 'between', left: BETWEEN_SEC } : { name: 'done' })
  }

  async function make() {
    setMaking(true)
    setFailed(false)
    try {
      setUrl(await renderTaskAudio(taskId))
    } catch {
      setFailed(true)
    } finally {
      setMaking(false)
    }
  }

  if (url === undefined) return <p className="text-sm text-muted-foreground">{c('loading')}</p>

  return (
    <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
      <p className="flex items-center gap-2 font-semibold text-foreground">
        <Headphones className="h-5 w-5 text-[var(--teal-accent-strong)]" />
        {c('audio')}
      </p>

      {url === null ? (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{c('noAudioYet')}</p>
          <button type="button" className={primaryButtonClass} disabled={making} onClick={make}>
            {making ? c('makingAudio') : c('makeAudio')}
          </button>
          {failed && <p className="text-sm text-red-600">{c('audioFailed')}</p>}
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-3 text-sm">
            {(['exam', 'free'] as const).map((m) => (
              <label key={m} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="playback"
                  checked={mode === m}
                  disabled={phase.name !== 'ready' && phase.name !== 'done'}
                  onChange={() => {
                    setMode(m)
                    setPhase({ name: 'ready' })
                  }}
                />
                {c(`playback_${m}`)}
              </label>
            ))}
          </div>

          <audio ref={audioRef} src={url} preload="auto" controls={mode === 'free'} onEnded={onEnded} className={mode === 'free' ? 'w-full' : 'hidden'} />

          {mode === 'exam' && (
            <div className="flex flex-wrap items-center gap-3" aria-live="polite">
              {phase.name === 'ready' && (
                <button type="button" className={`${primaryButtonClass} inline-flex items-center gap-2`} onClick={() => setPhase({ name: 'reading', left: READING_SEC })}>
                  <Play className="h-4 w-4" />
                  {c('play')}
                </button>
              )}
              {phase.name === 'reading' && (
                <>
                  <span className="text-sm font-medium tabular-nums">{c('readingTime', { s: phase.left })}</span>
                  <button type="button" className={secondaryButtonClass} onClick={() => setPhase({ name: 'reading', left: 0 })}>
                    {c('skip')}
                  </button>
                </>
              )}
              {phase.name === 'playing' && (
                <span className="inline-flex items-center gap-2 text-sm font-medium">
                  <Pause className="h-4 w-4 animate-pulse text-[var(--teal-accent-strong)]" />
                  {c('playOf', { n: phase.play })}
                </span>
              )}
              {phase.name === 'between' && (
                <>
                  <span className="text-sm font-medium tabular-nums">{c('betweenPlays', { s: phase.left })}</span>
                  <button type="button" className={secondaryButtonClass} onClick={() => setPhase({ name: 'between', left: 0 })}>
                    {c('skip')}
                  </button>
                </>
              )}
              {phase.name === 'done' && <span className="text-sm text-muted-foreground">{c('recordingDone')}</span>}
            </div>
          )}
        </>
      )}
    </div>
  )
}
