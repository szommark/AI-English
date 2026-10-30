import { WEEKLY_GOAL_MAX_DAYS, WEEKLY_GOAL_MIN_DAYS } from './gamification/constants.js'
import type { GoalMilestone } from './goalPlans.js'

// Learner goals, set with the GROW model: Goal · Reality (self-assessment) · Options · Will.
// Shared by the browser and api/_lib/learnerGoals.ts, so keep it free of browser imports.
// Design: docs/language-coach-tools-research.md §2–3.

/** KEEP IN SYNC with the goal_type check in supabase/migrations/20261027120000_learner_goals.sql. */
export const GOAL_TYPES = ['exam', 'work', 'life', 'skill', 'confidence', 'learning'] as const
export type GoalType = (typeof GOAL_TYPES)[number]

export const GOAL_SKILLS = ['listening', 'reading', 'speaking', 'writing', 'pronunciation', 'vocabulary', 'grammar'] as const
export type GoalSkill = (typeof GOAL_SKILLS)[number]

export type GoalStatus = 'pending' | 'active' | 'achieved' | 'dropped'

/** Pending + active goals a student may have at once. */
export const MAX_OPEN_GOALS = 3
export const GOAL_TITLE_MAX = 120
export const GOAL_WHY_MAX = 500
export const GOAL_ITEM_MAX = 120
export const GOAL_LIST_MAX = 8
export const GOAL_DAYS_MIN = WEEKLY_GOAL_MIN_DAYS
export const GOAL_DAYS_MAX = WEEKLY_GOAL_MAX_DAYS

/** Reality: "Where am I now on this goal?" 0–10, plus any skills rated 1–10. */
export interface GoalRating {
  overall: number
  skills: Partial<Record<GoalSkill, number>>
}

export interface GoalRatingPoint extends GoalRating {
  createdAt: string
}

export interface GoalStep {
  id: string
  text: string
  done: boolean
}

export interface LearnerGoal {
  id: string
  status: GoalStatus
  /** Who started it: the student, or a teacher (then it needed the student's confirmation). */
  startedBy: 'student' | 'teacher'
  goalType: GoalType | null
  title: string | null
  deadline: string | null
  why: string | null
  options: string[]
  steps: GoalStep[]
  daysPerWeek: number | null
  showOnHome: boolean
  /** A teacher's pre-filled rating on a pending goal. */
  draftRating: GoalRating | null
  /** Oldest first: the first one is the starting point. */
  ratings: GoalRatingPoint[]
  /** The teacher's milestone plan (src/lib/goalPlans.ts), in order; empty when there is none. */
  milestones: GoalMilestone[]
  createdAt: string
  confirmedAt: string | null
  closedAt: string | null
}

/** The GROW form's content, as sent to ?action=goal-save. */
export interface GoalInput {
  goalType: GoalType | null
  title: string
  deadline: string | null
  why: string
  options: string[]
  /** Steps keep their id (and done state) across edits; new ones have no id. */
  steps: { id?: string; text: string; done?: boolean }[]
  daysPerWeek: number | null
  rating: GoalRating | null
}

export const isOpenGoal = (g: Pick<LearnerGoal, 'status'>) => g.status === 'pending' || g.status === 'active'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

function cleanText(v: unknown, max: number): string | null {
  if (typeof v !== 'string') return null
  const s = v.trim().replace(/\s+/g, ' ')
  return s.length <= max ? s : null
}

function cleanList(v: unknown): string[] | null {
  if (!Array.isArray(v) || v.length > GOAL_LIST_MAX * 2) return null
  const out: string[] = []
  for (const item of v) {
    const s = cleanText(item, GOAL_ITEM_MAX)
    if (s === null) return null
    if (s) out.push(s)
  }
  return out.length <= GOAL_LIST_MAX ? out : null
}

