import type { VercelRequest, VercelResponse } from '@vercel/node'
import { randomUUID } from 'node:crypto'
import { supabaseAdmin } from './supabaseAdmin.js'
import { getUserRole, hasTeacherAccess } from './roles.js'
import {
  MAX_OPEN_GOALS,
  isOpenGoal,
  parseGoalInput,
  parseGoalRating,
  type GoalInput,
  type GoalRating,
  type GoalRatingPoint,
  type GoalStatus,
  type GoalStep,
  type LearnerGoal,
} from '../../src/lib/goals.js'

// Learner goals (GROW), served from api/gamification.ts as ?action=goals… — see the table
// comment in supabase/migrations/20261027120000_learner_goals.sql.
//   goals        GET   the student's own goals, or a connected student's (?studentId=, teacher)
//   goals-class  GET   every connected student's goals (teacher)
//   goal-save    POST  create or edit. Student: own goal, active at once; confirming a pending
//                      one makes it active. Teacher (body.studentId): sends a pending goal,
//                      filled in or blank, or edits a connected student's goal.
//   goal-rate    POST  the student re-rates Reality (adds to the history)
//   goal-step    POST  ticks a Will step done / not done
//   goal-status  POST  achieved / dropped / active again
//   goal-home    POST  the student shows or hides it on the home page
//   goal-delete  POST  a teacher withdraws a pending goal
// Every mutation replies with the student's whole goal list.

const GOAL_COLUMNS =
  'id, student_id, created_by, status, goal_type, title, deadline, why, options, steps, days_per_week, draft_rating, show_on_home, created_at, confirmed_at, closed_at'

interface GoalRow {
  id: string
  student_id: string
  created_by: string | null
  status: GoalStatus
  goal_type: LearnerGoal['goalType']
  title: string | null
  deadline: string | null
  why: string | null
  options: string[]
  steps: GoalStep[]
  days_per_week: number | null
  draft_rating: GoalRating | null
  show_on_home: boolean
  created_at: string
  confirmed_at: string | null
  closed_at: string | null
}

const STATUS_ORDER: Record<GoalStatus, number> = { pending: 0, active: 1, achieved: 2, dropped: 3 }

function toGoal(row: GoalRow, ratings: GoalRatingPoint[]): LearnerGoal {
  return {
    id: row.id,
    status: row.status,
    startedBy: row.created_by && row.created_by !== row.student_id ? 'teacher' : 'student',
    goalType: row.goal_type,
    title: row.title,
    deadline: row.deadline,
    why: row.why,
    options: row.options ?? [],
    steps: row.steps ?? [],
    daysPerWeek: row.days_per_week,
    showOnHome: row.show_on_home,
    draftRating: row.draft_rating,
    ratings,
    createdAt: row.created_at,
    confirmedAt: row.confirmed_at,
    closedAt: row.closed_at,
  }
}

/** Goals of these students with their rating history: open ones first, then the closed ones, newest first. */
async function loadGoalsFor(studentIds: string[]): Promise<Map<string, LearnerGoal[]>> {
  const byStudent = new Map<string, LearnerGoal[]>(studentIds.map((id) => [id, []]))
  if (studentIds.length === 0) return byStudent

  const { data, error } = await supabaseAdmin
    .from('learner_goals')
    .select(GOAL_COLUMNS)
    .in('student_id', studentIds)
    .order('created_at', { ascending: true })
  if (error) throw error
  const rows = (data ?? []) as GoalRow[]

  const ratings = new Map<string, GoalRatingPoint[]>()
  if (rows.length > 0) {
    const { data: rData, error: rError } = await supabaseAdmin
      .from('learner_goal_ratings')
      .select('goal_id, overall, skills, created_at')
      .in('goal_id', rows.map((r) => r.id))
      .order('created_at', { ascending: true })
    if (rError) throw rError
    for (const r of (rData ?? []) as { goal_id: string; overall: number; skills: GoalRating['skills']; created_at: string }[]) {
      const list = ratings.get(r.goal_id) ?? []
      list.push({ overall: r.overall, skills: r.skills ?? {}, createdAt: r.created_at })
      ratings.set(r.goal_id, list)
    }
  }

  for (const row of rows) byStudent.get(row.student_id)?.push(toGoal(row, ratings.get(row.id) ?? []))
  for (const goals of byStudent.values()) {
    goals.sort((a, b) => {
      const byStatus = STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
      if (byStatus !== 0) return byStatus
      return isOpenGoal(a) ? a.createdAt.localeCompare(b.createdAt) : (b.closedAt ?? '').localeCompare(a.closedAt ?? '')
    })
  }
  return byStudent
}

