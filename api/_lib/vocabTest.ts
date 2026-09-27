import { supabaseAdmin } from './supabaseAdmin.js'
import { fillPendingItems } from './vocabPractice.js'
import { VocabApiError, loadListWords } from './vocabWordlists.js'
import {
  TEST_MIN_LIST_WORDS,
  hasTest,
  testScore,
  testSize,
  type DrillCard,
  type TestAnswerInput,
  type TestResult,
  type TestRun,
  type WordlistRef,
} from '../../src/lib/vocab.js'

// Fast practice tests (design §7.1): a list with more than TEST_MIN_LIST_WORDS words can be
// tested on TEST_SHARE of its words, picked at random here (not by the client), each asked
// once as recall — no hint, one try, a typo counts as wrong. The score comes from the saved
// answers. Like Fast practice, a test never touches cards, reviews or list progress.

/** Fisher–Yates on a copy; `random` is injectable for checks. */
export function shuffled<T>(items: T[], random: () => number = Math.random): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/**
 * POST test-start { list }: TEST_SHARE of the list's words (rounded up), at random. Recall
 * needs a Hungarian meaning, so words still without one after enrichment are passed over;
 * the test is shorter only if the list hasn't enough words with a meaning.
 */
export async function startTest(userId: string, ref: WordlistRef): Promise<TestRun> {
  const { rows } = await loadListWords(userId, ref)
  if (!hasTest({ wordCount: rows.length })) {
    throw new VocabApiError(409, `A test needs a list of more than ${TEST_MIN_LIST_WORDS} words`)
  }

  // The random order doubles as the enrichment order: fillPendingItems fills one batch,
  // so the words most likely to be asked go first.
  const order = shuffled(rows)
  await fillPendingItems(userId, order)
  const picked = order.filter((r) => r.vocab_items.meaning_hu).slice(0, testSize(rows.length))
  if (picked.length === 0) throw new VocabApiError(409, 'No words with a meaning to test')

  const cards: DrillCard[] = picked.map((r) => ({
    itemId: r.item_id,
    term: r.vocab_items.term,
    kind: r.vocab_items.kind,
    meaningHu: r.vocab_items.meaning_hu,
    definitionEn: r.vocab_items.definition_en,
    exampleEn: r.vocab_items.example_en,
    contextCorrected: r.context_corrected,
    distractors: [],
  }))

  const { data: test, error } = await supabaseAdmin
    .from('vocab_tests')
    .insert({
      user_id: userId,
      source: ref.kind,
      list_id: ref.kind === 'teacher' ? ref.id : null,
      student_list_id: ref.kind === 'custom' ? ref.id : null,
      item_ids: cards.map((c) => c.itemId),
      word_count: cards.length,
    })
    .select('id')
    .single()
  if (error) throw error
  return { testId: test.id as string, cards }
}

interface TestRow {
  id: string
  item_ids: string[]
  word_count: number
  correct_count: number | null
  finished_at: string | null
}

async function loadOwnTest(userId: string, testId: string): Promise<TestRow> {
  const { data, error } = await supabaseAdmin
    .from('vocab_tests')
    .select('id, item_ids, word_count, correct_count, finished_at')
    .eq('id', testId)
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  if (!data) throw new VocabApiError(404, 'Not found')
  return data as TestRow
}

/**
 * POST test-answer: one answer for a word of the test. The first answer counts; a repeat
 * is ignored. A finished test takes no more answers (409).
 */
export async function recordTestAnswer(userId: string, input: TestAnswerInput, now = new Date()): Promise<void> {
  const test = await loadOwnTest(userId, input.testId)
  if (!test.item_ids.includes(input.itemId)) throw new VocabApiError(404, 'Not found')
  if (test.finished_at) throw new VocabApiError(409, 'The test is finished')

  const { error } = await supabaseAdmin.from('vocab_test_answers').upsert(
    { test_id: test.id, item_id: input.itemId, user_id: userId, correct: input.correct, answered_at: now.toISOString() },
    { onConflict: 'test_id,item_id', ignoreDuplicates: true },
  )
  if (error) throw error
}

/**
 * POST test-finish: scores the test from its saved answers — words left unanswered (the
 * student ended early) count as wrong. Finishing twice returns the first result.
 */
export async function finishTest(userId: string, testId: string, now = new Date()): Promise<TestResult> {
  const test = await loadOwnTest(userId, testId)
  if (test.finished_at && test.correct_count !== null) {
    return { correct: test.correct_count, total: test.word_count, score: testScore(test.correct_count, test.word_count) }
  }

  const { count, error } = await supabaseAdmin
    .from('vocab_test_answers')
    .select('item_id', { count: 'exact', head: true })
    .eq('test_id', test.id)
    .eq('correct', true)
  if (error) throw error
  const correct = Math.min(count ?? 0, test.word_count)

  const { data: updated, error: updateError } = await supabaseAdmin
    .from('vocab_tests')
    .update({ correct_count: correct, finished_at: now.toISOString() })
    .eq('id', test.id)
    .is('finished_at', null)
    .select('correct_count')
  if (updateError) throw updateError
  // Lost a race with a concurrent finish: report what that one stored.
  if (!updated || updated.length === 0) return finishTest(userId, testId, now)
  return { correct, total: test.word_count, score: testScore(correct, test.word_count) }
}
