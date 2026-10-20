import { TriangleAlert, OctagonX } from 'lucide-react'
import { CRITERIA_BY_ID } from '../../data/examTaskCriteria'
import { pick, useExamTaskCopy } from '../../data/examTaskCopy'
import {
  convertNotes,
  MAX_ITEMS,
  NOTES_SUBTYPES,
  type ListeningStatement,
  type ListeningTaskContent,
  type NotesSubtype,
  type TrapType,
} from '../../lib/examTasks'
import type { CheckReport } from '../../lib/listeningChecks'
import { countWords } from '../../lib/listeningScript'
import { cardClass, hintClass, inputClass, labelClass, secondaryButtonClass } from '../TeacherTools/ui'

function Flags({ report, itemId }: { report: CheckReport; itemId: string }) {
  const { lang } = useExamTaskCopy()
  const own = report.findings.filter((f) => f.itemId === itemId)
  if (own.length === 0) return null
  const fail = own.some((f) => f.status === 'fail')
  const Icon = fail ? OctagonX : TriangleAlert
  const title = own.map((f) => `${pick(CRITERIA_BY_ID.get(f.criterionId)?.label ?? { en: f.criterionId, hu: f.criterionId }, lang)}: ${pick(f.detail, lang)}`).join('\n')
  return (
    <span title={title} className={`inline-flex items-center gap-0.5 text-xs font-semibold ${fail ? 'text-rose-700' : 'text-amber-700'}`}>
      <Icon className="h-4 w-4" aria-hidden />
      {own.length}
      <span className="sr-only">{title}</span>
    </span>
  )
}

export default function ItemsEditor({
  content,
  onChange,
  report,
}: {
  content: ListeningTaskContent
  onChange: (content: ListeningTaskContent) => void
  report: CheckReport
}) {
  const { c } = useExamTaskCopy()

  if (content.format === 'true-false') {
    const rows = content.statements ?? []
    const setRow = (i: number, patch: Partial<ListeningStatement>) => {
      const next = rows.map((r, k) => {
        if (k !== i) return r
        const row = { ...r, ...patch }
        if (row.answer) delete row.trap
        return row
      })
      onChange({ ...content, statements: next })
    }
    return (
      <section className={cardClass}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold text-foreground">{c('items')}</h2>
          <span className="text-sm text-muted-foreground">
            {c('balance', { t: report.stats.trueCount ?? 0, f: report.stats.falseCount ?? 0 })}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="w-10 py-1">#</th>
                <th className="py-1">{c('statement')}</th>
                <th className="w-24 py-1">T / F</th>
                <th className="w-32 py-1">{c('trap')}</th>
                <th className="w-10 py-1" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id} className="border-t border-border align-top">
                  <td className="py-2 font-semibold tabular-nums text-muted-foreground">
                    {r.id}
                    {r.id === '0' && <span className="block text-[10px] font-normal uppercase">{c('example')}</span>}
                  </td>
                  <td className="py-2 pr-2">
                    <textarea
                      lang="en"
                      rows={2}
                      className={`${inputClass} min-h-0 text-sm`}
                      value={r.text}
                      onChange={(e) => setRow(i, { text: e.target.value })}
                    />
                    <span className="text-[11px] text-muted-foreground">{c('words', { n: countWords(r.text) })}</span>
                  </td>
                  <td className="py-2">
                    <div className="flex gap-1">
                      {[true, false].map((v) => (
                        <button
                          key={String(v)}
                          type="button"
                          aria-pressed={r.answer === v}
                          onClick={() => setRow(i, { answer: v })}
                          className={`h-9 w-9 rounded-lg border text-sm font-semibold ${r.answer === v ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card'}`}
                        >
                          {v ? 'T' : 'F'}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="py-2">
                    {!r.answer && (
                      <select
                        className={`${inputClass} min-h-9 text-sm`}
                        value={r.trap ?? ''}
                        onChange={(e) => setRow(i, { trap: (e.target.value || undefined) as TrapType | undefined })}
                      >
                        <option value="">{c('trap_none')}</option>
                        <option value="swap">{c('trap_swap')}</option>
                        <option value="conjunction">{c('trap_conjunction')}</option>
                      </select>
                    )}
                  </td>
                  <td className="py-2 text-right">
                    <Flags report={report} itemId={r.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className={secondaryButtonClass}
            disabled={rows.length > MAX_ITEMS}
            onClick={() => onChange({ ...content, statements: [...rows, { id: String(rows.length), text: '', answer: true }] })}
          >
            {c('addRow')}
          </button>
          <button type="button" className={secondaryButtonClass} disabled={rows.length <= 1} onClick={() => onChange({ ...content, statements: rows.slice(0, -1) })}>
            {c('removeRow')}
          </button>
        </div>
      </section>
    )
  }

  const answers = content.answers ?? []
  const notesText = (content.notes ?? []).join('\n')
  const setNotes = (text: string) => {
    const notes = text.split('\n')
    // Keep the key in step with the gaps that exist in the notes.
    const ids = [...new Set([...text.matchAll(/\{\{(\d{1,2})\}\}/g)].map((m) => m[1]))].sort((a, b) => Number(a) - Number(b))
    const nextAnswers = ids.map((id) => answers.find((a) => a.id === id) ?? { id, accepted: [''] })
    onChange({ ...content, notes, answers: nextAnswers.length ? nextAnswers : answers })
  }
  const subtype = content.subtype ?? 'flat-bullets'
  return (
    <section className={cardClass}>
      <h2 className="font-semibold text-foreground">{c('items')}</h2>
      <label className={labelClass}>
        {c('notesSubtype')}
        <select
          className={`${inputClass} mt-1`}
          value={subtype}
          onChange={(e) => {
            const next = e.target.value as NotesSubtype
            onChange({ ...content, subtype: next, notes: convertNotes(content.notes ?? [], next) })
          }}
        >
          {NOTES_SUBTYPES.map((s) => (
            <option key={s} value={s}>
              {c(`subtype_${s}`)}
            </option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        {c('notesLines')}
        <textarea lang="en" className={`${inputClass} mt-1 min-h-48 font-mono text-sm`} value={notesText} onChange={(e) => setNotes(e.target.value)} />
      </label>
      <p className={hintClass}>{c(`notesHint_${subtype}`)}</p>
      <div>
        <p className={labelClass}>{c('answers')}</p>
        <p className={hintClass}>{c('answersHint')}</p>
        <ul className="mt-2 space-y-1">
          {answers.map((a, i) => (
            <li key={a.id} className="flex items-center gap-2">
              <span className="w-8 shrink-0 text-right font-semibold tabular-nums text-muted-foreground">{a.id}</span>
              <input
                lang="en"
                className={`${inputClass} min-h-9 text-sm`}
                value={a.accepted.join(' / ')}
                onChange={(e) => {
                  // The last variant keeps its trailing space while the teacher is still typing it.
                  const parts = e.target.value.split('/')
                  const accepted = parts.map((s, k) => (k < parts.length - 1 ? s.trim() : s.replace(/^\s+/, '')))
                  onChange({ ...content, answers: answers.map((x, k) => (k === i ? { ...x, accepted: accepted.length ? accepted : [''] } : x)) })
                }}
              />
              <span className="w-12 shrink-0 text-xs text-muted-foreground">{c('words', { n: countWords(a.accepted[0] ?? '') })}</span>
              <span className="w-8 shrink-0">
                <Flags report={report} itemId={a.id} />
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