async function loadGoals(studentId: string): Promise<LearnerGoal[]> {
  return (await loadGoalsFor([studentId])).get(studentId) ?? []
}

async function isConnected(teacherId: string, studentId: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from('teacher_student_links')
    .select('id')
    .eq('teacher_id', teacherId)
    .eq('student_id', studentId)
    .eq('status', 'active')
    .maybeSingle()
  return !error && !!data
}

/**
 * Whose goals the request is about: the user's own, or — with a studentId that isn't the user —
 * a student the user teaches. Replies 403/404 and returns null otherwise (the same 404 whether
 * the student doesn't exist or isn't theirs, as elsewhere).
 */
async function resolveStudent(
  res: VercelResponse,
  userId: string,
  studentId: unknown,
): Promise<{ studentId: string; asTeacher: boolean } | null> {
  if (studentId == null || studentId === '' || studentId === userId) return { studentId: userId, asTeacher: false }
  if (typeof studentId !== 'string') {
    res.status(400).json({ error: 'invalid' })
    return null
  }
  if (!hasTeacherAccess(await getUserRole(userId))) {
    res.status(403).json({ error: 'Forbidden' })
    return null
  }
  if (!(await isConnected(userId, studentId))) {
    res.status(404).json({ error: 'Not found' })
    return null
  }
  return { studentId, asTeacher: true }
}

/** Loads a goal the user may change: their own, or a connected student's. Replies 404 otherwise. */
async function loadGoalForUser(
  res: VercelResponse,
  userId: string,
  goalId: unknown,
): Promise<{ row: GoalRow; asTeacher: boolean } | null> {
  if (typeof goalId !== 'string' || !goalId) {
    res.status(400).json({ error: 'invalid' })
    return null
  }
  const { data, error } = await supabaseAdmin.from('learner_goals').select(GOAL_COLUMNS).eq('id', goalId).maybeSingle()
  if (error || !data) {
    res.status(404).json({ error: 'Not found' })
    return null
  }
  const row = data as GoalRow
  if (row.student_id === userId) return { row, asTeacher: false }
  if (hasTeacherAccess(await getUserRole(userId)) && (await isConnected(userId, row.student_id))) {
    return { row, asTeacher: true }
  }
  res.status(404).json({ error: 'Not found' })
  return null
}

async function countOpenGoals(studentId: string): Promise<number> {
  const { count, error } = await supabaseAdmin
    .from('learner_goals')
    .select('id', { count: 'exact', head: true })
    .eq('student_id', studentId)
    .in('status', ['pending', 'active'])
  if (error) throw error
  return count ?? 0
}

/** Steps keep their id and done state; new ones get an id. */
function toSteps(input: GoalInput['steps']): GoalStep[] {
  return input.map((s) => ({ id: s.id ?? randomUUID(), text: s.text, done: s.done === true }))
}

function fieldsFrom(input: GoalInput) {
  return {
    goal_type: input.goalType,
    title: input.title || null,
    deadline: input.deadline,
    why: input.why || null,
    options: input.options,
    steps: toSteps(input.steps),
    days_per_week: input.daysPerWeek,
  }
}

async function addRating(goalId: string, rating: GoalRating): Promise<void> {
  const { error } = await supabaseAdmin
    .from('learner_goal_ratings')
    .insert({ goal_id: goalId, overall: rating.overall, skills: rating.skills })
  if (error) throw error
}

/** The weekly goal in the header chip follows the goal's practice days (applies from next week if changed). */
async function applyWeeklyGoal(studentId: string, days: number | null): Promise<void> {
  if (days === null) return
  const { error } = await supabaseAdmin.rpc('set_weekly_goal', { p_user_id: studentId, p_days: days })
  if (error) throw error
}

/**
 * The AI tutor reads learner_profiles.learner_goal (api/_lib/personalization.ts): keep it to
 * the titles of the active goals. Only an existing profile row is updated.
 */
async function syncTutorGoal(studentId: string): Promise<void> {
  const { data, error } = await supabaseAdmin
    .from('learner_goals')
    .select('title')
    .eq('student_id', studentId)
    .eq('status', 'active')
    .order('created_at', { ascending: true })
  if (error) throw error
  const titles = ((data ?? []) as { title: string | null }[]).flatMap((r) => (r.title ? [r.title] : []))
  const learnerGoal = titles.length > 0 ? titles.join('; ').slice(0, 300) : null
  const { error: uError } = await supabaseAdmin
    .from('learner_profiles')
    .update({ learner_goal: learnerGoal })
    .eq('user_id', studentId)
  if (uError) throw uError
}

