import { useEffect, useMemo, useState } from 'react'
import { FileAudio, FileText, ListChecks } from 'lucide-react'
import { useExamTaskCopy } from '../../data/examTaskCopy'
import { docxToText } from '../../lib/docxText'
import { AUDIO_UPLOAD_MAX_BYTES, type ListeningFormat, type TaskLevel } from '../../lib/examTasks'
import { parseListeningBundle } from '../../lib/listeningImport'
import { cardClass, hintClass, inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from '../TeacherTools/ui'
import type { LoadedDraft } from './StartPanel'

async function filesToText(files: File[]): Promise<string> {
  const texts = await Promise.all(files.map((f) => (f.name.toLowerCase().endsWith('.docx') ? docxToText(f) : f.text())))
  return texts.join('\n\n')
}

/** One input: upload files or paste text. */
function SourceField({
  icon: Icon,
  label,
  hint,
  files,
  text,
  onFiles,
  onText,
}: {
  icon: typeof FileText
  label: string
  hint: string
  files: File[]
  text: string
  onFiles: (f: File[]) => void
  onText: (t: string) => void
}) {
  const { c } = useExamTaskCopy()
  return (
    <div className="space-y-2 rounded-xl border border-border p-4">
      <p className={`${labelClass} flex items-center gap-2`}>
        <Icon className="h-4 w-4 text-[var(--teal-accent-strong)]" />
        {label}
      </p>
      <p className={hintClass}>{hint}</p>
      <div className="flex flex-wrap items-center gap-2">
        <label className={`${secondaryButtonClass} cursor-pointer`}>
          {c('chooseFiles')}
          <input type="file" accept=".docx,.txt,.md" multiple className="sr-only" onChange={(e) => onFiles([...(e.target.files ?? [])])} />
        </label>
        {files.length > 0 && <span className="text-sm text-muted-foreground">{files.map((f) => f.name).join(', ')}</span>}
      </div>
      <textarea lang="en" className={`${inputClass} min-h-28 text-sm`} placeholder={c('orPaste')} value={text} onChange={(e) => onText(e.target.value)} />
    </div>
  )
}

/**
 * Checking a task made outside the app: the audioscript and the task sheet (with its key) come
 * in separately, as .docx or pasted text, plus the recording if there is one. Answer points are
 * placed automatically when the script has no markers; the MP3 is attached on the first save.
 */
export default function CheckPanel({
  level,
  format,
  onLoad,
}: {
  level: TaskLevel
  format: ListeningFormat
  onLoad: (draft: LoadedDraft) => void
}) {
  const { c } = useExamTaskCopy()
  const [scriptFiles, setScriptFiles] = useState<File[]>([])
  const [scriptText, setScriptText] = useState('')
  const [sheetFiles, setSheetFiles] = useState<File[]>([])
  const [sheetText, setSheetText] = useState('')
  const [audio, setAudio] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const audioUrl = useMemo(() => (audio ? URL.createObjectURL(audio) : null), [audio])
  useEffect(() => () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl)
  }, [audioUrl])

  const ready = (scriptFiles.length > 0 || scriptText.trim()) && (sheetFiles.length > 0 || sheetText.trim())

  async function run() {
    setBusy(true)
    setError(null)
    try {
      const script = [await filesToText(scriptFiles), scriptText].filter((t) => t.trim()).join('\n\n')
      const sheet = [await filesToText(sheetFiles), sheetText].filter((t) => t.trim()).join('\n\n')
      const result = parseListeningBundle(sheet, { script, format, level })
      const summary = c('importFound', {
        script: result.found.script ? c('yes') : c('no'),
        markers: result.found.markers,
        items: result.content.format === 'true-false' ? result.found.statements : result.found.notes,
        key: result.found.key,
      })
      // An answer key on its own often has no title: fall back to the topic or the script's opening words.
      const opening = result.content.script.replace(/\[\[\d{1,2}\|?|\]\]/g, '').replace(/^[^:\n]{1,30}:\s*/, '').split(/\s+/).slice(0, 6).join(' ')
      onLoad({
        title: result.title || result.content.topic || (opening ? `${opening}…` : ''),
        sourceRef: result.sourceRef,
        origin: 'uploaded',
        content: result.content,
        level,
        notice: [summary, ...(audio ? [c('mp3OnSave', { name: audio.name })] : []), ...result.warnings],
        ...(audio ? { audioFile: audio } : {}),
      })
    } catch {
      setError(c('importFailed'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className={cardClass}>
      <h2 className="font-semibold text-foreground">{c('checkTitle')}</h2>
      <p className={hintClass}>{c('checkIntro')}</p>
      <div className="grid gap-4 lg:grid-cols-2">
        <SourceField icon={FileText} label={c('checkScript')} hint={c('checkScriptHint')} files={scriptFiles} text={scriptText} onFiles={setScriptFiles} onText={setScriptText} />
        <SourceField icon={ListChecks} label={c('checkSheet')} hint={c('checkSheetHint')} files={sheetFiles} text={sheetText} onFiles={setSheetFiles} onText={setSheetText} />
      </div>
      <div className="space-y-2 rounded-xl border border-border p-4">
        <p className={`${labelClass} flex items-center gap-2`}>
          <FileAudio className="h-4 w-4 text-[var(--teal-accent-strong)]" />
          {c('checkAudio')}
        </p>
        <p className={hintClass}>{c('checkAudioHint')}</p>
        <div className="flex flex-wrap items-center gap-2">
          <label className={`${secondaryButtonClass} cursor-pointer`}>
            {c('uploadMp3')}
            <input
              type="file"
              accept="audio/mpeg,.mp3"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null
                if (f && f.size > AUDIO_UPLOAD_MAX_BYTES) setError(c('mp3TooBig'))
                else setAudio(f)
              }}
            />
          </label>
          {audio && (
            <>
              <span className="text-sm text-muted-foreground">{audio.name}</span>
              <audio src={audioUrl ?? undefined} controls preload="none" className="h-9" />
              <button type="button" className={secondaryButtonClass} onClick={() => setAudio(null)}>
                {c('cancel')}
              </button>
            </>
          )}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className={primaryButtonClass} disabled={!ready || busy} onClick={run}>
          {c('checkRun')}
        </button>
        {!ready && <span className={hintClass}>{c('checkNeedBoth')}</span>}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </section>
  )
}
