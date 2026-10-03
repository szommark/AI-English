import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getUserFromRequest, supabaseAdmin } from './_lib/supabaseAdmin.js'
import { awardXp, getActivityType } from './_lib/gamification.js'
import { CLIENT_AWARD_RATE_LIMIT_PER_MINUTE } from '../src/lib/gamification/constants.js'
import { progressInLevel } from '../src/lib/gamification/levels.js'
import type { GamificationMe, XpLanguage } from '../src/lib/gamification/types.js'

// Single Vercel function for the whole /api/gamification surface (award for browser-completed
// activities, the learner's level), multiplexed by ?action= to stay under Vercel Hobby's
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

async function handleMe(req: VercelRequest, res: VercelResponse, userId: string) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { data, error } = await supabaseAdmin
    .from('learner_gamification')
    .select('total_xp')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) {
    res.status(502).json({ error: error.message })
    return
  }

  const totalXp = data?.total_xp ?? 0
  const body: GamificationMe = { totalXp, ...progressInLevel(totalXp) }
  res.status(200).json(body)
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
    default:
      res.status(404).json({ error: 'Not found' })
  }
}
