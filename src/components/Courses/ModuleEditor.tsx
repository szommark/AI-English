import { useState } from 'react'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import { hintClass, inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from '../TeacherTools/ui'
import { useCourseCopy } from '../../data/courseCopy'
import { GAP } from '../../lib/grammarExercises'
import { CourseValidationError, STEP_TYPES, normalizeSteps, sanitizeModuleContent, type CourseStep, type ModuleContent, type StepType } from '../../lib/courses'

const splitBar = (s: string) =>
  s
    .split('|')
    .map((x) => x.trim())
    .filter(Boolean)

function blankStep(type: StepType): CourseStep {
  switch (type) {
    case 'info':
      return { id: '', type, title: '', body: '' }
    case 'words':
      return { id: '', type, words: [{ term: '', meaning: '', example: '' }] }
    case 'text':
      return { id: '', type }
    case 'choice':
      return { id: '', type, prompt: '', options: ['', ''], answer: 0 }
    case 'gap':
      return { id: '', type, sentence: `… ${GAP} …`, accepted: [''] }
    case 'match':
      return { id: '', type, prompt: 'Match the words to their meanings.', pairs: [{ left: '', right: '' }, { left: '', right: '' }] }
    case 'order':
      return { id: '', type, prompt: 'Put the words in order.', answer: '' }
    case 'listen':
      return { id: '', type }
    case 'write':
      return { id: '', type, prompt: '', minWords: 60, maxWords: 100 }
    case 'speak':
      return { id: '', type, prompt: '', seconds: 60 }
    case 'roleplay':
      return { id: '', type, situation: '', botName: 'Receptionist', botRole: '', opening: '', goals: [''], turns: 5 }
  }
}

const listOf = (s: string) =>
  s
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)

/**
 * Edit a module by hand: its intro, its text (reading modules) and every step — change, add,
 * move or delete. Validated with the same rules as the server before saving.
 */
