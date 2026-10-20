import { useMemo, useState } from 'react'
import { useExamTaskCopy } from '../../data/examTaskCopy'
import { saveExamTask } from '../../lib/examTaskApi'
import type { ExamTask, ListeningTaskContent, TrapType } from '../../lib/examTasks'
import { checkListeningTask } from '../../lib/listeningChecks'
import { countWords } from '../../lib/listeningScript'
import { TeacherToolsError } from '../../lib/teacherToolsApi'
import { FindingLine } from './ChecksPanel'
import { markerExcerpt } from './ScriptView'
import { hintClass, inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from '../TeacherTools/ui'

const GAP_RE = /\{\{(\d{1,2})\}\}/g

const gapsIn = (line: string) => [...line.matchAll(GAP_RE)].map((m) => m[1]).sort((a, b) => Number(a) - Number(b))
const hasMarker = (text: string, id: string) => new RegExp(`\\[\\[\\s*${id}\\s*[|\\]]`).test(text)
const splitAccepted = (s: string) => s.split('/').map((x) => x.trim()).filter(Boolean)
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Where markerExcerpt()'s text sits in the script. The excerpt joins its sentences with single
 * spaces, so whitespace is matched loosely and the original (line breaks included) is edited.
 */
function excerptSpan(script: string, id: string): { start: number; end: number } | null {
  const excerpt = markerExcerpt(script, id)
  if (!excerpt?.trim()) return null
  const m = new RegExp(excerpt.trim().split(/\s+/).map(escapeRe).join('\\s+')).exec(script)
  return m ? { start: m.index, end: m.index + m[0].length } : null
}

/** The creator's inline fix of one item from the Results tab: wording, key and its script excerpt. */
export default function ItemCorrection({ task, id, onCancel, onSaved }: { task: ExamTask; id: string; onCancel: () => void; onSaved: (saved: ExamTask) => void }) {
  const { c } = useExamTaskCopy()
  const content = task.content
  const isTf = content.format === 'true-false'
  const row = content.statements?.find((s) => s.id === id)
  const lineIndex = (content.notes ?? []).findIndex((l) => l.includes(`{{${id}}}`))
  const origLine = lineIndex >= 0 ? (content.notes ?? [])[lineIndex] : ''
  const span = useMemo(() => excerptSpan(content.script, id), [content.script, id])
  const origExcerpt = span ? content.script.slice(span.start, span.end) : ''

  const [text, setText] = useState(isTf ? (row?.text ?? '') : origLine)
  const [answer, setAnswer] = useState(row?.answer ?? true)
  const [trap, setTrap] = useState<TrapType | undefined>(row?.trap)
  const [accepted, setAccepted] = useState((content.answers?.find((a) => a.id === id)?.accepted ?? ['']).join(' / '))
  const [excerpt, setExcerpt] = useState(origExcerpt)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const acceptedList = splitAccepted(accepted)
  const expectedGaps = gapsIn(origLine)
  const gapsOk = isTf || lineIndex < 0 || gapsIn(text).join(',') === expectedGaps.join(',')
  const markerGone = !!span && !hasMarker(excerpt, id)

  const next: ListeningTaskContent = useMemo(() => {
    const script = span ? content.script.slice(0, span.start) + excerpt + content.script.slice(span.end) : content.script
    if (isTf) {
      const statements = (content.statements ?? []).map((s) => {
        if (s.id !== id) return s
        const r = { ...s, text, answer }
        if (answer || !trap) delete r.trap
        else r.trap = trap
        return r
      })
      return { ...content, script, statements }
    }
    const notes = lineIndex >= 0 ? (content.notes ?? []).map((l, i) => (i === lineIndex ? text : l)) : content.notes
    const list = splitAccepted(accepted)
    const answers = (content.answers ?? []).map((a) => (a.id === id ? { ...a, accepted: list.length ? list : [''] } : a))
    return { ...content, script, notes, answers }
  }, [content, span, excerpt, isTf, id, text, answer, trap, lineIndex, accepted])

  const findings = useMemo(() => checkListeningTask(next, task.level).findings.filter((f) => f.itemId === id), [next, task.level, id])
  const changed = JSON.stringify(next) !== JSON.stringify(content)
  const problem = isTf && !text.trim() ? c('editNeedsText') : !gapsOk ? c('editGapRule', { gaps: expectedGaps.map((g) => `{{${g}}}`).join(', ') }) : !isTf && acceptedList.length === 0 ? c('editNeedsAnswer') : null

  async function save() {
    setSaving(true)
    setError(null)
    try {
      const saved = await saveExamTask(
        { examPart: task.examPart, level: task.level, field: task.field, title: task.title, origin: task.origin, sourceRef: task.sourceRef, content: next },
        task.id,
      )
      onSaved(saved)
    } catch (err) {
      setError(c('saveFailed', { error: err instanceof TeacherToolsError ? err.code : c('err_generic') }))
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4 rounded-xl border border-[var(--teal-accent-border)] bg-[var(--teal-accent-soft)] p-4">
      {isTf ? (
        <>
          <label className={labelClass}>
            {c('statement')}
            <textarea lang="en" rows={2} className={`${inputClass} mt-1 min-h-0 text-sm`} value={text} onChange={(e) => setText(e.target.value)} />
            <span className="text-[11px] font-normal text-muted-foreground">{c('words', { n: countWords(text) })}</span>
          </label>
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <p className={labelClass}>{c('editKey')}</p>
              <div className="mt-1 flex gap-1">
                {[true, false].map((v) => (
                  <button
                    key={String(v)}
                    type="button"
                    aria-pressed={answer === v}
                    onClick={() => setAnswer(v)}
                    className={`h-9 w-9 rounded-lg border text-sm font-semibold ${answer === v ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card'}`}
                  >
                    {v ? 'T' : 'F'}
                  </button>
                ))}
              </div>
            </div>
            {!answer && (
              <label className={labelClass}>
                {c('trap')}
                <select className={`${inputClass} mt-1 min-h-9 text-sm`} value={trap ?? ''} onChange={(e) => setTrap((e.target.value || undefined) as TrapType | undefined)}>
                  <option value="">{c('trap_none')}</option>
                  <option value="swap">{c('trap_swap')}</option>
                  <option value="conjunction">{c('trap_conjunction')}</option>
                </select>
              </label>
            )}
          </div>
        </>
      ) : (
        <>
          {lineIndex >= 0 && (
            <label className={labelClass}>
              {c('editNoteLine')}
              <input lang="en" className={`${inputClass} mt-1 font-mono text-sm`} value={text} onChange={(e) => setText(e.target.value)} />
              <span className="text-[11px] font-normal text-muted-foreground">{c('editNoteLineHint', { gap: `{{${id}}}` })}</span>
            </label>
          )}
          <label className={labelClass}>
            {c('editKey')}
            <input lang="en" className={`${inputClass} mt-1 text-sm`} value={accepted} onChange={(e) => setAccepted(e.target.value)} />
            <span className="text-[11px] font-normal text-muted-foreground">
              {c('answersHint')} · {c('words', { n: countWords(acceptedList[0] ?? '') })}
            </span>
          </label>
        </>
      )}

      {span ? (
        <label className={labelClass}>
          {c('editExcerpt')}
          <textarea lang="en" rows={4} className={`${inputClass} mt-1 font-mono text-sm leading-relaxed`} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
          <span className="text-[11px] font-normal text-muted-foreground">{c('editExcerptHint', { n: id })}</span>
        </label>
      ) : (
        <p className={hintClass}>{c('editNoExcerpt', { n: id })}</p>
      )}
      {markerGone && <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">{c('editMarkerRemoved', { n: id })}</p>}

      <div className="space-y-1" aria-live="polite">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{c('editChecks')}</p>
        {findings.length ? (
          <ul className="space-y-1">
            {findings.map((f, i) => (
              <FindingLine key={i} f={f} />
            ))}
          </ul>
        ) : (
          <p className="text-sm text-emerald-700">{c('editChecksClean')}</p>
        )}
      </div>

      {problem && <p className="text-sm font-medium text-rose-700">{problem}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className={primaryButtonClass} disabled={saving || !changed || !!problem} onClick={save}>
          {saving ? c('saving') : c('save')}
        </button>
        <button type="button" className={secondaryButtonClass} disabled={saving} onClick={onCancel}>
          {c('cancel')}
        </button>
        <span className={hintClass}>{c('editNewRevision')}</span>
      </div>
    </div>
  )
}
