import type { CefrLevel } from '../data/grammarCurriculum'
import type { ImportedRow } from './vocabImport'
import {
  LIST_MAX_ITEMS,
  normalizeTerm,
  type EnrichResult,
  type VocabListDetail,
  type VocabListInput,
  type VocabPos,
} from './vocab'
import type { MessageKey } from './i18n'

// Pure state helpers for the word-list editor's preview table (design §5.1).

export type EnrichState = 'pending' | 'loading' | 'done' | 'failed'
type FillableField = 'meaningHu' | 'exampleEn' | 'cefrLevel' | 'definitionEn' | 'pos'

export interface DraftRow {
  key: number
  term: string
  meaningHu: string
  exampleEn: string
  cefrLevel: CefrLevel | ''
  /** Not shown in the table, but saved (Phase 3 uses it). */
  definitionEn: string
  pos: VocabPos | null
  enrich: EnrichState
  /** The normalized term the current enrichment was requested/applied for. */
  enrichedFor: string
  /** Fields filled by enrichment (not typed by the teacher): cleared if the term changes. */
  autoFilled: FillableField[]
}

let nextKey = 1
const newKey = () => nextKey++

function needsEnrichment(r: Pick<DraftRow, 'meaningHu' | 'exampleEn' | 'cefrLevel' | 'definitionEn'>): boolean {
  return !r.meaningHu.trim() || !r.exampleEn.trim() || !r.cefrLevel || !r.definitionEn.trim()
}

function draftFromImported(row: ImportedRow): DraftRow {
  const draft: DraftRow = {
    key: newKey(),
    term: row.term,
    meaningHu: row.meaningHu ?? '',
    exampleEn: row.exampleEn ?? '',
    cefrLevel: row.cefrLevel ?? '',
    definitionEn: '',
    pos: null,
    enrich: 'pending',
    enrichedFor: normalizeTerm(row.term),
    autoFilled: [],
  }
  if (!needsEnrichment(draft)) draft.enrich = 'done'
  return draft
}

export function rowsFromDetail(detail: VocabListDetail): DraftRow[] {
  return detail.items.map((i) => ({
    key: newKey(),
    term: i.term,
    meaningHu: i.meaningHu ?? '',
    exampleEn: i.exampleEn ?? '',
    cefrLevel: i.cefrLevel ?? '',
    definitionEn: i.definitionEn ?? '',
    pos: i.pos,
    enrich: 'done',
    enrichedFor: i.termNormalized,
    autoFilled: [],
  }))
}

export interface AddOutcome {
  rows: DraftRow[]
  added: number
  duplicates: number
  overLimit: number
}

/** Appends imported rows, skipping terms already present (or repeated) and anything past LIST_MAX_ITEMS. */
export function addImportedRows(rows: DraftRow[], incoming: ImportedRow[]): AddOutcome {
  const seen = new Set(rows.map((r) => normalizeTerm(r.term)).filter(Boolean))
  const next = [...rows]
  let duplicates = 0
  let overLimit = 0
  for (const row of incoming) {
    const norm = normalizeTerm(row.term)
    if (!norm) continue
    if (seen.has(norm)) {
      duplicates++
      continue
    }
    if (next.length >= LIST_MAX_ITEMS) {
      overLimit++
      continue
    }
    seen.add(norm)
    next.push(draftFromImported(row))
  }
  return { rows: next, added: next.length - rows.length, duplicates, overLimit }
}

/** Fills only blank fields from an enrichment result; never overwrites what the teacher typed. */
export function applyEnrichment(row: DraftRow, result: EnrichResult | undefined): DraftRow {
  // The term was edited while the request was in flight: enrich the new term instead.
  if (normalizeTerm(row.term) !== row.enrichedFor) return { ...row, enrich: 'pending', enrichedFor: normalizeTerm(row.term) }
  if (!result || result.status !== 'done') return { ...row, enrich: 'failed' }

  const next: DraftRow = { ...row, enrich: 'done', autoFilled: [...row.autoFilled] }
  const fill = <K extends FillableField>(field: K, value: DraftRow[K] | null) => {
    const current = next[field]
    const blank = typeof current === 'string' ? current.trim() === '' : current === null
    if (blank && value) {
      next[field] = value
      next.autoFilled.push(field)
    }
  }
  fill('meaningHu', result.meaningHu)
  fill('exampleEn', result.exampleEn)
  fill('cefrLevel', result.cefrLevel)
  fill('definitionEn', result.definitionEn)
  fill('pos', result.pos)
  return next
}

/**
 * After the teacher finishes editing a term: if it now names a different word, drop the
 * fields enrichment filled for the old word and queue it for enrichment again.
 */
export function termCommitted(row: DraftRow): DraftRow {
  const norm = normalizeTerm(row.term)
  if (!norm || norm === row.enrichedFor || row.enrich === 'pending' || row.enrich === 'loading') return row
  const next: DraftRow = { ...row, enrichedFor: norm, autoFilled: [] }
  for (const field of row.autoFilled) {
    if (field === 'pos') next.pos = null
    else next[field] = ''
  }
  next.enrich = needsEnrichment(next) ? 'pending' : 'done'
  return next
}

/** Normalized terms that appear in more than one row. */
export function duplicateTerms(rows: DraftRow[]): Set<string> {
  const counts = new Map<string, number>()
  for (const r of rows) {
    const n = normalizeTerm(r.term)
    if (n) counts.set(n, (counts.get(n) ?? 0) + 1)
  }
  return new Set([...counts].filter(([, c]) => c > 1).map(([n]) => n))
}

export function isMissingMeaning(r: DraftRow): boolean {
  return (r.enrich === 'done' || r.enrich === 'failed') && !r.meaningHu.trim()
}

/** Why Save is disabled, as an i18n key plus vars, or null when saving is allowed. */
export function saveBlocker(
  title: string,
  rows: DraftRow[],
): { key: MessageKey; vars?: Record<string, number> } | null {
  if (!title.trim()) return { key: 'vlBlockTitle' }
  if (rows.length === 0) return { key: 'vlBlockEmpty' }
  if (rows.length > LIST_MAX_ITEMS) return { key: 'vlBlockTooMany', vars: { max: LIST_MAX_ITEMS } }
  if (rows.some((r) => !normalizeTerm(r.term))) return { key: 'vlBlockEmptyTerm' }
  if (duplicateTerms(rows).size > 0) return { key: 'vlBlockDuplicates' }
  if (rows.some((r) => r.enrich === 'pending' || r.enrich === 'loading')) return { key: 'vlBlockFilling' }
  const missing = rows.filter((r) => !r.meaningHu.trim()).length
  if (missing > 0) return { key: 'vlBlockMeanings', vars: { n: missing } }
  return null
}

export function toListInput(
  meta: { title: string; description: string; cefrLevel: CefrLevel | '' },
  rows: DraftRow[],
): VocabListInput {
  return {
    title: meta.title.trim(),
    description: meta.description.trim() || null,
    cefrLevel: meta.cefrLevel || null,
    items: rows.map((r) => ({
      term: r.term.trim(),
      meaningHu: r.meaningHu.trim(),
      exampleEn: r.exampleEn.trim() || null,
      definitionEn: r.definitionEn.trim() || null,
      pos: r.pos,
      cefrLevel: r.cefrLevel || null,
    })),
  }
}
