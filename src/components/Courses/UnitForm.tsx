import { ArrowDown, ArrowUp, X } from 'lucide-react'
import { hintClass, inputClass, labelClass } from '../TeacherTools/ui'
import { KIND_ICONS } from './kindMeta'
import { useCourseCopy } from '../../data/courseCopy'
import { getGrammarItem, getGrammarPointsByLevel } from '../../data/grammarCurriculum'
import {
  AVAILABLE_KINDS,
  COURSE_LEVELS,
  COURSE_TOPIC_MAX,
  MAX_GRAMMAR_PER_UNIT,
  MAX_MODULES,
  SOURCE_TEXT_MAX,
  UNIT_NOTES_MAX,
  UNIT_TEMPLATES,
  planProblems,
  templateHasInputChoice,
  templateKinds,
  templateSlots,
  type CourseLevel,
  type InputSkill,
  type ModuleKind,
  type UnitInput,
  type UnitTemplate,
} from '../../lib/courses'

export interface UnitFormValue {
  topic: string
  template: UnitTemplate
  input: InputSkill
  /** The custom plan (kept while another template is picked). */
  kinds: ModuleKind[]
  grammarIds: string[]
  notes: string
  /** Templates: end with a Unit check. */
  withCheck: boolean
  /** The teacher's own text for the first reading/listening module. */
  sourceText: string
}

export const EMPTY_UNIT: UnitFormValue = { topic: '', template: 'compact', input: 'reading', kinds: templateKinds('compact'), grammarIds: [], notes: '', withCheck: true, sourceText: '' }

export function planOf(value: UnitFormValue): ModuleKind[] {
  return value.template === 'custom' ? value.kinds : templateKinds(value.template, value.input, value.withCheck)
}

export function toUnitInput(value: UnitFormValue): UnitInput {
  return {
    topic: value.topic.trim(),
    template: value.template,
    input: value.input,
    ...(value.template === 'custom' ? { kinds: value.kinds } : {}),
    grammarIds: value.grammarIds,
    notes: value.notes.trim(),
    withCheck: planOf(value).includes('unit_check'),
    sourceText: value.sourceText.trim(),
  }
}

/** Whether the form can be sent: a topic, 1–2 grammar points and a plan that passes every rule. */
export function unitFormReady(value: UnitFormValue): boolean {
  return value.topic.trim().length > 0 && value.grammarIds.length > 0 && planProblems(planOf(value)).length === 0
}

/** Kinds the custom plan may add (Pronunciation shows as coming soon). */
const ADDABLE: ModuleKind[] = ['reading', 'writing', 'listening', 'speaking', 'grammar', 'pronunciation']

/**
 * A unit's settings: its topic, the template (or a custom module plan, checked live against the
 * builder rules) with its skill choice and optional Unit check, the grammar point(s) from the
 * Grammar Coach curriculum at the course level or below, optional notes for the AI, and
 * optionally the teacher's own text for the first reading/listening module.
 */
