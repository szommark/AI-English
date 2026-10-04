import {
  BONUS_MAX_RATIO,
  REPEAT_SECOND_MULTIPLIER,
  REPEAT_THIRD_PLUS_MULTIPLIER,
} from '../../src/lib/gamification/constants.js'

// The XP award calculation as a pure function (no database access), so it can be checked
// in isolation. api/_lib/gamification.ts loads the inputs and records the result.

export type RepeatRule = '24h_diminishing' | 'sitting_effort_only' | 'none'

export interface ActivityTypeRules {
  baseXp: number
  /** Null = no performance bonus. */
  bonusSource: string | null
  dailyXpCap: number | null
  weeklyXpCap: number | null
  repeatRule: RepeatRule
}

/** Earlier events, as returned by the xp_award_context() SQL function. */
export interface AwardContext {
  /** Events with the same activity type + item in the last 24 hours. */
  repeats24h: number
  /** Any earlier event with the same activity type + item. */
  hasPrevious: boolean
  /** XP already awarded today (Europe/Budapest) for this activity type. */
  awardedToday: number
  /** XP already awarded this week (Mon–Sun, Europe/Budapest) for this type or its weekly cap group. */
  awardedWeek: number
}

export interface ComputedAward {
  baseXp: number
  bonusXp: number
  /** The score as stored: clamped to 0..1, or null when none was given. */
  performanceScore: number | null
  /** True when a daily or weekly cap reduced the award. */
  capped: boolean
}

export function clampScore(score: number | null | undefined): number | null {
  if (typeof score !== 'number' || !Number.isFinite(score)) return null
  return Math.min(1, Math.max(0, score))
}

function repeatMultiplier(previousIn24h: number): number {
  if (previousIn24h <= 0) return 1
  if (previousIn24h === 1) return REPEAT_SECOND_MULTIPLIER
  return REPEAT_THIRD_PLUS_MULTIPLIER
}

/** Cuts base + bonus down to `remaining`, bonus first. */
function applyCap(base: number, bonus: number, cap: number | null, alreadyAwarded: number) {
  if (cap === null) return { base, bonus, capped: false }
  const remaining = Math.max(0, cap - alreadyAwarded)
  if (base + bonus <= remaining) return { base, bonus, capped: false }
  if (remaining <= base) return { base: remaining, bonus: 0, capped: true }
  return { base, bonus: remaining - base, capped: true }
}

/** Words or tasks in one award: a whole number ≥ 1, or 1 when not given. */
export function clampUnits(units: number | null | undefined): number {
  if (typeof units !== 'number' || !Number.isFinite(units)) return 1
  return Math.max(1, Math.floor(units))
}

export function computeAward(args: {
  rules: ActivityTypeRules
  hasItemRef: boolean
  performanceScore: number | null | undefined
  /** Per-unit types (a word, an exam task): base_xp is paid this many times. Default 1. */
  units?: number | null
  context: AwardContext
}): ComputedAward {
  const { rules, hasItemRef, context } = args
  const score = clampScore(args.performanceScore)
  const units = clampUnits(args.units)

  let base = rules.baseXp * units
  let bonus = rules.bonusSource !== null && score !== null ? Math.round(base * BONUS_MAX_RATIO * score) : 0

  if (hasItemRef) {
    if (rules.repeatRule === '24h_diminishing') {
      const multiplier = repeatMultiplier(context.repeats24h)
      base = Math.round(base * multiplier)
      bonus = Math.round(bonus * multiplier)
    } else if (rules.repeatRule === 'sitting_effort_only' && context.hasPrevious) {
      bonus = 0
    }
  }

  const daily = applyCap(base, bonus, rules.dailyXpCap, context.awardedToday)
  const weekly = applyCap(daily.base, daily.bonus, rules.weeklyXpCap, context.awardedWeek)

  return {
    baseXp: weekly.base,
    bonusXp: weekly.bonus,
    performanceScore: score,
    capped: daily.capped || weekly.capped,
  }
}
