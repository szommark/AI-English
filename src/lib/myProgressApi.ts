import { supabase } from './supabase'
import type { MyProgress } from './progressTypes'

async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/** The signed-in learner's own progress page data (api/connect.ts, action=my-progress). */
export async function fetchMyProgress(): Promise<MyProgress> {
  const headers = await authHeader()
  const res = await fetch('/api/connect?action=my-progress', { headers })
  if (!res.ok) throw new Error('Failed to load progress')
  return res.json()
}
