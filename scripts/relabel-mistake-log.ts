// Re-labels the old mistake_log rows (8 generic categories) into the mistake taxonomy
// (src/data/mistakeTaxonomy.ts) and, on --apply, copies them into mistake_events as
// source = 'legacy'. mistake_log itself is only ever read.
//
//   npm run relabel:dry-run
//       Default. Classifies every row and writes scripts/output/relabel-report.csv plus a
//       summary. Writes nothing to the database.
//   npm run relabel:apply -- scripts/output/relabel-report.csv
//       Inserts one mistake_events row per non-skipped row, using the new_subtype column of
//       the (hand-edited) CSV. new_area is ignored and derived from new_subtype; everything
//       else (examples, occurrences, dates) is re-read from mistake_log. Rows whose method is
//       "skipped" are left out.
//   npm run relabel:apply
//       Same, but classifies again with the model instead of reading a CSV.
//
// Needs SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and GROQ_API_KEY in .env (GROQ only when
// classifying). Idempotent: each imported row records legacy_mistake_log_id, and rows
// already imported are skipped, so --apply can be re-run safely.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'
import {
  OTHER_SUBTYPE,
  areaForSubtype,
  buildTaxonomyPromptBlock,
  isValidSubtype,
} from '../src/data/mistakeTaxonomy.ts'

/** Rows classified per model call. */
const RELABEL_BATCH_SIZE = 15
/** Pause between model calls, to stay well under Groq's per-minute limits (shared with the live app). */
const RELABEL_PAUSE_MS = 4000
const RELABEL_MODEL = 'openai/gpt-oss-120b'
const RETRY_DELAYS_MS = [5000, 15000, 30000]
const REPORT_PATH = new URL('./output/relabel-report.csv', import.meta.url)
const PAGE_SIZE = 1000
const INSERT_BATCH_SIZE = 500

/** Old categories that map 1:1, used for rows without an example (no model call). */
const LEGACY_RULE_MAP: Record<string, string> = {
  articles: 'articles',
  word_order: 'sentence_order',
}

type Method = 'model' | 'rule' | 'skipped'

interface MistakeLogRow {
  id: number
  user_id: string
  category: string
  example_original: string | null
  example_corrected: string | null
  occurrences: number
  last_seen_at: string
}

interface Labelled {
  row: MistakeLogRow
  subtype: string | null
  method: Method
  note: string
}

const CSV_COLUMNS = [
  'mistake_log_id',
  'user_id',
  'old_category',
  'occurrences',
  'last_seen_at',
  'example_original',
  'example_corrected',
  'new_area',
  'new_subtype',
  'method',
  'note',
] as const

// ---------- setup ----------

const args = process.argv.slice(2)
const apply = args.includes('--apply')
const csvPath = args.find((a) => !a.startsWith('--'))

const supabaseUrl = process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!supabaseUrl || !serviceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (run with --env-file=.env).')
  process.exit(1)
}
const supabase = createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function readMistakeLog(): Promise<MistakeLogRow[]> {
  const rows: MistakeLogRow[] = []
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from('mistake_log')
      .select('id, user_id, category, example_original, example_corrected, occurrences, last_seen_at')
      .order('id', { ascending: true })
      .range(from, from + PAGE_SIZE - 1)
    if (error) throw new Error(`Reading mistake_log failed: ${error.message}`)
    rows.push(...((data ?? []) as MistakeLogRow[]))
    if (!data || data.length < PAGE_SIZE) return rows
  }
}

// ---------- classification ----------

const SYSTEM_PROMPT = `You classify mistakes made by Hungarian adult learners of English. Each item gives what the learner said, the corrected version, and an old, coarse category as a hint (the hint may be wrong or too broad). Pick the one taxonomy id that fits each item best, the most specific one ("other" only if none fits). Use the id, never the area name.

Taxonomy (grouped by area):
${buildTaxonomyPromptBlock()}

Respond with ONLY valid JSON (no markdown, no code fences) in exactly this shape, one entry per item:
{"labels": [{"n": 1, "subtype": "articles"}]}`

async function callGroq(userContent: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('Missing GROQ_API_KEY (run with --env-file=.env).')
  for (let attempt = 0; ; attempt++) {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: RELABEL_MODEL,
        temperature: 0,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userContent },
        ],
      }),
    })
    if (response.status === 429 && attempt < RETRY_DELAYS_MS.length) {
      console.log(`  rate-limited, waiting ${RETRY_DELAYS_MS[attempt] / 1000}s`)
      await sleep(RETRY_DELAYS_MS[attempt])
      continue
    }
    if (!response.ok) throw new Error(`Groq ${response.status}: ${await response.text()}`)
    const json = await response.json()
    return json.choices?.[0]?.message?.content ?? ''
  }
}