export default function UnitForm({ level, value, onChange }: { level: CourseLevel; value: UnitFormValue; onChange: (next: UnitFormValue) => void }) {
  const { c, kind, lang } = useCourseCopy()
  const plan = planOf(value)
  const problems = planProblems(plan)
  const set = (patch: Partial<UnitFormValue>) => onChange({ ...value, ...patch })

  const levels = COURSE_LEVELS.slice(0, COURSE_LEVELS.indexOf(level) + 1).reverse()
  const grammarTitle = (id: string) => {
    const item = getGrammarItem(id)?.item
    return item ? (lang === 'hu' ? item.titleHu : item.title) : id
  }

  function editPlan(next: ModuleKind[]) {
    set({ kinds: next })
  }

  const hasCheck = plan.includes('unit_check')

  function addKind(k: ModuleKind) {
    if (k === 'unit_check') return editPlan([...plan, k])
    // New modules go before the Unit check.
    const at = plan[plan.length - 1] === 'unit_check' ? plan.length - 1 : plan.length
    editPlan([...plan.slice(0, at), k, ...plan.slice(at)])
  }

  function move(i: number, d: -1 | 1) {
    const next = [...plan]
    ;[next[i], next[i + d]] = [next[i + d], next[i]]
    editPlan(next)
  }

  return (
    <div className="space-y-5">
      <label className="block space-y-1">
        <span className={labelClass}>{c('unitTopic')}</span>
        <input className={inputClass} value={value.topic} maxLength={COURSE_TOPIC_MAX} placeholder={c('unitTopicPlaceholder')} onChange={(e) => set({ topic: e.target.value })} />
      </label>

      <fieldset className="space-y-2">
        <legend className={labelClass}>{c('template')}</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {UNIT_TEMPLATES.map((t) => {
            const picked = value.template === t
            return (
              <button
                key={t}
                type="button"
                onClick={() => set(t === 'custom' && value.template !== 'custom' ? { template: t, kinds: plan } : { template: t })}
                className={`rounded-xl border-2 p-3 text-left ${picked ? 'border-[var(--teal-accent)] bg-[var(--teal-accent-soft)]' : 'border-border bg-card hover:border-[var(--teal-accent-border)]'}`}
              >
                <span className="block font-medium text-foreground">{c(`template_${t}`)}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">{c(`templateDesc_${t}`)}</span>
                {t !== 'custom' && (
                  <span className="mt-2 flex flex-wrap gap-1">
                    {templateSlots(t, value.input)
                      .filter((k) => value.withCheck || k !== 'unit_check')
                      .map((k, i) =>
                        AVAILABLE_KINDS.has(k) ? (
                          <span key={i} className="rounded bg-secondary px-1.5 py-0.5 text-[11px] text-muted-foreground">
                            {kind(k)}
                          </span>
                        ) : (
                          <span key={i} title={c('comingSoon')} className="rounded border border-dashed border-border px-1.5 py-0.5 text-[11px] text-muted-foreground/70">
                            {kind(k)} · {c('soon')}
                          </span>
                        ),
                      )}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </fieldset>

      {templateHasInputChoice(value.template) && (
        <fieldset className="space-y-1">
          <legend className={labelClass}>{value.template === 'compact' ? c('skillPair') : c('textSkill')}</legend>
          <div className="flex flex-wrap gap-2">
            {(['reading', 'listening'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => set({ input: s })}
                className={`rounded-lg border-2 px-3 py-1.5 text-sm ${value.input === s ? 'border-[var(--teal-accent)] bg-[var(--teal-accent-soft)]' : 'border-border bg-card'}`}
              >
                {value.template === 'compact' ? c(s === 'reading' ? 'pair_reading' : 'pair_listening') : kind(s)}
              </button>
            ))}
          </div>
          <p className={hintClass}>{value.template === 'compact' ? c('skillPairHint') : c('textSkillHint')}</p>
        </fieldset>
      )}

      {value.template !== 'custom' && (
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" checked={value.withCheck} onChange={(e) => set({ withCheck: e.target.checked })} />
          {c('withCheck')}
        </label>
      )}

      {value.template === 'custom' && (
        <div className="space-y-3 rounded-xl border border-border p-3">
          <p className={hintClass}>{c('customHint')}</p>
          <ol className="space-y-1.5">
            {plan.map((k, i) => {
              const Icon = KIND_ICONS[k]
              const fixed = k === 'vocabulary'
              const isCheck = k === 'unit_check'
              return (
                <li key={`${k}-${i}`} className="flex items-center gap-2 rounded-lg bg-secondary/60 px-2 py-1.5 text-sm">
                  <span className="w-5 text-center text-xs text-muted-foreground">{i + 1}</span>
                  <Icon className="h-4 w-4 text-[var(--teal-accent-strong)]" />
                  <span className="flex-1 text-foreground">{kind(k)}</span>
                  {!fixed && (
                    <>
                      {!isCheck && (
                        <>
                      <button type="button" aria-label={c('moveUp')} disabled={i <= 1} onClick={() => move(i, -1)} className="rounded p-1 hover:bg-background disabled:opacity-30">
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        aria-label={c('moveDown')}
                        disabled={i >= plan.length - (hasCheck ? 2 : 1)}
                        onClick={() => move(i, 1)}
                        className="rounded p-1 hover:bg-background disabled:opacity-30"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                        </>
                      )}
                      <button type="button" aria-label={c('remove')} onClick={() => editPlan(plan.filter((_, k2) => k2 !== i))} className="rounded p-1 hover:bg-background">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                </li>
              )
            })}
          </ol>
          <div className="flex flex-wrap gap-1.5">
            {ADDABLE.map((k) => (
              <button
                key={k}
                type="button"
                disabled={!AVAILABLE_KINDS.has(k) || plan.length >= MAX_MODULES}
                onClick={() => addKind(k)}
                title={AVAILABLE_KINDS.has(k) ? undefined : c('comingSoon')}
                className="rounded-lg border border-dashed border-border px-2.5 py-1 text-xs text-foreground hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
              >
                + {kind(k)}
              </button>
            ))}
            {!hasCheck && (
              <button
                type="button"
                disabled={plan.length >= MAX_MODULES}
                onClick={() => addKind('unit_check')}
                className="rounded-lg border border-dashed border-border px-2.5 py-1 text-xs text-foreground hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
              >
                + {kind('unit_check')}
              </button>
            )}
          </div>
          {problems.length > 0 && (
            <ul className="space-y-0.5 text-xs text-red-600">
              {problems.map((p) => (
                <li key={p}>{c(`problem_${p}`)}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="space-y-2">
        <span className={labelClass}>{c('grammar')}</span>
        <p className={hintClass}>{c('grammarHint', { n: MAX_GRAMMAR_PER_UNIT })}</p>
        {value.grammarIds.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {value.grammarIds.map((id) => (
              <span key={id} className="inline-flex items-center gap-1 rounded-lg bg-[var(--teal-accent-soft)] px-2 py-1 text-sm text-foreground">
                {grammarTitle(id)}
                <button type="button" aria-label={c('remove')} onClick={() => set({ grammarIds: value.grammarIds.filter((g) => g !== id) })} className="rounded p-0.5 hover:bg-background/60">
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
        {value.grammarIds.length < MAX_GRAMMAR_PER_UNIT && (
          <select
            className={inputClass}
            value=""
            onChange={(e) => e.target.value && set({ grammarIds: [...value.grammarIds, e.target.value] })}
          >
            <option value="">{c('grammarPick')}</option>
            {levels.map((l) => (
              <optgroup key={l} label={l}>
                {getGrammarPointsByLevel(l)
                  .filter((g) => !value.grammarIds.includes(g.id))
                  .map((g) => (
                    <option key={g.id} value={g.id}>
                      {lang === 'hu' ? g.titleHu : g.title}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        )}
      </div>

      <label className="block space-y-1">
        <span className={labelClass}>{c('sourceText')}</span>
        <textarea
          className={`${inputClass} min-h-[5rem]`}
          value={value.sourceText}
          maxLength={SOURCE_TEXT_MAX}
          placeholder={c('sourceTextPlaceholder')}
          onChange={(e) => set({ sourceText: e.target.value })}
        />
        <span className={hintClass}>{c('sourceTextHint', { n: SOURCE_TEXT_MAX })}</span>
      </label>

      <label className="block space-y-1">
        <span className={labelClass}>{c('notes')}</span>
        <textarea className={`${inputClass} min-h-[4rem]`} value={value.notes} maxLength={UNIT_NOTES_MAX} placeholder={c('notesPlaceholder')} onChange={(e) => set({ notes: e.target.value })} />
      </label>
    </div>
  )
}
