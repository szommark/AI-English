import { supabase } from './supabase'
import { getModelPreference } from './modelSelection'
import type { CefrLevel } from '../data/grammarCurriculum'
import type { GrammarLesson } from './types'

async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/** Cache-only lookup — never triggers generation. Used to silently prefetch on item select. */
export async function fetchCachedGrammarLesson(cefrLevel: CefrLevel, itemId: string): Promise<GrammarLesson | null> {
  const headers = await authHeader()
  const model = getModelPreference('grammarCoach')
  const res = await fetch(
    `/api/grammar-lesson?cefrLevel=${encodeURIComponent(cefrLevel)}&itemId=${encodeURIComponent(itemId)}&model=${encodeURIComponent(model)}`,
    { headers },
  )
  if (!res.ok) return null
  const body = await res.json()
  return body.lesson ?? null
}

/** Generates the lesson if not cached (or returns the cached one). Throws on failure — the caller should fail silently. */
export async function requestGrammarLesson(cefrLevel: CefrLevel, itemId: string): Promise<GrammarLesson> {
  const headers = await authHeader()
  const res = await fetch('/api/grammar-lesson', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify({ cefrLevel, itemId, model: getModelPreference('grammarCoach') }),
  })
  if (!res.ok) throw new Error('Grammar lesson generation failed')
  const body = await res.json()
  if (!body.lesson) throw new Error('Grammar lesson generation failed')
  return body.lesson as GrammarLesson
}
