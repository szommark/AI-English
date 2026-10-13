import { supabase } from './supabase'
import type {
  LyricsActivity,
  LyricsActivityInput,
  LyricsActivitySummary,
  LyricsGapSuggestion,
} from './lyricsGapFill'

// Client for api/teacher-tools.ts (Teacher Toolkit, teacher role only).

async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export class TeacherToolsError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
  ) {
    super(code)
  }
}

async function request<T>(url: string, init: RequestInit = {}): Promise<T> {
  const headers = { ...(await authHeader()), ...(init.body ? { 'Content-Type': 'application/json' } : {}) }
  const res = await fetch(url, { ...init, headers })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new TeacherToolsError(res.status, typeof body.error === 'string' ? body.error : 'request_failed')
  }
  return res.json() as Promise<T>
}

export async function fetchLyricsActivities(): Promise<LyricsActivitySummary[]> {
  const body = await request<{ activities: LyricsActivitySummary[] }>('/api/teacher-tools?action=lyrics')
  return body.activities
}

export async function fetchLyricsActivity(id: string): Promise<LyricsActivity> {
  const body = await request<{ activity: LyricsActivity }>(`/api/teacher-tools?action=lyrics&id=${encodeURIComponent(id)}`)
  return body.activity
}

export async function saveLyricsActivity(input: LyricsActivityInput, id?: string): Promise<LyricsActivity> {
  const url = id ? `/api/teacher-tools?action=lyrics&id=${encodeURIComponent(id)}` : '/api/teacher-tools?action=lyrics'
  const body = await request<{ activity: LyricsActivity }>(url, { method: id ? 'PUT' : 'POST', body: JSON.stringify(input) })
  return body.activity
}

export async function deleteLyricsActivity(id: string): Promise<void> {
  await request(`/api/teacher-tools?action=lyrics&id=${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export async function suggestLyricsGaps(input: {
  lyrics: string
  goal: string
  count: number
  level: string | null
}): Promise<{ gaps: LyricsGapSuggestion[]; remaining: number }> {
  return request('/api/teacher-tools?action=lyrics-suggest', { method: 'POST', body: JSON.stringify(input) })
}
