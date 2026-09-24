import { supabaseAdmin } from './supabaseAdmin.js'
import { callModel } from './modelRouter.js'
import { getModelForFeature } from './modelSettings.js'
import { logModelUsage } from './usageLog.js'
import { buildVocabEnrichmentPrompt, type CefrLevel } from './prompts.js'
import { parseVocabEnrichmentJson, type VocabEnrichmentEntry } from './groq.js'
import { getModelEntry, type ModelId } from '../../src/lib/models.js'
import {
  ENRICH_BATCH_SIZE,
  LIST_MAX_ITEMS,
  normalizeTerm,
  termKind,
  type EnrichResult,
  type VocabOrigin,
  type VocabPos,
} from '../../src/lib/vocab.js'

// Fills Hungarian meaning, simple definition, example, part of speech and CEFR guess for
// a batch of terms (docs/vocabulary-builder-design.md §4.2). Global vocab_items rows are
// the shared cache: a term that is already enriched costs no model call.

interface GlobalItemRow {
  term_normalized: string
  kind: string
  pos: string | null
  cefr_level: string | null
  meaning_hu: string | null
  definition_en: string | null
  example_en: string | null
}

interface UniqueTerm {
  term: string
  termNormalized: string
}

/** Normalizes, drops empties, dedupes (first spelling wins) and caps at LIST_MAX_ITEMS. */
function uniqueTerms(terms: string[]): UniqueTerm[] {
  const seen = new Map<string, UniqueTerm>()
  for (const raw of terms) {
    const termNormalized = normalizeTerm(raw)
    if (!termNormalized || seen.has(termNormalized)) continue
    seen.set(termNormalized, { term: raw.trim().replace(/\s+/g, ' '), termNormalized })
  }
  return [...seen.values()].slice(0, LIST_MAX_ITEMS)
}

async function loadCachedItems(normalizedTerms: string[]): Promise<Map<string, GlobalItemRow>> {
  const cached = new Map<string, GlobalItemRow>()
  if (normalizedTerms.length === 0) return cached

  const { data, error } = await supabaseAdmin
    .from('vocab_items')
    .select('term_normalized, kind, pos, cefr_level, meaning_hu, definition_en, example_en')
    .is('owner_teacher_id', null)
    .eq('enrichment_status', 'done')
    .in('term_normalized', normalizedTerms)

  if (error) {
    // Not fatal: every term is treated as a miss and re-enriched.
    console.error('Failed to read vocab enrichment cache', error)
    return cached
  }
  for (const row of (data ?? []) as GlobalItemRow[]) {
    // The global unique key is (term_normalized, kind); only the kind we'd write counts.
    if (row.kind === termKind(row.term_normalized)) cached.set(row.term_normalized, row)
  }
  return cached
}

/** One model call for one batch. Never throws: a failed batch yields no entries. */
async function enrichBatch(
  batch: UniqueTerm[],
  modelId: ModelId,
  userId: string,
  cefrHint: CefrLevel | undefined,
): Promise<Map<string, VocabEnrichmentEntry>> {
  const terms = batch.map((t) => t.term)
  try {
    const { systemPrompt, messages } = buildVocabEnrichmentPrompt(terms, cefrHint)
    const result = await callModel(modelId, systemPrompt, messages)
    // Logged before parsing: the tokens were spent even if the reply turns out unusable.
    await logModelUsage({ userId, scenarioId: 'vocabulary', callType: 'vocab_enrich', modelId, usage: result.usage })
    const { entries, failed } = parseVocabEnrichmentJson(result.content, terms)
    if (failed.length > 0) console.error('Vocab enrichment returned no valid entry for some terms', { failed })
    return entries
  } catch (err) {
    console.error('Vocab enrichment batch failed', { terms, error: err })
    return new Map()
  }
}

async function writeToCache(entries: VocabEnrichmentEntry[], modelId: ModelId, origin: VocabOrigin): Promise<void> {
  if (entries.length === 0) return
  const providerModelId = getModelEntry(modelId).providerModelId
  const { error } = await supabaseAdmin.rpc('upsert_global_vocab_items', {
    p_items: entries.map((e) => ({
      term: e.term,
      term_normalized: e.termNormalized,
      kind: e.kind,
      pos: e.pos,
      cefr_level: e.cefrLevel,
      meaning_hu: e.meaningHu,
      definition_en: e.definitionEn,
      example_en: e.exampleEn,
      origin,
      enrichment_model_id: providerModelId,
    })),
  })
  // Not surfaced to the caller: the enrichment itself succeeded, it just won't be cached.
  if (error) console.error('Failed to write vocab enrichment cache', error)
}

/** `origin` is stored on new global cache rows; 'catalog' is reserved for reviewed catalog items (design decision 9). */
export async function enrichTerms(
  terms: string[],
  opts: { userId: string; origin: VocabOrigin; cefrHint?: CefrLevel },
): Promise<EnrichResult[]> {
  const unique = uniqueTerms(terms)
  const cached = await loadCachedItems(unique.map((t) => t.termNormalized))
  const misses = unique.filter((t) => !cached.has(t.termNormalized))

  const enriched = new Map<string, VocabEnrichmentEntry>()
  if (misses.length > 0) {
    const modelId = await getModelForFeature('vocabulary')
    // Sequential on purpose: Groq's per-minute token limit is the binding constraint.
    for (let i = 0; i < misses.length; i += ENRICH_BATCH_SIZE) {
      const entries = await enrichBatch(misses.slice(i, i + ENRICH_BATCH_SIZE), modelId, opts.userId, opts.cefrHint)
      await writeToCache([...entries.values()], modelId, opts.origin)
      for (const [key, entry] of entries) enriched.set(key, entry)
    }
  }

  return unique.map(({ term, termNormalized }): EnrichResult => {
    const hit = cached.get(termNormalized)
    if (hit) {
      return {
        term,
        termNormalized,
        kind: termKind(termNormalized),
        pos: hit.pos as VocabPos | null,
        cefrLevel: hit.cefr_level as CefrLevel | null,
        meaningHu: hit.meaning_hu,
        definitionEn: hit.definition_en,
        exampleEn: hit.example_en,
        status: 'done',
        fromCache: true,
      }
    }

    const entry = enriched.get(termNormalized)
    return {
      term,
      termNormalized,
      kind: termKind(termNormalized),
      pos: entry?.pos ?? null,
      cefrLevel: entry?.cefrLevel ?? null,
      meaningHu: entry?.meaningHu ?? null,
      definitionEn: entry?.definitionEn ?? null,
      exampleEn: entry?.exampleEn ?? null,
      status: entry ? 'done' : 'failed',
      fromCache: false,
    }
  })
}
