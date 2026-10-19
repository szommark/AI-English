import { useEffect, useState } from 'react'
import { Headphones } from 'lucide-react'
import { useExamTaskCopy } from '../../data/examTaskCopy'
import { deleteTaskAudio, fetchTaskAudio, renderTaskAudio, uploadTaskAudio } from '../../lib/examTaskApi'
import { AUDIO_UPLOAD_MAX_BYTES, levelSpec, type ListeningFormat, type TaskLevel } from '../../lib/examTasks'
import { cardClass, hintClass, primaryButtonClass, secondaryButtonClass } from '../TeacherTools/ui'

/** The owner's recording for the saved revision: Azure TTS at the level's speed, or an uploaded MP3. */
export default function AudioPanel({
  taskId,
  revision,
  level,
  format,
  dirty,
}: {
  taskId: string | null
  revision: number
  level: TaskLevel
  format: ListeningFormat
  /** Unsaved edits: the recording would not match the script. */
  dirty: boolean
}) {
  const { c } = useExamTaskCopy()
  const [audio, setAudio] = useState<{ url: string | null; uploaded: boolean } | null>(null)
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!taskId) return
    setAudio(null)
    fetchTaskAudio(taskId)
      .then(setAudio)
      .catch(() => setAudio({ url: null, uploaded: false }))
  }, [taskId, revision])

  async function run(fn: () => Promise<{ url: string | null; uploaded: boolean }>) {
    setBusy(true)
    setFailed(false)
    try {
      setAudio(await fn())
    } catch {
      setFailed(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className={cardClass}>
      <h2 className="flex items-center gap-2 font-semibold text-foreground">
        <Headphones className="h-5 w-5 text-[var(--teal-accent-strong)]" />
        {c('audio')}
      </h2>
      {!taskId || dirty ? (
        <p className={hintClass}>{c('saveFirst')}</p>
      ) : !audio ? (
        <p className={hintClass}>{c('loading')}</p>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {audio.url ? (audio.uploaded ? c('audioUploaded') : c('audioTts', { wpm: levelSpec(level, format).wpm })) : c('audioNone')}
          </p>
          {audio.url && <audio src={audio.url} controls preload="none" className="w-full" />}
          <div className="flex flex-wrap gap-2">
            {!audio.url && (
              <button type="button" className={primaryButtonClass} disabled={busy} onClick={() => run(async () => ({ url: await renderTaskAudio(taskId), uploaded: false }))}>
                {busy ? c('makingAudio') : c('makeAudio')}
              </button>
            )}
            <label className={`${secondaryButtonClass} cursor-pointer`}>
              {c('uploadMp3')}
              <input
                type="file"
                accept="audio/mpeg,.mp3"
                className="sr-only"
                disabled={busy}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file && file.size <= AUDIO_UPLOAD_MAX_BYTES) run(async () => ({ url: await uploadTaskAudio(taskId, file), uploaded: true }))
                  else if (file) setFailed(true)
                }}
              />
            </label>
            {audio.url && (
              <button
                type="button"
                className={secondaryButtonClass}
                disabled={busy}
                onClick={() =>
                  run(async () => {
                    await deleteTaskAudio(taskId)
                    return { url: null, uploaded: false }
                  })
                }
              >
                {c('removeAudio')}
              </button>
            )}
          </div>
          {failed && <p className="text-sm text-red-600">{c('audioFailed')}</p>}
        </>
      )}
    </section>
  )
}
