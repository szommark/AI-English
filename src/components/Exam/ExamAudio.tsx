import { useEffect, useRef, useState } from 'react'
import { Headphones, Play } from 'lucide-react'
import type { ExamTask, SectionAudio } from '../../data/exams/types'
import type { ExamMode } from '../../lib/examAttempt'
import { useLanguage } from '../../lib/i18n'
import { supabase } from '../../lib/supabase'

const SIGNED_URL_TTL_SEC = 3 * 3600

function clock(sec: number): string {
  const s = Math.max(0, Math.floor(sec))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

/**
 * The section's recording, streamed from the private `exam-audio` bucket.
 * Practice mode: a normal player plus "jump to task" buttons.
 * Exam mode: one Start button, then the recording plays straight through — no pause, no
 * seeking. After a refresh it resumes where the recording would be by now.
 */
export default function ExamAudio({
  audio,
  tasks,
  mode,
  startedAt,
  onStart,
  onEnded,
  endsSection,
}: {
  audio: SectionAudio
  tasks: ExamTask[]
  mode: ExamMode
  startedAt?: number
  onStart?: (at: number) => void
  onEnded?: () => void
  /** Exam mode: the section is submitted when the recording ends. */
  endsSection?: boolean
}) {
  const { t } = useLanguage()
  const ref = useRef<HTMLAudioElement>(null)
  const [url, setUrl] = useState<string | null>(null)
  const [loadFailed, setLoadFailed] = useState(false)
  const [reload, setReload] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [position, setPosition] = useState(0)
  const alreadyOver = startedAt !== undefined && (Date.now() - startedAt) / 1000 >= audio.durationSec
  const [ended, setEnded] = useState(alreadyOver)

  useEffect(() => {
    let cancelled = false
    setLoadFailed(false)
    setUrl(null)
    supabase.storage
      .from('exam-audio')
      .createSignedUrl(audio.storagePath, SIGNED_URL_TTL_SEC)
      .then(({ data, error }) => {
        if (cancelled) return
        if (error || !data) {
          console.error('Failed to sign exam audio URL', { path: audio.storagePath, error })
          setLoadFailed(true)
        } else setUrl(data.signedUrl)
      })
    return () => {
      cancelled = true
    }
  }, [audio.storagePath, reload])

  // A recording that ran out while the page was closed ends the section straight away.
  useEffect(() => {
    if (mode === 'exam' && alreadyOver) onEnded?.()
    // Only on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const expectedPosition = () => (startedAt !== undefined ? (Date.now() - startedAt) / 1000 : 0)

  async function startExamPlayback() {
    const el = ref.current
    if (!el) return
    const now = Date.now()
    const offset = startedAt !== undefined ? (now - startedAt) / 1000 : 0
    if (offset >= audio.durationSec) {
      setEnded(true)
      onEnded?.()
      return
    }
    el.currentTime = offset
    try {
      await el.play()
      if (startedAt === undefined) onStart?.(now)
    } catch (err) {
      console.error('Exam audio failed to play', err)
      setLoadFailed(true)
    }
  }

  function jumpTo(sec: number) {
    const el = ref.current
    if (!el) return
    el.currentTime = sec
    void el.play().catch(() => {})
  }

  const taskLabel = (taskId: string) => tasks.find((x) => x.id === taskId)?.label ?? taskId

  if (loadFailed) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700" role="alert">
        <p>{t('exAudioError')}</p>
        <button
          type="button"
          onClick={() => setReload((n) => n + 1)}
          className="mt-2 min-h-11 rounded-lg border border-rose-300 bg-white px-4 font-medium"
        >
          {t('exRetry')}
        </button>
      </div>
    )
  }

  if (!url) {
    return <p className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">{t('exAudioLoading')}</p>
  }

  if (mode === 'practice') {
    return (
      <div className="space-y-3 rounded-xl bg-muted p-4">
        <audio ref={ref} src={url} controls preload="metadata" className="w-full" />
        {audio.taskMarkers && audio.taskMarkers.length > 1 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">{t('exJumpTo')}</span>
            {audio.taskMarkers.map((m) => (
              <button
                key={m.taskId}
                type="button"
                onClick={() => jumpTo(m.startSec)}
                className="min-h-11 rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground hover:bg-background"
              >
                {taskLabel(m.taskId)} <span className="text-muted-foreground">({clock(m.startSec)})</span>
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  const started = startedAt !== undefined
  const progress = Math.min(100, (position / audio.durationSec) * 100)

  return (
    <div className="space-y-3 rounded-xl bg-muted p-4">
      <audio
        ref={ref}
        src={url}
        preload="auto"
        onPlay={() => setPlaying(true)}
        onTimeUpdate={(e) => setPosition(e.currentTarget.currentTime)}
        // No pausing in exam mode (e.g. from a headset button): carry on.
        onPause={(e) => {
          if (!e.currentTarget.ended) void e.currentTarget.play().catch(() => setPlaying(false))
        }}
        // No seeking either: snap back to where the recording should be.
        onSeeked={(e) => {
          const expected = expectedPosition()
          if (Math.abs(e.currentTarget.currentTime - expected) > 3) e.currentTarget.currentTime = expected
        }}
        onEnded={() => {
          setPlaying(false)
          setEnded(true)
          onEnded?.()
        }}
      />
      {!playing && !ended && (
        <>
          <p className="text-sm text-foreground">{t('exAudioExamNote')}</p>
          {endsSection && <p className="text-sm text-muted-foreground">{t('exAudioEndsSection')}</p>}
          <button
            type="button"
            onClick={() => void startExamPlayback()}
            className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-primary px-5 text-base font-semibold text-primary-foreground hover:opacity-90"
          >
            <Play className="h-5 w-5" />
            {started ? t('exAudioResume') : t('exAudioStart')}
          </button>
        </>
      )}
      {(playing || ended) && (
        <div className="space-y-2" aria-live="polite">
          <p className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Headphones className="h-4 w-4" />
            {ended ? t('exAudioEnded') : t('exAudioPlaying')}
          </p>
          <div className="h-2 overflow-hidden rounded-full bg-card" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full bg-[var(--teal-accent)]" style={{ width: `${ended ? 100 : progress}%` }} />
          </div>
          <p className="text-xs tabular-nums text-muted-foreground">
            {clock(ended ? audio.durationSec : position)} / {clock(audio.durationSec)}
          </p>
        </div>
      )}
    </div>
  )
}
