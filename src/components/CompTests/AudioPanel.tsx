import { useEffect, useRef, useState } from 'react'
import { Headphones, Trash2, Upload, Volume2 } from 'lucide-react'
import { cardClass, hintClass, primaryButtonClass, secondaryButtonClass } from '../TeacherTools/ui'
import { useCompCopy } from '../../data/compTestCopy'
import { COMP_AUDIO_UPLOAD_MAX_BYTES } from '../../lib/compTests'
import { deleteCompAudio, fetchCompAudio, renderCompAudio, uploadCompAudio } from '../../lib/compTestApi'

/**
 * The listening test's recording: Azure TTS of the saved script (one voice, or one per speaker),
 * or the teacher's own MP3. `version` changes on every save, so a stale render disappears.
 */
export default function AudioPanel({ testId, version, dirty }: { testId: string; version: string; dirty: boolean }) {
  const { c } = useCompCopy()
  const [state, setState] = useState<{ url: string | null; uploaded: boolean } | null>(null)
  const [busy, setBusy] = useState<'tts' | 'upload' | 'delete' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let live = true
    fetchCompAudio(testId)
      .then((s) => live && setState(s))
      .catch(() => live && setState({ url: null, uploaded: false }))
    return () => {
      live = false
    }
  }, [testId, version])

  async function run(kind: 'tts' | 'upload' | 'delete', fn: () => Promise<void>) {
    setBusy(kind)
    setError(null)
    try {
      await fn()
    } catch {
      setError(kind === 'tts' ? c('audioTtsError') : kind === 'upload' ? c('audioUploadError') : c('saveError'))
    } finally {
      setBusy(null)
    }
  }

  return (
    <section className={cardClass}>
      <h2 className="flex items-center gap-2 font-semibold text-foreground">
        <Headphones className="h-5 w-5" />
        {c('audioTitle')}
      </h2>
      {dirty && <p className="text-sm text-amber-700">{c('audioSaveFirst')}</p>}
      {state?.url ? (
        <>
          <audio controls src={state.url} className="w-full" preload="metadata" />
          <p className={hintClass}>{state.uploaded ? c('audioUploaded') : c('audioTts')}</p>
        </>
      ) : (
        state && <p className={hintClass}>{c('audioNone')}</p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!!busy || dirty}
          onClick={() => run('tts', async () => setState({ url: await renderCompAudio(testId), uploaded: false }))}
          className={`${primaryButtonClass} inline-flex items-center gap-2`}
        >
          <Volume2 className="h-4 w-4" />
          {busy === 'tts' ? c('audioRendering') : state?.url && !state.uploaded ? c('audioRerender') : c('audioRender')}
        </button>
        <button type="button" disabled={!!busy} onClick={() => fileRef.current?.click()} className={`${secondaryButtonClass} inline-flex items-center gap-2`}>
          <Upload className="h-4 w-4" />
          {busy === 'upload' ? c('audioUploading') : c('audioUpload')}
        </button>
        {state?.url && (
          <button type="button" disabled={!!busy} onClick={() => run('delete', async () => { await deleteCompAudio(testId); setState({ url: null, uploaded: false }) })} className={`${secondaryButtonClass} inline-flex items-center gap-2`}>
            <Trash2 className="h-4 w-4" />
            {c('audioDelete')}
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="audio/mpeg,.mp3"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            e.target.value = ''
            if (!file) return
            if (file.size > COMP_AUDIO_UPLOAD_MAX_BYTES) {
              setError(c('audioTooBig', { mb: COMP_AUDIO_UPLOAD_MAX_BYTES / 1024 / 1024 }))
              return
            }
            void run('upload', async () => setState({ url: await uploadCompAudio(testId, file), uploaded: true }))
          }}
        />
      </div>
      <p className={hintClass}>{c('audioHint')}</p>
    </section>
  )
}
