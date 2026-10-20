import { useState, type ReactNode } from 'react'
import { useExamTaskCopy, type ExamTaskCopyKey } from '../../data/examTaskCopy'
import { generateExamTask } from '../../lib/examTaskApi'
import type { SourceCandidate } from '../../lib/examSources'
import {
  EXAM_FIELDS,
  levelSpec,
  NOTES_SUBTYPES,
  TASK_LEVELS,
  type ExamField,
  type ListeningFormat,
  type NotesSubtype,
  type ScriptStyle,
  type TaskLevel,
} from '../../lib/examTasks'
import { TeacherToolsError } from '../../lib/teacherToolsApi'
import { hintClass, inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from '../TeacherTools/ui'
import SourceFinder from './SourceFinder'
import type { LoadedDraft } from './StartPanel'

// Guided AI creation in the order of the listening-task-intake skill: level → task type (and
// notes layout) → exam field → source (web source finder or the teacher's own) → things to avoid
// → a one-line confirmation → generate. Level, format and field live in the editor's draft.

type Step = 'level' | 'type' | 'field' | 'source' | 'avoid' | 'confirm'
const STEPS: Step[] = ['level', 'type', 'field', 'source', 'avoid', 'confirm']

const ERR: Record<string, true> = {
  err_daily_limit: true,
  err_generation_failed: true,
  err_source_fetch_failed: true,
  err_invalid_url: true,
  err_source_too_short: true,
}

/** The label and answer table is a B2 layout (no C1 exam uses it, B1 notes are flat). */
const subtypesFor = (level: TaskLevel): NotesSubtype[] => NOTES_SUBTYPES.filter((s) => s !== 'label-table' || level === 'B2')

function Choice({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`inline-flex min-h-10 items-center rounded-lg border px-3 text-left text-sm font-medium ${
        selected ? 'border-[var(--teal-accent-border)] bg-[var(--teal-accent-soft)] text-[var(--teal-accent-strong)]' : 'border-border bg-card text-foreground hover:bg-muted'
      }`}
    >
      {children}
    </button>
  )
}