async function replyWithGoals(res: VercelResponse, studentId: string, changed: boolean): Promise<void> {
  if (changed) await syncTutorGoal(studentId)
  res.status(200).json({ goals: await loadGoals(studentId) })
}

// --- Handlers ---------------------------------------------------------------------------

async function handleList(req: VercelRequest, res: VercelResponse, userId: string) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
  const who = await resolveStudent(res, userId, req.query.studentId)
  if (!who) return
  res.status(200).json({ goals: await loadGoals(who.studentId) })
}

async function handleClass(req: VercelRequest, res: VercelResponse, userId: string) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
  if (!hasTeacherAccess(await getUserRole(userId))) {
    res.status(403).json({ error: 'Forbidden' })
    return
  }
  const { data, error } = await supabaseAdmin
    .from('teacher_student_links')
    .select('student_id')
    .eq('teacher_id', userId)
    .eq('status', 'active')
  if (error) throw error
  const ids = ((data ?? []) as { student_id: string }[]).map((r) => r.student_id)
  const goals = await loadGoalsFor(ids)
  res.status(200).json({ students: ids.map((studentId) => ({ studentId, goals: goals.get(studentId) ?? [] })) })
}

async function handleSave(req: VercelRequest, res: VercelResponse, userId: string) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
  const body = (req.body ?? {}) as Record<string, unknown>
  const now = new Date().toISOString()

  // --- A new goal ---
  if (body.id == null) {
    const who = await resolveStudent(res, userId, body.studentId)
    if (!who) return
    // A teacher may send a blank form; a student's own goal is active at once, so it needs one.
    const parsed = parseGoalInput(body, !who.asTeacher)
    if ('error' in parsed) {
      res.status(400).json({ error: parsed.error })
      return
    }
    if ((await countOpenGoals(who.studentId)) >= MAX_OPEN_GOALS) {
      res.status(409).json({ error: 'tooManyGoals' })
      return
    }
    const { input } = parsed
    const { data, error } = await supabaseAdmin
      .from('learner_goals')
      .insert({
        student_id: who.studentId,
        created_by: userId,
        ...fieldsFrom(input),
        ...(who.asTeacher
          ? { status: 'pending', draft_rating: input.rating }
          : { status: 'active', confirmed_at: now }),
      })
      .select('id')
      .single()
    if (error) throw error
    if (!who.asTeacher) {
      if (input.rating) await addRating((data as { id: string }).id, input.rating)
      await applyWeeklyGoal(who.studentId, input.daysPerWeek)
    }
    await replyWithGoals(res, who.studentId, !who.asTeacher)
    return
  }

  // --- An existing goal ---
  const found = await loadGoalForUser(res, userId, body.id)
  if (!found) return
  const { row, asTeacher } = found
  const pending = row.status === 'pending'
  // A teacher may keep a pending goal blank; anything the student saves, or an active goal, needs one.
  const parsed = parseGoalInput(body, !(asTeacher && pending))
  if ('error' in parsed) {
    res.status(400).json({ error: parsed.error })
    return
  }
  const { input } = parsed

  if (asTeacher) {
    // The teacher edits; on a pending goal the Reality pre-fill too. Ratings stay the student's.
    const { error } = await supabaseAdmin
      .from('learner_goals')
      .update({ ...fieldsFrom(input), ...(pending ? { draft_rating: input.rating } : {}), updated_at: now })
      .eq('id', row.id)
    if (error) throw error
    await replyWithGoals(res, row.student_id, !pending)
    return
  }

  // The student: saving a pending goal confirms it (with their own rating, or the teacher's pre-fill).
  const { error } = await supabaseAdmin
    .from('learner_goals')
    .update({
      ...fieldsFrom(input),
      ...(pending ? { status: 'active', confirmed_at: now, draft_rating: null } : {}),
      updated_at: now,
    })
    .eq('id', row.id)
  if (error) throw error
  if (pending) {
    const rating = input.rating ?? row.draft_rating
    if (rating) await addRating(row.id, rating)
  }
  if (pending || input.daysPerWeek !== row.days_per_week) await applyWeeklyGoal(row.student_id, input.daysPerWeek)
  await replyWithGoals(res, row.student_id, true)
}

