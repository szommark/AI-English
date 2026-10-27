import { useState } from 'react'
import { BookOpenText, Headphones, Sparkles } from 'lucide-react'
import { cardClass, hintClass, inputClass, labelClass, primaryButtonClass } from '../TeacherTools/ui'
import FocusFields, { EMPTY_FOCUS, type FocusValue } from './FocusFields'
import { useCompCopy } from '../../data/compTestCopy'
import {
  COMP_DEFAULT_LENGTH,
  COMP_LEVELS,
  COMP_LISTENING_MINUTES,
  COMP_MAX_ITEMS,
  COMP_MAX_VOCAB,
  COMP_MAX_SECTION_ITEMS,
  COMP_READING_WORDS,
  COMP_TASK_TYPES,
  COMP_WPM,
  splitVocabulary,
  type CompGenerateInput,
  type CompLevel,
  type CompSkill,
  type CompStyle,
  type CompTaskType,
} from '../../lib/compTests'

const DEFAULT_COUNT: Record<CompTaskType, number> = { mcq: 5, 'true-false': 6, 'gap-fill': 6, matching: 5, 'short-answer': 5 }

/**
 * New test: reading or listening, topic, CEFR level, length (words or minutes) and the task
 * types with their number of items. "Generate" hands it to the AI (busy for up to a minute).
 */
