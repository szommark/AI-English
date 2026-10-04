import { supabaseAdmin } from './supabaseAdmin.js'
import { computeAward, type RepeatRule } from './xpCalc.js'
import { evaluateBadges } from './badges.js'
import { evaluateChallenges } from './challenges.js'
import { TEACHER_BONUS_WEEKLY_CAP } from '../../src/lib/gamification/constants.js'
import type { AwardResult, TeacherBonus, XpLanguage } from '../../src/lib/gamification/types.js'

// Single server-side entry point for XP (docs/gamification-design.md §9.2). Only API
// routes call this; the browser never sends an XP amount, only an activity type, an item
// reference and (for browser-completed activities) a performance score.
//
// Gamification must never break learning: awardXp never throws. On any error it logs and
// returns null, and the caller carries on with the learner's request.
//
// Caps are read-then-write, so two requests landing at the same moment can both see the
// same remaining allowance and slightly overshoot a cap. Accepted for now: the overshoot is
// at most one award, and the registry's caps are motivational, not billing limits.

export interface ActivityTypeRow {
  key: string
  base_xp: number
  bonus_source: string | null
  daily_xp_cap: number | null
  weekly_xp_cap: number | null
  repeat_rule: RepeatRule
  client_awardable: boolean
  enabled: boolean
}

export async function getActivityType(key: string): Promise<ActivityTypeRow | null> {
  const { data, error } = await supabaseAdmin
    .from('gamification_activity_types')
    .select('key, base_xp, bonus_source, daily_xp_cap, weekly_xp_cap, repeat_rule, client_awardable, enabled')
    .eq('key', key)
    .maybeSingle()
  if (error) throw error
  return (data as ActivityTypeRow | null) ?? null
}

export async function awardXp(args: {
  userId: string
  activityType: string
  itemRef?: string | null
  language?: XpLanguage
  performanceScore?: number | null
}): Promise<AwardResult | null> {
  try {
    const type = await getActivityType(args.activityType)
    if (!type) {
      console.warn(`awardXp: unknown activity type ${args.activityType}`)
      return null
    }
    if (!type.enabled) return null

    const itemRef = args.itemRef ?? null
    const { data: contextRows, error: contextError } = await supabaseAdmin.rpc('xp_award_context', {
      p_user_id: args.userId,
      p_activity_type: type.key,
      p_item_ref: itemRef,
    })
    if (contextError) throw contextError
    const context = (contextRows as Array<{
      repeats_24h: number
      has_previous: boolean
      awarded_today: number
      awarded_week: number
    }>)[0]

    const award = computeAward({
      rules: {
        baseXp: type.base_xp,
        bonusSource: type.bonus_source,
        dailyXpCap: type.daily_xp_cap,
        weeklyXpCap: type.weekly_xp_cap,
        repeatRule: type.repeat_rule,
      },
      hasItemRef: itemRef !== null,
      performanceScore: args.performanceScore,
      context: {
        repeats24h: context?.repeats_24h ?? 0,
        hasPrevious: context?.has_previous ?? false,
        awardedToday: context?.awarded_today ?? 0,
        awardedWeek: context?.awarded_week ?? 0,
      },
    })

    // Always recorded, even at 0 XP: a capped or repeated activity still counts as practice.
    const { data: recordRows, error: recordError } = await supabaseAdmin.rpc('record_xp_event', {
      p_user_id: args.userId,
      p_activity_type: type.key,
      p_item_ref: itemRef,
      p_language: args.language ?? 'en',
      p_base_xp: award.baseXp,
      p_bonus_xp: award.bonusXp,
      p_performance_score: award.performanceScore,
      p_capped: award.capped,
    })
    if (recordError) throw recordError
    const totals = (
      recordRows as Array<{ total_xp: number; level: number; previous_level: number; weekly_goal_met: boolean }>
    )[0]
    if (!totals) throw new Error('record_xp_event returned no row')

    // The ledger row is written; challenges and badges are a bonus on top and never fail the
    // award. Challenges first, so a challenge badge is granted with the completion.
    const completedChallenges = await evaluateChallenges(args.userId)
    const newBadges = await evaluateBadges(args.userId)

    return {
      activityType: type.key,
      baseXp: award.baseXp,
      bonusXp: award.bonusXp,
      totalAwarded: award.baseXp + award.bonusXp,
      capped: award.capped,
      totalXp: totals.total_xp,
      level: totals.level,
      previousLevel: totals.previous_level,
      leveledUp: totals.level > totals.previous_level,
      weeklyGoalMet: totals.weekly_goal_met === true,
      newBadges,
      completedChallenges,
    }
  } catch (err) {
    console.error(`Failed to award XP for ${args.activityType}`, err)
    return null
  }
}

