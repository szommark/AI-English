import { supabaseAdmin } from './supabaseAdmin.js'
import { callModel } from './modelRouter.js'
import { getModelForFeature } from './modelSettings.js'
import { logModelUsage } from './usageLog.js'
import { buildDanishVocabPrompt, type CefrLevel } from './prompts.js'
import { parseDanishVocabJson, type DanishVocabEntry } from './groq.js'
import { getModelEntry, type ModelId } from '../../src/lib/models.js'
import {
  DA_GENERATE_BATCH_SIZE,
  DA_GENERATE_MAX_TOKENS,
  DA_LEVELS,
  DA_PICK_SLACK,
  DA_STORED_POOL_MAX,
  DA_TOKENS_PER_CARD,
  DA_TOP_FREQUENCY_TOPIC,
  DA_TOPIC_PROMPT,
  bareKey,
  isDaLevel,
  isDaTopicId,
  keyLanguage,
  normalizeTerm,
  stripDanishMarker,
  termKey,
  type ListLevel,
  type VocabOrigin,
} from '../../src/lib/vocab.js'

// Danish words for the Vocabulary Builder (Danish Phase 1). Danish items are global
// vocab_items rows with target_language 'da' and a 'da:' key (termKey). They are made by
// the model once — picked and filled in by one call — stored with review_status
// 'needs_review' and reused by every later compile, so a topic and level that already has
// enough stored words costs nothing. Danish items are always stored complete
// (enrichment_status 'done'): nothing here leaves a pending row for the English
// enrichment to pick up. The English word bank is never used for Danish.

/** Terms per `in` filter, to keep request URLs short. */
const KEYS_PER_QUERY = 100
/** Cards one call may ask for: the batch size, capped by what the output budget fits. */
const MAX_CARDS_PER_CALL = Math.min(DA_GENERATE_BATCH_SIZE, Math.floor(DA_GENERATE_MAX_TOKENS / DA_TOKENS_PER_CARD))
/** Avoid-list words sent to the model (the learner's Danish words). */
const AVOID_WORDS_MAX = 200

/** A Danish list's levels: one of DA_LEVELS, or all of them for 'mixed' (or an English level). */
export function danishLevels(level: ListLevel): CefrLevel[] {
  return isDaLevel(level) ? [level] : [...DA_LEVELS]
}

