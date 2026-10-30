import { supabaseAdmin } from './supabaseAdmin.js'
import { getScenario } from '../../src/data/scenarios.js'
import type { GoalMilestone, GoalPlanInput, GoalTask, ScenarioMode, TaskKind } from '../../src/lib/goalPlans.js'

// Goal milestones (supabase/migrations/20261101120000_goal_milestones.sql), used by
// api/_lib/learnerGoals.ts: the plan comes with every goal, and only a connected teacher saves
// it (?action=goal-plan-save). Courses, tests and word lists are assigned through their own
// tables once the goal is active; a task ticks itself off when the linked content is finished,
// checked here whenever the goals are loaded.

interface MilestoneRow {
  id: string
  goal_id: string
  title: string
  note: string | null
  due_on: string
  position: number
  completed_at: string | null
}

export interface TaskRow {
  id: string
  milestone_id: string
  goal_id: string
  kind: TaskKind
  ref: string
  title: string
  due_on: string
  position: number
  scenario_mode: ScenarioMode | null
  min_score: number | null
  assignment_id: string | null
  assigned_at: string | null
  completed_at: string | null
}

const MILESTONE_COLUMNS = 'id, goal_id, title, note, due_on, position, completed_at'
const TASK_COLUMNS =
  'id, milestone_id, goal_id, kind, ref, title, due_on, position, scenario_mode, min_score, assignment_id, assigned_at, completed_at'

/** The XP activity a finished conversation logs, by mode (api/chat.ts). */
const SCENARIO_ACTIVITY = { test: 'conversational-english.scenario_live', practice: 'conversational-english.rehearsal' } as const

/** Bad input from the editor (400), or content the teacher may not use. */
export class PlanError extends Error {
  constructor(public code: string) {
    super(code)
  }
}

// --- Completion -----------------------------------------------------------------------------

/** What the student has finished, for the tasks being checked. */
export interface Evidence {
  /** Course ids with a completed enrollment. */
  coursesDone: Set<string>
  /** Submitted comprehension tests by test id. */
  tests: Map<string, { score: number | null; max: number | null }>
  /** Word list ids the student has learned completely. */
  listsDone: Set<string>
  /** Finished conversations: scenario id, XP activity, when. */
  conversations: { ref: string; activity: string; at: string }[]
}

/** Whether an assigned, open task's content is finished (by its rule). */
export function isTaskDone(task: Pick<TaskRow, 'kind' | 'ref' | 'scenario_mode' | 'min_score' | 'assigned_at'>, ev: Evidence): boolean {
  if (!task.assigned_at) return false
  switch (task.kind) {
    case 'course':
      return ev.coursesDone.has(task.ref)
    case 'word_list':
      return ev.listsDone.has(task.ref)
    case 'comp_test': {
      const t = ev.tests.get(task.ref)
      if (!t) return false
      if (task.min_score == null) return true
      return t.score != null && !!t.max && (t.score / t.max) * 100 >= task.min_score
    }
    case 'scenario': {
      const mode = task.scenario_mode ?? 'any'
      const since = Date.parse(task.assigned_at)
      return ev.conversations.some(
        (c) =>
          c.ref === task.ref &&
          (mode === 'any' ? Object.values(SCENARIO_ACTIVITY).includes(c.activity as never) : c.activity === SCENARIO_ACTIVITY[mode]) &&
          Date.parse(c.at) >= since,
      )
    }
  }
}

const refsOf = (tasks: TaskRow[], kind: TaskKind) => [...new Set(tasks.filter((t) => t.kind === kind).map((t) => t.ref))]