async function classifyBatch(batch: MistakeLogRow[]): Promise<Labelled[]> {
  const userContent = batch
    .map(
      (row, i) =>
        `${i + 1}. learner: ${JSON.stringify(row.example_original)} | corrected: ${JSON.stringify(row.example_corrected ?? '')} | old category: ${row.category}`,
    )
    .join('\n')

  let labels = new Map<number, unknown>()
  let failure = ''
  try {
    const raw = await callGroq(userContent)
    const cleaned = raw.trim().replace(/^```(json)?/i, '').replace(/```$/, '').trim()
    const parsed = JSON.parse(cleaned)
    labels = new Map(
      (Array.isArray(parsed.labels) ? parsed.labels : []).map((l: { n?: unknown; subtype?: unknown }) => [Number(l?.n), l?.subtype]),
    )
  } catch (err) {
    failure = `model call failed (${err instanceof Error ? err.message.slice(0, 120) : String(err)}), set to other`
  }

  return batch.map((row, i) => {
    const answer = labels.get(i + 1)
    if (isValidSubtype(answer)) return { row, subtype: answer, method: 'model', note: '' }
    const note = failure || (answer === undefined ? 'model gave no label, set to other' : `model said "${String(answer)}", set to other`)
    return { row, subtype: OTHER_SUBTYPE, method: 'model', note }
  })
}

async function classifyAll(rows: MistakeLogRow[]): Promise<Labelled[]> {
  const out: Labelled[] = []
  const forModel: MistakeLogRow[] = []
  for (const row of rows) {
    if (row.category === 'pronunciation') {
      out.push({ row, subtype: null, method: 'skipped', note: 'pronunciation is no longer part of mistake tracking' })
    } else if (!row.example_original?.trim()) {
      out.push({ row, subtype: LEGACY_RULE_MAP[row.category] ?? OTHER_SUBTYPE, method: 'rule', note: 'no example' })
    } else {
      forModel.push(row)
    }
  }

  const batches = Math.ceil(forModel.length / RELABEL_BATCH_SIZE)
  for (let b = 0; b < batches; b++) {
    if (b > 0) await sleep(RELABEL_PAUSE_MS)
    console.log(`Classifying batch ${b + 1}/${batches}`)
    out.push(...(await classifyBatch(forModel.slice(b * RELABEL_BATCH_SIZE, (b + 1) * RELABEL_BATCH_SIZE))))
  }
  return out.sort((a, b) => a.row.id - b.row.id)
}

// ---------- CSV ----------