export default function CreateForm({
  busy,
  error,
  onGenerate,
  onStartEmpty,
}: {
  busy: boolean
  error: string | null
  onGenerate: (input: CompGenerateInput) => void
  onStartEmpty: (skill: CompSkill, level: CompLevel) => void
}) {
  const { c } = useCompCopy()
  const [skill, setSkill] = useState<CompSkill>('reading')
  const [level, setLevel] = useState<CompLevel>('B1')
  const [topic, setTopic] = useState('')
  const [words, setWords] = useState(COMP_DEFAULT_LENGTH.B1.words)
  const [minutes, setMinutes] = useState(COMP_DEFAULT_LENGTH.B1.minutes)
  const [style, setStyle] = useState<CompStyle>('monologue')
  const [counts, setCounts] = useState<Partial<Record<CompTaskType, number>>>({ mcq: 5, 'true-false': 6 })
  const [focus, setFocus] = useState<FocusValue>(EMPTY_FOCUS)
  const vocabulary = splitVocabulary(focus.vocabText)

  const chosen = COMP_TASK_TYPES.filter((t) => counts[t] !== undefined)
  const total = chosen.reduce((n, t) => n + (counts[t] ?? 0), 0)
  const [wMin, wMax] = COMP_READING_WORDS
  const [mMin, mMax] = COMP_LISTENING_MINUTES
  const length = skill === 'reading' ? words : minutes
  const lengthOk = skill === 'reading' ? words >= wMin && words <= wMax : minutes >= mMin && minutes <= mMax
  const countsOk = chosen.length > 0 && total <= COMP_MAX_ITEMS && chosen.every((t) => (counts[t] ?? 0) >= 2 && (counts[t] ?? 0) <= COMP_MAX_SECTION_ITEMS)
  const canGenerate = !busy && topic.trim().length > 0 && lengthOk && countsOk && vocabulary.length <= COMP_MAX_VOCAB

  function pickLevel(next: CompLevel) {
    setLevel(next)
    setWords(COMP_DEFAULT_LENGTH[next].words)
    setMinutes(COMP_DEFAULT_LENGTH[next].minutes)
  }

  function toggle(type: CompTaskType) {
    setCounts((prev) => {
      const next = { ...prev }
      if (next[type] === undefined) next[type] = DEFAULT_COUNT[type]
      else delete next[type]
      return next
    })
  }

  return (
    <form
      className={cardClass}
      onSubmit={(e) => {
        e.preventDefault()
        if (!canGenerate) return
        onGenerate({
          skill,
          level,
          topic: topic.trim(),
          length,
          style,
          tasks: chosen.map((type) => ({ type, count: counts[type] ?? 0 })),
          ...(focus.grammar.length ? { grammar: focus.grammar } : {}),
          ...(focus.grammarOther.trim() ? { grammarOther: focus.grammarOther.trim() } : {}),
          ...(vocabulary.length ? { vocabulary } : {}),
        })
      }}
    >
      <div role="radiogroup" aria-label={c('skill')} className="grid gap-3 sm:grid-cols-2">
        {(['reading', 'listening'] as const).map((s) => {
          const Icon = s === 'reading' ? BookOpenText : Headphones
          return (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={skill === s}
              onClick={() => setSkill(s)}
              className={`flex min-h-11 items-center gap-3 rounded-xl border px-4 py-3 text-left ${
                skill === s ? 'border-[var(--teal-accent-border)] bg-[var(--teal-accent-soft)]' : 'border-border bg-card hover:bg-muted'
              }`}
            >
              <Icon className="h-5 w-5 shrink-0 text-[var(--teal-accent-strong)]" />
              <span>
                <span className="block font-semibold text-foreground">{c(`skill_${s}`)}</span>
                <span className="block text-xs text-muted-foreground">{c(`skillHint_${s}`)}</span>
              </span>
            </button>
          )
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <label className="block space-y-1">
          <span className={labelClass}>{c('topic')}</span>
          <input value={topic} onChange={(e) => setTopic(e.target.value)} maxLength={160} placeholder={c('topicPlaceholder')} className={inputClass} />
        </label>
        <label className="block space-y-1">
          <span className={labelClass}>{c('level')}</span>
          <select value={level} onChange={(e) => pickLevel(e.target.value as CompLevel)} className={inputClass}>
            {COMP_LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {skill === 'reading' ? (
          <label className="block space-y-1">
            <span className={labelClass}>{c('lengthWords')}</span>
            <input type="number" min={wMin} max={wMax} step={10} value={words} onChange={(e) => setWords(Number(e.target.value))} className={inputClass} />
            <span className={hintClass}>{c('lengthWordsHint', { min: wMin, max: wMax })}</span>
          </label>
        ) : (
          <>
            <label className="block space-y-1">
              <span className={labelClass}>{c('lengthMinutes')}</span>
              <input type="number" min={mMin} max={mMax} step={0.5} value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} className={inputClass} />
              <span className={hintClass}>{c('lengthMinutesHint', { words: Math.round(minutes * COMP_WPM[level]), wpm: COMP_WPM[level] })}</span>
            </label>
            <label className="block space-y-1">
              <span className={labelClass}>{c('style')}</span>
              <select value={style} onChange={(e) => setStyle(e.target.value as CompStyle)} className={inputClass}>
                <option value="monologue">{c('style_monologue')}</option>
                <option value="dialogue">{c('style_dialogue')}</option>
              </select>
            </label>
          </>
        )}
      </div>

      <fieldset className="space-y-2">
        <legend className={labelClass}>{c('taskTypes')}</legend>
        <ul className="grid gap-2 sm:grid-cols-2">
          {COMP_TASK_TYPES.map((type) => {
            const on = counts[type] !== undefined
            return (
              <li key={type} className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2 ${on ? 'border-[var(--teal-accent-border)]' : 'border-border'}`}>
                <label className="flex min-h-9 flex-1 cursor-pointer items-center gap-2 text-sm text-foreground">
                  <input type="checkbox" checked={on} onChange={() => toggle(type)} className="h-4 w-4" />
                  {c(`type_${type}`)}
                </label>
                {on && (
                  <label className="flex items-center gap-1 text-xs text-muted-foreground">
                    <input
                      type="number"
                      min={2}
                      max={COMP_MAX_SECTION_ITEMS}
                      value={counts[type]}
                      aria-label={c('itemsOf', { type: c(`type_${type}`) })}
                      onChange={(e) => setCounts((p) => ({ ...p, [type]: Number(e.target.value) }))}
                      className="w-16 rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground"
                    />
                    {c('items')}
                  </label>
                )}
              </li>
            )
          })}
        </ul>
        <p className={hintClass}>{c('totalItems', { n: total, max: COMP_MAX_ITEMS })}</p>
      </fieldset>

      <FocusFields level={level} value={focus} onChange={setFocus} />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={!canGenerate} className={`${primaryButtonClass} inline-flex items-center gap-2`}>
          <Sparkles className="h-4 w-4" />
          {busy ? c('generating') : c('generate')}
        </button>
        <button type="button" disabled={busy} onClick={() => onStartEmpty(skill, level)} className="text-sm font-medium text-muted-foreground underline-offset-2 hover:underline disabled:opacity-50">
          {c('startEmpty')}
        </button>
        {busy && <span className={hintClass}>{c('generatingHint')}</span>}
      </div>
    </form>
  )
}
