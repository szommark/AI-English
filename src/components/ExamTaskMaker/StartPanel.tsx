import { useState } from 'react'
import { ClipboardPaste, FileUp, FilePlus2, Sparkles, type LucideIcon } from 'lucide-react'
import { useExamTaskCopy, type ExamTaskCopyKey } from '../../data/examTaskCopy'
import { docxToText } from '../../lib/docxText'
import { generateExamTask } from '../../lib/examTaskApi'
import {
  emptyListeningContent,
  type ExamField,
  type ListeningFormat,
  type ListeningTaskContent,
  type ScriptStyle,
  type TaskLevel,
  type TaskOrigin,
} from '../../lib/examTasks'
import { parseListeningBundle, type ImportResult } from '../../lib/listeningImport'
import { TeacherToolsError } from '../../lib/teacherToolsApi'
import { cardClass, hintClass, inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from '../TeacherTools/ui'

export interface LoadedDraft {
  title: string
  sourceRef: string
  origin: TaskOrigin
  content: ListeningTaskContent
  level?: TaskLevel
  /** What an import found and what it couldn't, shown above the editor. */
  notice?: string[]
}

type Way = 'generate' | 'upload' | 'paste' | 'blank'
const WAYS: { way: Way; icon: LucideIcon; label: ExamTaskCopyKey }[] = [
  { way: 'generate', icon: Sparkles, label: 'way_generate' },
  { way: 'upload', icon: FileUp, label: 'way_upload' },
  { way: 'paste', icon: ClipboardPaste, label: 'way_paste' },
  { way: 'blank', icon: FilePlus2, label: 'way_blank' },
]

/** The three ways into a listening task: AI generation from a source, a .docx upload, pasted text (or a blank task). */
export default function StartPanel({
  level,
  format,
  field,
  onFormat,
  onLoad,
  replacing,
}: {
  level: TaskLevel
  format: ListeningFormat
  field: ExamField
  onFormat: (f: ListeningFormat) => void
  onLoad: (draft: LoadedDraft) => void
  replacing: boolean
}) {
  const { c } = useExamTaskCopy()
  const [way, setWay] = useState<Way>('generate')
  const [style, setStyle] = useState<ScriptStyle | 'infer'>('infer')
  const [sourceUrl, setSourceUrl] = useState('')
  const [sourceText, setSourceText] = useState('')
  const [avoid, setAvoid] = useState('')
  const [pasted, setPasted] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [remaining, setRemaining] = useState<number | null>(null)
  const [envAsk, setEnvAsk] = useState(false)
  const [imported, setImported] = useState<ImportResult | null>(null)

  async function generate(forceFormat?: ListeningFormat) {
    setBusy(true)
    setError(null)
    setEnvAsk(false)
    const useFormat = forceFormat ?? format
    try {
      const { draft, remaining: left } = await generateExamTask({
        level,
        format: useFormat,
        field,
        style,
        ...(sourceText.trim() ? { sourceText } : { sourceUrl: sourceUrl.trim() }),
        avoid,
      })
      setRemaining(left)
      onLoad({ title: draft.title, sourceRef: draft.sourceRef || sourceUrl.trim(), origin: 'generated', content: draft.content })
    } catch (err) {
      const code = err instanceof TeacherToolsError ? err.code : 'generic'
      if (code === 'environment_topic') setEnvAsk(true)
      else setError(c((`err_${code}` as ExamTaskCopyKey) in ERR ? (`err_${code}` as ExamTaskCopyKey) : 'err_generic'))
    } finally {
      setBusy(false)
    }
  }

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

  const canGenerate = !busy && (sourceText.trim().split(/\s+/).length >= 80 || /^https?:\/\//.test(sourceUrl.trim()))

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
            onClick={() => setWay(w)}
            className={`inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium ${
              way === w ? 'border-[var(--teal-accent-border)] bg-[var(--teal-accent-soft)] text-[var(--teal-accent-strong)]' : 'border-border bg-card text-foreground hover:bg-muted'
            }`}
          >
            <Icon className="h-4 w-4" />
            {c(label)}
          </button>
        ))}
      </div>

      {way === 'generate' && (
        <div className="space-y-3">
          <label className={labelClass}>
            {c('style')}
            <select className={`${inputClass} mt-1 max-w-xs`} value={style} onChange={(e) => setStyle(e.target.value as ScriptStyle | 'infer')}>
              {(['infer', 'monologue', 'dialogue', 'panel'] as const).map((s) => (
                <option key={s} value={s}>
                  {c(`style_${s}`)}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            {c('sourceUrl')}
            <input className={`${inputClass} mt-1`} type="url" placeholder="https://www.bbc.com/news/…" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} />
          </label>
          <label className={labelClass}>
            {c('sourceText')}
            <textarea className={`${inputClass} mt-1 min-h-32`} value={sourceText} onChange={(e) => setSourceText(e.target.value)} />
          </label>
          <p className={hintClass}>{c('sourceHint')}</p>
          <label className={labelClass}>
            {c('avoid')}
            <input className={`${inputClass} mt-1`} placeholder={c('avoidPlaceholder')} value={avoid} maxLength={500} onChange={(e) => setAvoid(e.target.value)} />
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className={primaryButtonClass} disabled={!canGenerate} onClick={() => generate()}>
              {busy ? c('generating') : c('generate')}
            </button>
            {remaining !== null && <span className={hintClass}>{c('remaining', { n: remaining })}</span>}
          </div>
          {envAsk && (
            <div role="alertdialog" aria-label={c('envTitle')} className="space-y-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900">
              <p className="font-semibold">{c('envTitle')}</p>
              <p className="text-sm">{c('envBody')}</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className={primaryButtonClass}
                  onClick={() => {
                    onFormat('true-false')
                    generate('true-false')
                  }}
                >
                  {c('envSwitch')}
                </button>
                <button
                  type="button"
                  className={secondaryButtonClass}
                  onClick={() => {
                    setEnvAsk(false)
                    setSourceUrl('')
                    setSourceText('')
                  }}
                >
                  {c('envChange')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {way === 'upload' && (
        <div className="space-y-3">
          <p className={hintClass}>{c('uploadHint')}</p>
          <label className={`${secondaryButtonClass} inline-flex cursor-pointer items-center gap-2`}>
            <FileUp className="h-4 w-4" />
            {c('chooseFiles')}
            <input type="file" accept=".docx,.txt,.md" multiple className="sr-only" onChange={(e) => onFiles(e.target.files)} />
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

const ERR: Record<string, true> = {
  err_daily_limit: true,
  err_generation_failed: true,
  err_source_fetch_failed: true,
  err_invalid_url: true,
  err_source_too_short: true,
}
