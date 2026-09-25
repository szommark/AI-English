import { supabaseAdmin } from './supabaseAdmin.js'
import { distractorPool, fillPendingItems, pickDistractors } from './vocabPractice.js'
import { VocabApiError, loadListWords } from './vocabWordlists.js'
import {
  RECOGNITION_DISTRACTORS,
  type DrillAnswerInput,
  type DrillCard,
  type DrillRun,
  type WordlistRef,
} from '../../src/lib/vocab.js'

// Fast practice (design §7.1): every exercise over words the student picks from one of
// their lists, at any time and whether or not the words are in spaced repetition. Answers
// go to vocab_drill_answers, keyed by item, never to vocab_reviews — so they don't
// reschedule cards, use up new cards or move teacher-list progress.

/**
 * Starts a run over the chosen words of a list the caller may see (`itemIds` already
 * validated as distinct ids, at most DRILL_MAX_WORDS). Ids that aren't on the list are
 * left out; if none remain the run is not created.
 */
export async function startDrill(userId: string, ref: WordlistRef, itemIds: string[]): Promise<DrillRun> {
  const { rows: listRows } = await loadListWords(userId, ref)
  const byItem = new Map(listRows.map((r) => [r.item_id, r]))
  const rows = itemIds.flatMap((id) => byItem.get(id) ?? [])
  if (rows.length === 0) throw new VocabApiError(404, 'No words to practise')

  await fillPendingItems(userId, rows)
  const pool = await distractorPool(userId, rows)
  const cards: DrillCard[] = rows.map((r) => ({
    itemId: r.item_id,
    term: r.vocab_items.term,
    kind: r.vocab_items.kind,
    meaningHu: r.vocab_items.meaning_hu,
    definitionEn: r.vocab_items.definition_en,
    exampleEn: r.vocab_items.example_en,
    contextCorrected: r.context_corrected,
    distractors: pickDistractors(r.vocab_items.meaning_hu, pool, RECOGNITION_DISTRACTORS),
  }))

  const { data: run, error } = await supabaseAdmin
    .from('vocab_drill_runs')
    .insert({
      user_id: userId,
      source: ref.kind,
      list_id: ref.kind === 'teacher' ? ref.id : null,
      student_list_id: ref.kind === 'custom' ? ref.id : null,
      word_count: cards.length,
      item_ids: cards.map((c) => c.itemId),
    })
    .select('id')
    .single()
  if (error) throw error
  return { runId: run.id as string, cards }
}

/** Records one answer for a word of the run. A repeat of the same run/word/exercise is ignored. */
export async function recordDrillAnswer(userId: string, input: DrillAnswerInput, now = new Date()): Promise<void> {
  const { data: run, error: runError } = await supabaseAdmin
    .from('vocab_drill_runs')
    .select('id, item_ids')
    .eq('id', input.runId)
    .eq('user_id', userId)
    .maybeSingle()
  if (runError) throw runError
  if (!run || !(run.item_ids as string[]).includes(input.itemId)) throw new VocabApiError(404, 'Not found')

  const { error } = await supabaseAdmin.from('vocab_drill_answers').upsert(
    {
      run_id: input.runId,
      item_id: input.itemId,
      user_id: userId,
      exercise: input.exercise,
      correct: input.correct,
      used_hint: input.usedHint,
      response_ms: input.responseMs,
      answered_at: now.toISOString(),
    },
    { onConflict: 'run_id,item_id,exercise', ignoreDuplicates: true },
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
  if (!run) throw new VocabApiError(404, 'Not found')
  if (run.finished_at) return

  const { error: updateError } = await supabaseAdmin
    .from('vocab_drill_runs')
    .update({ finished_at: now.toISOString() })
    .eq('id', runId)
    .is('finished_at', null)
  if (updateError) throw updateError
}