function csvField(value: unknown): string {
  const s = value === null || value === undefined ? '' : String(value)
  return /[",;\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

function writeReport(labelled: Labelled[]) {
  const lines = [CSV_COLUMNS.join(',')]
  for (const l of labelled) {
    const values: Record<(typeof CSV_COLUMNS)[number], unknown> = {
      mistake_log_id: l.row.id,
      user_id: l.row.user_id,
      old_category: l.row.category,
      occurrences: l.row.occurrences,
      last_seen_at: l.row.last_seen_at,
      example_original: l.row.example_original,
      example_corrected: l.row.example_corrected,
      new_area: l.subtype ? areaForSubtype(l.subtype) : '',
      new_subtype: l.subtype ?? '',
      method: l.method,
      note: l.note,
    }
    lines.push(CSV_COLUMNS.map((c) => csvField(values[c])).join(','))
  }
  mkdirSync(new URL('./output/', import.meta.url), { recursive: true })
  // BOM so Excel opens the Hungarian text as UTF-8.
  writeFileSync(REPORT_PATH, '﻿' + lines.join('\r\n') + '\r\n', 'utf8')
}

/** Minimal RFC 4180 parser; accepts ',' or ';' (what Hungarian Excel saves) as the delimiter. */
function parseCsv(text: string): Record<string, string>[] {
  const src = text.replace(/^﻿/, '')
  const firstLine = src.split(/\r?\n/, 1)[0]
  const delimiter = firstLine.includes(';') && !firstLine.includes(',') ? ';' : ','
  const records: string[][] = []
  let record: string[] = []
  let field = ''
  let quoted = false
  for (let i = 0; i < src.length; i++) {
    const ch = src[i]
    if (quoted) {
      if (ch === '"' && src[i + 1] === '"') {
        field += '"'
        i++
      } else if (ch === '"') quoted = false
      else field += ch
    } else if (ch === '"') quoted = true
    else if (ch === delimiter) {
      record.push(field)
      field = ''
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i++
      record.push(field)
      records.push(record)
      record = []
      field = ''
    } else field += ch
  }
  if (field || record.length) {
    record.push(field)
    records.push(record)
  }
  const [header, ...rows] = records.filter((r) => r.some((f) => f.trim() !== ''))
  return rows.map((r) => Object.fromEntries(header.map((h, i) => [h.trim(), (r[i] ?? '').trim()])))
}

function labelsFromCsv(path: string, rows: MistakeLogRow[]): Labelled[] {
  const byId = new Map(rows.map((r) => [r.id, r]))
  const labelled: Labelled[] = []
  const problems: string[] = []
  for (const rec of parseCsv(readFileSync(path, 'utf8'))) {
    const id = Number(rec.mistake_log_id)
    const row = byId.get(id)
    if (!row) {
      problems.push(`mistake_log_id ${rec.mistake_log_id}: not in mistake_log`)
      continue
    }
    if (rec.method === 'skipped') {
      labelled.push({ row, subtype: null, method: 'skipped', note: rec.note })
    } else if (!isValidSubtype(rec.new_subtype)) {
      problems.push(`mistake_log_id ${id}: unknown new_subtype "${rec.new_subtype}"`)
    } else {
      labelled.push({ row, subtype: rec.new_subtype, method: rec.method === 'rule' ? 'rule' : 'model', note: rec.note })
    }
  }
  if (problems.length > 0) {
    console.error(`The CSV has ${problems.length} problem(s); nothing was written:\n${problems.join('\n')}`)
    process.exit(1)
  }
  return labelled
}

// ---------- summary + apply ----------

function printSummary(labelled: Labelled[]) {
  const bySubtype: Record<string, number> = {}
  const byPair: Record<string, number> = {}
  const byMethod: Record<string, number> = {}
  for (const l of labelled) {
    const target = l.subtype ?? '(skipped)'
    bySubtype[target] = (bySubtype[target] ?? 0) + 1
    byPair[`${l.row.category} → ${target}`] = (byPair[`${l.row.category} → ${target}`] ?? 0) + 1
    byMethod[l.method] = (byMethod[l.method] ?? 0) + 1
  }
  const sortDesc = (o: Record<string, number>) => Object.fromEntries(Object.entries(o).sort((a, b) => b[1] - a[1]))
  console.log(`\n${labelled.length} mistake_log rows, by method:`, byMethod)
  console.log('\nRows per new subtype:')
  console.table(sortDesc(bySubtype))
  console.log('Old category → new subtype:')
  console.table(sortDesc(byPair))
  const flagged = labelled.filter((l) => l.note && l.method !== 'skipped').length
  if (flagged > 0) console.log(`${flagged} row(s) have a note worth checking (see the "note" column).`)
}

async function applyLabels(labelled: Labelled[]) {
  const done = new Set<number>()
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from('mistake_events')
      .select('legacy_mistake_log_id')
      .not('legacy_mistake_log_id', 'is', null)
      .order('legacy_mistake_log_id', { ascending: true })
      .range(from, from + PAGE_SIZE - 1)
    if (error) throw new Error(`Reading mistake_events failed: ${error.message}`)
    for (const e of data ?? []) done.add(Number(e.legacy_mistake_log_id))
    if (!data || data.length < PAGE_SIZE) break
  }

  const toInsert = labelled
    .filter((l) => l.subtype && !done.has(l.row.id))
    .map((l) => ({
      user_id: l.row.user_id,
      session_id: null,
      area: areaForSubtype(l.subtype!),
      subtype: l.subtype!,
      example_original: l.row.example_original,
      example_corrected: l.row.example_corrected,
      note: null,
      source: 'legacy',
      legacy_occurrences: l.row.occurrences,
      legacy_mistake_log_id: l.row.id,
      created_at: l.row.last_seen_at,
    }))

  console.log(`\nAlready imported: ${done.size}. Skipped (pronunciation / marked skipped): ${labelled.filter((l) => !l.subtype).length}. To insert: ${toInsert.length}.`)
  for (let i = 0; i < toInsert.length; i += INSERT_BATCH_SIZE) {
    const batch = toInsert.slice(i, i + INSERT_BATCH_SIZE)
    const { error } = await supabase
      .from('mistake_events')
      .upsert(batch, { onConflict: 'legacy_mistake_log_id', ignoreDuplicates: true })
    if (error) throw new Error(`Insert failed at row ${i}: ${error.message}`)
    console.log(`Inserted ${Math.min(i + INSERT_BATCH_SIZE, toInsert.length)}/${toInsert.length}`)
  }
  console.log('Done.')
}

const rows = await readMistakeLog()
console.log(`Read ${rows.length} mistake_log rows.`)

if (apply && csvPath) {
  const labelled = labelsFromCsv(csvPath, rows)
  const missing = rows.length - labelled.length
  if (missing > 0) console.log(`Note: ${missing} mistake_log row(s) are not in the CSV and will not be imported.`)
  printSummary(labelled)
  await applyLabels(labelled)
} else {
  const labelled = await classifyAll(rows)
  printSummary(labelled)
  if (apply) {
    await applyLabels(labelled)
  } else {
    writeReport(labelled)
    console.log(`\nDry run: nothing written to the database. Report: ${fileURLToPath(REPORT_PATH)}`)
  }
}
