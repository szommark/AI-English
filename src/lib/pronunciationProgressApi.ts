import { supabase } from './supabase'

export interface PronunciationProgressEntry {
  soundItemId: string
  perceptionScore: number | null
  productionScore: number | null
  attempts: number
  updatedAt: string
}

async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/** Fails soft (empty list) — a progress-fetch failure shouldn't block browsing the curriculum. */
export async function fetchPronunciationProgress(): Promise<PronunciationProgressEntry[]> {
  const headers = await authHeader()
  const res = await fetch('/api/pronunciation-progress', { headers })
  if (!res.ok) return []
  const body = await res.json()
  return body.progress ?? []
}

export async function recordPronunciationAttempt(
  soundItemId: string,
  scores: { perceptionScore?: number; productionScore?: number },
): Promise<void> {
  const headers = await authHeader()
  const res = await fetch('/api/pronunciation-progress', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify({ soundItemId, ...scores }),
  })
  if (!res.ok) throw new Error('Failed to record pronunciation progress')
}
