import { supabaseAdmin } from './supabaseAdmin.js'
import { applyReview, ratingFromResult, type VocabCardScheduleRow } from './vocabScheduler.js'
import { computeListProgress, isComplete, loadListTerms, loadProgressCards, recordCompletions } from './vocabListProgress.js'
import { enrichTerms } from './vocabEnrichment.js'
import type { CefrLevel } from './prompts.js'
import {
  ENRICH_BATCH_SIZE,
  RECOGNITION_DISTRACTORS,
  type ReviewInput,
  type ReviewResult,
  type VocabKind,
  type VocabPos,
} from '../../src/lib/vocab.js'

// Student practice (design §6–§7): the content helpers review sessions and Fast practice
// share, and scheduling a review. Everything here acts on the calling student's own cards
// only. Which cards a list's review session contains: vocabListSession.ts.

/** Distinct meanings fetched from the student's deck for recognition distractors. */
const DECK_DISTRACTOR_POOL = 200
/** Global items fetched when the deck alone can't supply enough distractors. */
const GLOBAL_DISTRACTOR_POOL = 100

export interface ItemContent {
  term: string
  kind: VocabKind
  pos: VocabPos | null
  meaning_hu: string | null
  definition_en: string | null
  example_en: string | null
  cefr_level: string | null
  enrichment_status: string
  owner_teacher_id: string | null
}

/** "New cards per day" counts from UTC midnight — the same day boundary as the usage meters. */
export function utcDayStart(now: Date): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
}

/**
 * Up to `n` distinct meanings from `pool`, none equal to the answer (ignoring case and
 * spacing). Pure; `random` is injectable for checks.
 */
export function pickDistractors(
  answer: string | null,
  pool: Iterable<string | null>,
  n: number,
  random: () => number = Math.random,
): string[] {
  const key = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ')
  const seen = new Set<string>(answer ? [key(answer)] : [])
  const candidates: string[] = []
  for (const m of pool) {
    if (!m || !m.trim() || seen.has(key(m))) continue
    seen.add(key(m))
    candidates.push(m.trim())
  }
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[candidates[i], candidates[j]] = [candidates[j], candidates[i]]
  }
  return candidates.slice(0, n)
}

/** Rows that carry item content: session cards, and the words of a Fast practice list. */
export interface ItemContentRow {
  term_normalized: string
  vocab_items: ItemContent | null
}

export async function distractorPool(userId: string, cards: ItemContentRow[]): Promise<string[]> {
  const { data, error } = await supabaseAdmin
    .from('vocab_cards')
    .select('vocab_items(meaning_hu)')
    .eq('user_id', userId)
    .limit(DECK_DISTRACTOR_POOL)
  if (error) throw error
  const pool = new Set<string>()
  for (const row of (data ?? []) as unknown as { vocab_items: { meaning_hu: string | null } | null }[]) {
    if (row.vocab_items?.meaning_hu) pool.add(row.vocab_items.meaning_hu)
  }

  // A small deck: top up with global items at the session's levels (design §7).
  if (pool.size < RECOGNITION_DISTRACTORS + 1) {
    const levels = [...new Set(cards.map((c) => c.vocab_items?.cefr_level).filter((l): l is string => Boolean(l)))]
    let query = supabaseAdmin
      .from('vocab_items')
      .select('meaning_hu')
      .is('owner_teacher_id', null)
      .not('meaning_hu', 'is', null)
    if (levels.length > 0) query = query.in('cefr_level', levels)
    const { data: global, error: globalError } = await query.limit(GLOBAL_DISTRACTOR_POOL)
    if (globalError) throw globalError
    for (const row of global ?? []) if (row.meaning_hu) pool.add(row.meaning_hu as string)
  }
  return [...pool]
}

/**
 * Tutor Bot words whose enrichment failed (or legacy words migrated from
 * vocabulary_mastery) sit on a global item still 'pending'. Enrich this session's
 * pending items — one batch at most, so starting a session stays quick — and patch the
 * rows in place. enrichTerms writes the result into the same global row, so this happens
 * once per term, not once per student. Failures leave the rows as they are: the exercise
 * choice copes with a missing meaning, and the next session retries.
 */