/** One query per content kind over every student and task being checked. */
async function loadEvidence(studentId: string, tasks: TaskRow[]): Promise<Evidence> {
  const courses = refsOf(tasks, 'course')
  const tests = refsOf(tasks, 'comp_test')
  const lists = refsOf(tasks, 'word_list')
  const scenarios = refsOf(tasks, 'scenario')
  const since = tasks
    .filter((t) => t.kind === 'scenario' && t.assigned_at)
    .map((t) => t.assigned_at as string)
    .sort()[0]

  const [c, t, l, s] = await Promise.all([
    courses.length
      ? supabaseAdmin.from('course_enrollments').select('course_id').eq('student_id', studentId).in('course_id', courses).not('completed_at', 'is', null)
      : null,
    tests.length
      ? supabaseAdmin.from('comp_test_assignments').select('test_id, score, max_score').eq('student_id', studentId).in('test_id', tests).not('submitted_at', 'is', null)
      : null,
    lists.length
      ? supabaseAdmin.from('vocab_list_assignments').select('list_id').eq('student_id', studentId).in('list_id', lists).not('completed_at', 'is', null)
      : null,
    scenarios.length && since
      ? supabaseAdmin
          .from('xp_events')
          .select('item_ref, activity_type, created_at')
          .eq('user_id', studentId)
          .in('activity_type', Object.values(SCENARIO_ACTIVITY))
          .in('item_ref', scenarios)
          .gte('created_at', since)
      : null,
  ])
  for (const r of [c, t, l, s]) if (r?.error) throw r.error

  return {
    coursesDone: new Set(((c?.data ?? []) as { course_id: string }[]).map((r) => r.course_id)),
    tests: new Map(
      ((t?.data ?? []) as { test_id: string; score: number | null; max_score: number | null }[]).map((r) => [r.test_id, { score: r.score, max: r.max_score }]),
    ),
    listsDone: new Set(((l?.data ?? []) as { list_id: string }[]).map((r) => r.list_id)),
    conversations: ((s?.data ?? []) as { item_ref: string; activity_type: string; created_at: string }[]).map((r) => ({
      ref: r.item_ref,
      activity: r.activity_type,
      at: r.created_at,
    })),
  }
}

/**
 * Ticks off open, assigned tasks whose content is now finished, and keeps each milestone's
 * completed_at in step with its tasks. Changes the rows in place.
 */
async function refreshCompletion(studentId: string, milestones: MilestoneRow[], tasks: TaskRow[]): Promise<void> {
  const open = tasks.filter((t) => !t.completed_at && t.assigned_at)
  if (open.length > 0) {
    const ev = await loadEvidence(studentId, open)
    const done = open.filter((t) => isTaskDone(t, ev))
    if (done.length > 0) {
      const now = new Date().toISOString()
      const { error } = await supabaseAdmin.from('goal_tasks').update({ completed_at: now }).in('id', done.map((t) => t.id))
      if (error) throw error
      for (const t of done) t.completed_at = now
    }
  }

  for (const m of milestones) {
    const mine = tasks.filter((t) => t.milestone_id === m.id)
    const complete = mine.length > 0 && mine.every((t) => t.completed_at)
    if (complete === !!m.completed_at) continue
    const completedAt = complete ? new Date().toISOString() : null
    const { error } = await supabaseAdmin.from('goal_milestones').update({ completed_at: completedAt }).eq('id', m.id)
    if (error) throw error
    m.completed_at = completedAt
  }
}

// --- Loading ------------------------------------------------------------------------------

async function loadRows(goalIds: string[]): Promise<{ milestones: MilestoneRow[]; tasks: TaskRow[] }> {
  if (goalIds.length === 0) return { milestones: [], tasks: [] }
  const [m, t] = await Promise.all([
    supabaseAdmin.from('goal_milestones').select(MILESTONE_COLUMNS).in('goal_id', goalIds).order('position'),
    supabaseAdmin.from('goal_tasks').select(TASK_COLUMNS).in('goal_id', goalIds).order('position'),
  ])
  if (m.error) throw m.error
  if (t.error) throw t.error
  return { milestones: (m.data ?? []) as MilestoneRow[], tasks: (t.data ?? []) as TaskRow[] }
}

function toTask(t: TaskRow): GoalTask {
  return {
    id: t.id,
    kind: t.kind,
    ref: t.ref,
    title: t.title,
    dueOn: t.due_on,
    scenarioMode: t.scenario_mode,
    minScore: t.min_score,
    assignmentId: t.assignment_id,
    assigned: !!t.assigned_at,
    completedAt: t.completed_at,
  }
}

/**
 * The milestones of these goals, by goal id, after the completion check. `goals` maps each
 * goal id to its student.
 */
export async function loadPlans(goals: { id: string; studentId: string }[]): Promise<Map<string, GoalMilestone[]>> {
  const { milestones, tasks } = await loadRows(goals.map((g) => g.id))
  const studentOf = new Map(goals.map((g) => [g.id, g.studentId]))

  for (const studentId of new Set(goals.map((g) => g.studentId))) {
    const ms = milestones.filter((m) => studentOf.get(m.goal_id) === studentId)
    if (ms.length === 0) continue
    await refreshCompletion(studentId, ms, tasks.filter((t) => studentOf.get(t.goal_id) === studentId))
  }

  const byGoal = new Map<string, GoalMilestone[]>(goals.map((g) => [g.id, []]))
  for (const m of milestones) {
    byGoal.get(m.goal_id)?.push({
      id: m.id,
      title: m.title,
      note: m.note,
      dueOn: m.due_on,
      completedAt: m.completed_at,
      tasks: tasks.filter((t) => t.milestone_id === m.id).map(toTask),
    })
  }
  return byGoal
}

