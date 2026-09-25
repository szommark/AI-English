// Pure builder for the Vocabulary word bank (docs/vocabulary-builder-design.md §5.3):
// CEFR-J Wordlist 1.5 (A1–B2) + Octanove Vocabulary Profile C1/C2 → vocab_word_bank rows.
// No I/O here, so it can be checked on its own; scripts/import-word-bank.ts does the rest.
import { VOCAB_TOPICS, normalizeTerm, termKind, type VocabKind, type VocabPos, type VocabTopicId } from '../src/lib/vocab.ts'

export type BankLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
export type BankSource = 'cefrj' | 'octanove'

export interface TopicMap {
  topics: Record<VocabTopicId, string[]>
  _unmapped: string[]
}

export interface BankRow {
  term: string
  term_normalized: string
  kind: VocabKind
  pos: VocabPos
  cefr_level: BankLevel
  topics: VocabTopicId[]
  source: BankSource
}

export interface BankBuild {
  rows: BankRow[]
  /** Headwords with only function-word parts of speech (a, the, of, can…): not study targets. */
  skippedFunctionWords: number
  /** Extra rows for a headword already seen (another part of speech or sense), merged. */
  merged: number
  /** Topic categories in the data that topic-map.json neither maps nor lists as unmapped. */
  unknownCategories: string[]
}

const LEVELS: readonly BankLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

/** Only content words go into the bank; the CEFR-J function-word tags map to null. */
const CONTENT_POS: Record<string, VocabPos> = {
  noun: 'noun',
  verb: 'verb',
  adjective: 'adjective',
  adverb: 'adverb',
}

/** RFC 4180-style CSV: quoted fields, doubled quotes, CRLF or LF. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"'
        i++
      } else if (ch === '"') quoted = false
      else field += ch
    } else if (ch === '"') quoted = true
    else if (ch === ',') {
      row.push(field)
      field = ''
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++
      row.push(field)
      if (row.some((f) => f !== '')) rows.push(row)
      row = []
      field = ''
    } else field += ch
  }
  row.push(field)
  if (row.some((f) => f !== '')) rows.push(row)
  return rows
}

/**
 * The headword as a study term. Spelling variants are slash-separated
 * ("color/colour", "email/e-mail/E-mail"); the first one is kept.
 */
export function headwordTerm(raw: string): string {
  return raw.split('/')[0].trim().replace(/\s+/g, ' ')
}

interface Entry {
  term: string
  pos: string
  level: BankLevel
  categories: string[]
  source: BankSource
}

function readEntries(csv: string, source: BankSource, categoryColumns: string[]): Entry[] {
  const [header, ...rows] = parseCsv(csv)
  const col = (name: string) => {
    const i = header.indexOf(name)
    if (i < 0) throw new Error(`${source}: missing column "${name}"`)
    return i
  }
  const [headword, pos, level] = [col('headword'), col('pos'), col('CEFR')]
  const categories = categoryColumns.map(col)
  return rows.map((r) => {
    const lvl = r[level]?.trim() as BankLevel
    if (!LEVELS.includes(lvl)) throw new Error(`${source}: bad level "${r[level]}" for "${r[headword]}"`)
    return {
      term: headwordTerm(r[headword] ?? ''),
      pos: (r[pos] ?? '').trim(),
      level: lvl,
      categories: categories.map((i) => (r[i] ?? '').trim()).filter(Boolean),
      source,
    }
  })
}

/**
 * Builds the bank: one row per normalized term. A headword listed more than once
 * (several parts of speech or senses) keeps its lowest level, the part of speech of that
 * entry and the union of its topics; CEFR-J wins over Octanove at equal level.
 */
export function buildWordBank(cefrjCsv: string, octanoveCsv: string, topicMap: TopicMap): BankBuild {
  const topicsFor = new Map<string, VocabTopicId[]>()
  for (const topic of VOCAB_TOPICS) {
    for (const category of topicMap.topics[topic] ?? []) {
      topicsFor.set(category, [...(topicsFor.get(category) ?? []), topic])
    }
  }
  const unmapped = new Set(topicMap._unmapped)

  const entries = [
    ...readEntries(cefrjCsv, 'cefrj', ['CoreInventory 1', 'CoreInventory 2', 'Threshold']),
    ...readEntries(octanoveCsv, 'octanove', []),
  ]

  const unknown = new Set<string>()
  const byTerm = new Map<string, { row: BankRow; topics: Set<VocabTopicId> }>()
  let skippedFunctionWords = 0
  let merged = 0
  const functionOnly = new Map<string, boolean>()

  for (const e of entries) {
    const termNormalized = normalizeTerm(e.term)
    if (!termNormalized) continue
    const topics: VocabTopicId[] = []
    for (const c of e.categories) {
      const mapped = topicsFor.get(c)
      if (mapped) topics.push(...mapped)
      else if (!unmapped.has(c)) unknown.add(c)
    }

    const pos = CONTENT_POS[e.pos]
    if (!pos) {
      if (!functionOnly.has(termNormalized)) functionOnly.set(termNormalized, true)
      continue
    }
    functionOnly.set(termNormalized, false)

    const existing = byTerm.get(termNormalized)
    if (!existing) {
      byTerm.set(termNormalized, {
        row: {
          term: e.term,
          term_normalized: termNormalized,
          kind: termKind(termNormalized),
          pos,
          cefr_level: e.level,
          topics: [],
          source: e.source,
        },
        topics: new Set(topics),
      })
      continue
    }
    merged++
    for (const t of topics) existing.topics.add(t)
    if (LEVELS.indexOf(e.level) < LEVELS.indexOf(existing.row.cefr_level)) {
      existing.row = { ...existing.row, term: e.term, pos, cefr_level: e.level, source: e.source }
    }
  }
  for (const isFunctionOnly of functionOnly.values()) if (isFunctionOnly) skippedFunctionWords++

  const rows = [...byTerm.values()].map(({ row, topics }) => ({
    ...row,
    topics: VOCAB_TOPICS.filter((t) => topics.has(t)),
  }))
  rows.sort((a, b) => a.term_normalized.localeCompare(b.term_normalized))
  return { rows, skippedFunctionWords, merged, unknownCategories: [...unknown].sort() }
}
