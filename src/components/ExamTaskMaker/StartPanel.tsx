import { useState } from 'react'
import { ClipboardPaste, FileUp, FilePlus2, Sparkles, type LucideIcon } from 'lucide-react'
import { useExamTaskCopy, type ExamTaskCopyKey } from '../../data/examTaskCopy'
import { docxToText } from '../../lib/docxText'
import {
  emptyListeningContent,
  type ExamField,
  type ListeningFormat,
  type ListeningTaskContent,
  type TaskLevel,
  type TaskOrigin,
} from '../../lib/examTasks'
import { parseListeningBundle, type ImportResult } from '../../lib/listeningImport'
import { cardClass, hintClass, inputClass, primaryButtonClass, secondaryButtonClass } from '../TeacherTools/ui'
import CreateWizard from './CreateWizard'

export interface LoadedDraft {
  title: string
  sourceRef: string
  origin: TaskOrigin
  content: ListeningTaskContent
  level?: TaskLevel
  /** What an import found and what it couldn't, shown above the editor. */
  notice?: string[]
  /** A recording chosen before the task exists; uploaded right after the first save. */
  audioFile?: File
}

export type Way = 'generate' | 'upload' | 'paste' | 'blank'
const WAYS: { way: Way; icon: LucideIcon; label: ExamTaskCopyKey }[] = [
  { way: 'generate', icon: Sparkles, label: 'way_generate' },
  { way: 'upload', icon: FileUp, label: 'way_upload' },
  { way: 'paste', icon: ClipboardPaste, label: 'way_paste' },
  { way: 'blank', icon: FilePlus2, label: 'way_blank' },
]

/** The ways into a listening task: the guided AI creation wizard, a .docx upload, pasted text (or a blank task). */
export default function StartPanel({
  level,
  format,
  field,
  onLevel,
  onFormat,
  onField,
  onLoad,
  onWay,
  replacing,
}: {
  level: TaskLevel
  format: ListeningFormat
  field: ExamField
  onLevel: (l: TaskLevel) => void
  onFormat: (f: ListeningFormat) => void
  onField: (f: ExamField) => void
  onLoad: (draft: LoadedDraft) => void
  /** The wizard asks level / format / field itself, so the editor hides its own selects meanwhile. */
  onWay?: (way: Way) => void
  replacing: boolean
}) {
  const { c } = useExamTaskCopy()
  const [way, setWay] = useState<Way>('generate')
  const [pasted, setPasted] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imported, setImported] = useState<ImportResult | null>(null)

  function applyImport(result: ImportResult, origin: TaskOrigin) {
    setImported(result)
    if (result.content.format !== format) onFormat(result.content.format)
    const summary = c('importFound', {
      script: result.found.script ? c('yes') : c('no'),
      markers: result.found.markers,
      items: result.content.format === 'true-false' ? result.found.statements : result.found.notes,
      key: result.found.key,
    })
    onLoad({ title: result.title, sourceRef: result.sourceRef, origin, content: result.content, level: result.level ?? undefined, notice: [summary, ...result.warnings] })
  }

  async function onFiles(files: FileList | null) {
    if (!files?.length) return
    setBusy(true)
    setError(null)
    try {
      const texts = await Promise.all([...files].map((f) => (f.name.toLowerCase().endsWith('.docx') ? docxToText(f) : f.text())))
      applyImport(parseListeningBundle(texts.join('\n\n')), 'uploaded')
    } catch {
      setError(c('importFailed'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className={cardClass}>
      <h2 className="font-semibold text-foreground">{replacing ? c('replaceTitle') : c('startTitle')}</h2>
      <div className="flex flex-wrap gap-2" role="tablist">
        {WAYS.map(({ way: w, icon: Icon, label }) => (
          <button
            key={w}
            type="button"
            role="tab"
            aria-selected={way === w}
            onClick={() => {
              setWay(w)
              onWay?.(w)
            }}
            className={`inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium ${
              way === w ? 'border-[var(--teal-accent-border)] bg-[var(--teal-accent-soft)] text-[var(--teal-accent-strong)]' : 'border-border bg-card text-foreground hover:bg-muted'
            }`}
          >
            <Icon className="h-4 w-4" />
            {c(label)}
          </button>
        ))}
      </div>

      {way === 'generate' && <CreateWizard level={level} format={format} field={field} onLevel={onLevel} onFormat={onFormat} onField={onField} onLoad={onLoad} />}

      {way === 'upload' && (
        <div className="space-y-3">
          <p className={hintClass}>{c('uploadHint')}</p>
          <label className={`${secondaryButtonClass} inline-flex cursor-pointer items-center gap-2`}>
            <FileUp className="h-4 w-4" />
            {c('chooseFiles')}
            <input type="file" accept=".docx,.txt,.md" multiple disabled={busy} className="sr-only" onChange={(e) => onFiles(e.target.files)} />
          </label>
        </div>
      )}

      {way === 'paste' && (
        <div className="space-y-3">
          <p className={hintClass}>{c('pasteHint')}</p>
          <textarea className={`${inputClass} min-h-48 font-mono text-sm`} value={pasted} onChange={(e) => setPasted(e.target.value)} />
          <button type="button" className={primaryButtonClass} disabled={!pasted.trim()} onClick={() => applyImport(parseListeningBundle(pasted), 'pasted')}>
            {c('importBtn')}
          </button>
        </div>
      )}

      {way === 'blank' && (
        <button
          type="button"
          className={secondaryButtonClass}
          onClick={() => onLoad({ title: '', sourceRef: '', origin: 'pasted', content: emptyListeningContent(format, level) })}
        >
          {c('way_blank')}
        </button>
      )}

      {imported && (way === 'upload' || way === 'paste') && (
        <div className="space-y-1 rounded-xl bg-muted px-4 py-3 text-sm">
          <p className="text-foreground">
            {c('importFound', {
              script: imported.found.script ? c('yes') : c('no'),
              markers: imported.found.markers,
              items: imported.content.format === 'true-false' ? imported.found.statements : imported.found.notes,
              key: imported.found.key,
            })}
          </p>
          {imported.warnings.map((w) => (
            <p key={w} className="text-amber-800">
              {w}
            </p>
          ))}
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </section>
  )
}
