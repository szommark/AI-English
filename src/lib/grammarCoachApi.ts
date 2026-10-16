import { supabase } from './supabase'
import type { CefrLevel } from '../data/grammarCurriculum'
import type { ExplainLanguage, GrammarExerciseSet, GrammarLesson, LessonLanguage } from './types'

async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/** Cache-only lookup — never triggers generation. Used to silently prefetch on item select. */
export async function fetchCachedGrammarLesson(
  cefrLevel: CefrLevel,
  itemId: string,
  lang: LessonLanguage,
  explain: ExplainLanguage,
): Promise<GrammarLesson | null> {
  const headers = await authHeader()
  const res = await fetch(
    `/api/grammar-lesson?cefrLevel=${encodeURIComponent(cefrLevel)}&itemId=${encodeURIComponent(itemId)}&lang=${lang}&explain=${explain}`,
    { headers },
  )
  if (!res.ok) return null
  const body = await res.json()
  return body.lesson ?? null
}

/** Generates the lesson if not cached (or returns the cached one). Throws on failure — the caller should fail silently. */
export async function requestGrammarLesson(
  cefrLevel: CefrLevel,
  itemId: string,
  lang: LessonLanguage,
  explain: ExplainLanguage,
): Promise<GrammarLesson> {
  const headers = await authHeader()
  const res = await fetch('/api/grammar-lesson', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify({ cefrLevel, itemId, lang, explain }),
  })
  if (!res.ok) throw new Error('Grammar lesson generation failed')
  const body = await res.json()
  if (!body.lesson) throw new Error('Grammar lesson generation failed')
  return body.lesson as GrammarLesson
}

/** Cache-only lookup of the written practice set — never triggers generation. */
export async function fetchCachedGrammarExercises(
  cefrLevel: CefrLevel,
  itemId: string,
  lang: LessonLanguage,
  explain: ExplainLanguage,
): Promise<GrammarExerciseSet | null> {
  const headers = await authHeader()
  const res = await fetch(
    `/api/grammar-lesson?kind=exercises&cefrLevel=${encodeURIComponent(cefrLevel)}&itemId=${encodeURIComponent(itemId)}&lang=${lang}&explain=${explain}`,
    { headers },
  )
  if (!res.ok) return null
  const body = await res.json()
  return body.exercises ?? null
}

/** Generates the written practice set if not cached. Throws on failure — the caller should fail silently. */
export async function requestGrammarExercises(
  cefrLevel: CefrLevel,
  itemId: string,
  lang: LessonLanguage,
  explain: ExplainLanguage,
): Promise<GrammarExerciseSet> {
  const headers = await authHeader()
  const res = await fetch('/api/grammar-lesson', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify({ kind: 'exercises', cefrLevel, itemId, lang, explain }),
  })
  if (!res.ok) throw new Error('Grammar exercises generation failed')
  const body = await res.json()
  if (!body.exercises) throw new Error('Grammar exercises generation failed')
  return body.exercises as GrammarExerciseSet
}