// --- Teacher bonus XP (design §7.2) -------------------------------------------------------

const TEACHER_BONUS_TYPE = 'teacher.bonus'

/** A student's teacher bonuses, most recent first; only those after `since` when given. */
export async function loadTeacherBonuses(studentId: string, opts: { since?: string | null; limit: number }): Promise<TeacherBonus[]> {
  let query = supabaseAdmin
    .from('xp_events')
    .select('base_xp, reason, created_at')
    .eq('user_id', studentId)
    .eq('activity_type', TEACHER_BONUS_TYPE)
  if (opts.since) query = query.gt('created_at', opts.since)
  const { data, error } = await query.order('created_at', { ascending: false }).limit(opts.limit)
  if (error) throw error
  return ((data ?? []) as { base_xp: number; reason: string | null; created_at: string }[]).map((r) => ({
    amount: r.base_xp,
    reason: r.reason ?? '',
    createdAt: r.created_at,
  }))
}

/** Bonus XP the student can still receive this week, from all their teachers together. */
export async function teacherBonusRemaining(studentId: string): Promise<number> {
  const { data, error } = await supabaseAdmin.rpc('xp_award_context', {
    p_user_id: studentId,
    p_activity_type: TEACHER_BONUS_TYPE,
    p_item_ref: null,
  })
  if (error) throw error
  const awardedWeek = (data as { awarded_week: number }[])[0]?.awarded_week ?? 0
  return Math.max(0, TEACHER_BONUS_WEEKLY_CAP - awardedWeek)
}

/**
 * Gives a connected student bonus XP (the caller has checked the teacher and the
 * connection, and validated amount and reason). Refuses — gives nothing — when the amount is
 * over this week's remaining allowance. Like caps elsewhere, two bonuses at the same moment
 * could both pass the check; accepted, the overshoot is at most one bonus.
 * Throws on database errors: the teacher gets an error, no learner flow is involved.
 */
export async function giveTeacherBonus(args: {
  teacherId: string
  studentId: string
  amount: number
  reason: string
}): Promise<{ given: boolean; bonusRemaining: number }> {
  const type = await getActivityType(TEACHER_BONUS_TYPE)
  if (!type?.enabled) throw new Error('teacher.bonus is not enabled')

  const remaining = await teacherBonusRemaining(args.studentId)
  if (args.amount > remaining) return { given: false, bonusRemaining: remaining }

  const { error } = await supabaseAdmin.rpc('record_xp_event', {
    p_user_id: args.studentId,
    p_activity_type: TEACHER_BONUS_TYPE,
    p_item_ref: null,
    p_language: 'en',
    p_base_xp: args.amount,
    p_bonus_xp: 0,
    p_performance_score: null,
    p_capped: false,
    p_awarded_by: args.teacherId,
    p_reason: args.reason,
  })
  if (error) throw error

  // A bonus can lift the student into a level badge; never fails the bonus.
  await evaluateBadges(args.studentId)
  return { given: true, bonusRemaining: remaining - args.amount }
}
