import { supabaseAdmin } from './supabaseAdmin.js'
import { fetchAllPages, loadListTerms } from './vocabListProgress.js'
import { SESSION_CARD_COLUMNS, distractorPool, fillPendingItems, toPracticeCard, type SessionCardRow } from './vocabPractice.js'
import {
  cardStage,
  type DrillAnswerInput,
  type DrillListOption,
  type DrillRun,
  type DrillSetup,
  type DrillWord,
  type PracticeCard,
  type VocabOrigin,
} from '../../src/lib/vocab.js'

// Full practice (design §7.1): every exercise over words the student picks, outside the
// spaced-repetition schedule. Answers go to vocab_drill_answers, never to vocab_reviews,
// so they don't reschedule cards, use up new cards or move teacher-list progress.
// Everything here acts on the calling student's own cards only.

export class DrillError extends Error {
  constructor(
    readonly status: 404,
    message: string,
  ) {
    super(message)
  }
}

interface DrillWordRow {
  id: string
  term_normalized: string
  origin: VocabOrigin
  state: number
  first_learned_at: string | null
  vocab_items: { term: string; meaning_hu: string | null } | null
}

/** The student's active (not paused) words, A–Z, and their teacher lists as selections. */
export async function loadDrillSetup(userId: string): Promise<DrillSetup> {
  const [rows, { data: assigned, error }] = await Promise.all([
    fetchAllPages<DrillWordRow>((from, to) =>
      supabaseAdmin
        .from('vocab_cards')
        .select('id, term_normalized, origin, state, first_learned_at, vocab_items(term, meaning_hu)')
        .eq('user_id', userId)
        .eq('suspended', false)
        .order('id')
        .range(from, to) as unknown as PromiseLike<{ data: DrillWordRow[] | null; error: unknown }>,
    ),
    supabaseAdmin
      .from('vocab_list_assignments')
      .select('list_id, vocab_lists(title)')
      .eq('student_id', userId)
      .order('assigned_at', { ascending: false }),
  ])
  if (error) throw error

  const withItems = rows.filter((r) => r.vocab_items)
  const words: DrillWord[] = withItems
    .map((r) => ({
      cardId: r.id,
      term: r.vocab_items!.term,
      meaningHu: r.vocab_items!.meaning_hu,
      origin: r.origin,
      stage: cardStage(r),
    }))
    .sort((a, b) => a.term.localeCompare(b.term, 'en', { sensitivity: 'base' }))

  // Lists match cards on term_normalized, like list progress (design §6.2).
  const cardByTerm = new Map(withItems.map((r) => [r.term_normalized, r.id]))
  const assignments = ((assigned ?? []) as unknown as { list_id: string; vocab_lists: { title: string } | null }[]).filter(
    (a) => a.vocab_lists,
  )
  const termsByList = await loadListTerms(assignments.map((a) => a.list_id))
  const lists: DrillListOption[] = assignments
    .map((a) => ({
      listId: a.list_id,
      title: a.vocab_lists!.title,
      cardIds: [...new Set((termsByList.get(a.list_id) ?? []).flatMap((t) => cardByTerm.get(t) ?? []))],
    }))
    .filter((l) => l.cardIds.length > 0)

  return { words, lists }
}

/**
 * Starts a run over the given cards (already validated as distinct ids, at most
 * DRILL_MAX_WORDS). Cards that aren't the caller's, or are paused, are left out; if none
 * remain the run is not created. `listId`, when given, must be a list assigned to the caller.
 */
export async function startDrill(userId: string, cardIds: string[], listId: string | null): Promise<DrillRun> {
  if (listId) {
    const { data, error } = await supabaseAdmin
      .from('vocab_list_assignments')
      .select('list_id')
      .eq('list_id', listId)
      .eq('student_id', userId)
      .maybeSingle()
    if (error) throw error
    if (!data) throw new DrillError(404, 'Not found')
  }

  const { data, error } = await supabaseAdmin
    .from('vocab_cards')
    .select(SESSION_CARD_COLUMNS)
    .eq('user_id', userId)
    .eq('suspended', false)
    .in('id', cardIds)
  if (error) throw error
  const order = new Map(cardIds.map((id, i) => [id, i]))
  const rows = ((data ?? []) as unknown as SessionCardRow[]).sort((a, b) => order.get(a.id)! - order.get(b.id)!)

  await fillPendingItems(userId, rows)
  const pool = await distractorPool(userId, rows)
  const cards = rows.map((r) => toPracticeCard(r, pool, true)).filter((c): c is PracticeCard => c !== null)
  if (cards.length === 0) throw new DrillError(404, 'No words to practise')

  const { data: run, error: runError } = await supabaseAdmin
    .from('vocab_drill_runs')
    .insert({ user_id: userId, list_id: listId, word_count: cards.length })
    .select('id')
    .single()
  if (runError) throw runError
  return { runId: run.id as string, cards }
}

/** Records one answer. A repeat of the same run/card/exercise is ignored, not an error. */
export async function recordDrillAnswer(userId: string, input: DrillAnswerInput, now = new Date()): Promise<void> {
  const [run, card] = await Promise.all([
    supabaseAdmin.from('vocab_drill_runs').select('id').eq('id', input.runId).eq('user_id', userId).maybeSingle(),
    supabaseAdmin.from('vocab_cards').select('id').eq('id', input.cardId).eq('user_id', userId).maybeSingle(),
  ])
  if (run.error) throw run.error
  if (card.error) throw card.error
  if (!run.data || !card.data) throw new DrillError(404, 'Not found')

  const { error } = await supabaseAdmin.from('vocab_drill_answers').upsert(
    {
      run_id: input.runId,
      card_id: input.cardId,
      user_id: userId,
      exercise: input.exercise,
      correct: input.correct,
      used_hint: input.usedHint,
      response_ms: input.responseMs,
      answered_at: now.toISOString(),
    },
    { onConflict: 'run_id,card_id,exercise', ignoreDuplicates: true },
  )
  if (error) throw error
}

/** Marks the run finished (all done, or ended early). Finishing twice keeps the first time. */
export async function finishDrill(userId: string, runId: string, now = new Date()): Promise<void> {
  const { data: run, error } = await supabaseAdmin
    .from('vocab_drill_runs')
    .select('id, finished_at')
    .eq('id', runId)
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  if (!run) throw new DrillError(404, 'Not found')
  if (run.finished_at) return

  const { error: updateError } = await supabaseAdmin
    .from('vocab_drill_runs')
    .update({ finished_at: now.toISOString() })
    .eq('id', runId)
    .is('finished_at', null)
  if (updateError) throw updateError
}
