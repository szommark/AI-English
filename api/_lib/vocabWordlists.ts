import { supabaseAdmin } from './supabaseAdmin.js'
import { callModel } from './modelRouter.js'
import { getModelForFeature } from './modelSettings.js'
import { logModelUsage } from './usageLog.js'
import { buildVocabWordPickPrompt, type CefrLevel } from './prompts.js'
import { parseWordPickJson } from './groq.js'
import { enrichTerms } from './vocabEnrichment.js'
import { newCardFields } from './vocabScheduler.js'
import {
  computeListProgress,
  emailsFor,
  fetchAllPages,
  isComplete,
  loadListTerms,
  loadProgressCards,
  recordCompletions,
} from './vocabListProgress.js'
import { utcDayStart, type ItemContent } from './vocabPractice.js'
import {
  COMPILES_PER_DAY,
  COMPILE_MAX_WORDS,
  COMPILE_MIN_WORDS,
  STUDENT_LIST_MAX_ITEMS,
  VOCAB_TOPIC_PROMPT,
  cardStage,
  isVocabTopicId,
  normalizeTerm,
  termKind,
  type AddToSrsResult,
  type CompileInput,
  type VocabOrigin,
  type WordCard,
  type WordlistDetail,
  type WordlistRef,
  type WordlistSummary,
  type WordlistWord,
  type WordlistsResponse,
} from '../../src/lib/vocab.js'

// My wordlists (design §7.2): the student's own compiled lists, the teacher lists assigned
// to them and the Tutor Bot words as one virtual list. Everything here acts on the
// caller's own lists and cards only. Deleting a list, or a word from it, never touches the
// student's cards: learning progress stays.

export class VocabApiError extends Error {
  constructor(
    readonly status: 400 | 404 | 409 | 429 | 502,
    message: string,
  ) {
    super(message)
  }
}

const notFound = () => new VocabApiError(404, 'Not found')

/** Terms sent as "avoid" when picking words: the student's most recent ones. */
const AVOID_TERMS_MAX = 200
/** Extra terms asked for, so dropping ones the student already has still leaves enough. */
const PICK_SLACK = 3
/** Terms per `in` filter, to keep request URLs short. */
const TERMS_PER_QUERY = 100
const DEFAULT_LEVEL: CefrLevel = 'B1'

const ITEM_COLUMNS =
  'id, term, term_normalized, kind, pos, meaning_hu, definition_en, example_en, cefr_level, enrichment_status, owner_teacher_id'

type ItemRow = ItemContent & { id: string; term_normalized: string }

interface CardRow {
  id: string
  item_id: string
  term_normalized: string
  origin: VocabOrigin
  state: number
  first_learned_at: string | null
  suspended: boolean
  context_original: string | null
  context_corrected: string | null
  created_at: string
}

const CARD_COLUMNS =
  'id, item_id, term_normalized, origin, state, first_learned_at, suspended, context_original, context_corrected, created_at'

/**
 * One word of a list with its content, and the student's card for the term if they have
 * one. Shaped like a session row (term_normalized + vocab_items) so the practice helpers
 * (fillPendingItems, distractorPool) work on it too.
 */
export interface ListWordRow {
  item_id: string
  term_normalized: string
  vocab_items: ItemContent
  /** Tutor Bot cards: what the learner said, and the better version. */
  context_original: string | null
  context_corrected: string | null
  card: WordCard | null
}

function toWordCard(c: CardRow): WordCard {
  return { cardId: c.id, stage: cardStage(c), suspended: c.suspended, origin: c.origin }
}

function toWord(row: ListWordRow): WordlistWord {
  return {
    itemId: row.item_id,
    term: row.vocab_items.term,
    meaningHu: row.vocab_items.meaning_hu,
    exampleEn: row.vocab_items.example_en,
    contextOriginal: row.context_original,
    contextCorrected: row.context_corrected,
    card: row.card,
  }
}

/** The caller's cards for these terms (active and paused), by term. */
async function cardsByTerm(userId: string, terms: string[]): Promise<Map<string, CardRow>> {
  const unique = [...new Set(terms)]
  const cards = new Map<string, CardRow>()
  for (let i = 0; i < unique.length; i += TERMS_PER_QUERY) {
    const { data, error } = await supabaseAdmin
      .from('vocab_cards')
      .select(CARD_COLUMNS)
      .eq('user_id', userId)
      .in('term_normalized', unique.slice(i, i + TERMS_PER_QUERY))
    if (error) throw error
    for (const c of (data ?? []) as CardRow[]) cards.set(c.term_normalized, c)
  }
  return cards
}

