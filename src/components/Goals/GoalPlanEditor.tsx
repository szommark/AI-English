import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, Check, Trash2 } from 'lucide-react'
import { useLanguage, type MessageKey } from '../../lib/i18n'
import type { LearnerGoal } from '../../lib/goals'
import {
  MAX_MILESTONES,
  MAX_TASKS_PER_MILESTONE,
  MILESTONE_NOTE_MAX,
  MILESTONE_TITLE_MAX,
  SCENARIO_MODES,
  planWarnings,
  spreadDates,
  type GoalPlanInput,
  type PlanWarning,
  type ScenarioMode,
  type TaskKind,
} from '../../lib/goalPlans'
import { addDays, budapestDate } from '../../lib/gamification/dates'
import { saveGoalPlan } from '../../lib/goalsApi'
import { cardClass, hintClass, inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from '../TeacherTools/ui'
import TaskPicker, { type PickedContent } from './TaskPicker'
import { SCENARIO_MODE_LABEL, TASK_KIND_ICON, TASK_KIND_LABEL, goalErrorKey } from './labels'

interface DraftTask {
  key: string
  id?: string
  kind: TaskKind
  ref: string
  title: string
  dueOn: string
  scenarioMode: ScenarioMode | null
  minScore: number | null
  completedAt: string | null
}

interface DraftMilestone {
  key: string
  id?: string
  title: string
  note: string
  dueOn: string
  tasks: DraftTask[]
}

const WARNING_LABEL: Record<PlanWarning, MessageKey> = {
  pastDeadline: 'gpWarnPastDeadline',
  taskAfterMilestone: 'gpWarnTaskAfterMilestone',
  bunched: 'gpWarnBunched',
}

let nextKey = 0
const newKey = () => `k${++nextKey}`

function toDraft(goal: LearnerGoal): DraftMilestone[] {
  return goal.milestones.map((m) => ({
    key: m.id,
    id: m.id,
    title: m.title,
    note: m.note ?? '',
    dueOn: m.dueOn,
    tasks: m.tasks.map((t) => ({
      key: t.id,
      id: t.id,
      kind: t.kind,
      ref: t.ref,
      title: t.title,
      dueOn: t.dueOn,
      scenarioMode: t.scenarioMode,
      minScore: t.minScore,
      completedAt: t.completedAt,
    })),
  }))
}

function toInput(draft: DraftMilestone[]): GoalPlanInput {
  return {
    milestones: draft.map((m) => ({
      id: m.id,
      title: m.title.trim(),
      note: m.note.trim(),
      dueOn: m.dueOn,
      tasks: m.tasks.map((t) => ({
        id: t.id,
        kind: t.kind,
        ref: t.ref,
        title: t.title,
        dueOn: t.dueOn,
        scenarioMode: t.scenarioMode,
        minScore: t.minScore,
      })),
    })),
  }
}

/**
 * Teacher Toolkit › Goal setting: the goal's milestones and their content tasks, edited as a
 * whole and saved with one button. On an active goal new courses, tests and lists are assigned
 * on save; on a pending one when the student confirms the goal.
 */
export default function GoalPlanEditor({
  goal,
  onSaved,
  onCancel,
}: {
  goal: LearnerGoal
  onSaved: (goals: LearnerGoal[]) => void
  onCancel: () => void
}) {
  const { t, lang } = useLanguage()
  const today = budapestDate()
  const initial = useMemo(() => toDraft(goal), [goal])
  const [draft, setDraft] = useState<DraftMilestone[]>(initial)
  const [picking, setPicking] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const dirty = JSON.stringify(toInput(draft)) !== JSON.stringify(toInput(initial))
  const warnings = planWarnings(draft, goal.deadline, today)
  const date = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString(lang)

  function setMilestone(key: string, patch: Partial<DraftMilestone>) {
    setDraft((d) => d.map((m) => (m.key === key ? { ...m, ...patch } : m)))
  }

  function setTask(mKey: string, tKey: string, patch: Partial<DraftTask>) {
    setDraft((d) => d.map((m) => (m.key === mKey ? { ...m, tasks: m.tasks.map((x) => (x.key === tKey ? { ...x, ...patch } : x)) } : m)))
  }

  function addMilestone() {
    const last = draft.at(-1)?.dueOn ?? today
    let dueOn = addDays(last < today ? today : last, 14)
    if (goal.deadline && dueOn > goal.deadline && goal.deadline > today) dueOn = goal.deadline
    setDraft((d) => [...d, { key: newKey(), title: '', note: '', dueOn, tasks: [] }])
  }

  function move(index: number, by: -1 | 1) {
    setDraft((d) => {
      const next = [...d]
      const [m] = next.splice(index, 1)
      next.splice(index + by, 0, m)
      return next
    })
  }

  /** Milestones evenly from today to the deadline; each one's tasks evenly since the one before. */
  function spread() {
    const dates = spreadDates(draft.length, today, goal.deadline)
    setDraft((d) =>
      d.map((m, i) => {
        const from = i === 0 ? today : dates[i - 1]
        const taskDates = spreadDates(m.tasks.length, from, dates[i])
        return { ...m, dueOn: dates[i], tasks: m.tasks.map((x, j) => ({ ...x, dueOn: taskDates[j] })) }
      }),
    )
  }

  function pick(mKey: string, item: PickedContent) {
    setDraft((d) =>
      d.map((m) =>
        m.key === mKey && m.tasks.length < MAX_TASKS_PER_MILESTONE
          ? {
              ...m,
              tasks: [
                ...m.tasks,
                {
                  key: newKey(),
                  ...item,
                  dueOn: m.dueOn,
                  scenarioMode: item.kind === 'scenario' ? 'test' : null,
                  minScore: null,
                  completedAt: null,
                },
              ],
            }
          : m,
      ),
    )
  }

  function cancel() {
    if (!dirty || window.confirm(t('gpDiscardConfirm'))) onCancel()
  }

  async function save() {
    if (draft.some((m) => !m.title.trim() || !m.dueOn || m.tasks.some((x) => !x.dueOn))) {
      setError(t('gpErrMilestone'))
      return
    }
    setBusy(true)
    setError(null)
    try {
      onSaved(await saveGoalPlan(goal.id, toInput(draft)))
    } catch (err) {
      setError(t(goalErrorKey(err)))
      setBusy(false)
    }
  }

  const pickingMilestone = draft.find((m) => m.key === picking)

  return (
    <section className={cardClass}>
      <div>
        <h2 className="text-lg font-semibold text-foreground">{t('gpPlanFor', { title: goal.title || t('glBlank') })}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t('gpPlanIntro')}</p>
        {goal.deadline && <p className="mt-1 text-sm text-muted-foreground">{t('glDeadlineLine', { date: date(goal.deadline) })}</p>}
        {goal.status === 'pending' && <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{t('gpPendingNote')}</p>}
      </div>

      {draft.length === 0 && <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">{t('gpEmptyEditor')}</p>}

      <ol className="space-y-4">
        {draft.map((m, i) => (
          <li key={m.key} className="relative rounded-xl border border-border p-4 pl-5">
            <span className="absolute inset-y-3 left-0 w-1 rounded-full bg-[var(--teal-accent)]" aria-hidden="true" />
            <div className="flex flex-wrap items-start gap-3">
              <span className="mt-6 inline-flex h-7 min-w-7 items-center justify-center rounded-full border border-[var(--teal-accent-border)] bg-[var(--teal-accent-soft)] px-2 text-sm font-semibold text-[var(--teal-accent-strong)]">
                {i + 1}
              </span>
              <label className="min-w-[12rem] flex-1 space-y-1">
                <span className={labelClass}>{t('gpMilestoneTitle')}</span>
                <input
                  value={m.title}
                  maxLength={MILESTONE_TITLE_MAX}
                  placeholder={t('gpMilestoneTitlePh')}
                  onChange={(e) => setMilestone(m.key, { title: e.target.value })}
                  className={inputClass}
                />
              </label>
              <label className="w-40 space-y-1">
                <span className={labelClass}>{t('gpDue')}</span>
                <input type="date" value={m.dueOn} onChange={(e) => setMilestone(m.key, { dueOn: e.target.value })} className={inputClass} />
              </label>
              <div className="mt-6 flex gap-1">
                <button type="button" disabled={i === 0} onClick={() => move(i, -1)} aria-label={t('gpMoveUp')} className={secondaryButtonClass}>
                  <ArrowUp className="h-4 w-4" aria-hidden="true" />
                </button>
                <button type="button" disabled={i === draft.length - 1} onClick={() => move(i, 1)} aria-label={t('gpMoveDown')} className={secondaryButtonClass}>
                  <ArrowDown className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setDraft((d) => d.filter((x) => x.key !== m.key))}
                  aria-label={t('gpRemove')}
                  className={secondaryButtonClass}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
            <label className="mt-2 block space-y-1">
              <span className="sr-only">{t('gpNote')}</span>
              <input
                value={m.note}
                maxLength={MILESTONE_NOTE_MAX}
                placeholder={t('gpNote')}
                onChange={(e) => setMilestone(m.key, { note: e.target.value })}
                className={inputClass}
              />
            </label>

            <ul className="mt-3 space-y-2">
              {m.tasks.length === 0 && <li className={hintClass}>{t('gpNoTasks')}</li>}
              {m.tasks.map((x) => {
                const Icon = TASK_KIND_ICON[x.kind]
                return (
                  <li key={x.key} className="flex flex-wrap items-center gap-2 rounded-lg bg-secondary/60 px-3 py-2">
                    <Icon className="h-4 w-4 shrink-0 text-[var(--teal-accent-strong)]" aria-hidden="true" />
                    <span className="min-w-[10rem] flex-1 text-sm">
                      <span className="font-medium text-foreground">{x.title}</span>
                      <span className="text-muted-foreground"> · {t(TASK_KIND_LABEL[x.kind])}</span>
                      {x.completedAt && <Check className="ml-1 inline h-4 w-4 text-emerald-600" aria-label={t('gpTaskDone')} />}
                    </span>
                    {x.kind === 'scenario' && (
                      <label className="flex items-center gap-1 text-xs text-muted-foreground">
                        {t('gpMode')}
                        <select
                          value={x.scenarioMode ?? 'test'}
                          onChange={(e) => setTask(m.key, x.key, { scenarioMode: e.target.value as ScenarioMode })}
                          className="rounded-md border border-border bg-card px-2 py-1 text-sm text-foreground"
                        >
                          {SCENARIO_MODES.map((mode) => (
                            <option key={mode} value={mode}>
                              {t(SCENARIO_MODE_LABEL[mode])}
                            </option>
                          ))}
                        </select>
                      </label>
                    )}
                    {x.kind === 'comp_test' && (
                      <label className="flex items-center gap-1 text-xs text-muted-foreground">
                        {t('gpMinScore')}
                        <input
                          type="number"
                          min={1}
                          max={100}
                          value={x.minScore ?? ''}
                          onChange={(e) => {
                            const n = Number.parseInt(e.target.value, 10)
                            setTask(m.key, x.key, { minScore: Number.isFinite(n) ? Math.min(100, Math.max(1, n)) : null })
                          }}
                          className="w-16 rounded-md border border-border bg-card px-2 py-1 text-sm text-foreground"
                        />
                      </label>
                    )}
                    <input
                      type="date"
                      value={x.dueOn}
                      aria-label={t('gpDue')}
                      onChange={(e) => setTask(m.key, x.key, { dueOn: e.target.value })}
                      className="rounded-md border border-border bg-card px-2 py-1 text-sm text-foreground"
                    />
                    <button
                      type="button"
                      onClick={() => setMilestone(m.key, { tasks: m.tasks.filter((y) => y.key !== x.key) })}
                      aria-label={t('gpRemove')}
                      className="text-muted-foreground hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </li>
                )
              })}
            </ul>
            <div className="mt-2 flex items-center gap-3">
              <button type="button" disabled={m.tasks.length >= MAX_TASKS_PER_MILESTONE} onClick={() => setPicking(m.key)} className={secondaryButtonClass}>
                {t('gpAddTask')}
              </button>
              {m.tasks.length >= MAX_TASKS_PER_MILESTONE && <span className={hintClass}>{t('gpLimitTasks', { n: MAX_TASKS_PER_MILESTONE })}</span>}
            </div>
          </li>
        ))}
      </ol>

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" disabled={draft.length >= MAX_MILESTONES} onClick={addMilestone} className={secondaryButtonClass}>
          {t('gpAddMilestone')}
        </button>
        {draft.length > 1 && (
          <button type="button" onClick={spread} className={secondaryButtonClass}>
            {t('gpSpread')}
          </button>
        )}
        {draft.length >= MAX_MILESTONES && <span className={hintClass}>{t('gpLimitMilestones', { n: MAX_MILESTONES })}</span>}
      </div>

      {warnings.length > 0 && (
        <ul className="space-y-1 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {warnings.map((w) => (
            <li key={w}>{t(WARNING_LABEL[w])}</li>
          ))}
        </ul>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3 border-t border-border pt-3">
        <button type="button" disabled={busy || !dirty} onClick={() => void save()} className={primaryButtonClass}>
          {t('gpSave')}
        </button>
        <button type="button" onClick={cancel} className="text-sm text-muted-foreground hover:text-foreground">
          {t('glCancel')}
        </button>
      </div>

      {pickingMilestone && (
        <TaskPicker
          added={new Set(pickingMilestone.tasks.map((x) => `${x.kind}:${x.ref}`))}
          onPick={(item) => pick(pickingMilestone.key, item)}
          onClose={() => setPicking(null)}
        />
      )}
    </section>
  )
}
