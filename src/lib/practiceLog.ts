import { supabase } from './supabase'
import type { PracticeStartInput } from './progressTypes'

// The practice log (api/_lib/practiceLog.ts): each start of a word game, Grammar Coach written
// practice or time game, and its finish, for the progress pages. No XP — that stays with
// awardClientXp. Every call is fire-and-forget and silent: logging must never get in the way.

async function post(action: string, body: unknown): Promise<Response | null> {
  try {
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token
    if (!token) return null
    return await fetch(`/api/gamification?action=${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    })
  } catch {
    return null
  }
}

/** Logs a start; resolves to its id (null if logging failed). */
export async function logPracticeStart(input: PracticeStartInput): Promise<string | null> {
  const res = await post('practice-start', input)
  if (!res?.ok) return null
  try {
    return ((await res.json()) as { id?: string }).id ?? null
  } catch {
    return null
  }
}

/** Logs the finish of a start; `score` is the share right (0–1), if the activity is scored. */
export function logPracticeFinish(id: Promise<string | null> | null, score: number | null = null): void {
  if (!id) return
  void id.then((resolved) => {
    if (resolved) void post('practice-finish', { id: resolved, score })
  })
}