/** How a Danish topic is stored in vocab_items.topics: fixed ids as they are, the learner's own lowercased. */
export function danishTopicTag(topic: string): string {
  // Commas, braces and quotes would break the PostgREST array filter (contains).
  return isDaTopicId(topic) || topic === DA_TOP_FREQUENCY_TOPIC ? topic : normalizeTerm(topic.replace(/[,{}"]/g, ' '))
}

function topicForPrompt(topic: string): string | null {
  if (topic === DA_TOP_FREQUENCY_TOPIC) return null
  return isDaTopicId(topic) ? DA_TOPIC_PROMPT[topic] : topic
}

/** Ids of stored Danish items by key. */
async function danishItemIds(keys: string[]): Promise<Map<string, string>> {
  const ids = new Map<string, string>()
  const unique = [...new Set(keys)]
  for (let i = 0; i < unique.length; i += KEYS_PER_QUERY) {
    const { data, error } = await supabaseAdmin
      .from('vocab_items')
      .select('id, term_normalized')
      .is('owner_teacher_id', null)
      .eq('target_language', 'da')
      .eq('enrichment_status', 'done')
      .in('term_normalized', unique.slice(i, i + KEYS_PER_QUERY))
    if (error) throw error
    for (const row of (data ?? []) as { id: string; term_normalized: string }[]) ids.set(row.term_normalized, row.id)
  }
  return ids
}

/** Random stored Danish items of this topic at these levels whose keys aren't in `avoid`. */
async function pickStored(topicTag: string, levels: CefrLevel[], count: number, avoid: Set<string>): Promise<{ id: string; key: string }[]> {
  if (count <= 0) return []
  const { data, error } = await supabaseAdmin
    .from('vocab_items')
    .select('id, term_normalized')
    .is('owner_teacher_id', null)
    .eq('target_language', 'da')
    .eq('enrichment_status', 'done')
    .in('cefr_level', levels)
    .contains('topics', [topicTag])
    .limit(DA_STORED_POOL_MAX)
  if (error) throw error
  const pool = ((data ?? []) as { id: string; term_normalized: string }[]).filter((r) => !avoid.has(r.term_normalized))
  // Fisher–Yates: a fresh random choice per compile, so two learners' lists differ.
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, count).map((r) => ({ id: r.id, key: r.term_normalized }))
}

/**
 * Stores new Danish cards (needs_review) and returns every card's item id by key. A word
 * that is already stored keeps its row: a reviewed one is never overwritten (the upsert
 * skips it), and its id is read back.
 */
async function storeCards(entries: DanishVocabEntry[], modelId: ModelId, origin: VocabOrigin, topics: string[]): Promise<Map<string, string>> {
  if (entries.length === 0) return new Map()
  const providerModelId = getModelEntry(modelId).providerModelId
  const { error } = await supabaseAdmin.rpc('upsert_global_vocab_items', {
    p_items: entries.map((e) => ({
      term: e.term,
      term_normalized: e.termNormalized,
      kind: e.kind,
      pos: e.pos,
      cefr_level: e.cefrLevel,
      meaning_hu: e.meaningHu,
      // Column reuse (migration 20261119120000): the English gloss and the Danish example.
      definition_en: e.meaningEn,
      example_en: e.exampleDa,
      origin,
      enrichment_model_id: providerModelId,
      target_language: 'da',
      review_status: 'needs_review',
      article: e.article,
      pronunciation_hint: e.pronunciationHint,
      example_hu: e.exampleHu,
      verb_forms: e.verbForms,
      topics,
    })),
  })
  if (error) throw error
  return danishItemIds(entries.map((e) => e.termNormalized))
}

/** One generation call (logged as `callType`). Never throws: a failed call yields no cards. */
async function generate(
  userId: string,
  modelId: ModelId,
  request: Parameters<typeof buildDanishVocabPrompt>[0],
  avoid: Set<string>,
  callType: 'vocab_generate' | 'vocab_enrich',
): Promise<{ entries: DanishVocabEntry[]; failed: string[] }> {
  const { systemPrompt, messages } = buildDanishVocabPrompt(request)
  try {
    const result = await callModel(modelId, systemPrompt, messages, {
      maxTokens: DA_GENERATE_MAX_TOKENS,
      reasoningEffort: 'low',
      temperature: 0.4,
    })
    // Logged before parsing: the tokens were spent either way.
    await logModelUsage({ userId, scenarioId: 'vocabulary', callType, modelId, usage: result.usage })
    const parsed = parseDanishVocabJson(result.content, { levels: request.levels, avoid, inputTerms: request.terms })
    if (parsed.dropped > 0) console.error('Danish vocab reply had invalid cards', { dropped: parsed.dropped, kept: parsed.entries.length })
    return parsed
  } catch (err) {
    console.error('Danish vocab generation failed', { topic: request.topic, terms: request.terms, error: err })
    return { entries: [], failed: request.terms ?? [] }
  }
}

export interface DanishPick {
  itemIds: string[]
  /** Reused stored items. */
  storedWords: number
  /** Generated now. */
  aiWords: number
}

/**
 * The words for a new Danish list, or for adding to one: stored Danish items of the topic
 * at these levels first, none of which the learner has (`avoid`: their keys); the model
 * generates only the shortfall (plus DA_PICK_SLACK, at most MAX_CARDS_PER_CALL), and the
 * new cards are stored for everyone's later compiles. Stored items come first.
 */
export async function pickDanishWords(
  userId: string,
  topic: string,
  levels: CefrLevel[],
  count: number,
  avoid: Set<string>,
): Promise<DanishPick> {
  const topicTag = danishTopicTag(topic)
  const stored = await pickStored(topicTag, levels, count, avoid)
  const shortfall = count - stored.length
  if (shortfall <= 0) return { itemIds: stored.map((s) => s.id), storedWords: stored.length, aiWords: 0 }

  for (const s of stored) avoid.add(s.key)
  const modelId = await getModelForFeature('vocabulary')
  const avoidWords = [...avoid].filter((k) => keyLanguage(k) === 'da').slice(0, AVOID_WORDS_MAX).map(bareKey)
  const { entries } = await generate(
    userId,
    modelId,
    { topic: topicForPrompt(topic), levels, count: Math.min(shortfall + DA_PICK_SLACK, MAX_CARDS_PER_CALL), avoid: avoidWords },
    avoid,
    'vocab_generate',
  )
  const ids = await storeCards(entries, modelId, 'student', [topicTag])
  const fresh = entries.flatMap((e) => (ids.has(e.termNormalized) ? [ids.get(e.termNormalized)!] : [])).slice(0, shortfall)
  return { itemIds: [...stored.map((s) => s.id), ...fresh], storedWords: stored.length, aiWords: fresh.length }
}

/** Both keys a typed Danish word may have: as typed ("en gang") and without a leading en/et/at ("hus"). */
export function typedDanishKeys(term: string): string[] {
  return [...new Set([termKey(term, 'da'), termKey(stripDanishMarker(term), 'da')].filter(Boolean))]
}

/**
 * Item ids for Danish words a learner typed: stored items are reused (matched as typed,
 * or without a leading article / "at"); the rest are made in one call (card mode, logged
 * as 'vocab_enrich') and stored as needs_review with no topic, so they never turn up in a
 * topic compile. Words the model couldn't make a valid card for come back in `failed`.
 */
export async function resolveTypedDanishWords(
  userId: string,
  terms: string[],
): Promise<{ resolved: { term: string; itemId: string; key: string }[]; failed: string[] }> {
  const stored = await danishItemIds(terms.flatMap(typedDanishKeys))
  const resolved: { term: string; itemId: string; key: string }[] = []
  const misses: string[] = []
  for (const term of terms) {
    const key = typedDanishKeys(term).find((k) => stored.has(k))
    if (key) resolved.push({ term, itemId: stored.get(key)!, key })
    else misses.push(term)
  }
  if (misses.length === 0) return { resolved, failed: [] }

  const modelId = await getModelForFeature('vocabulary')
  const failed: string[] = []
  for (let i = 0; i < misses.length; i += MAX_CARDS_PER_CALL) {
    const batch = misses.slice(i, i + MAX_CARDS_PER_CALL)
    const { entries, failed: batchFailed } = await generate(
      userId,
      modelId,
      { topic: null, levels: [...DA_LEVELS], count: batch.length, avoid: [], terms: batch },
      new Set(),
      'vocab_enrich',
    )
    failed.push(...batchFailed)
    const ids = await storeCards(entries, modelId, 'student', [])
    for (const term of batch) {
      const key = typedDanishKeys(term).find((k) => ids.has(k))
      if (key) resolved.push({ term, itemId: ids.get(key)!, key })
      else if (!batchFailed.includes(term)) failed.push(term)
    }
  }
  const order = new Map(terms.map((t, i) => [t, i]))
  resolved.sort((a, b) => order.get(a.term)! - order.get(b.term)!)
  return { resolved, failed }
}
