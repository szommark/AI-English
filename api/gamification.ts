import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getUserFromRequest, supabaseAdmin } from './_lib/supabaseAdmin.js'
import { awardXp, getActivityType } from './_lib/gamification.js'
import {
  CLIENT_AWARD_RATE_LIMIT_PER_MINUTE,
  WEEKLY_GOAL_MAX_DAYS,
  WEEKLY_GOAL_MIN_DAYS,
} from '../src/lib/gamification/constants.js'
import { progressInLevel } from '../src/lib/gamification/levels.js'
import type { GamificationMe, XpLanguage } from '../src/lib/gamification/types.js'

// Single Vercel function for the whole /api/gamification surface (award for browser-completed
// activities, the learner's level/week/streaks, the weekly goal), multiplexed by ?action= to stay under Vercel Hobby's
// 12-serverless-function cap — do not add new files directly under api/.

const ALLOWED_AWARD_FIELDS = new Set(['activityType', 'itemRef', 'language', 'performanceScore'])
const MAX_ITEM_REF_LENGTH = 200

interface AwardRequestBody {
  activityType: string
  itemRef?: string | null
  language?: XpLanguage
  performanceScore?: number | null
}

function parseAwardBody(raw: unknown): AwardRequestBody | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const body = raw as Record<string, unknown>
  // Anything else — above all an XP amount — is refused outright, not ignored.
  if (Object.keys(body).some((key) => !ALLOWED_AWARD_FIELDS.has(key))) return null
  if (typeof body.activityType !== 'string' || !body.activityType) return null
  if (body.itemRef != null && (typeof body.itemRef !== 'string' || body.itemRef.length > MAX_ITEM_REF_LENGTH)) return null
  if (body.language != null && body.language !== 'en' && body.language !== 'de') return null
  if (body.performanceScore != null && (typeof body.performanceScore !== 'number' || !Number.isFinite(body.performanceScore))) {
    return null
  }
  return body as unknown as AwardRequestBody
}

// For activities that finish in the browser (drills, swipe cards, lessons). The performance
// score sent here is trusted only within the bonus limit (at most +50% of base XP) and the
// activity type's caps — an accepted, bounded risk. Server-completed activities award XP in
// their own routes and are refused here (client_awardable = false).
async function handleAward(req: VercelRequest, res: VercelResponse, userId: string) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const body = parseAwardBody(req.body)
  if (!body) {
    res.status(400).json({ error: 'Invalid request' })
    return
  }

  let type
  try {
    type = await getActivityType(body.activityType)
  } catch (err) {
    console.error('Failed to load activity type', err)
    res.status(502).json({ error: 'Lookup failed' })
    return
  }
  if (!type || !type.enabled || !type.client_awardable) {
    res.status(403).json({ error: 'Activity type not awardable' })
    return
  }

  const since = new Date(Date.now() - 60_000).toISOString()
  const { count, error: countError } = await supabaseAdmin
    .from('xp_events')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', since)
  if (countError) {
    console.error('Failed to check the XP award rate limit', countError)
    res.status(502).json({ error: 'Rate limit check failed' })
    return
  }
  if ((count ?? 0) >= CLIENT_AWARD_RATE_LIMIT_PER_MINUTE) {
    res.status(429).json({ error: 'Too many requests' })
    return
  }

  const xp = await awardXp({
    userId,
    activityType: type.key,
    itemRef: body.itemRef ?? null,
    language: body.language ?? 'en',
    performanceScore: body.performanceScore ?? null,
  })
  res.status(200).json({ xp })
}

interface GamificationStateRow {
  total_xp: number
  weekly_goal_days: number
  week_goal_days: number
  week_active_days: number
  week_streak: number
  best_week_streak: number
  daily_streak: number
  freezes: number
  active_today: boolean
  streak_restarted_today: boolean
}

/** The learner's level, week and streaks. gamification_state() closes finished weeks first. */
async function loadMe(userId: string): Promise<GamificationMe> {
  const { data, error } = await supabaseAdmin.rpc('gamification_state', { p_user_id: userId })
  if (error) throw error
  const row = (data as GamificationStateRow[])[0]
  if (!row) throw new Error('gamification_state returned no row')

  const thisWeekMet = row.week_active_days >= row.week_goal_days
  return {
    totalXp: row.total_xp,
    ...progressInLevel(row.total_xp),
    weeklyGoalDays: row.weekly_goal_days,
    week: { goalDays: row.week_goal_days, activeDays: row.week_active_days },
    // week_streak counts closed weeks only; a week whose goal is already met counts too.
    weekStreak: row.week_streak + (thisWeekMet ? 1 : 0),
    bestWeekStreak: Math.max(row.best_week_streak, row.week_streak + (thisWeekMet ? 1 : 0)),
    dailyStreak: row.daily_streak,
    freezes: row.freezes,
    activeToday: row.active_today,
    streakRestartedToday: row.streak_restarted_today,
  }
}

async function handleMe(req: VercelRequest, res: VercelResponse, userId: string) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    res.status(200).json(await loadMe(userId))
  } catch (err) {
    console.error('Failed to load gamification state', err)
    res.status(502).json({ error: 'Failed to load' })
  }
}

// The weekly goal applies from next week (the current week keeps its goal; see set_weekly_goal()).
async function handleGoal(req: VercelRequest, res: VercelResponse, userId: string) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const days = (req.body as { days?: unknown } | undefined)?.days
  if (typeof days !== 'number' || !Number.isInteger(days) || days < WEEKLY_GOAL_MIN_DAYS || days > WEEKLY_GOAL_MAX_DAYS) {
    res.status(400).json({ error: 'Invalid goal' })
    return
  }

  try {
    const { error } = await supabaseAdmin.rpc('set_weekly_goal', { p_user_id: userId, p_days: days })
    if (error) throw error
    res.status(200).json(await loadMe(userId))
  } catch (err) {
    console.error('Failed to set weekly goal', err)
    res.status(502).json({ error: 'Failed to save' })
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await getUserFromRequest(req)
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const action = req.query.action

  switch (action) {
    case 'award':
      await handleAward(req, res, user.id)
      return
    case 'me':
      await handleMe(req, res, user.id)
      return
    case 'goal':
      await handleGoal(req, res, user.id)
      return
    default:
      res.status(404).json({ error: 'Not found' })
  }
}