async function handleRate(req: VercelRequest, res: VercelResponse, userId: string) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
  const body = (req.body ?? {}) as Record<string, unknown>
  const found = await loadGoalForUser(res, userId, body.id)
  if (!found) return
  // The self-assessment is the student's own.
  if (found.asTeacher || found.row.status !== 'active') {
    res.status(409).json({ error: 'notRateable' })
    return
  }
  const rating = parseGoalRating(body)
  if (!rating) {
    res.status(400).json({ error: 'rating' })
    return
  }
  await addRating(found.row.id, rating)
  await replyWithGoals(res, found.row.student_id, false)
}

async function handleStep(req: VercelRequest, res: VercelResponse, userId: string) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
  const body = (req.body ?? {}) as Record<string, unknown>
  const found = await loadGoalForUser(res, userId, body.id)
  if (!found) return
  const steps = found.row.steps ?? []
  if (typeof body.stepId !== 'string' || typeof body.done !== 'boolean' || !steps.some((s) => s.id === body.stepId)) {
    res.status(400).json({ error: 'invalid' })
    return
  }
  const { error } = await supabaseAdmin
    .from('learner_goals')
    .update({
      steps: steps.map((s) => (s.id === body.stepId ? { ...s, done: body.done } : s)),
      updated_at: new Date().toISOString(),
    })
    .eq('id', found.row.id)
  if (error) throw error
  await replyWithGoals(res, found.row.student_id, false)
}

async function handleStatus(req: VercelRequest, res: VercelResponse, userId: string) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
  const body = (req.body ?? {}) as Record<string, unknown>
  const found = await loadGoalForUser(res, userId, body.id)
  if (!found) return
  const { row } = found
  const status = body.status
  if (status !== 'achieved' && status !== 'dropped' && status !== 'active') {
    res.status(400).json({ error: 'invalid' })
    return
  }
  // Pending → active only by confirming (goal-save); a pending goal can still be declined (dropped).
  if (status === 'active') {
    if (row.status === 'active' || row.status === 'pending') {
      res.status(409).json({ error: 'invalid' })
      return
    }
    if ((await countOpenGoals(row.student_id)) >= MAX_OPEN_GOALS) {
      res.status(409).json({ error: 'tooManyGoals' })
      return
    }
  } else if (status === 'achieved' && row.status !== 'active') {
    res.status(409).json({ error: 'invalid' })
    return
  }
  const now = new Date().toISOString()
  const { error } = await supabaseAdmin
    .from('learner_goals')
    .update({ status, closed_at: status === 'active' ? null : now, updated_at: now })
    .eq('id', row.id)
  if (error) throw error
  await replyWithGoals(res, row.student_id, true)
}

async function handleHome(req: VercelRequest, res: VercelResponse, userId: string) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
  const body = (req.body ?? {}) as Record<string, unknown>
  const found = await loadGoalForUser(res, userId, body.id)
  if (!found) return
  if (found.asTeacher || typeof body.show !== 'boolean') {
    res.status(found.asTeacher ? 403 : 400).json({ error: 'invalid' })
    return
  }
  const { error } = await supabaseAdmin.from('learner_goals').update({ show_on_home: body.show }).eq('id', found.row.id)
  if (error) throw error
  await replyWithGoals(res, found.row.student_id, false)
}

async function handleDelete(req: VercelRequest, res: VercelResponse, userId: string) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
  const body = (req.body ?? {}) as Record<string, unknown>
  const found = await loadGoalForUser(res, userId, body.id)
  if (!found) return
  // Only a teacher's unconfirmed goal can be withdrawn; anything else is dropped, not deleted.
  if (!found.asTeacher || found.row.status !== 'pending') {
    res.status(409).json({ error: 'invalid' })
    return
  }
  const { error } = await supabaseAdmin.from('learner_goals').delete().eq('id', found.row.id)
  if (error) throw error
  await replyWithGoals(res, found.row.student_id, false)
}

const HANDLERS: Record<string, (req: VercelRequest, res: VercelResponse, userId: string) => Promise<void>> = {
  goals: handleList,
  'goals-class': handleClass,
  'goal-save': handleSave,
  'goal-rate': handleRate,
  'goal-step': handleStep,
  'goal-status': handleStatus,
  'goal-home': handleHome,
  'goal-delete': handleDelete,
}

export const GOAL_ACTIONS = new Set(Object.keys(HANDLERS))

export async function handleGoalAction(action: string, req: VercelRequest, res: VercelResponse, userId: string) {
  try {
    await HANDLERS[action](req, res, userId)
  } catch (err) {
    console.error(`Learner goals: ${action} failed`, err)
    if (!res.headersSent) res.status(502).json({ error: 'Failed' })
  }
}
