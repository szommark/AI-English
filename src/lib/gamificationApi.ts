import { supabase } from './supabase'
import { publishXpResult } from './gamification/xpEvents'
import type { AwardResult, GamificationMe, GamificationOverview, XpLanguage } from './gamification/types'

async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/** The learner's level, week and streaks; null if it can't be loaded (the chip then stays hidden). */
export async function fetchGamificationMe(): Promise<GamificationMe | null> {
  try {
    const headers = await authHeader()
    const res = await fetch('/api/gamification?action=me', { headers })
    if (!res.ok) return null
    return (await res.json()) as GamificationMe
  } catch {
    return null
  }
}

/** Level, XP by section, week history and the badge wall for "Az én fejlődésem". Throws on failure. */
export async function fetchGamificationOverview(): Promise<GamificationOverview> {
  const headers = await authHeader()
  const res = await fetch('/api/gamification?action=overview', { headers })
  if (!res.ok) throw new Error('Failed to load the gamification overview')
  return (await res.json()) as GamificationOverview
}

/** Saves the weekly goal (applies from next week) and returns the updated state. Throws on failure. */
export async function setWeeklyGoal(days: number): Promise<GamificationMe> {
  const headers = await authHeader()
  const res = await fetch('/api/gamification?action=goal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify({ days }),
  })
  if (!res.ok) throw new Error('Failed to save the weekly goal')
  return (await res.json()) as GamificationMe
}

/**
 * Reports a browser-completed activity (drill stage, card set, lesson). Fire-and-forget:
 * call it without awaiting. The server decides the XP; a result, if any, is published to the
 * header chip and toast. Never throws and never surfaces an error to the learner.
 */
export function awardClientXp(params: {
  activityType: string
  itemRef?: string
  language?: XpLanguage
  performanceScore?: number | null
}): void {
  void (async () => {
    try {
      const headers = await authHeader()
      const res = await fetch('/api/gamification?action=award', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(params),
      })
      if (!res.ok) return
      const body = (await res.json()) as { xp?: AwardResult | null }
      publishXpResult(body.xp)
    } catch {
      // XP is a bonus on top of learning; a failure here is deliberately silent.
    }
  })()
}
