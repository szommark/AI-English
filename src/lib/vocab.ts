// Vocabulary Builder helpers and constants shared by the client and api/ — same
// cross-boundary pattern as src/lib/types.ts. See docs/vocabulary-builder-design.md.
import type { CefrLevel } from '../data/grammarCurriculum.js'

// Design doc §11 — initial values, all tuneable.
export const ENRICH_BATCH_SIZE = 15
export const LIST_MAX_ITEMS = 100
export const REQUEST_RETENTION = 0.9
export const FAST_ANSWER_MS = 4000
export const NEW_CARDS_PER_DAY = 10
export const MAX_REVIEWS_PER_SESSION = 40
export const MAX_TUTOR_ITEMS_PER_SESSION = 5
export const MASTERED_STABILITY_DAYS = 21
export const TUTOR_TARGET_WORDS = 4

export type VocabKind = 'word' | 'phrase'

// Must match the `origin` check constraints in
// supabase/migrations/20260924120000_vocabulary_builder.sql exactly.
export type VocabOrigin = 'catalog' | 'teacher' | 'tutor'

// Must match the `vocab_reviews.exercise` check constraint exactly.
export type VocabExercise = 'recognition' | 'recall' | 'context' | 'listening' | 'production' | 'conversation'

export const VOCAB_POS = ['noun', 'verb', 'adjective', 'adverb', 'phrase', 'other'] as const
export type VocabPos = (typeof VOCAB_POS)[number]

/** One vocab_items row, camelCased for API responses. */
export interface VocabItem {
  id: string
  term: string
  termNormalized: string
  kind: VocabKind
  pos: VocabPos | null
  cefrLevel: CefrLevel | null
  topics: string[]
  meaningHu: string | null
  definitionEn: string | null
  exampleEn: string | null
  origin: VocabOrigin
  ownerTeacherId: string | null
  enrichmentStatus: 'pending' | 'done' | 'failed'
}

/** One entry of POST /api/vocab?action=enrich's response, in request order. */
export interface EnrichResult {
  term: string
  termNormalized: string
  kind: VocabKind
  pos: VocabPos | null
  cefrLevel: CefrLevel | null
  meaningHu: string | null
  definitionEn: string | null
  exampleEn: string | null
  status: 'done' | 'failed'
  fromCache: boolean
}

const EDGE_PUNCTUATION = /^[\p{P}\p{S}\s]+|[\p{P}\p{S}\s]+$/gu

/**
 * Canonical form used for dedup and cache lookups: trimmed, lowercased, internal
 * whitespace collapsed, surrounding punctuation stripped. Internal apostrophes and
 * hyphens survive ("don't", "well-known"); typographic apostrophes become ASCII ones
 * so "don’t" and "don't" are the same term. Returns '' for punctuation-only input.
 */
export function normalizeTerm(raw: string): string {
  return raw
    .replace(/[‘’ʼ]/g, "'")
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(EDGE_PUNCTUATION, '')
}

export function termKind(term: string): VocabKind {
  return normalizeTerm(term).includes(' ') ? 'phrase' : 'word'
}
