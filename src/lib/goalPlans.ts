// Goal milestones: under a learner goal (src/lib/goals.ts) the teacher plans dated milestones,
// each with dated content tasks. Only the teacher edits; the student sees it read-only, and a
// task ticks itself off when the linked content is finished (api/_lib/goalPlans.ts).
// Shared by the browser and the API, so keep it free of browser imports.
// Design: docs/goal-milestone-editor-research.md.

import { addDays, daysBetween } from './gamification/dates.js'

/** KEEP IN SYNC with the kind check in supabase/migrations/20261101120000_goal_milestones.sql. */
export const TASK_KINDS = ['course', 'scenario', 'word_list', 'comp_test'] as const
export type TaskKind = (typeof TASK_KINDS)[number]

/** Which scenario mode ticks the task: Test (live), Practice (rehearsal) or either. */
export const SCENARIO_MODES = ['test', 'practice', 'any'] as const
export type ScenarioMode = (typeof SCENARIO_MODES)[number]

export const MAX_MILESTONES = 8
export const MAX_TASKS_PER_MILESTONE = 10
export const MILESTONE_TITLE_MAX = 120
export const MILESTONE_NOTE_MAX = 300
export const TASK_TITLE_MAX = 160

export interface GoalTask {
  id: string
  kind: TaskKind
  /** courses.id, vocab_lists.id or comp_tests.id; a scenario id. */
  ref: string
  title: string
  dueOn: string
  scenarioMode: ScenarioMode | null
  /** Comprehension test: the lowest score (%) that counts; null = any submitted test. */
  minScore: number | null
  /** The course enrollment or comp-test assignment it created (the student's link). */
  assignmentId: string | null
  /** False until the goal is active: then courses, tests and lists are assigned. */
  assigned: boolean
  completedAt: string | null
}

export interface GoalMilestone {
  id: string
  title: string
  note: string | null
  dueOn: string
  completedAt: string | null
  tasks: GoalTask[]
}

/** The plan at a glance, sent with every goal (LearnerGoal.plan). */
export interface GoalPlanSummary {
  milestonesDone: number
  milestonesTotal: number
  tasksDone: number
  tasksTotal: number
  /** The earliest open task. */
  next: { title: string; dueOn: string } | null
}

export interface GoalTaskInput {
  id?: string
  kind: TaskKind
  ref: string
  title: string
  dueOn: string
  scenarioMode: ScenarioMode | null
  minScore: number | null
}

export interface GoalMilestoneInput {
  id?: string
  title: string
  note: string
  dueOn: string
  tasks: GoalTaskInput[]
}

/** The whole plan as the editor saves it; existing milestones and tasks keep their ids. */
export interface GoalPlanInput {
  milestones: GoalMilestoneInput[]
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const SCENARIO_ID = /^[a-z0-9][a-z0-9-]{0,79}$/

function cleanText(v: unknown, max: number): string | null {
  if (typeof v !== 'string') return null
  const s = v.trim().replace(/\s+/g, ' ')
  return s.length <= max ? s : null
}

function isDate(v: unknown): v is string {
  return typeof v === 'string' && ISO_DATE.test(v) && !Number.isNaN(Date.parse(`${v}T00:00:00Z`))
}

function cleanId(v: unknown): string | undefined | null {
  if (v == null || v === '') return undefined
  return typeof v === 'string' && UUID.test(v) ? v : null
}

function parseTask(raw: unknown): GoalTaskInput | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const t = raw as Record<string, unknown>
  const id = cleanId(t.id)
  if (id === null) return null
  if (!(TASK_KINDS as readonly unknown[]).includes(t.kind)) return null
  const kind = t.kind as TaskKind
  const ref = typeof t.ref === 'string' ? t.ref : ''
  if (!(kind === 'scenario' ? SCENARIO_ID.test(ref) : UUID.test(ref))) return null
  const title = cleanText(t.title, TASK_TITLE_MAX)
  if (!title || !isDate(t.dueOn)) return null

  let scenarioMode: ScenarioMode | null = null
  if (kind === 'scenario') {
    if (!(SCENARIO_MODES as readonly unknown[]).includes(t.scenarioMode)) return null
    scenarioMode = t.scenarioMode as ScenarioMode
  } else if (t.scenarioMode != null) return null

  let minScore: number | null = null
  if (t.minScore != null && t.minScore !== '') {
    const n = t.minScore
    if (kind !== 'comp_test' || typeof n !== 'number' || !Number.isInteger(n) || n < 1 || n > 100) return null
    minScore = n
  }
  return { id, kind, ref, title, dueOn: t.dueOn, scenarioMode, minScore }
}

