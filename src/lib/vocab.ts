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

// --- Teacher word lists (Phase 2, design §5.1) -------------------------------------------

export const LIST_TITLE_MAX_LENGTH = 120
export const LIST_DESCRIPTION_MAX_LENGTH = 1000
export const TERM_MAX_LENGTH = 100
/** Meaning, definition and example sentence. */
export const ITEM_FIELD_MAX_LENGTH = 500

/** One row of the list editor, as sent to POST/PUT /api/vocab?action=list. */
export interface VocabListItemInput {
  term: string
  meaningHu: string
  definitionEn?: string | null
  exampleEn?: string | null
  pos?: VocabPos | null
  cefrLevel?: CefrLevel | null
}

/** Body of POST /api/vocab?action=list (create) and PUT ...&id= (update). */
export interface VocabListInput {
  title: string
  description?: string | null
  cefrLevel?: CefrLevel | null
  items: VocabListItemInput[]
}

export interface VocabList {
  id: string
  title: string
  description: string | null
  cefrLevel: CefrLevel | null
  archivedAt: string | null
  createdAt: string
  updatedAt: string
}

/** One entry of GET /api/vocab?action=lists. */
export interface VocabListSummary extends VocabList {
  termCount: number
  assignedCount: number
  completedCount: number
  /** Learned cards summed over assigned students; out of termCount × assignedCount. */
  learned: number
}

export interface VocabListItemRow {
  itemId: string
  term: string
  termNormalized: string
  meaningHu: string | null
  definitionEn: string | null
  exampleEn: string | null
  pos: VocabPos | null
  cefrLevel: CefrLevel | null
  position: number
}

/** Per student per list (design §6.2): matched on term_normalized, not item_id. */
export interface VocabListProgress {
  learned: number
  started: number
  total: number
}

export interface VocabListAssignment extends VocabListProgress {
  studentId: string
  email: string
  assignedAt: string
  completedAt: string | null
  /** false once the student disconnected; the assignment and progress stay. */
  connected: boolean
}

/** GET /api/vocab?action=list&id= (also returned by create/update). */
export interface VocabListDetail {
  list: VocabList
  items: VocabListItemRow[]
  assignments: VocabListAssignment[]
}

export interface VocabCardCounts {
  cardsCreated: number
  cardsUpgraded: number
  cardsUnchanged: number
}

/** POST /api/vocab?action=assign. */
export interface VocabAssignResult extends VocabCardCounts {
  studentCount: number
  assignmentsCreated: number
}

/** PUT /api/vocab?action=list&id=: cards created for terms added to an assigned list. */
export interface VocabListUpdateResult extends VocabListDetail {
  addedTermCards: VocabCardCounts | null
}

/** One entry of GET /api/vocab?action=student-lists&studentId=. */
export interface VocabStudentListProgress extends VocabListProgress {
  listId: string
  title: string
  cefrLevel: CefrLevel | null
  archivedAt: string | null
  assignedAt: string
  completedAt: string | null
}