export default function CreateWizard({
  level,
  format,
  field,
  onLevel,
  onFormat,
  onField,
  onLoad,
}: {
  level: TaskLevel
  format: ListeningFormat
  field: ExamField
  onLevel: (l: TaskLevel) => void
  onFormat: (f: ListeningFormat) => void
  onField: (f: ExamField) => void
  onLoad: (draft: LoadedDraft) => void
}) {
  const { c } = useExamTaskCopy()
  const [step, setStep] = useState(0)
  const [subtype, setSubtype] = useState<NotesSubtype>('flat-bullets')
  const [sourceMode, setSourceMode] = useState<'find' | 'own'>('find')
  const [picked, setPicked] = useState<SourceCandidate | null>(null)
  const [sourceUrl, setSourceUrl] = useState('')
  const [sourceText, setSourceText] = useState('')
  const [style, setStyle] = useState<ScriptStyle | 'infer'>('infer')
  const [avoid, setAvoid] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [remaining, setRemaining] = useState<number | null>(null)
  const [envAsk, setEnvAsk] = useState(false)

  const current = STEPS[step]
  const ownOk = sourceText.trim().split(/\s+/).length >= 80 || /^https?:\/\//.test(sourceUrl.trim())
  const sourceOk = sourceMode === 'find' ? !!picked : ownOk

  function chooseLevel(l: TaskLevel) {
    onLevel(l)
    if (!subtypesFor(l).includes(subtype)) setSubtype('flat-bullets')
  }

  async function generate(forceFormat?: ListeningFormat) {
    setBusy(true)
    setError(null)
    setEnvAsk(false)
    const useFormat = forceFormat ?? format
    const source = sourceMode === 'find' && picked ? { sourceText: picked.text } : sourceText.trim() ? { sourceText } : { sourceUrl: sourceUrl.trim() }
    const sourceRef = sourceMode === 'find' && picked ? picked.url : sourceUrl.trim()
    try {
      const { draft, remaining: left } = await generateExamTask({
        level,
        format: useFormat,
        field,
        style,
        ...source,
        avoid,
        ...(useFormat === 'notes' ? { subtype } : {}),
      })
      setRemaining(left)
      onLoad({
        title: draft.title,
        sourceRef: draft.sourceRef || sourceRef,
        origin: 'generated',
        content: draft.content,
      })
    } catch (err) {
      const code = err instanceof TeacherToolsError ? err.code : 'generic'
      if (code === 'environment_topic') setEnvAsk(true)
      else setError(c((`err_${code}` as ExamTaskCopyKey) in ERR ? (`err_${code}` as ExamTaskCopyKey) : 'err_generic'))
    } finally {
      setBusy(false)
    }
  }

  const answerWords =
    format === 'notes'
      ? level === 'C1' && field === 'technical'
        ? c('wiz_c1Technical')
        : c('wiz_answerWords', {
            n: levelSpec(level, 'notes').answerWords ?? 3,
          })
      : null
  const sourceLabel = sourceMode === 'find' ? (picked?.title ?? '') : sourceUrl.trim() || (sourceText.trim() ? c('src_words', { n: sourceText.trim().split(/\s+/).length }) : '')
  const summary = [
    level,
    format === 'notes' ? `${c('format_notes')} (${c(`subtype_${subtype}`)})` : c('format_true_false'),
    c(`field_${field}`),
    answerWords,
    sourceLabel && c('wiz_summarySource', { s: sourceLabel }),
    avoid.trim() && c('wiz_summaryAvoid', { s: avoid.trim() }),
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="space-y-4">
      <p className={hintClass}>{c('wiz_step', { n: step + 1, total: STEPS.length })}</p>

      {current === 'level' && (
        <fieldset className="space-y-2">
          <legend className={labelClass}>{c('wiz_levelQ')}</legend>
          <div className="flex flex-wrap gap-2">
            {TASK_LEVELS.map((l) => (
              <Choice key={l} selected={level === l} onClick={() => chooseLevel(l)}>
                {l}
              </Choice>
            ))}
          </div>
        </fieldset>
      )}

      {current === 'type' && (
        <div className="space-y-3">
          <fieldset className="space-y-2">
            <legend className={labelClass}>{c('wiz_typeQ')}</legend>
            <div className="flex flex-wrap gap-2">
              <Choice selected={format === 'true-false'} onClick={() => onFormat('true-false')}>
                {c('format_true_false')}
              </Choice>
              <Choice selected={format === 'notes'} onClick={() => onFormat('notes')}>
                {c('format_notes')}
              </Choice>
            </div>
            <p className={hintClass}>{c('wiz_envRule')}</p>
          </fieldset>
          {format === 'notes' && (
            <fieldset className="space-y-2">
              <legend className={labelClass}>{c('wiz_subtypeQ')}</legend>
              <div className="flex flex-wrap gap-2">
                {subtypesFor(level).map((s) => (
                  <Choice key={s} selected={subtype === s} onClick={() => setSubtype(s)}>
                    {c(`subtype_${s}`)}
                  </Choice>
                ))}
              </div>
              {level !== 'B2' && <p className={hintClass}>{c('wiz_labelTableB2')}</p>}
            </fieldset>
          )}
        </div>
      )}

      {current === 'field' && (
        <fieldset className="space-y-2">
          <legend className={labelClass}>{c('wiz_fieldQ')}</legend>
          <div className="flex flex-wrap gap-2">
            {EXAM_FIELDS.map((f) => (
              <Choice key={f} selected={field === f} onClick={() => onField(f)}>
                {c(`field_${f}`)}
              </Choice>
            ))}
          </div>
          {answerWords && <p className={hintClass}>{answerWords}</p>}
        </fieldset>
      )}

      {/* Kept mounted while hidden, so search results and the pick survive Back / Next. */}
      <div className="space-y-3" hidden={current !== 'source'}>
        <fieldset className="space-y-2">
          <legend className={labelClass}>{c('wiz_sourceQ')}</legend>
          <div className="flex flex-wrap gap-2">
            <Choice selected={sourceMode === 'find'} onClick={() => setSourceMode('find')}>
              {c('wiz_sourceFind')}
            </Choice>
            <Choice selected={sourceMode === 'own'} onClick={() => setSourceMode('own')}>
              {c('wiz_sourceOwn')}
            </Choice>
          </div>
        </fieldset>
        <div hidden={sourceMode !== 'find'}>
          <SourceFinder level={level} field={field} format={format} picked={picked} onPick={setPicked} onFormat={onFormat} />
        </div>
        <div className="space-y-3" hidden={sourceMode !== 'own'}>
          <label className={labelClass}>
            {c('sourceUrl')}
            <input
              className={`${inputClass} mt-1`}
              type="url"
              placeholder="https://www.gov.uk/government/news/…"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
            />
          </label>
          <label className={labelClass}>
            {c('sourceText')}
            <textarea className={`${inputClass} mt-1 min-h-32`} value={sourceText} onChange={(e) => setSourceText(e.target.value)} />
          </label>
          <p className={hintClass}>{c('sourceHint')}</p>
        </div>
      </div>

      {current === 'avoid' && (
        <label className={labelClass}>
          {c('wiz_avoidQ')}
          <input className={`${inputClass} mt-1`} placeholder={c('avoidPlaceholder')} value={avoid} maxLength={500} onChange={(e) => setAvoid(e.target.value)} />
        </label>
      )}

      {current === 'confirm' && (
        <div className="space-y-3">
          <p className={labelClass}>{c('wiz_confirmQ')}</p>
          <p className="rounded-xl bg-muted px-4 py-3 text-sm text-foreground" data-testid="wizard-summary">
            {summary}
          </p>
          {!sourceOk && <p className="text-sm text-amber-800">{c('wiz_noSource')}</p>}
          {sourceMode === 'find' && picked?.environmental && format === 'notes' && (
            <div className="flex flex-wrap items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
              <span>{c('src_envWarn')}</span>
              <button type="button" className={secondaryButtonClass} onClick={() => onFormat('true-false')}>
                {c('envSwitch')}
              </button>
            </div>
          )}
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
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className={primaryButtonClass} disabled={busy || !sourceOk} onClick={() => generate()}>
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
                    setPicked(null)
                    setSourceUrl('')
                    setSourceText('')
                    setStep(STEPS.indexOf('source'))
                  }}
                >
                  {c('envChange')}
                </button>
              </div>
            </div>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      )}

      <div className="flex flex-wrap gap-2 border-t border-border pt-3">
        {step > 0 && (
          <button type="button" className={secondaryButtonClass} disabled={busy} onClick={() => setStep(step - 1)}>
            {c('wiz_back')}
          </button>
        )}
        {step < STEPS.length - 1 && (
          <button type="button" className={primaryButtonClass} disabled={current === 'source' && !sourceOk} onClick={() => setStep(step + 1)}>
            {c('wiz_next')}
          </button>
        )}
      </div>
    </div>
  )
}
