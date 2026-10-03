import { supabaseAdmin } from './supabaseAdmin.js'
import { computeAward, type RepeatRule } from './xpCalc.js'
import { evaluateBadges } from './badges.js'
import type { AwardResult, XpLanguage } from '../../src/lib/gamification/types.js'

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

    // The ledger row is written; badges are a bonus on top and never fail the award.
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
    }
  } catch (err) {
    console.error(`Failed to award XP for ${args.activityType}`, err)
    return null
  }
}
