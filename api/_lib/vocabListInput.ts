import type { CefrLevel } from './prompts.js'
import {
  ITEM_FIELD_MAX_LENGTH,
  LIST_DESCRIPTION_MAX_LENGTH,
  LIST_MAX_ITEMS,
  LIST_TITLE_MAX_LENGTH,
  TERM_MAX_LENGTH,
  VOCAB_POS,
  normalizeTerm,
  termKind,
  type VocabKind,
  type VocabPos,
} from '../../src/lib/vocab.js'

// Validation for the teacher list editor's save (POST/PUT /api/vocab?action=list).
// Pure — no DB access — so it can be checked in isolation. The client dedupes too, but
// the server is the authority (design §5.1, decision 8).

export const CEFR_LEVELS: readonly CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

/** A validated list item, in upsert_teacher_vocab_items' jsonb shape. */
export interface PreparedListItem {
  term: string
  term_normalized: string
  kind: VocabKind
  pos: VocabPos | null
  cefr_level: CefrLevel | null
  meaning_hu: string
  definition_en: string | null
  example_en: string | null
}

export interface PreparedListMeta {
  title: string
  description: string | null
  cefr_level: CefrLevel | null
}

export type Prepared<T> = { ok: true; value: T } | { ok: false; error: string; terms?: string[] }

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

/** Trimmed string or null for missing/blank; undefined when the value has the wrong type. */
function optionalText(v: unknown): string | null | undefined {
  if (v === undefined || v === null) return null
  if (typeof v !== 'string') return undefined
  const trimmed = v.trim()
  return trimmed === '' ? null : trimmed
}

function isCefr(v: unknown): v is CefrLevel {
  return typeof v === 'string' && (CEFR_LEVELS as readonly string[]).includes(v)
}

function isPos(v: unknown): v is VocabPos {
  return typeof v === 'string' && (VOCAB_POS as readonly string[]).includes(v)
}

export function prepareListMeta(body: Record<string, unknown>): Prepared<PreparedListMeta> {
  const title = optionalText(body.title)
  if (!title) return { ok: false, error: 'title is required' }
  if (title.length > LIST_TITLE_MAX_LENGTH) return { ok: false, error: `title is longer than ${LIST_TITLE_MAX_LENGTH} characters` }

  const description = optionalText(body.description)
  if (description === undefined) return { ok: false, error: 'description must be a string' }
  if (description && description.length > LIST_DESCRIPTION_MAX_LENGTH) {
    return { ok: false, error: `description is longer than ${LIST_DESCRIPTION_MAX_LENGTH} characters` }
  }

  const cefr = body.cefrLevel ?? null
  if (cefr !== null && !isCefr(cefr)) return { ok: false, error: 'Invalid cefrLevel' }

  return { ok: true, value: { title, description, cefr_level: cefr } }
}

/**
 * Normalizes, drops empty terms, dedupes on the normalized term (first occurrence wins,
 * order kept), then enforces LIST_MAX_ITEMS and a non-empty Hungarian meaning on every
 * item. An empty list is rejected: a list with nothing to study can't be assigned or
 * completed.
 */
export function prepareListItems(raw: unknown): Prepared<PreparedListItem[]> {
  if (!Array.isArray(raw)) return { ok: false, error: 'items must be an array' }

  const seen = new Set<string>()
  const items: PreparedListItem[] = []
  const missingMeaning: string[] = []

  for (const entry of raw) {
    if (!isRecord(entry) || typeof entry.term !== 'string') {
      return { ok: false, error: 'Each item needs a term string' }
    }
    const term = entry.term.trim().replace(/\s+/g, ' ')
    const termNormalized = normalizeTerm(term)
    if (!termNormalized || seen.has(termNormalized)) continue
    seen.add(termNormalized)

    if (term.length > TERM_MAX_LENGTH) {
      return { ok: false, error: `Terms can be at most ${TERM_MAX_LENGTH} characters`, terms: [term] }
    }

    const meaning = optionalText(entry.meaningHu)
    const definition = optionalText(entry.definitionEn)
    const example = optionalText(entry.exampleEn)
    if (meaning === undefined || definition === undefined || example === undefined) {
      return { ok: false, error: 'meaningHu, definitionEn and exampleEn must be strings', terms: [term] }
    }
    if ([meaning, definition, example].some((f) => f !== null && f.length > ITEM_FIELD_MAX_LENGTH)) {
      return { ok: false, error: `Item fields can be at most ${ITEM_FIELD_MAX_LENGTH} characters`, terms: [term] }
    }

    const pos = entry.pos ?? null
    if (pos !== null && !isPos(pos)) return { ok: false, error: 'Invalid pos', terms: [term] }
    const cefr = entry.cefrLevel ?? null
    if (cefr !== null && !isCefr(cefr)) return { ok: false, error: 'Invalid cefrLevel', terms: [term] }

    if (meaning === null) missingMeaning.push(term)
    items.push({
      term,
      term_normalized: termNormalized,
      kind: termKind(termNormalized),
      pos,
      cefr_level: cefr,
      meaning_hu: meaning ?? '',
      definition_en: definition,
      example_en: example,
    })
  }

  if (items.length === 0) return { ok: false, error: 'The list has no terms' }
  if (items.length > LIST_MAX_ITEMS) {
    return { ok: false, error: `A list can have at most ${LIST_MAX_ITEMS} terms (got ${items.length})` }
  }
  if (missingMeaning.length > 0) {
    return { ok: false, error: 'Every term needs a Hungarian meaning', terms: missingMeaning }
  }
  return { ok: true, value: items }
}