export async function fillPendingItems(userId: string, rows: ItemContentRow[]): Promise<void> {
  const pending = rows.filter((r) => r.vocab_items && r.vocab_items.enrichment_status !== 'done' && !r.vocab_items.owner_teacher_id)
  const terms = [...new Set(pending.map((r) => r.vocab_items!.term))].slice(0, ENRICH_BATCH_SIZE)
  if (terms.length === 0) return

  const { data: profile } = await supabaseAdmin.from('learner_profiles').select('cefr_level').eq('user_id', userId).maybeSingle()
  const results = await enrichTerms(terms, {
    userId,
    origin: 'tutor',
    cefrHint: (profile?.cefr_level as CefrLevel | null) ?? undefined,
  })
  const byTerm = new Map(results.filter((r) => r.status === 'done').map((r) => [r.termNormalized, r]))
  for (const row of pending) {
    const r = byTerm.get(row.term_normalized)
    if (!r || !row.vocab_items) continue
    row.vocab_items = {
      ...row.vocab_items,
      pos: r.pos,
      cefr_level: r.cefrLevel,
      meaning_hu: r.meaningHu,
      definition_en: r.definitionEn,
      example_en: r.exampleEn,
      enrichment_status: 'done',
    }
  }
}

export class ReviewError extends Error {
  constructor(
    readonly status: 404 | 409,
    message: string,
  ) {
    super(message)
  }
}

interface CardRow extends VocabCardScheduleRow {
  id: string
  user_id: string
  term_normalized: string
  suspended: boolean
  retired_at: string | null
  updated_at: string
}

/**
 * Sets completed_at on the student's open teacher-list assignments that this term's
 * graduation completes. Returns the titles of the lists that were just completed.
 */
async function completeListsForTerm(userId: string, termNormalized: string): Promise<string[]> {
  const { data: open, error } = await supabaseAdmin
    .from('vocab_list_assignments')
    .select('list_id, vocab_lists(title)')
    .eq('student_id', userId)
    .is('completed_at', null)
  if (error) throw error
  const assignments = (open ?? []) as unknown as { list_id: string; vocab_lists: { title: string } | null }[]
  if (assignments.length === 0) return []

  const termsByList = await loadListTerms(assignments.map((a) => a.list_id))
  const affected = assignments.filter((a) => termsByList.get(a.list_id)?.includes(termNormalized))
  if (affected.length === 0) return []

  const cards = await loadProgressCards([userId], affected.flatMap((a) => termsByList.get(a.list_id) ?? []))
  const completed: string[] = []
  for (const a of affected) {
    const progress = computeListProgress(termsByList.get(a.list_id) ?? [], [userId], cards)
    if (!isComplete(progress.get(userId)!)) continue
    const newly = await recordCompletions(a.list_id, progress)
    if (newly.size > 0) completed.push(a.vocab_lists?.title ?? '')
  }
  return completed
}

/**
 * Schedules one review of the caller's own card (design §6.1) and logs it. The update is
 * conditional on the card's updated_at, so a double-submitted answer is rejected (409)
 * instead of being applied twice.
 */
export async function recordReview(userId: string, input: ReviewInput, now = new Date()): Promise<ReviewResult> {
  const { data, error } = await supabaseAdmin
    .from('vocab_cards')
    .select('*')
    .eq('id', input.cardId)
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  const card = data as CardRow | null
  // Paused and mastered cards aren't in rotation, so a session never offers them.
  if (!card || card.suspended || card.retired_at) throw new ReviewError(404, 'Not found')

  const rating = ratingFromResult({
    correct: input.correct,
    usedHint: input.usedHint,
    responseMs: input.responseMs,
    exercise: input.exercise,
  })
  const { fields, stateBefore } = applyReview(card, rating, now)

  const { data: updated, error: updateError } = await supabaseAdmin
    .from('vocab_cards')
    .update({ ...fields, updated_at: now.toISOString() })
    .eq('id', card.id)
    .eq('updated_at', card.updated_at)
    .select('id')
  if (updateError) throw updateError
  if (!updated || updated.length === 0) throw new ReviewError(409, 'Card changed; reload the session')

  const { error: logError } = await supabaseAdmin.from('vocab_reviews').insert({
    card_id: card.id,
    user_id: userId,
    exercise: input.exercise,
    correct: input.correct,
    used_hint: input.usedHint,
    response_ms: input.responseMs,
    rating,
    state_before: stateBefore,
    reviewed_at: now.toISOString(),
  })
  // The card is already rescheduled; a missing log row only affects the daily new-card count.
  if (logError) console.error('Failed to log vocab review', logError)

  const learnedNow = card.first_learned_at === null && fields.first_learned_at !== null
  let completedLists: string[] = []
  if (learnedNow) {
    try {
      completedLists = await completeListsForTerm(userId, card.term_normalized)
    } catch (err) {
      // Not fatal: the list views (teacher's list page, student's "From my teacher") record
      // any completion they compute, so a missed one is caught up there.
      console.error('Failed to record list completion', err)
    }
  }

  return {
    rating,
    due: fields.due,
    state: fields.state,
    ladderStep: fields.ladder_step,
    learnedNow,
    completedLists,
  }
}