/** A 0–10 overall score and 1–10 skill scores; null when invalid. */
export function parseGoalRating(raw: unknown): GoalRating | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const r = raw as Record<string, unknown>
  const overall = r.overall
  if (typeof overall !== 'number' || !Number.isInteger(overall) || overall < 0 || overall > 10) return null
  const skills: GoalRating['skills'] = {}
  if (r.skills != null) {
    if (typeof r.skills !== 'object' || Array.isArray(r.skills)) return null
    for (const [key, value] of Object.entries(r.skills as Record<string, unknown>)) {
      if (!(GOAL_SKILLS as readonly string[]).includes(key)) return null
      if (value == null) continue
      if (typeof value !== 'number' || !Number.isInteger(value) || value < 1 || value > 10) return null
      skills[key as GoalSkill] = value
    }
  }
  return { overall, skills }
}

/**
 * Validates and tidies the GROW form. Blank fields are allowed here (a teacher may send a blank
 * form); `requireGoal` additionally demands a type and a title, as an active goal needs them.
 * Returns an error code instead of throwing, for a 400 reply.
 */
export function parseGoalInput(raw: unknown, requireGoal: boolean): { input: GoalInput } | { error: string } {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { error: 'invalid' }
  const b = raw as Record<string, unknown>

  let goalType: GoalType | null = null
  if (b.goalType != null && b.goalType !== '') {
    if (!(GOAL_TYPES as readonly unknown[]).includes(b.goalType)) return { error: 'goalType' }
    goalType = b.goalType as GoalType
  }
  const title = cleanText(b.title ?? '', GOAL_TITLE_MAX)
  if (title === null) return { error: 'title' }
  const why = cleanText(b.why ?? '', GOAL_WHY_MAX)
  if (why === null) return { error: 'why' }
  if (requireGoal && (!goalType || !title)) return { error: 'goalRequired' }

  let deadline: string | null = null
  if (b.deadline != null && b.deadline !== '') {
    if (typeof b.deadline !== 'string' || !ISO_DATE.test(b.deadline) || Number.isNaN(Date.parse(b.deadline))) {
      return { error: 'deadline' }
    }
    deadline = b.deadline
  }

  const options = cleanList(b.options ?? [])
  if (!options) return { error: 'options' }

  const rawSteps = b.steps ?? []
  if (!Array.isArray(rawSteps) || rawSteps.length > GOAL_LIST_MAX * 2) return { error: 'steps' }
  const steps: GoalInput['steps'] = []
  for (const s of rawSteps) {
    if (!s || typeof s !== 'object') return { error: 'steps' }
    const step = s as Record<string, unknown>
    const text = cleanText(step.text, GOAL_ITEM_MAX)
    if (text === null) return { error: 'steps' }
    if (!text) continue
    if (step.id != null && (typeof step.id !== 'string' || step.id.length > 40)) return { error: 'steps' }
    steps.push({ id: step.id as string | undefined, text, done: step.done === true })
  }
  if (steps.length > GOAL_LIST_MAX) return { error: 'steps' }

  let daysPerWeek: number | null = null
  if (b.daysPerWeek != null && b.daysPerWeek !== '') {
    const d = b.daysPerWeek
    if (typeof d !== 'number' || !Number.isInteger(d) || d < GOAL_DAYS_MIN || d > GOAL_DAYS_MAX) return { error: 'daysPerWeek' }
    daysPerWeek = d
  }

  let rating: GoalRating | null = null
  if (b.rating != null) {
    rating = parseGoalRating(b.rating)
    if (!rating) return { error: 'rating' }
  }

  return { input: { goalType, title, deadline, why, options, steps, daysPerWeek, rating } }
}

/** Whole weeks from today to the deadline (negative once it has passed). */
export function weeksLeft(deadline: string, today = new Date()): number {
  const ms = Date.parse(`${deadline}T00:00:00`) - new Date(today.toDateString()).getTime()
  return Math.floor(ms / (7 * 24 * 60 * 60 * 1000))
}