/** Every card term of the caller (newest first) with its origin. */
async function deckTerms(userId: string): Promise<{ term_normalized: string; origin: VocabOrigin; created_at: string }[]> {
  return fetchAllPages((from, to) =>
    supabaseAdmin
      .from('vocab_cards')
      .select('term_normalized, origin, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .order('id')
      .range(from, to) as unknown as PromiseLike<{
      data: { term_normalized: string; origin: VocabOrigin; created_at: string }[] | null
      error: unknown
    }>,
  )
}

async function learnerLevel(userId: string): Promise<CefrLevel> {
  const { data, error } = await supabaseAdmin.from('learner_profiles').select('cefr_level').eq('user_id', userId).maybeSingle()
  if (error) throw error
  return (data?.cefr_level as CefrLevel | null) ?? DEFAULT_LEVEL
}

/** Compiles and regenerations since UTC midnight: one vocab_compiles row each. */
export async function compilesToday(userId: string, now = new Date()): Promise<number> {
  const { count, error } = await supabaseAdmin
    .from('vocab_compiles')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', utcDayStart(now).toISOString())
  if (error) throw error
  return count ?? 0
}

// --- Summaries -------------------------------------------------------------------------------

interface StudentListRow {
  id: string
  title: string
  topic: string
  cefr_level: CefrLevel
  created_at: string
}

interface TeacherAssignmentRow {
  list_id: string
  assigned_at: string
  completed_at: string | null
  vocab_lists: {
    id: string
    teacher_id: string
    title: string
    description: string | null
    cefr_level: CefrLevel | null
  } | null
}

function customSummary(list: StudentListRow, terms: string[], deck: Set<string>): WordlistSummary {
  return {
    kind: 'custom',
    id: list.id,
    title: list.title,
    cefrLevel: list.cefr_level,
    topic: list.topic,
    wordCount: terms.length,
    inSrs: terms.filter((t) => deck.has(t)).length,
    createdAt: list.created_at,
    teacher: null,
  }
}

/** Teacher-list summaries with progress, catching up any completion a review missed. */
async function teacherSummaries(userId: string, assignments: TeacherAssignmentRow[], deck: Set<string>): Promise<WordlistSummary[]> {
  const rows = assignments.filter((a) => a.vocab_lists)
  if (rows.length === 0) return []
  const termsByList = await loadListTerms(rows.map((a) => a.list_id))
  const [cards, emails] = await Promise.all([
    loadProgressCards([userId], [...termsByList.values()].flat()),
    emailsFor([...new Set(rows.map((a) => a.vocab_lists!.teacher_id))]),
  ])

  const summaries: WordlistSummary[] = []
  for (const a of rows) {
    const l = a.vocab_lists!
    const terms = [...new Set(termsByList.get(a.list_id) ?? [])]
    const progress = computeListProgress(terms, [userId], cards)
    let completedAt = a.completed_at
    if (!completedAt && isComplete(progress.get(userId)!)) {
      completedAt = (await recordCompletions(a.list_id, progress)).get(userId) ?? null
    }
    summaries.push({
      kind: 'teacher',
      id: l.id,
      title: l.title,
      cefrLevel: l.cefr_level,
      topic: null,
      wordCount: terms.length,
      inSrs: terms.filter((t) => deck.has(t)).length,
      createdAt: a.assigned_at,
      teacher: {
        email: emails.get(l.teacher_id) ?? 'unknown',
        description: l.description,
        progress: progress.get(userId)!,
        completedAt,
      },
    })
  }
  return summaries
}

function conversationsSummary(tutorCards: { created_at: string }[]): WordlistSummary {
  return {
    kind: 'conversations',
    id: null,
    title: '',
    cefrLevel: null,
    topic: null,
    wordCount: tutorCards.length,
    inSrs: tutorCards.length,
    createdAt: tutorCards[0]?.created_at ?? new Date(0).toISOString(),
    teacher: null,
  }
}

const TEACHER_ASSIGNMENT_COLUMNS = 'list_id, assigned_at, completed_at, vocab_lists(id, teacher_id, title, description, cefr_level)'

/** GET wordlists: custom lists (newest first), teacher lists, then the conversations list. */
export async function loadWordlists(userId: string): Promise<WordlistsResponse> {
  const [deck, custom, assigned, level, compiled] = await Promise.all([
    deckTerms(userId),
    supabaseAdmin
      .from('vocab_student_lists')
      .select('id, title, topic, cefr_level, created_at, vocab_student_list_items(vocab_items(term_normalized))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('vocab_list_assignments')
      .select(TEACHER_ASSIGNMENT_COLUMNS)
      .eq('student_id', userId)
      .order('assigned_at', { ascending: false }),
    learnerLevel(userId),
    compilesToday(userId),
  ])
  if (custom.error) throw custom.error
  if (assigned.error) throw assigned.error

  const deckSet = new Set(deck.map((c) => c.term_normalized))
  const customLists = ((custom.data ?? []) as unknown as (StudentListRow & {
    vocab_student_list_items: { vocab_items: { term_normalized: string } | null }[]
  })[]).map((l) =>
    customSummary(
      l,
      l.vocab_student_list_items.flatMap((i) => (i.vocab_items ? [i.vocab_items.term_normalized] : [])),
      deckSet,
    ),
  )
  const teacherLists = await teacherSummaries(userId, (assigned.data ?? []) as unknown as TeacherAssignmentRow[], deckSet)
  const tutorCards = deck.filter((c) => c.origin === 'tutor')

  return {
    lists: [...customLists, ...teacherLists, ...(tutorCards.length > 0 ? [conversationsSummary(tutorCards)] : [])],
    learnerLevel: level,
    compiledToday: compiled,
  }
}

// --- One list's words --------------------------------------------------------------------

async function loadOwnList(userId: string, listId: string): Promise<StudentListRow> {
  const { data, error } = await supabaseAdmin
    .from('vocab_student_lists')
    .select('id, title, topic, cefr_level, created_at')
    .eq('id', listId)
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  if (!data) throw notFound()
  return data as StudentListRow
}

async function withCards(userId: string, items: ItemRow[]): Promise<ListWordRow[]> {
  const cards = await cardsByTerm(
    userId,
    items.map((i) => i.term_normalized),
  )
  return items.map((i) => {
    const card = cards.get(i.term_normalized)
    return {
      item_id: i.id,
      term_normalized: i.term_normalized,
      vocab_items: i,
      context_original: card?.context_original ?? null,
      context_corrected: card?.context_corrected ?? null,
      card: card ? toWordCard(card) : null,
    }
  })
}

async function customListItems(listId: string): Promise<ItemRow[]> {
  const { data, error } = await supabaseAdmin
    .from('vocab_student_list_items')
    .select(`position, vocab_items(${ITEM_COLUMNS})`)
    .eq('list_id', listId)
    .order('position')
    .order('item_id')
  if (error) throw error
  return ((data ?? []) as unknown as { vocab_items: ItemRow | null }[]).flatMap((r) => (r.vocab_items ? [r.vocab_items] : []))
}

/** A list's summary and its words (with their cards), after checking the caller may see it. */
export async function loadListWords(userId: string, ref: WordlistRef): Promise<{ summary: WordlistSummary; rows: ListWordRow[] }> {
  if (ref.kind === 'custom') {
    const list = await loadOwnList(userId, ref.id!)
    const rows = await withCards(userId, await customListItems(list.id))
    const deck = new Set(rows.filter((r) => r.card).map((r) => r.term_normalized))
    return { summary: customSummary(list, rows.map((r) => r.term_normalized), deck), rows }
  }

  if (ref.kind === 'teacher') {
    const { data: assignment, error } = await supabaseAdmin
      .from('vocab_list_assignments')
      .select(TEACHER_ASSIGNMENT_COLUMNS)
      .eq('list_id', ref.id!)
      .eq('student_id', userId)
      .maybeSingle()
    if (error) throw error
    if (!assignment || !(assignment as unknown as TeacherAssignmentRow).vocab_lists) throw notFound()

    const { data, error: itemsError } = await supabaseAdmin
      .from('vocab_list_items')
      .select(`position, vocab_items(${ITEM_COLUMNS})`)
      .eq('list_id', ref.id!)
      .order('position')
      .order('item_id')
    if (itemsError) throw itemsError
    const items = ((data ?? []) as unknown as { vocab_items: ItemRow | null }[]).flatMap((r) => (r.vocab_items ? [r.vocab_items] : []))
    const rows = await withCards(userId, items)
    const deck = new Set(rows.filter((r) => r.card).map((r) => r.term_normalized))
    const [summary] = await teacherSummaries(userId, [assignment as unknown as TeacherAssignmentRow], deck)
    return { summary, rows }
  }

  // Conversations: the Tutor Bot cards themselves, newest first.
  const cards = await fetchAllPages<CardRow & { vocab_items: ItemRow | null }>((from, to) =>
    supabaseAdmin
      .from('vocab_cards')
      .select(`${CARD_COLUMNS}, vocab_items(${ITEM_COLUMNS})`)
      .eq('user_id', userId)
      .eq('origin', 'tutor')
      .order('created_at', { ascending: false })
      .order('id')
      .range(from, to) as unknown as PromiseLike<{ data: (CardRow & { vocab_items: ItemRow | null })[] | null; error: unknown }>,
  )
  const rows = cards
    .filter((c) => c.vocab_items)
    .map((c) => ({
      item_id: c.item_id,
      term_normalized: c.term_normalized,
      vocab_items: c.vocab_items!,
      context_original: c.context_original,
      context_corrected: c.context_corrected,
      card: toWordCard(c),
    }))
  return { summary: conversationsSummary(cards), rows }
}

export async function loadWordlistDetail(userId: string, ref: WordlistRef): Promise<WordlistDetail> {
  const { summary, rows } = await loadListWords(userId, ref)
  return { list: summary, words: rows.map(toWord) }
}

// --- Compiling ---------------------------------------------------------------------------

function topicForPrompt(topic: string): string {
  return isVocabTopicId(topic) ? VOCAB_TOPIC_PROMPT[topic] : topic
}

/** The caller's most recent terms, from their deck and their own lists. */
async function termsToAvoid(userId: string): Promise<Set<string>> {
  const [deck, lists] = await Promise.all([
    deckTerms(userId),
    supabaseAdmin
      .from('vocab_student_lists')
      .select('vocab_student_list_items(vocab_items(term_normalized))')
      .eq('user_id', userId),
  ])
  if (lists.error) throw lists.error
  const listTerms = ((lists.data ?? []) as unknown as {
    vocab_student_list_items: { vocab_items: { term_normalized: string } | null }[]
  }[]).flatMap((l) => l.vocab_student_list_items.flatMap((i) => (i.vocab_items ? [i.vocab_items.term_normalized] : [])))
  return new Set([...listTerms, ...deck.map((c) => c.term_normalized)])
}

interface PickedWords {
  itemIds: string[]
  bankWords: number
  aiWords: number
}

/**
 * Up to `count` random word-bank terms (§5.3) for a fixed topic at this level, none of
 * which the student already has. Custom topics have no bank words. Never throws: on a
 * failure the model picks every word instead.
 */
async function pickFromBank(topic: string, level: CefrLevel, count: number, avoid: Set<string>): Promise<string[]> {
  if (!isVocabTopicId(topic) || count <= 0) return []
  const { data, error } = await supabaseAdmin.rpc('pick_word_bank_terms', {
    p_topic: topic,
    p_level: level,
    p_count: count,
    p_exclude: [...avoid],
  })
  if (error) {
    console.error('Word bank pick failed', { topic, level, error })
    return []
  }
  return ((data ?? []) as { term: string }[]).map((r) => r.term)
}

/** Up to `count` model-picked terms (one call, logged as 'vocab_generate'). Never throws. */
async function pickFromModel(userId: string, topic: string, level: CefrLevel, count: number, avoid: Set<string>): Promise<string[]> {
  const modelId = await getModelForFeature('vocabulary')
  const { systemPrompt, messages } = buildVocabWordPickPrompt(
    topicForPrompt(topic),
    level,
    count + PICK_SLACK,
    [...avoid].slice(0, AVOID_TERMS_MAX),
  )
  try {
    const result = await callModel(modelId, systemPrompt, messages)
    // Logged before parsing: the tokens were spent either way.
    await logModelUsage({ userId, scenarioId: 'vocabulary', callType: 'vocab_generate', modelId, usage: result.usage })
    return parseWordPickJson(result.content)
      .filter((t) => !avoid.has(normalizeTerm(t)))
      .slice(0, count)
  } catch (err) {
    console.error('Vocab word pick failed', { topic, level, error: err })
    return []
  }
}

/**
 * The words for a new or regenerated list (§7.2): word-bank terms first, then the model
 * fills whatever the bank can't (thin topics, C1/C2, custom topics). Checks the daily
 * limit first. Terms are enriched through the shared cache and returned as global item
 * ids, bank words first. Bank words create 'catalog' items, model words 'student' ones —
 * the origin only labels cache rows created now (decision 9).
 */
async function pickWords(userId: string, topic: string, level: CefrLevel, count: number): Promise<PickedWords> {
  if ((await compilesToday(userId)) >= COMPILES_PER_DAY) {
    throw new VocabApiError(429, `At most ${COMPILES_PER_DAY} new word lists per day`)
  }

  const avoid = await termsToAvoid(userId)
  const bank = await pickFromBank(topic, level, count, avoid)
  for (const t of bank) avoid.add(normalizeTerm(t))
  const ai = bank.length < count ? await pickFromModel(userId, topic, level, count - bank.length, avoid) : []
  if (bank.length + ai.length === 0) throw new VocabApiError(502, "Couldn't pick words for this topic; please try again")

  // Never throws on model failure: terms that fail stay 'pending' and are filled in when practised.
  if (bank.length > 0) await enrichTerms(bank, { userId, origin: 'catalog', cefrHint: level })
  if (ai.length > 0) await enrichTerms(ai, { userId, origin: 'student', cefrHint: level })
  const itemIds = await ensureItems([
    ...bank.map((term) => ({ term, origin: 'catalog' as const })),
    ...ai.map((term) => ({ term, origin: 'student' as const })),
  ])
  return { itemIds, bankWords: bank.length, aiWords: ai.length }
}

/** Counts towards the daily limit. Not fatal: the student's list is already saved. */
async function recordCompile(userId: string, listId: string, picked: PickedWords): Promise<void> {
  const { error } = await supabaseAdmin
    .from('vocab_compiles')
    .insert({ user_id: userId, list_id: listId, bank_words: picked.bankWords, ai_words: picked.aiWords })
  if (error) console.error('Failed to record vocab compile', error)
}

/** Global items for these terms (find-or-create), in the given order. */
async function ensureItems(terms: { term: string; origin: VocabOrigin }[]): Promise<string[]> {
  const { data, error } = await supabaseAdmin.rpc('ensure_global_vocab_items', {
    p_items: terms.map(({ term, origin }) => {
      const termNormalized = normalizeTerm(term)
      return { term, term_normalized: termNormalized, kind: termKind(termNormalized), origin }
    }),
  })
  if (error) throw error
  const byTerm = new Map(((data ?? []) as { id: string; term_normalized: string }[]).map((i) => [i.term_normalized, i.id]))
  return [...new Set(terms.flatMap(({ term }) => byTerm.get(normalizeTerm(term)) ?? []))]
}

async function insertListItems(listId: string, itemIds: string[], firstPosition: number): Promise<void> {
  if (itemIds.length === 0) return
  const { error } = await supabaseAdmin
    .from('vocab_student_list_items')
    .insert(itemIds.map((item_id, i) => ({ list_id: listId, item_id, position: firstPosition + i })))
  if (error) throw error
}

async function touchList(listId: string): Promise<void> {
  const { error } = await supabaseAdmin.from('vocab_student_lists').update({ updated_at: new Date().toISOString() }).eq('id', listId)
  if (error) throw error
}

/** POST wordlist-compile: picks the words and saves the list (input already validated). */
export async function compileWordlist(userId: string, input: CompileInput): Promise<WordlistDetail> {
  const picked = await pickWords(userId, input.topic, input.cefrLevel, input.count)

  const { data: list, error } = await supabaseAdmin
    .from('vocab_student_lists')
    .insert({ user_id: userId, title: input.title, topic: input.topic, cefr_level: input.cefrLevel })
    .select('id')
    .single()
  if (error) throw error
  await insertListItems(list.id as string, picked.itemIds, 0)
  await recordCompile(userId, list.id as string, picked)
  return loadWordlistDetail(userId, { kind: 'custom', id: list.id as string })
}

/** POST wordlist-regenerate: a fresh set of words (same topic, level and size) replaces the list's words. */
export async function regenerateWordlist(userId: string, listId: string): Promise<WordlistDetail> {
  const list = await loadOwnList(userId, listId)
  const current = await customListItems(listId)
  const count = Math.min(COMPILE_MAX_WORDS, Math.max(COMPILE_MIN_WORDS, current.length || COMPILE_MAX_WORDS))
  // The current words are in the avoid set too (they're list terms), so the set is fresh.
  const picked = await pickWords(userId, list.topic, list.cefr_level, count)

  const { error } = await supabaseAdmin.from('vocab_student_list_items').delete().eq('list_id', listId)
  if (error) throw error
  await insertListItems(listId, picked.itemIds, 0)
  await recordCompile(userId, listId, picked)
  await touchList(listId)
  return loadWordlistDetail(userId, { kind: 'custom', id: listId })
}

// --- Editing a custom list -----------------------------------------------------------------

export async function renameWordlist(userId: string, listId: string, title: string): Promise<WordlistDetail> {
  const { data, error } = await supabaseAdmin
    .from('vocab_student_lists')
    .update({ title, updated_at: new Date().toISOString() })
    .eq('id', listId)
    .eq('user_id', userId)
    .select('id')
  if (error) throw error
  if (!data || data.length === 0) throw notFound()
  return loadWordlistDetail(userId, { kind: 'custom', id: listId })
}

/** Deletes the list and its word rows; the student's cards stay (decision in design §7.2). */
export async function deleteWordlist(userId: string, listId: string): Promise<void> {
  const { data, error } = await supabaseAdmin.from('vocab_student_lists').delete().eq('id', listId).eq('user_id', userId).select('id')
  if (error) throw error
  if (!data || data.length === 0) throw notFound()
}

/** POST wordlist-word: adds a typed word (enriched through the cache) to the end of the list. */
export async function addWordToList(userId: string, listId: string, term: string): Promise<WordlistDetail> {
  const list = await loadOwnList(userId, listId)
  const items = await customListItems(listId)
  const termNormalized = normalizeTerm(term)
  if (items.some((i) => i.term_normalized === termNormalized)) throw new VocabApiError(409, 'Already in the list')
  if (items.length >= STUDENT_LIST_MAX_ITEMS) {
    throw new VocabApiError(400, `At most ${STUDENT_LIST_MAX_ITEMS} words per list`)
  }

  await enrichTerms([term], { userId, origin: 'student', cefrHint: list.cefr_level })
  const [itemId] = await ensureItems([{ term, origin: 'student' }])
  if (!itemId) throw new Error(`No item for "${term}"`)

  const { data: last, error } = await supabaseAdmin
    .from('vocab_student_list_items')
    .select('position')
    .eq('list_id', listId)
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  await insertListItems(listId, [itemId], ((last?.position as number | undefined) ?? -1) + 1)
  await touchList(listId)
  return loadWordlistDetail(userId, { kind: 'custom', id: listId })
}

/** DELETE wordlist-word: takes a word off the list; its card, if any, stays. */
export async function removeWordFromList(userId: string, listId: string, itemId: string): Promise<WordlistDetail> {
  await loadOwnList(userId, listId)
  const { data, error } = await supabaseAdmin
    .from('vocab_student_list_items')
    .delete()
    .eq('list_id', listId)
    .eq('item_id', itemId)
    .select('item_id')
  if (error) throw error
  if (!data || data.length === 0) throw notFound()
  await touchList(listId)
  return loadWordlistDetail(userId, { kind: 'custom', id: listId })
}

/**
 * POST wordlist-srs: cards (origin 'student', FSRS New, due now) for the list's words the
 * student has no card for yet. Existing cards — any origin, paused or not — are left as
 * they are, like Tutor Bot words (§4.3). Teacher lists join automatically on assignment
 * and conversation words already are cards, so only custom lists take this.
 */
export async function addListToSrs(userId: string, listId: string): Promise<AddToSrsResult> {
  const { rows } = await loadListWords(userId, { kind: 'custom', id: listId })
  const missing = rows.filter((r) => !r.card)
  const now = new Date()

  let cardsCreated = 0
  if (missing.length > 0) {
    const { data, error } = await supabaseAdmin
      .from('vocab_cards')
      .upsert(
        missing.map((r) => ({
          user_id: userId,
          item_id: r.item_id,
          term_normalized: r.term_normalized,
          origin: 'student',
          ...newCardFields(now),
          ladder_step: 1,
        })),
        { onConflict: 'user_id,term_normalized', ignoreDuplicates: true },
      )
      .select('id')
    if (error) throw error
    cardsCreated = data?.length ?? 0
  }

  return {
    cardsCreated,
    alreadyInSrs: rows.length - missing.length,
    detail: await loadWordlistDetail(userId, { kind: 'custom', id: listId }),
  }
}
