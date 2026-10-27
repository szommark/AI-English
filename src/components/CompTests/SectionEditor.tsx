import { useState } from 'react'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import { hintClass, inputClass, labelClass, secondaryButtonClass } from '../TeacherTools/ui'
import { useCompCopy } from '../../data/compTestCopy'
import { COMP_MAX_SECTION_ITEMS, markupToSummary, optionKey, summaryToMarkup, type CompSection } from '../../lib/compTests'

const smallInput = 'w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground'
const iconButton = 'rounded-md p-1.5 text-muted-foreground hover:bg-secondary disabled:opacity-30'

/** "a|b" while typing: split without trimming so spaces can be typed; the server trims. */
const splitAccepted = (v: string) => v.split('|')

function OptionKeySelect({ value, count, onChange, label }: { value: string; count: number; onChange: (v: string) => void; label: string }) {
  return (
    <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} className="rounded-md border border-border bg-background px-2 py-1.5 text-sm font-semibold">
      <option value="">–</option>
      {Array.from({ length: count }, (_, k) => (
        <option key={k} value={optionKey(k)}>
          {optionKey(k)}
        </option>
      ))}
    </select>
  )
}

/** One section of the test: its instructions and items, edited in place. */
export default function SectionEditor({
  section,
  index,
  count,
  onChange,
  onMove,
  onRemove,
}: {
  section: CompSection
  index: number
  count: number
  onChange: (next: CompSection) => void
  onMove: (delta: -1 | 1) => void
  onRemove: () => void
}) {
  const { c } = useCompCopy()
  // The gap-fill markup is kept as typed: rebuilding it from the parsed gaps would eat spaces.
  const [markup, setMarkup] = useState(() => (section.type === 'gap-fill' ? summaryToMarkup(section.summary, section.items) : ''))
  const full = section.items.length >= COMP_MAX_SECTION_ITEMS

  function patchItem(i: number, patch: Record<string, unknown>) {
    onChange({ ...section, items: section.items.map((it, k) => (k === i ? { ...it, ...patch } : it)) } as CompSection)
  }
  function removeItem(i: number) {
    onChange({ ...section, items: section.items.filter((_, k) => k !== i) } as CompSection)
  }
  const nextId = () => `new-${Date.now()}`

  const removeButton = (i: number) => (
    <button type="button" onClick={() => removeItem(i)} aria-label={c('removeItem')} className={iconButton}>
      <Trash2 className="h-4 w-4" />
    </button>
  )

  let body: React.ReactNode = null
  switch (section.type) {
    case 'mcq':
      body = (
        <>
          {section.items.map((it, i) => (
            <div key={i} className="space-y-2 rounded-lg border border-border p-3">
              <div className="flex items-start gap-2">
                <span className="pt-1.5 text-sm font-semibold text-muted-foreground">{it.id}.</span>
                <input value={it.stem} onChange={(e) => patchItem(i, { stem: e.target.value })} placeholder={c('question')} className={smallInput} lang="en" />
                {removeButton(i)}
              </div>
              <ul className="space-y-1 pl-6">
                {it.options.map((o, k) => (
                  <li key={k} className="flex items-center gap-2">
                    <label className="flex items-center gap-1 text-sm font-semibold">
                      <input type="radio" name={`${section.id}-${i}`} checked={it.answer === optionKey(k)} onChange={() => patchItem(i, { answer: optionKey(k) })} />
                      {optionKey(k)}
                    </label>
                    <input
                      value={o}
                      lang="en"
                      onChange={(e) => patchItem(i, { options: it.options.map((x, j) => (j === k ? e.target.value : x)) })}
                      className={smallInput}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <button type="button" disabled={full} onClick={() => onChange({ ...section, items: [...section.items, { id: nextId(), stem: '', options: ['', '', '', ''], answer: 'A' }] })} className={`${secondaryButtonClass} inline-flex items-center gap-1`}>
            <Plus className="h-4 w-4" />
            {c('addQuestion')}
          </button>
        </>
      )
      break
    case 'true-false':
      body = (
        <>
          {section.items.map((it, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-sm font-semibold text-muted-foreground">{it.id}.</span>
              <input value={it.statement} onChange={(e) => patchItem(i, { statement: e.target.value })} placeholder={c('statement')} className={smallInput} lang="en" />
              <div className="flex shrink-0 overflow-hidden rounded-md border border-border text-sm font-semibold" role="group" aria-label={c('answer')}>
                {[true, false].map((v) => (
                  <button key={String(v)} type="button" aria-pressed={it.answer === v} onClick={() => patchItem(i, { answer: v })} className={`px-2.5 py-1.5 ${it.answer === v ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>
                    {v ? 'T' : 'F'}
                  </button>
                ))}
              </div>
              {removeButton(i)}
            </div>
          ))}
          <button type="button" disabled={full} onClick={() => onChange({ ...section, items: [...section.items, { id: nextId(), statement: '', answer: true }] })} className={`${secondaryButtonClass} inline-flex items-center gap-1`}>
            <Plus className="h-4 w-4" />
            {c('addStatement')}
          </button>
        </>
      )
      break
    case 'gap-fill':
      body = (
        <>
          <textarea
            value={markup}
            lang="en"
            rows={6}
            onChange={(e) => {
              setMarkup(e.target.value)
              const { summary, items } = markupToSummary(e.target.value)
              onChange({ ...section, summary, items })
            }}
            className={`${inputClass} font-mono text-sm`}
          />
          <p className={hintClass}>{c('gapMarkupHint', { n: section.items.length })}</p>
          <label className="flex items-center gap-2 text-sm">
            {c('maxWords')}
            <input type="number" min={1} max={6} value={section.maxWords} onChange={(e) => onChange({ ...section, maxWords: Number(e.target.value) })} className="w-16 rounded-md border border-border bg-background px-2 py-1 text-sm" />
          </label>
        </>
      )
      break
    case 'matching':
      body = (
        <>
          <div className="space-y-1">
            <span className={labelClass}>{c('options')}</span>
            {section.options.map((o, k) => (
              <div key={k} className="flex items-center gap-2">
                <span className="w-5 text-sm font-semibold">{optionKey(k)}</span>
                <input value={o} lang="en" onChange={(e) => onChange({ ...section, options: section.options.map((x, j) => (j === k ? e.target.value : x)) })} className={smallInput} />
                <button
                  type="button"
                  aria-label={c('removeOption')}
                  disabled={section.options.length <= 2}
                  onClick={() => onChange({ ...section, options: section.options.filter((_, j) => j !== k), items: section.items.map((it) => ({ ...it, answer: it.answer === optionKey(k) ? '' : it.answer })) })}
                  className={iconButton}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button type="button" disabled={section.options.length >= 10} onClick={() => onChange({ ...section, options: [...section.options, ''] })} className={`${secondaryButtonClass} inline-flex items-center gap-1`}>
              <Plus className="h-4 w-4" />
              {c('addOption')}
            </button>
          </div>
          <div className="space-y-1">
            <span className={labelClass}>{c('matchItems')}</span>
            {section.items.map((it, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-sm font-semibold text-muted-foreground">{it.id}.</span>
                <input value={it.text} lang="en" onChange={(e) => patchItem(i, { text: e.target.value })} className={smallInput} />
                <OptionKeySelect value={it.answer} count={section.options.length} onChange={(v) => patchItem(i, { answer: v })} label={c('answer')} />
                {removeButton(i)}
              </div>
            ))}
            <button type="button" disabled={full || section.items.length >= section.options.length} onClick={() => onChange({ ...section, items: [...section.items, { id: nextId(), text: '', answer: '' }] })} className={`${secondaryButtonClass} inline-flex items-center gap-1`}>
              <Plus className="h-4 w-4" />
              {c('addItem')}
            </button>
          </div>
        </>
      )
      break
    case 'short-answer':
      body = (
        <>
          {section.items.map((it, i) => (
            <div key={i} className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-[auto_1fr_1fr_auto] sm:items-center">
              <span className="text-sm font-semibold text-muted-foreground">{it.id}.</span>
              <input value={it.question} lang="en" onChange={(e) => patchItem(i, { question: e.target.value })} placeholder={c('question')} className={smallInput} />
              <input value={it.accepted.join('|')} lang="en" onChange={(e) => patchItem(i, { accepted: splitAccepted(e.target.value) })} placeholder={c('acceptedPlaceholder')} className={smallInput} />
              {removeButton(i)}
            </div>
          ))}
          <p className={hintClass}>{c('acceptedHint')}</p>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" disabled={full} onClick={() => onChange({ ...section, items: [...section.items, { id: nextId(), question: '', accepted: [] }] })} className={`${secondaryButtonClass} inline-flex items-center gap-1`}>
              <Plus className="h-4 w-4" />
              {c('addQuestion')}
            </button>
            <label className="flex items-center gap-2 text-sm">
              {c('maxWords')}
              <input type="number" min={1} max={6} value={section.maxWords} onChange={(e) => onChange({ ...section, maxWords: Number(e.target.value) })} className="w-16 rounded-md border border-border bg-background px-2 py-1 text-sm" />
            </label>
          </div>
        </>
      )
      break
  }

  return (
    <section className="space-y-3 rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold text-foreground">
          {c('taskN', { n: index + 1 })} · {c(`type_${section.type}`)}
        </h3>
        <div className="flex">
          <button type="button" aria-label={c('moveUp')} disabled={index === 0} onClick={() => onMove(-1)} className={iconButton}>
            <ArrowUp className="h-4 w-4" />
          </button>
          <button type="button" aria-label={c('moveDown')} disabled={index === count - 1} onClick={() => onMove(1)} className={iconButton}>
            <ArrowDown className="h-4 w-4" />
          </button>
          <button type="button" aria-label={c('removeTask')} onClick={onRemove} className={iconButton}>
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <label className="block space-y-1">
        <span className={labelClass}>{c('instructions')}</span>
        <input value={section.instructions} lang="en" onChange={(e) => onChange({ ...section, instructions: e.target.value })} className={inputClass} />
      </label>
      {body}
    </section>
  )
}