// --- Assigning ----------------------------------------------------------------------------

/** End of that day in Europe/Budapest, as the comprehension test tool sets due_at. */
export function endOfDayBudapest(date: string): string {
  const guess = Date.parse(`${date}T23:59:00Z`)
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Budapest',
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).formatToParts(new Date(guess))
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '00'
  const local = Date.parse(`${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}:00Z`)
  return new Date(guess - (local - guess)).toISOString()
}

/**
 * Assigns the goal's not-yet-assigned tasks to the student (the goal is active): enrolls them
 * in courses, assigns tests (due at the task's date) and word lists, and marks scenario tasks
 * as started. Content that is gone or no longer published is skipped and stays unassigned.
 */
export async function assignTasks(goalId: string, studentId: string, teacherId: string | null): Promise<void> {
  const { data, error } = await supabaseAdmin.from('goal_tasks').select(TASK_COLUMNS).eq('goal_id', goalId).is('assigned_at', null)
  if (error) throw error
  const tasks = (data ?? []) as TaskRow[]
  if (tasks.length === 0) return

  const assignmentIds = new Map<string, string | null>()

  const courses = refsOf(tasks, 'course')
  if (courses.length) {
    const { data: live, error: e1 } = await supabaseAdmin.from('courses').select('id').in('id', courses).eq('status', 'published')
    if (e1) throw e1
    const ids = ((live ?? []) as { id: string }[]).map((c) => c.id)
    if (ids.length) {
      const { error: e2 } = await supabaseAdmin
        .from('course_enrollments')
        .upsert(
          ids.map((id) => ({ course_id: id, student_id: studentId, source: 'assigned', assigned_by: teacherId })),
          { onConflict: 'course_id,student_id', ignoreDuplicates: true },
        )
      if (e2) throw e2
      const { data: rows, error: e3 } = await supabaseAdmin.from('course_enrollments').select('id, course_id').eq('student_id', studentId).in('course_id', ids)
      if (e3) throw e3
      for (const r of (rows ?? []) as { id: string; course_id: string }[]) assignmentIds.set(`course:${r.course_id}`, r.id)
    }
  }

  const tests = tasks.filter((t) => t.kind === 'comp_test')
  if (tests.length) {
    const { data: live, error: e1 } = await supabaseAdmin.from('comp_tests').select('id').in('id', refsOf(tests, 'comp_test'))
    if (e1) throw e1
    const ids = new Set(((live ?? []) as { id: string }[]).map((c) => c.id))
    const fresh = tests.filter((t, i) => ids.has(t.ref) && tests.findIndex((x) => x.ref === t.ref) === i)
    if (fresh.length) {
      const { error: e2 } = await supabaseAdmin
        .from('comp_test_assignments')
        .upsert(
          fresh.map((t) => ({ test_id: t.ref, student_id: studentId, assigned_by: teacherId, due_at: endOfDayBudapest(t.due_on) })),
          { onConflict: 'test_id,student_id', ignoreDuplicates: true },
        )
      if (e2) throw e2
      const { data: rows, error: e3 } = await supabaseAdmin.from('comp_test_assignments').select('id, test_id').eq('student_id', studentId).in('test_id', [...ids])
      if (e3) throw e3
      for (const r of (rows ?? []) as { id: string; test_id: string }[]) assignmentIds.set(`comp_test:${r.test_id}`, r.id)
    }
  }

  const lists = refsOf(tasks, 'word_list')
  if (lists.length) {
    const { data: live, error: e1 } = await supabaseAdmin.from('vocab_lists').select('id').in('id', lists).is('archived_at', null)
    if (e1) throw e1
    for (const { id } of (live ?? []) as { id: string }[]) {
      const { error: e2 } = await supabaseAdmin.rpc('assign_vocab_list', { p_list_id: id, p_student_ids: [studentId] })
      if (e2) throw e2
      assignmentIds.set(`word_list:${id}`, null)
    }
  }

  const now = new Date().toISOString()
  for (const t of tasks) {
    const key = `${t.kind}:${t.ref}`
    if (t.kind !== 'scenario' && !assignmentIds.has(key)) continue
    if (t.kind === 'scenario' && !getScenario(t.ref)) continue
    const { error: e } = await supabaseAdmin
      .from('goal_tasks')
      .update({ assigned_at: now, assignment_id: assignmentIds.get(key) ?? null })
      .eq('id', t.id)
    if (e) throw e
  }
}

// --- Saving -------------------------------------------------------------------------------