export default function ModuleEditor({ content, onSave, onCancel }: { content: ModuleContent; onSave: (next: ModuleContent) => Promise<void>; onCancel: () => void }) {
  const { c } = useCourseCopy()
  const [draft, setDraft] = useState<ModuleContent>(content)
  const [addType, setAddType] = useState<StepType>('choice')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const setStep = (i: number, step: CourseStep) => setDraft((d) => ({ ...d, steps: d.steps.map((s, k) => (k === i ? step : s)) }))
  const moveStep = (i: number, dir: -1 | 1) =>
    setDraft((d) => {
      const steps = [...d.steps]
      ;[steps[i], steps[i + dir]] = [steps[i + dir], steps[i]]
      return { ...d, steps: normalizeSteps(steps) }
    })

  async function save() {
    setError(null)
    let clean: ModuleContent
    try {
      clean = sanitizeModuleContent(draft)
    } catch (err) {
      setError(err instanceof CourseValidationError ? err.message : c('saveError'))
      return
    }
    setSaving(true)
    try {
      await onSave(clean)
    } catch {
      setError(c('saveError'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4 rounded-xl border border-[var(--teal-accent-border)] bg-background p-3 sm:p-4">
      <label className="block space-y-1">
        <span className={labelClass}>{c('moduleIntro')}</span>
        <input className={inputClass} value={draft.intro} maxLength={300} onChange={(e) => setDraft({ ...draft, intro: e.target.value })} />
      </label>

      {draft.passage && (
        <div className="space-y-2">
          <span className={labelClass}>{c('passage')}</span>
          <input
            className={inputClass}
            value={draft.passage.title}
            placeholder={c('passageTitle')}
            onChange={(e) => setDraft({ ...draft, passage: { ...(draft.passage as NonNullable<ModuleContent['passage']>), title: e.target.value } })}
          />
          <textarea
            className={`${inputClass} min-h-[12rem] font-serif`}
            value={draft.passage.text}
            onChange={(e) => setDraft({ ...draft, passage: { ...(draft.passage as NonNullable<ModuleContent['passage']>), text: e.target.value } })}
          />
          {draft.steps.some((st) => st.type === 'listen') && (
            <>
              <select
                className={`${inputClass} w-auto`}
                value={draft.passage.style ?? 'monologue'}
                onChange={(e) => setDraft({ ...draft, passage: { ...(draft.passage as NonNullable<ModuleContent['passage']>), style: e.target.value as 'monologue' | 'dialogue' } })}
              >
                <option value="monologue">{c('style_monologue')}</option>
                <option value="dialogue">{c('style_dialogue')}</option>
              </select>
              <p className={hintClass}>{c('scriptHint')}</p>
            </>
          )}
        </div>
      )}

      <ol className="space-y-3">
        {draft.steps.map((step, i) => (
          <li key={i} className="space-y-2 rounded-lg border border-border bg-card p-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">
                {i + 1}. {c(`step_${step.type}`)}
              </span>
              <span className="flex-1" />
              <button type="button" aria-label={c('moveUp')} disabled={i === 0} onClick={() => moveStep(i, -1)} className="rounded p-1 hover:bg-secondary disabled:opacity-30">
                <ArrowUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label={c('moveDown')}
                disabled={i === draft.steps.length - 1}
                onClick={() => moveStep(i, 1)}
                className="rounded p-1 hover:bg-secondary disabled:opacity-30"
              >
                <ArrowDown className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label={c('remove')}
                onClick={() => setDraft((d) => ({ ...d, steps: normalizeSteps(d.steps.filter((_, k) => k !== i)) }))}
                className="rounded p-1 text-red-600 hover:bg-secondary"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <StepFields step={step} onChange={(s) => setStep(i, s)} />
          </li>
        ))}
      </ol>

      <div className="flex flex-wrap items-center gap-2">
        <select className={`${inputClass} w-auto`} value={addType} onChange={(e) => setAddType(e.target.value as StepType)}>
          {STEP_TYPES.filter((t) => (t !== 'text' && t !== 'listen') || draft.passage).map((t) => (
            <option key={t} value={t}>
              {c(`step_${t}`)}
            </option>
          ))}
        </select>
        <button type="button" className={`${secondaryButtonClass} inline-flex items-center gap-1`} onClick={() => setDraft((d) => ({ ...d, steps: normalizeSteps([...d.steps, blankStep(addType)]) }))}>
          <Plus className="h-4 w-4" />
          {c('addStep')}
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button type="button" className={primaryButtonClass} disabled={saving} onClick={() => void save()}>
          {saving ? c('saving') : c('save')}
        </button>
        <button type="button" className={secondaryButtonClass} onClick={onCancel}>
          {c('cancel')}
        </button>
      </div>
    </div>
  )
}

function StepFields({ step, onChange }: { step: CourseStep; onChange: (s: CourseStep) => void }) {
  const { c } = useCourseCopy()
  const small = `${inputClass} text-sm`
  switch (step.type) {
    case 'info':
      return (
        <>
          <input className={small} value={step.title} placeholder={c('fieldTitle')} onChange={(e) => onChange({ ...step, title: e.target.value })} />
          <textarea className={`${small} min-h-[6rem]`} value={step.body} placeholder={c('fieldBody')} onChange={(e) => onChange({ ...step, body: e.target.value })} />
          <p className={hintClass}>{c('boldHint')}</p>
        </>
      )
    case 'text':
      return <p className={hintClass}>{c('textStepHint')}</p>
    case 'listen':
      return <p className={hintClass}>{c('listenStepHint')}</p>
    case 'roleplay':
      return (
        <div className="space-y-2">
          <textarea className={`${small} min-h-[4rem]`} value={step.situation} placeholder={c('fieldSituation')} onChange={(e) => onChange({ ...step, situation: e.target.value })} />
          <div className="flex flex-wrap items-center gap-2">
            <input className={`${small} w-48`} value={step.botName} placeholder={c('fieldBotName')} onChange={(e) => onChange({ ...step, botName: e.target.value })} />
            <span className="text-sm text-muted-foreground">{c('fieldTurns')}</span>
            <input type="number" className={`${small} w-20`} value={step.turns} onChange={(e) => onChange({ ...step, turns: Number(e.target.value) })} />
          </div>
          <textarea className={`${small} min-h-[3rem]`} value={step.botRole} placeholder={c('fieldBotRole')} onChange={(e) => onChange({ ...step, botRole: e.target.value })} />
          <input className={small} value={step.opening} placeholder={c('fieldOpening')} onChange={(e) => onChange({ ...step, opening: e.target.value })} />
          <textarea
            className={`${small} min-h-[3rem]`}
            value={step.goals.join('\n')}
            placeholder={c('fieldGoals')}
            onChange={(e) => onChange({ ...step, goals: e.target.value.split('\n') })}
          />
          <input className={small} value={(step.targets ?? []).join(', ')} placeholder={c('fieldTargets')} onChange={(e) => onChange({ ...step, targets: listOf(e.target.value) })} />
        </div>
      )
    case 'write':
    case 'speak':
      return (
        <div className="space-y-2">
          <textarea className={`${small} min-h-[4rem]`} value={step.prompt} placeholder={c('fieldTask')} onChange={(e) => onChange({ ...step, prompt: e.target.value })} />
          {step.type === 'write' ? (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted-foreground">{c('fieldWords')}</span>
              <input type="number" className={`${small} w-20`} value={step.minWords} onChange={(e) => onChange({ ...step, minWords: Number(e.target.value) })} />
              <span>–</span>
              <input type="number" className={`${small} w-20`} value={step.maxWords} onChange={(e) => onChange({ ...step, maxWords: Number(e.target.value) })} />
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted-foreground">{c('fieldSeconds')}</span>
              <input type="number" className={`${small} w-20`} value={step.seconds} onChange={(e) => onChange({ ...step, seconds: Number(e.target.value) })} />
              <label className="ml-2 inline-flex items-center gap-1.5">
                <input type="checkbox" checked={!!step.modelFirst} onChange={(e) => onChange({ ...step, modelFirst: e.target.checked || undefined })} />
                {c('fieldModelFirst')}
              </label>
            </div>
          )}
          <textarea className={`${small} min-h-[4rem]`} value={step.model ?? ''} placeholder={c('fieldModel')} onChange={(e) => onChange({ ...step, model: e.target.value || undefined })} />
          <input className={small} value={(step.targets ?? []).join(', ')} placeholder={c('fieldTargets')} onChange={(e) => onChange({ ...step, targets: listOf(e.target.value) })} />
        </div>
      )
    case 'words':
      return (
        <div className="space-y-2">
          {step.words.map((w, i) => {
            const setWord = (patch: Partial<typeof w>) => onChange({ ...step, words: step.words.map((x, k) => (k === i ? { ...x, ...patch } : x)) })
            return (
              <div key={i} className="grid gap-1.5 rounded-lg bg-secondary/50 p-2 sm:grid-cols-[1fr_6rem_auto]">
                <input className={small} value={w.term} placeholder={c('fieldTerm')} onChange={(e) => setWord({ term: e.target.value })} />
                <input className={small} value={w.pos ?? ''} placeholder={c('fieldPos')} onChange={(e) => setWord({ pos: e.target.value || undefined })} />
                <button type="button" aria-label={c('remove')} onClick={() => onChange({ ...step, words: step.words.filter((_, k) => k !== i) })} className="rounded p-1 text-red-600 hover:bg-background">
                  <Trash2 className="h-4 w-4" />
                </button>
                <input className={`${small} sm:col-span-3`} value={w.meaning} placeholder={c('fieldMeaning')} onChange={(e) => setWord({ meaning: e.target.value })} />
                <input className={`${small} sm:col-span-3`} value={w.example} placeholder={c('fieldExample')} onChange={(e) => setWord({ example: e.target.value })} />
              </div>
            )
          })}
          <button type="button" className={secondaryButtonClass} onClick={() => onChange({ ...step, words: [...step.words, { term: '', meaning: '', example: '' }] })}>
            + {c('addWord')}
          </button>
        </div>
      )
    case 'choice':
      return (
        <div className="space-y-2">
          <input className={small} value={step.prompt} placeholder={c('fieldPrompt')} onChange={(e) => onChange({ ...step, prompt: e.target.value })} />
          {step.options.map((o, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="radio" name={`ans-${step.id}`} checked={step.answer === i} onChange={() => onChange({ ...step, answer: i })} aria-label={c('rightOption')} />
              <input className={small} value={o} placeholder={c('fieldOption', { n: i + 1 })} onChange={(e) => onChange({ ...step, options: step.options.map((x, k) => (k === i ? e.target.value : x)) })} />
              <button
                type="button"
                aria-label={c('remove')}
                disabled={step.options.length <= 2}
                onClick={() => onChange({ ...step, options: step.options.filter((_, k) => k !== i), answer: step.answer === i ? 0 : step.answer > i ? step.answer - 1 : step.answer })}
                className="rounded p-1 text-red-600 hover:bg-secondary disabled:opacity-30"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          {step.options.length < 5 && (
            <button type="button" className={secondaryButtonClass} onClick={() => onChange({ ...step, options: [...step.options, ''] })}>
              + {c('addOption')}
            </button>
          )}
          <input className={small} value={step.explain ?? ''} placeholder={c('fieldExplain')} onChange={(e) => onChange({ ...step, explain: e.target.value || undefined })} />
        </div>
      )
    case 'gap':
      return (
        <div className="space-y-2">
          <input className={small} value={step.sentence} placeholder={c('fieldSentence')} onChange={(e) => onChange({ ...step, sentence: e.target.value })} />
          <p className={hintClass}>{c('gapMarkHint', { gap: GAP })}</p>
          <input className={small} value={step.accepted.join(' | ')} placeholder={c('fieldAccepted')} onChange={(e) => onChange({ ...step, accepted: splitBar(e.target.value) })} />
          <input
            className={small}
            value={(step.options ?? []).join(' | ')}
            placeholder={c('fieldGapOptions')}
            onChange={(e) => {
              const options = splitBar(e.target.value)
              onChange({ ...step, options: options.length ? options : undefined })
            }}
          />
          <input className={small} value={step.explain ?? ''} placeholder={c('fieldExplain')} onChange={(e) => onChange({ ...step, explain: e.target.value || undefined })} />
        </div>
      )
    case 'match':
      return (
        <div className="space-y-2">
          <input className={small} value={step.prompt} placeholder={c('fieldPrompt')} onChange={(e) => onChange({ ...step, prompt: e.target.value })} />
          {step.pairs.map((p, i) => (
            <div key={i} className="flex items-center gap-2">
              <input className={small} value={p.left} placeholder={c('fieldLeft')} onChange={(e) => onChange({ ...step, pairs: step.pairs.map((x, k) => (k === i ? { ...x, left: e.target.value } : x)) })} />
              <span className="text-muted-foreground">→</span>
              <input className={small} value={p.right} placeholder={c('fieldRight')} onChange={(e) => onChange({ ...step, pairs: step.pairs.map((x, k) => (k === i ? { ...x, right: e.target.value } : x)) })} />
              <button
                type="button"
                aria-label={c('remove')}
                disabled={step.pairs.length <= 2}
                onClick={() => onChange({ ...step, pairs: step.pairs.filter((_, k) => k !== i) })}
                className="rounded p-1 text-red-600 hover:bg-secondary disabled:opacity-30"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          {step.pairs.length < 8 && (
            <button type="button" className={secondaryButtonClass} onClick={() => onChange({ ...step, pairs: [...step.pairs, { left: '', right: '' }] })}>
              + {c('addPair')}
            </button>
          )}
        </div>
      )
    case 'order':
      return (
        <div className="space-y-2">
          <input className={small} value={step.prompt} placeholder={c('fieldPrompt')} onChange={(e) => onChange({ ...step, prompt: e.target.value })} />
          <input className={small} value={step.answer} placeholder={c('fieldOrderAnswer')} onChange={(e) => onChange({ ...step, answer: e.target.value })} />
          <input className={small} value={step.explain ?? ''} placeholder={c('fieldExplain')} onChange={(e) => onChange({ ...step, explain: e.target.value || undefined })} />
        </div>
      )
  }
}
