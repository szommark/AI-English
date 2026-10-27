import { supabase } from './supabase'
import type { GoalInput, GoalRating, LearnerGoal } from './goals'

// Client for the learner goals (?action=goals… on /api/gamification, api/_lib/learnerGoals.ts).

async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/** A refused save or change; `code` is the server's error code (e.g. 'tooManyGoals', 'goalRequired'). */
export class GoalRequestError extends Error {
  constructor(public code: string) {
    super(code)
  }
}

async function post(action: string, body: unknown): Promise<LearnerGoal[]> {
  const headers = { ...(await authHeader()), 'Content-Type': 'application/json' }
  const res = await fetch(`/api/gamification?action=${action}`, { method: 'POST', headers, body: JSON.stringify(body) })
  const json = (await res.json().catch(() => ({}))) as { goals?: LearnerGoal[]; error?: string }
  if (!res.ok || !json.goals) throw new GoalRequestError(json.error ?? 'Failed')
  return json.goals
}

/** The user's own goals, or (teacher) a connected student's. Throws on failure. */
export async function fetchGoals(studentId?: string): Promise<LearnerGoal[]> {
  const headers = await authHeader()
  const query = studentId ? `&studentId=${encodeURIComponent(studentId)}` : ''
  const res = await fetch(`/api/gamification?action=goals${query}`, { headers })
  if (!res.ok) throw new Error('Failed to load goals')
  return ((await res.json()) as { goals: LearnerGoal[] }).goals
}

/** Teacher: every connected student's goals. Throws on failure. */
export async function fetchClassGoals(): Promise<{ studentId: string; goals: LearnerGoal[] }[]> {
  const headers = await authHeader()
  const res = await fetch('/api/gamification?action=goals-class', { headers })
  if (!res.ok) throw new Error('Failed to load goals')
  return ((await res.json()) as { students: { studentId: string; goals: LearnerGoal[] }[] }).students
}

/**
 * Creates (no id) or edits a goal. A student's new goal is active at once and saving a pending
 * one confirms it; a teacher passes studentId to send a new goal to that student.
 */
export function saveGoal(input: GoalInput, opts: { id?: string; studentId?: string } = {}): Promise<LearnerGoal[]> {
  return post('goal-save', { ...input, ...opts })
}

export function rateGoal(id: string, rating: GoalRating): Promise<LearnerGoal[]> {
  return post('goal-rate', { id, ...rating })
}

export function setGoalStep(id: string, stepId: string, done: boolean): Promise<LearnerGoal[]> {
  return post('goal-step', { id, stepId, done })
}

export function setGoalStatus(id: string, status: 'achieved' | 'dropped' | 'active'): Promise<LearnerGoal[]> {
  return post('goal-status', { id, status })
}

export function setGoalOnHome(id: string, show: boolean): Promise<LearnerGoal[]> {
  return post('goal-home', { id, show })
}

/** Teacher: withdraws a goal the student hasn't confirmed yet. */
export function deleteGoal(id: string): Promise<LearnerGoal[]> {
  return post('goal-delete', { id })
}