/** New content must be the teacher's own (and a course published), or a known scenario. */
async function checkContent(tasks: { kind: TaskKind; ref: string }[], teacherId: string): Promise<void> {
  const want = (kind: TaskKind) => [...new Set(tasks.filter((t) => t.kind === kind).map((t) => t.ref))]
  const owned = async (table: string, ids: string[], extra?: (q: any) => any) => {
    if (ids.length === 0) return
    let q = supabaseAdmin.from(table).select('id').in('id', ids).eq('teacher_id', teacherId)
    if (extra) q = extra(q)
    const { data, error } = await q
    if (error) throw error
    if ((data ?? []).length !== ids.length) throw new PlanError('content')
  }
  await owned('courses', want('course'), (q) => q.eq('status', 'published'))
  await owned('comp_tests', want('comp_test'))
  await owned('vocab_lists', want('word_list'), (q) => q.is('archived_at', null))
  if (want('scenario').some((id) => !getScenario(id))) throw new PlanError('content')
}

/**
 * Replaces the goal's plan with the editor's: milestones and tasks keep their ids, missing ones
 * are deleted, new ones added. A task's content can't change (remove it and add another); a
 * changed scenario mode or minimum score is checked again. Deleting a task leaves its
 * assignment in place. Assigns new tasks right away when the goal is active.
 */
export async function savePlan(
  goal: { id: string; student_id: string; status: string },
  input: GoalPlanInput,
  teacherId: string,
): Promise<void> {
  const { milestones: oldMs, tasks: oldTasks } = await loadRows([goal.id])
  const oldMsIds = new Set(oldMs.map((m) => m.id))
  const oldTaskById = new Map(oldTasks.map((t) => [t.id, t]))

  const inputTasks = input.milestones.flatMap((m) => m.tasks)
  for (const m of input.milestones) if (m.id && !oldMsIds.has(m.id)) throw new PlanError('invalid')
  for (const t of inputTasks) {
    if (!t.id) continue
    const old = oldTaskById.get(t.id)
    if (!old || old.kind !== t.kind || old.ref !== t.ref) throw new PlanError('invalid')
  }
  await checkContent(inputTasks.filter((t) => !t.id), teacherId)

  const keepMs = new Set(input.milestones.flatMap((m) => (m.id ? [m.id] : [])))
  const keepTasks = new Set(inputTasks.flatMap((t) => (t.id ? [t.id] : [])))
  const dropTasks = oldTasks.filter((t) => !keepTasks.has(t.id)).map((t) => t.id)
  if (dropTasks.length) {
    const { error } = await supabaseAdmin.from('goal_tasks').delete().in('id', dropTasks)
    if (error) throw error
  }
  const dropMs = oldMs.filter((m) => !keepMs.has(m.id)).map((m) => m.id)
  if (dropMs.length) {
    const { error } = await supabaseAdmin.from('goal_milestones').delete().in('id', dropMs)
    if (error) throw error
  }

  const now = new Date().toISOString()
  for (const [mi, m] of input.milestones.entries()) {
    const fields = { title: m.title, note: m.note || null, due_on: m.dueOn, position: mi, updated_at: now }
    let milestoneId = m.id
    if (milestoneId) {
      const { error } = await supabaseAdmin.from('goal_milestones').update(fields).eq('id', milestoneId)
      if (error) throw error
    } else {
      const { data, error } = await supabaseAdmin.from('goal_milestones').insert({ goal_id: goal.id, ...fields }).select('id').single()
      if (error) throw error
      milestoneId = (data as { id: string }).id
    }

    for (const [ti, t] of m.tasks.entries()) {
      const taskFields = {
        milestone_id: milestoneId,
        title: t.title,
        due_on: t.dueOn,
        position: ti,
        scenario_mode: t.scenarioMode,
        min_score: t.minScore,
      }
      if (t.id) {
        const old = oldTaskById.get(t.id) as TaskRow
        // A stricter or different rule is checked again from scratch.
        const ruleChanged = old.scenario_mode !== t.scenarioMode || old.min_score !== t.minScore
        const { error } = await supabaseAdmin
          .from('goal_tasks')
          .update({ ...taskFields, ...(ruleChanged ? { completed_at: null } : {}) })
          .eq('id', t.id)
        if (error) throw error
      } else {
        const { error } = await supabaseAdmin.from('goal_tasks').insert({ ...taskFields, goal_id: goal.id, kind: t.kind, ref: t.ref })
        if (error) throw error
      }
    }
  }

  if (goal.status === 'active') await assignTasks(goal.id, goal.student_id, teacherId)
}
