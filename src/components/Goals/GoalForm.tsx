import { useState, type FormEvent, type ReactNode } from 'react'
import { useLanguage } from '../../lib/i18n'
import {
  GOAL_DAYS_MAX,
  GOAL_DAYS_MIN,
  GOAL_ITEM_MAX,
  GOAL_LIST_MAX,
  GOAL_TITLE_MAX,
  GOAL_TYPES,
  GOAL_WHY_MAX,
  type GoalInput,
  type GoalRating,
  type GoalType,
  type LearnerGoal,
} from '../../lib/goals'
import { cardClass, hintClass, inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from '../TeacherTools/ui'
import RatingInput, { toRating, withSkill } from './RatingInput'
import { GOAL_TYPE_LABEL, goalErrorKey } from './labels'

interface StepDraft {
  id?: string
  text: string
  done: boolean
}

function Section({ title, hint, children }: { title: string; hint: string; children: ReactNode }) {
  return (
    <section className="space-y-3 border-t border-border pt-4 first:border-t-0 first:pt-0">
      <div>
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className={hintClass}>{hint}</p>
      </div>
      {children}
    </section>
  )
}

/** Editable list of short lines (Options, Will steps), always with at least one empty row. */
function LineList({
  lines,
  onEdit,
  onRemove,
  onAdd,
  placeholder,
}: {
  lines: string[]
  onEdit: (index: number, text: string) => void
  onRemove: (index: number) => void
  onAdd: () => void
  placeholder: string
}) {
  const { t } = useLanguage()
  const rows = lines.length > 0 ? lines : ['']
  return (
    <div className="space-y-2">
      {rows.map((line, i) => (
        <div key={i} className="flex gap-2">
          <input
            value={line}
            maxLength={GOAL_ITEM_MAX}
            placeholder={i === 0 ? placeholder : undefined}
            onChange={(e) => onEdit(i, e.target.value)}
            className={inputClass}
          />
          {rows.length > 1 && (
            <button
              type="button"
              onClick={() => onRemove(i)}
              className={secondaryButtonClass}
              aria-label={t('glRemove')}
            >
              ×
            </button>
          )}
        </div>
      ))}
      {rows.length < GOAL_LIST_MAX && (
        <button type="button" onClick={onAdd} className="text-sm font-medium text-[var(--teal-accent-strong)] hover:underline">
          {t('glAdd')}
        </button>
      )}
    </div>
  )
}

/**
 * The GROW goal form: Goal · Reality (self-assessment) · Options · Will. Used by students (new
 * goal, confirming a teacher's goal, editing) and teachers (sending or editing a student's goal).
 */
export default function GoalForm({
  initial,
  audience,
  withReality,
  requireGoal,
  submitLabel,
  onSubmit,
  extraAction,
  onCancel,
  heading,
}: {
  initial?: LearnerGoal | null
  audience: 'student' | 'teacher'
  /** Hidden when a student edits an active goal: they re-rate on the goal card instead. */
  withReality: boolean
  /** An active goal needs a type and a title; a teacher's pending one may stay blank. */
  requireGoal: boolean
  submitLabel: string
  onSubmit: (input: GoalInput) => Promise<void>
  /** A second button, e.g. "Send blank form". */
  extraAction?: { label: string; hint?: string; onClick: () => Promise<void> }
  onCancel: () => void
  heading?: string
}) {
  const { t } = useLanguage()
  const startRating: GoalRating | null = initial?.draftRating ?? initial?.ratings.at(-1) ?? null

  const [goalType, setGoalType] = useState<GoalType | ''>(initial?.goalType ?? '')
  const [title, setTitle] = useState(initial?.title ?? '')
  const [deadline, setDeadline] = useState(initial?.deadline ?? '')
  const [why, setWhy] = useState(initial?.why ?? '')
  const [overall, setOverall] = useState<number | null>(startRating?.overall ?? null)
  const [skills, setSkills] = useState<GoalRating['skills']>(startRating?.skills ?? {})
  const [options, setOptions] = useState<string[]>(initial?.options ?? [])
  const [steps, setSteps] = useState<StepDraft[]>(initial?.steps ?? [])
  const [days, setDays] = useState<number | null>(initial?.daysPerWeek ?? null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function run(action: () => Promise<void>) {
    setBusy(true)
    setError(null)
    try {
      await action()
    } catch (err) {
      setError(t(goalErrorKey(err)))
      setBusy(false)
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (requireGoal && (!goalType || !title.trim())) {
      setError(t('glErrGoalRequired'))
      return
    }
    const input: GoalInput = {
      goalType: goalType || null,
      title,
      deadline: deadline || null,
      why,
      options,
      steps,
      daysPerWeek: days,
      rating: withReality ? toRating(overall, skills) : null,
    }
    void run(() => onSubmit(input))
  }

  // An empty list shows one blank row, so editing row 0 of an empty list adds it.
  const editAt = <T,>(list: T[], i: number, make: (old: T | undefined) => T) =>
    list.length === 0 ? [make(undefined)] : list.map((x, j) => (j === i ? make(x) : x))
  const withRow = <T,>(list: T[], blank: T) => (list.length === 0 ? [blank, blank] : [...list, blank])

  return (
    <form onSubmit={handleSubmit} className={cardClass}>
      {heading && <h2 className="text-lg font-semibold text-foreground">{heading}</h2>}

      <Section title={t('glStepGoal')} hint={t('glStepGoalHint')}>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1">
            <span className={labelClass}>{t('glType')}</span>
            <select value={goalType} onChange={(e) => setGoalType(e.target.value as GoalType | '')} className={inputClass}>
              <option value="">{t('glTypeChoose')}</option>
              {GOAL_TYPES.map((type) => (
                <option key={type} value={type}>
                  {t(GOAL_TYPE_LABEL[type])}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className={labelClass}>{t('glDeadline')}</span>
            <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className={inputClass} />
          </label>
        </div>
        <label className="block space-y-1">
          <span className={labelClass}>{t('glTitle')}</span>
          <input
            value={title}
            maxLength={GOAL_TITLE_MAX}
            placeholder={t('glTitlePlaceholder')}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="block space-y-1">
          <span className={labelClass}>{t('glWhy')}</span>
          <textarea value={why} maxLength={GOAL_WHY_MAX} rows={2} onChange={(e) => setWhy(e.target.value)} className={inputClass} />
        </label>
      </Section>

      {withReality && (
        <Section title={t('glStepReality')} hint={t(audience === 'teacher' ? 'glRealityTeacherNote' : 'glStepRealityHint')}>
          <RatingInput
            overall={overall}
            skills={skills}
            onOverall={setOverall}
            onSkill={(skill, n) => setSkills((s) => withSkill(s, skill, n))}
          />
        </Section>
      )}

      <Section title={t('glStepOptions')} hint={t('glStepOptionsHint')}>
        <LineList
          lines={options}
          onEdit={(i, text) => setOptions((list) => editAt(list, i, () => text))}
          onRemove={(i) => setOptions((list) => list.filter((_, j) => j !== i))}
          onAdd={() => setOptions((list) => withRow(list, ''))}
          placeholder={t('glOptionPlaceholder')}
        />
      </Section>

      <Section title={t('glStepWill')} hint={t('glStepWillHint')}>
        <LineList
          lines={steps.map((s) => s.text)}
          onEdit={(i, text) => setSteps((list) => editAt(list, i, (old) => ({ ...(old ?? { done: false }), text })))}
          onRemove={(i) => setSteps((list) => list.filter((_, j) => j !== i))}
          onAdd={() => setSteps((list) => withRow(list, { text: '', done: false }))}
          placeholder={t('glStepPlaceholder')}
        />
        <label className="block space-y-1 pt-1">
          <span className={labelClass}>{t('glDays')}</span>
          <select
            value={days ?? ''}
            onChange={(e) => setDays(e.target.value ? Number(e.target.value) : null)}
            className={`${inputClass} sm:w-48`}
          >
            <option value="">{t('glDaysNone')}</option>
            {Array.from({ length: GOAL_DAYS_MAX - GOAL_DAYS_MIN + 1 }, (_, i) => GOAL_DAYS_MIN + i).map((n) => (
              <option key={n} value={n}>
                {t('glDaysOption', { n })}
              </option>
            ))}
          </select>
          <span className={`${hintClass} block`}>{t('glDaysHint')}</span>
        </label>
      </Section>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
        <button type="submit" disabled={busy} className={primaryButtonClass}>
          {submitLabel}
        </button>
        {extraAction && (
          <button type="button" disabled={busy} onClick={() => void run(extraAction.onClick)} className={secondaryButtonClass} title={extraAction.hint}>
            {extraAction.label}
          </button>
        )}
        <button type="button" disabled={busy} onClick={onCancel} className="text-sm text-muted-foreground hover:text-foreground">
          {t('glCancel')}
        </button>
      </div>
    </form>
  )
}
