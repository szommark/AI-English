import { rowsFromTable, type ImportedRow } from './vocabImport'

// Loaded on demand (dynamic import) by the word-list editor. Each spreadsheet reader is
// itself imported dynamically, so an upload only downloads the one it needs:
//   .xlsx -> read-excel-file (small, maintained)
//   .xls  -> SheetJS 0.20.3 (the legacy binary format needs a full parser), installed from
//            SheetJS's own CDN tarball. Not the `xlsx` package on the npm registry: that
//            release (0.18.5) is abandoned there and has known advisories (CVE-2023-30533,
//            CVE-2024-22363), both fixed by 0.20.3.

export class UnsupportedFileError extends Error {}

/** Guess the CSV delimiter from the first line: Hungarian Excel exports use ';'. */
function detectDelimiter(text: string): string {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? ''
  const counts = [',', ';', '\t'].map((d) => [d, firstLine.split(d).length - 1] as const)
  counts.sort((a, b) => b[1] - a[1])
  return counts[0][1] > 0 ? counts[0][0] : ','
}

/** RFC 4180 CSV: quoted fields, doubled quotes, newlines inside quotes. */
export function parseCsv(text: string, delimiter = detectDelimiter(text)): string[][] {
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
      } else if (ch === '"') {
        quoted = false
      } else {
        field += ch
      }
    } else if (ch === '"' && field === '') {
      quoted = true
    } else if (ch === delimiter) {
      row.push(field)
      field = ''
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else {
      field += ch
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

/** Every Excel 97+ .xls is an OLE compound file, which starts with this signature. */
const COMPOUND_FILE_SIGNATURE = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]

function isCompoundFile(bytes: Uint8Array): boolean {
  return COMPOUND_FILE_SIGNATURE.every((b, i) => bytes[i] === b)
}

export async function parseVocabFile(file: File): Promise<ImportedRow[]> {
  const name = file.name.toLowerCase()

  if (name.endsWith('.csv') || name.endsWith('.txt') || file.type === 'text/csv') {
    // Strip a UTF-8 BOM (Excel adds one).
    const text = (await file.text()).replace(/^﻿/, '')
    return rowsFromTable(parseCsv(text))
  }

  if (name.endsWith('.xlsx')) {
    const { readSheet } = await import('read-excel-file/browser')
    const sheet = await readSheet(file)
    return rowsFromTable(sheet.map((cells) => cells.map((c) => (c === null || c === undefined ? '' : String(c)))))
  }

  if (name.endsWith('.xls')) {
    const bytes = new Uint8Array(await file.arrayBuffer())
    // Checked before loading SheetJS, which would otherwise read a renamed text/HTML file
    // as a table (as Excel does) instead of rejecting it.
    if (!isCompoundFile(bytes)) throw new UnsupportedFileError(file.name)
    const { read, utils } = await import('xlsx')
    const workbook = read(bytes, { type: 'array' })
    const first = workbook.SheetNames[0]
    if (!first) return []
    // raw: false gives the cells' displayed text (dates and numbers as the teacher sees them).
    const table = utils.sheet_to_json<unknown[]>(workbook.Sheets[first], { header: 1, raw: false, defval: '' })
    return rowsFromTable(table.map((cells) => cells.map((c) => (c === null || c === undefined ? '' : String(c)))))
  }

  throw new UnsupportedFileError(file.name)
}
