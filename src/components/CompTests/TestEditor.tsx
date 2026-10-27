import { useState } from 'react'
import { Plus } from 'lucide-react'
import { cardClass, hintClass, inputClass, labelClass, secondaryButtonClass } from '../TeacherTools/ui'
import { useCompCopy } from '../../data/compTestCopy'
import {
  COMP_LEVELS,
  COMP_MAX_PLAYS,
  COMP_MAX_SECTIONS,
  COMP_TASK_TYPES,
  COMP_WPM,
  countWords,
  defaultInstructions,
  normalizeContent,
  type CompLevel,
  type CompSection,
  type CompStyle,
  type CompTaskType,
  type CompTestInput,
} from '../../lib/compTests'
import SectionEditor from './SectionEditor'
import FocusCard from './FocusCard'

/** A new, empty section of the given type. */
export function emptySection(type: CompTaskType, skill: CompTestInput['skill']): CompSection {
  const instructions = defaultInstructions(type, skill)
  const id = `new-${Date.now()}`
  switch (type) {
    case 'mcq':
      return { id, type, instructions, items: [{ id: `${id}-1`, stem: '', options: ['', '', '', ''], answer: 'A' }] }
    case 'true-false':
      return { id, type, instructions, items: [{ id: `${id}-1`, statement: '', answer: true }] }
    case 'gap-fill':
      return { id, type, instructions, summary: '', items: [], maxWords: 3 }
    case 'matching':
      return { id, type, instructions, options: ['', '', ''], items: [{ id: `${id}-1`, text: '', answer: '' }] }
    case 'short-answer':
      return { id, type, instructions, items: [{ id: `${id}-1`, question: '', accepted: [] }], maxWords: 3 }
  }
}

/** The whole test, editable: settings, the text or script, and the sections. */
export default function TestEditor({ value, onChange }: { value: CompTestInput; onChange: (next: CompTestInput) => void }) {
  const { c } = useCompCopy()
  const [newType, setNewType] = useState<CompTaskType>('mcq')
  // Bumped when sections are reordered or removed, so the section editors (which keep the
  // gap-fill markup as typed) start again from the content.
  const [layoutVersion, setLayoutVersion] = useState(0)
  const { content } = value
  const listening = value.skill === 'listening'
  const words = countWords(content.text)

  const setSections = (sections: CompSection[], relayout = false) => {
    onChange({ ...value, content: normalizeContent({ ...content, sections }) })
    if (relayout) setLayoutVersion((v) => v + 1)
  }

  return (
    <div className="space-y-5">
      <div className={cardClass}>
        <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
          <label className="block space-y-1">
            <span className={labelClass}>{c('title')}</span>
            <input value={value.title} maxLength={160} onChange={(e) => onChange({ ...value, title: e.target.value })} className={inputClass} />
          </label>
          <label className="block space-y-1">
            <span className={labelClass}>{c('level')}</span>
            <select value={value.level} onChange={(e) => onChange({ ...value, level: e.target.value as CompLevel })} className={inputClass}>
              {COMP_LEVELS.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </label>
        </div>
        <label className="block space-y-1">
          <span className={labelClass}>{c('topic')}</span>
          <input value={value.topic} maxLength={160} onChange={(e) => onChange({ ...value, topic: e.target.value })} className={inputClass} />
        </label>
        {listening && (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1">
              <span className={labelClass}>{c('style')}</span>
              <select value={content.style ?? 'monologue'} onChange={(e) => onChange({ ...value, content: { ...content, style: e.target.value as CompStyle } })} className={inputClass}>
                <option value="monologue">{c('style_monologue')}</option>
                <option value="dialogue">{c('style_dialogue')}</option>
              </select>
            </label>
            <label className="block space-y-1">
              <span className={labelClass}>{c('maxPlays')}</span>
              <select value={value.maxPlays} onChange={(e) => onChange({ ...value, maxPlays: Number(e.target.value) })} className={inputClass}>
                {Array.from({ length: COMP_MAX_PLAYS + 1 }, (_, n) => (
                  <option key={n} value={n}>
                    {n === 0 ? c('maxPlaysNone') : c('maxPlaysN', { n })}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
      </div>

      <div className={cardClass}>
        <label className="block space-y-1">
          <span className={labelClass}>{listening ? c('script') : c('text')}</span>
          <textarea value={content.text} lang="en" rows={14} onChange={(e) => onChange({ ...value, content: { ...content, text: e.target.value } })} className={`${inputClass} leading-relaxed`} />
        </label>
        <p className={hintClass}>
          {listening ? c('scriptStats', { words, minutes: (words / COMP_WPM[value.level]).toFixed(1) }) : c('textStats', { words })}
          {listening && ` ${c('scriptHint')}`}
        </p>
      </div>

      {content.focus && (
        <FocusCard
          focus={content.focus}
          text={content.text}
          onRemove={() => {
            const { focus: _removed, ...rest } = content
            onChange({ ...value, content: rest })
          }}
        />
      )}

      {content.sections.map((section, i) => (
        <SectionEditor
          key={`${layoutVersion}-${i}`}
          section={section}
          index={i}
          count={content.sections.length}
          onChange={(next) => setSections(content.sections.map((s, k) => (k === i ? next : s)))}
          onMove={(delta) => {
            const next = [...content.sections]
            const [moved] = next.splice(i, 1)
            next.splice(i + delta, 0, moved)
            setSections(next, true)
          }}
          onRemove={() => setSections(content.sections.filter((_, k) => k !== i), true)}
        />
      ))}

      <div className="flex flex-wrap items-center gap-2">
        <select value={newType} onChange={(e) => setNewType(e.target.value as CompTaskType)} aria-label={c('taskTypes')} className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm">
          {COMP_TASK_TYPES.map((t) => (
            <option key={t} value={t}>
              {c(`type_${t}`)}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={content.sections.length >= COMP_MAX_SECTIONS}
          onClick={() => setSections([...content.sections, emptySection(newType, value.skill)])}
          className={`${secondaryButtonClass} inline-flex items-center gap-1`}
        >
          <Plus className="h-4 w-4" />
          {c('addTask')}
        </button>
      </div>
    </div>
  )
}