/**
 * Validates and tidies the plan from the editor. Returns an error code instead of throwing, for
 * a 400 reply. Scenario ids are only checked for shape here; the API checks they exist.
 */
export function parseGoalPlanInput(raw: unknown): { input: GoalPlanInput } | { error: string } {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { error: 'invalid' }
  const list = (raw as Record<string, unknown>).milestones
  if (!Array.isArray(list)) return { error: 'invalid' }
  if (list.length > MAX_MILESTONES) return { error: 'tooManyMilestones' }

  const milestones: GoalMilestoneInput[] = []
  const ids = new Set<string>()
  for (const m of list) {
    if (!m || typeof m !== 'object' || Array.isArray(m)) return { error: 'milestone' }
    const r = m as Record<string, unknown>
    const id = cleanId(r.id)
    const title = cleanText(r.title, MILESTONE_TITLE_MAX)
    const note = cleanText(r.note ?? '', MILESTONE_NOTE_MAX)
    if (id === null || !title || note === null || !isDate(r.dueOn)) return { error: 'milestone' }
    if (!Array.isArray(r.tasks)) return { error: 'task' }
    if (r.tasks.length > MAX_TASKS_PER_MILESTONE) return { error: 'tooManyTasks' }
    const tasks: GoalTaskInput[] = []
    for (const raw of r.tasks) {
      const task = parseTask(raw)
      if (!task) return { error: 'task' }
      tasks.push(task)
    }
    for (const x of [id, ...tasks.map((t) => t.id)]) {
      if (!x) continue
      if (ids.has(x)) return { error: 'invalid' }
      ids.add(x)
    }
    milestones.push({ id, title, note, dueOn: r.dueOn, tasks })
  }
  return { input: { milestones } }
}

// --- Dates (YYYY-MM-DD, Europe/Budapest like the rest of the app) ---------------------------

/**
 * `count` evenly spaced dates after `from`, the last one on `to`. Without a later `to` (no
 * deadline, or it has passed) they fall a week apart.
 */
export function spreadDates(count: number, from: string, to: string | null): string[] {
  const span = to ? daysBetween(from, to) : 0
  return Array.from({ length: count }, (_, i) =>
    addDays(from, span >= count ? Math.round((span * (i + 1)) / count) : 7 * (i + 1)),
  )
}

export type PlanWarning = 'pastDeadline' | 'taskAfterMilestone' | 'bunched'

/**
 * Soft checks for the editor: a date after the goal's deadline, a task due after its milestone,
 * and most of the work bunched at the end (more than half of 4+ tasks in the last third of the
 * time to the deadline) — evenly spaced deadlines work better than one late rush.
 */
export function planWarnings(
  milestones: Pick<GoalMilestoneInput, 'dueOn' | 'tasks'>[],
  deadline: string | null,
  today: string,
): PlanWarning[] {
  const out: PlanWarning[] = []
  const tasks = milestones.flatMap((m) => m.tasks)
  const dates = [...milestones.map((m) => m.dueOn), ...tasks.map((t) => t.dueOn)]
  if (deadline && dates.some((d) => d > deadline)) out.push('pastDeadline')
  if (milestones.some((m) => m.tasks.some((t) => t.dueOn > m.dueOn))) out.push('taskAfterMilestone')
  if (deadline && tasks.length >= 4) {
    const span = daysBetween(today, deadline)
    if (span > 0) {
      const late = tasks.filter((t) => daysBetween(today, t.dueOn) > (span * 2) / 3).length
      if (late * 2 > tasks.length) out.push('bunched')
    }
  }
  return out
}

// --- State ----------------------------------------------------------------------------------

export type TaskState = 'done' | 'overdue' | 'upcoming'

export function taskState(task: Pick<GoalTask, 'completedAt' | 'dueOn'>, today: string): TaskState {
  if (task.completedAt) return 'done'
  return task.dueOn < today ? 'overdue' : 'upcoming'
}

export function milestoneProgress(m: Pick<GoalMilestone, 'tasks'>): { done: number; total: number } {
  return { done: m.tasks.filter((t) => t.completedAt).length, total: m.tasks.length }
}

export function planSummary(milestones: GoalMilestone[]): GoalPlanSummary | null {
  if (milestones.length === 0) return null
  const tasks = milestones.flatMap((m) => m.tasks)
  const open = tasks.filter((t) => !t.completedAt).sort((a, b) => a.dueOn.localeCompare(b.dueOn))
  return {
    milestonesDone: milestones.filter((m) => m.completedAt).length,
    milestonesTotal: milestones.length,
    tasksDone: tasks.length - open.length,
    tasksTotal: tasks.length,
    next: open[0] ? { title: open[0].title, dueOn: open[0].dueOn } : null,
  }
}
