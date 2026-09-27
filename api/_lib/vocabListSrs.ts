import { supabaseAdmin } from './supabaseAdmin.js'
import { fetchAllPages } from './vocabListProgress.js'
import { utcDayStart } from './vocabPractice.js'
import {
  MAX_REVIEWS_PER_SESSION,
  NEW_CARDS_PER_DAY,
  PRACTICE_EXERCISES,
  cardStage,
  type ListSrs,
  type VocabOrigin,
} from '../../src/lib/vocab.js'

// Spaced repetition per list (design §7): every list has its own pipeline and review
// session, and its own daily allowance of new words. Cards stay one per student and term,
// so a word on two lists shares its progress between them. Pure apart from the loaders.

const STATE_NEW = 0

/** The vocab_cards columns the pipeline and the session plan need. */
export interface SrsCardRow {
  id: string
  term_normalized: string
  origin: VocabOrigin
  state: number
  ladder_step: number
  due: string
  first_learned_at: string | null
  retired_at: string | null
  suspended: boolean
  created_at: string
}

export const SRS_CARD_COLUMNS =
  'id, term_normalized, origin, state, ladder_step, due, first_learned_at, retired_at, suspended, created_at'

/** What the stats need besides a list's terms: the caller's cards by term, and today's new starts. */
export interface SrsContext {
  cards: Map<string, SrsCardRow>
  /** Ids of cards started today: reviewed for the first time since UTC midnight. */
  startedToday: Set<string>
  now: Date
}

/** Every card of the caller, newest first. */
export async function loadDeck(userId: string): Promise<SrsCardRow[]> {
  return fetchAllPages<SrsCardRow>((from, to) =>
    supabaseAdmin
      .from('vocab_cards')
      .select(SRS_CARD_COLUMNS)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .order('id')
      .range(from, to) as unknown as PromiseLike<{ data: SrsCardRow[] | null; error: unknown }>,
  )
}

/** Cards the student started today: those with a review of a card that was still New. */
export async function cardsStartedToday(userId: string, now: Date): Promise<Set<string>> {
  const { data, error } = await supabaseAdmin
    .from('vocab_reviews')
    .select('card_id')
    .eq('user_id', userId)
    .eq('state_before', STATE_NEW)
    .gte('reviewed_at', utcDayStart(now).toISOString())
  if (error) throw error
  return new Set((data ?? []).map((r) => r.card_id as string))
}

/** The list's cards, one per distinct term. */
function listCards(terms: string[], ctx: SrsContext): SrsCardRow[] {
  return [...new Set(terms)].flatMap((t) => ctx.cards.get(t) ?? [])
}

const inRotation = (c: SrsCardRow) => !c.suspended && !c.retired_at

/** New cards the list's session can still start today. */
function newAllowance(cards: SrsCardRow[], ctx: SrsContext): number {
  return Math.max(0, NEW_CARDS_PER_DAY - cards.filter((c) => ctx.startedToday.has(c.id)).length)
}

/**
 * The cards of one list's review session (design §7): every due review first (oldest due
 * first, at most MAX_REVIEWS_PER_SESSION), then up to the list's remaining new cards for
 * today, oldest first.
 */
export function sessionPlan(terms: string[], ctx: SrsContext): { due: SrsCardRow[]; fresh: SrsCardRow[] } {
  const cards = listCards(terms, ctx)
  const nowIso = ctx.now.toISOString()
  const due = cards
    .filter((c) => inRotation(c) && c.state !== STATE_NEW && c.due <= nowIso)
    .sort((a, b) => a.due.localeCompare(b.due) || a.id.localeCompare(b.id))
    .slice(0, MAX_REVIEWS_PER_SESSION)
  const fresh = cards
    .filter((c) => inRotation(c) && c.state === STATE_NEW)
    .sort((a, b) => a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id))
    .slice(0, newAllowance(cards, ctx))
  return { due, fresh }
}

/** One list's pipeline: the same stages as cardStage, per exercise, and what is due. */
export function listSrs(terms: string[], ctx: SrsContext): ListSrs {
  const cards = listCards(terms, ctx)
  const nowIso = ctx.now.toISOString()
  const active = cards.filter((c) => !c.suspended)
  const rotation = active.filter((c) => !c.retired_at)
  const scheduled = rotation.filter((c) => c.state !== STATE_NEW)
  const dueCount = scheduled.filter((c) => c.due <= nowIso).length
  const newTotal = rotation.filter((c) => c.state === STATE_NEW).length
  const upcoming = scheduled.filter((c) => c.due > nowIso).map((c) => c.due)

  const stages = { new: 0, learning: 0, learned: 0, mastered: 0, paused: cards.length - active.length }
  for (const c of active) stages[cardStage(c)]++

  return {
    dueCount,
    newAvailable: Math.min(newTotal, newAllowance(cards, ctx)),
    nextDue: dueCount === 0 && upcoming.length > 0 ? upcoming.sort()[0] : null,
    stages,
    // ladder_step 1–4 is recognition … listening, in PRACTICE_EXERCISES order.
    exercises: Object.fromEntries(
      PRACTICE_EXERCISES.map((e, i) => [e, rotation.filter((c) => c.ladder_step === i + 1).length]),
    ) as ListSrs['exercises'],
  }
}
