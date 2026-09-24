import { supabaseAdmin } from './supabaseAdmin.js'
import type { VocabListProgress } from '../../src/lib/vocab.js'

// Teacher-list progress per student (design §6.2). Everything is matched on
// term_normalized, not item_id: a student's card for a list term may point at another
// teacher's item or (before assignment) a global one, and it still counts.
//
//   learned = cards with first_learned_at set (sticky, so a lapse never un-learns)
//   started = cards with reps > 0
//   total   = distinct terms currently in the list
//
// Phase 3's review action calls refreshListCompletion() after a card graduates, so an
// assignment's completed_at is set the first time learned === total — and never cleared.

/** The vocab_cards columns progress needs. */
export interface ProgressCard {
  user_id: string
  term_normalized: string
  reps: number
  first_learned_at: string | null
}

/** Supabase's default max rows per request; larger reads are paged. */
const PAGE_SIZE = 1000
/** Terms per `in` filter, to keep request URLs short. */
const TERMS_PER_QUERY = 100

/** Pure: progress for each student over the given list terms. Students with no cards get zeros. */
export function computeListProgress(
  listTerms: Iterable<string>,
  studentIds: Iterable<string>,
  cards: Iterable<ProgressCard>,
): Map<string, VocabListProgress> {
  const terms = new Set(listTerms)
  const progress = new Map<string, VocabListProgress>()
  for (const id of studentIds) progress.set(id, { learned: 0, started: 0, total: terms.size })

  for (const card of cards) {
    const p = progress.get(card.user_id)
    if (!p || !terms.has(card.term_normalized)) continue
    if (card.first_learned_at) p.learned += 1
    if (card.reps > 0) p.started += 1
  }
  return progress
}

export function isComplete(p: VocabListProgress): boolean {
  return p.total > 0 && p.learned >= p.total
}

/** Reads every row of a query by paging with .range(); `build` must apply a stable order. */
export async function fetchAllPages<T>(
  build: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>,
): Promise<T[]> {
  const rows: T[] = []
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await build(from, from + PAGE_SIZE - 1)
    if (error) throw error
    rows.push(...(data ?? []))
    if (!data || data.length < PAGE_SIZE) return rows
  }
}

/**
 * The cards that can count towards progress (started or learned) for these students and
 * terms. Cards that are neither contribute nothing, so they aren't fetched.
 */
export async function loadProgressCards(studentIds: string[], terms: string[]): Promise<ProgressCard[]> {
  const uniqueTerms = [...new Set(terms)]
  if (studentIds.length === 0 || uniqueTerms.length === 0) return []

  const cards: ProgressCard[] = []
  for (let i = 0; i < uniqueTerms.length; i += TERMS_PER_QUERY) {
    const chunk = uniqueTerms.slice(i, i + TERMS_PER_QUERY)
    const rows = await fetchAllPages<ProgressCard>((from, to) =>
      supabaseAdmin
        .from('vocab_cards')
        .select('user_id, term_normalized, reps, first_learned_at')
        .in('user_id', studentIds)
        .in('term_normalized', chunk)
        .or('reps.gt.0,first_learned_at.not.is.null')
        .order('id')
        .range(from, to),
    )
    cards.push(...rows)
  }
  return cards
}

/** Normalized terms of each list, in list order. */
export async function loadListTerms(listIds: string[]): Promise<Map<string, string[]>> {
  const terms = new Map<string, string[]>(listIds.map((id) => [id, []]))
  if (listIds.length === 0) return terms

  const rows = await fetchAllPages<{ list_id: string; vocab_items: { term_normalized: string } | null }>(
    (from, to) =>
      supabaseAdmin
        .from('vocab_list_items')
        .select('list_id, vocab_items(term_normalized)')
        .in('list_id', listIds)
        .order('list_id')
        .order('position')
        .order('item_id')
        .range(from, to) as unknown as PromiseLike<{
        data: { list_id: string; vocab_items: { term_normalized: string } | null }[] | null
        error: unknown
      }>,
  )
  for (const row of rows) {
    if (row.vocab_items) terms.get(row.list_id)?.push(row.vocab_items.term_normalized)
  }
  return terms
}

/**
 * Sets completed_at (once) on the given assignments whose progress is complete.
 * Returns the newly completed student ids with their stored completed_at.
 */
export async function recordCompletions(
  listId: string,
  progress: Map<string, VocabListProgress>,
): Promise<Map<string, string>> {
  const completed = [...progress].filter(([, p]) => isComplete(p)).map(([id]) => id)
  if (completed.length === 0) return new Map()

  const { data, error } = await supabaseAdmin
    .from('vocab_list_assignments')
    .update({ completed_at: new Date().toISOString() })
    .eq('list_id', listId)
    .in('student_id', completed)
    .is('completed_at', null)
    .select('student_id, completed_at')
  if (error) throw error
  return new Map((data ?? []).map((r) => [r.student_id as string, r.completed_at as string]))
}

/**
 * Recomputes progress for a list's assignments (all of them, or just `studentIds`) and
 * records any new completions. For Phase 3's review action and for list edits.
 */
export async function refreshListCompletion(listId: string, studentIds?: string[]): Promise<void> {
  let query = supabaseAdmin
    .from('vocab_list_assignments')
    .select('student_id')
    .eq('list_id', listId)
    .is('completed_at', null)
  if (studentIds) query = query.in('student_id', studentIds)
  const { data: open, error } = await query
  if (error) throw error
  const openIds = (open ?? []).map((r) => r.student_id as string)
  if (openIds.length === 0) return

  const terms = (await loadListTerms([listId])).get(listId) ?? []
  const cards = await loadProgressCards(openIds, terms)
  await recordCompletions(listId, computeListProgress(terms, openIds, cards))
}
