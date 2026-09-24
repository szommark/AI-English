import type { CefrLevel } from '../data/grammarCurriculum'

// Turning pasted text and uploaded tables into list-editor rows (design §5.1). The file
// parsers (CSV, XLSX) live in vocabFileImport.ts and are loaded on demand with import(),
// so they stay out of the main bundle.

export interface ImportedRow {
  term: string
  meaningHu?: string
  exampleEn?: string
  cefrLevel?: CefrLevel
}

const CEFR = new Set(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])

function clean(cell: string | undefined): string | undefined {
  const v = cell?.trim().replace(/\s+/g, ' ')
  return v ? v : undefined
}

function toRow(term: string | undefined, meaning?: string, example?: string, level?: string): ImportedRow | null {
  const t = clean(term)
  if (!t) return null
  const row: ImportedRow = { term: t }
  const m = clean(meaning)
  const e = clean(example)
  const l = clean(level)?.toUpperCase()
  if (m) row.meaningHu = m
  if (e) row.exampleEn = e
  if (l && CEFR.has(l)) row.cefrLevel = l as CefrLevel
  return row
}

/**
 * One term per line, with optional `term ; Hungarian ; example` columns. Tabs also
 * separate columns (a range copied from a spreadsheet). Only the first two separators
 * split, so an example sentence may itself contain a semicolon.
 */
export function parsePastedTerms(text: string): ImportedRow[] {
  const rows: ImportedRow[] = []
  for (const line of text.split(/\r?\n/)) {
    const sep = line.includes('\t') ? '\t' : ';'
    const [term, meaning, ...rest] = line.split(sep)
    const row = toRow(term, meaning, rest.join(sep))
    if (row) rows.push(row)
  }
  return rows
}

const HEADER_ALIASES: Record<'term' | 'meaning' | 'example' | 'level', string[]> = {
  term: ['term', 'word', 'words', 'phrase', 'english', 'angol', 'szó', 'szavak', 'kifejezés', 'wort', 'begriff', 'englisch'],
  meaning: ['meaning', 'hungarian', 'translation', 'magyar', 'jelentés', 'fordítás', 'bedeutung', 'ungarisch', 'übersetzung'],
  example: ['example', 'example sentence', 'sentence', 'példa', 'példamondat', 'beispiel', 'beispielsatz'],
  level: ['level', 'cefr', 'cefr level', 'szint', 'niveau'],
}

/**
 * A table (CSV or first XLSX sheet) to rows. If the first row names a term column (in
 * English, Hungarian or German), columns are matched by header; otherwise the order is
 * term, Hungarian meaning, example.
 */
export function rowsFromTable(table: string[][]): ImportedRow[] {
  if (table.length === 0) return []
  const header = table[0].map((c) => c.trim().toLowerCase())
  const col = (key: keyof typeof HEADER_ALIASES) => header.findIndex((h) => HEADER_ALIASES[key].includes(h))

  const termCol = col('term')
  const hasHeader = termCol >= 0
  const map = hasHeader
    ? { term: termCol, meaning: col('meaning'), example: col('example'), level: col('level') }
    : { term: 0, meaning: 1, example: 2, level: -1 }
  const at = (row: string[], i: number) => (i >= 0 ? row[i] : undefined)

  const rows: ImportedRow[] = []
  for (const cells of hasHeader ? table.slice(1) : table) {
    const row = toRow(at(cells, map.term), at(cells, map.meaning), at(cells, map.example), at(cells, map.level))
    if (row) rows.push(row)
  }
  return rows
}
