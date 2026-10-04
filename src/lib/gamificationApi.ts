import { supabase } from './supabase'
import { publishXpResult } from './gamification/xpEvents'
import type {
  AdminGamificationSettings,
  AwardResult,
  ClassGamification,
  ClassRankingView,
  LeaderboardView,
  TeacherClassSettings,
  GamificationMe,
  GamificationOverview,
  NewChallenge,
  StudentGamification,
  TeacherBonusResult,
  TeacherChallenge,
  XpLanguage,
} from './gamification/types'

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

/** Marks the learner's teacher bonuses and new challenges as seen, so the toasts don't repeat. Never throws. */
export async function markNoticesSeen(): Promise<void> {
  try {
    const headers = await authHeader()
    await fetch('/api/gamification?action=seen', { method: 'POST', headers })
  } catch {
    // Worst case the toast shows once more next time.
  }
}

// --- Teacher side -------------------------------------------------------------------------

/** Gamification for every connected student, plus a class summary. Throws on failure. */
export async function fetchClassGamification(): Promise<ClassGamification> {
  const headers = await authHeader()
  const res = await fetch('/api/gamification?action=class', { headers })
  if (!res.ok) throw new Error('Failed to load class gamification')
  return (await res.json()) as ClassGamification
}

/** One connected student's gamification. Throws on failure (403/404 included). */
export async function fetchStudentGamification(studentId: string): Promise<StudentGamification> {
  const headers = await authHeader()
  const res = await fetch(`/api/gamification?action=student&studentId=${encodeURIComponent(studentId)}`, { headers })
  if (!res.ok) throw new Error('Failed to load student gamification')
  return (await res.json()) as StudentGamification
}

/**
 * Gives a connected student bonus XP. Resolves with given: false (nothing given) when the
 * amount is over this week's remaining allowance; throws on any other failure.
 */
export async function giveTeacherBonus(studentId: string, amount: number, reason: string): Promise<TeacherBonusResult> {
  const headers = await authHeader()
  const res = await fetch('/api/gamification?action=bonus', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify({ studentId, amount, reason }),
  })
  if (res.status !== 200 && res.status !== 409) throw new Error('Failed to give bonus XP')
  return (await res.json()) as TeacherBonusResult
}

// --- Class challenges (teacher) --------------------------------------------------------------

export interface TeacherChallengeList {
  challenges: TeacherChallenge[]
  /** Running or scheduled now. */
  openCount: number
  maxOpen: number
}

async function gamificationRequest<T>(action: string, method: string, body?: unknown): Promise<T> {
  const headers = await authHeader()
  const res = await fetch(`/api/gamification?action=${action}`, {
    method,
    headers: body === undefined ? headers : { 'Content-Type': 'application/json', ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const json = (await res.json().catch(() => ({}))) as { error?: string }
  if (!res.ok) throw new Error(json.error ?? 'Request failed')
  return json as T
}

export function fetchTeacherChallenges(): Promise<TeacherChallengeList> {
  return gamificationRequest('challenges', 'GET')
}

/** Throws with the server's message (e.g. a validation error) when refused. */
export function createChallenge(challenge: NewChallenge): Promise<{ id: string }> {
  return gamificationRequest('challenge', 'POST', challenge)
}

export function updateChallengeText(id: string, title: string, description: string | null): Promise<unknown> {
  return gamificationRequest('challenge', 'PATCH', { id, title, description })
}

export function endChallenge(id: string): Promise<unknown> {
  return gamificationRequest('challenge-end', 'POST', { id })
}

export function deleteChallenge(id: string): Promise<unknown> {
  return gamificationRequest('challenge-delete', 'POST', { id })
}

// --- Class comparison and the public leaderboard (Phase 5) -----------------------------------

export function fetchLeaderboard(): Promise<LeaderboardView> {
  return gamificationRequest('leaderboard', 'GET')
}

/** Joins with the 16+ self-declaration and consent. Throws with the server's (Hungarian) message when refused. */
export function joinLeaderboard(nickname: string): Promise<LeaderboardView> {
  return gamificationRequest('leaderboard-join', 'POST', { nickname, age16: true, consent: true })
}

export function changeLeaderboardNickname(nickname: string): Promise<LeaderboardView> {
  return gamificationRequest('leaderboard-nickname', 'POST', { nickname })
}

export function leaveLeaderboard(): Promise<LeaderboardView> {
  return gamificationRequest('leaderboard-leave', 'POST')
}

export function fetchClassRanking(): Promise<ClassRankingView> {
  return gamificationRequest('class-ranking', 'GET')
}

export function fetchClassSettings(): Promise<TeacherClassSettings> {
  return gamificationRequest('class-settings', 'GET')
}

export function saveClassSettings(settings: { classComparison: boolean; leaderboardAllowed: boolean }): Promise<TeacherClassSettings> {
  return gamificationRequest('class-settings', 'POST', settings)
}

export function fetchAdminGamification(): Promise<AdminGamificationSettings> {
  return gamificationRequest('admin-gamification', 'GET')
}

export function saveAdminGamification(switches: { publicLeaderboard?: boolean; classComparison?: boolean }): Promise<AdminGamificationSettings> {
  return gamificationRequest('admin-gamification', 'POST', switches)
}

export function resetLeaderboardNickname(userId: string): Promise<AdminGamificationSettings> {
  return gamificationRequest('admin-nickname-reset', 'POST', { userId })
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
