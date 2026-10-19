// Turns a listening task that was made outside the app — the listening-task-intake skill's .docx
// files (read by docxText.ts) or text pasted from a chat — into ListeningTaskContent. It is
// deliberately forgiving: whatever it finds (instruction, annotated script, T/F table, notes,
// answer key, self-check table) is used, the rest is reported, and the teacher fixes the result
// in the editor before saving.

import {
  levelSpec,
  standardInstruction,
  type ListeningFormat,
  type ListeningNoteAnswer,
  type ListeningStatement,
  type ListeningTaskContent,
  type TaskLevel,
  type TrapType,
} from './examTasks'
import { autoMarkScript } from './listeningAutoMark'

export interface ImportResult {
  content: ListeningTaskContent
  level: TaskLevel | null
  title: string
  sourceRef: string
  /** What was found, for the summary under the import box. */
  found: { script: boolean; markers: number; statements: number; notes: number; key: number; autoMarked: number }
  warnings: string[]
}

const LEVEL_RE = /\b(B1|B2|C1)\b/
const MARKED_RE = /\*\*\s*\((\d{1,2})\)\s*\*\*|\*\*\s*\((\d{1,2})\)\s*([^*]*)\*\*|\[\[\s*\d{1,2}\s*(\|[^\]]*)?\]\]/
const HEADING_STOP_RE = /^(\**)\s*(compliance|self-check|self check|answer key|key\b|marking box|item\b|#|notes on|clean (recording )?script|recording script|task sheet|distance chart|revision note)/i

function stripMd(s: string): string {
  return s.replace(/\*\*/g, '').replace(/^#+\s*/, '').trim()
}

function wordCount(s: string): number {
  return stripMd(s).split(/\s+/).filter(Boolean).length
}

function tableRows(lines: string[]): string[][][] {
  const tables: string[][][] = []
  let current: string[][] | null = null
  for (const line of lines) {
    const t = line.trim()
    if (t.startsWith('|') && t.endsWith('|')) {
      const cells = t.slice(1, -1).split('|').map((c) => stripMd(c))
      if (cells.every((c) => /^:?-{2,}:?$/.test(c) || c === '')) continue // markdown separator row
      if (!current) {
        current = []
        tables.push(current)
      }
      current.push(cells)
    } else current = null
  }
  return tables
}

function parseTf(v: string): boolean | null {
  const s = v.trim().toUpperCase().replace(/[^A-Z]/g, '')
  if (s === 'T' || s === 'TRUE' || s === 'I' || s === 'IGAZ') return true
  if (s === 'F' || s === 'FALSE' || s === 'H' || s === 'HAMIS') return false
  return null
}

/** `**(3) words**` / `**(3)** words` / `[[3|words]]` → `[[3|words]]`. */
function toMarkerSyntax(paragraph: string, keyFor: (id: string) => string | undefined, format: ListeningFormat | null): string {
  let p = paragraph.replace(/\*\*\s*\((\d{1,2})\)\s*([^*]*?)\s*\*\*/g, (_m, id: string, words: string) => (words ? `[[${id}|${words}]]` : `[[${id}]]`))
  // A bare marker right after its answer ("misleading parents **(1)**"): wrap the answer before it.
  for (const m of [...p.matchAll(/\[\[(\d{1,2})\]\]/g)]) {
    const key = keyFor(m[1])
    const at = p.indexOf(m[0])
    const before = p.slice(0, at).replace(/\s+$/, '')
    if (!key || !before.toLowerCase().endsWith(key.toLowerCase())) continue
    const start = before.length - key.length
    p = `${p.slice(0, start)}[[${m[1]}|${before.slice(start)}]]${p.slice(at + m[0].length)}`
  }
  // A bare marker before its answer: wrap the key answer if it follows closely, else the next words up to punctuation.
  p = p.replace(/\[\[(\d{1,2})\]\]\s*([^[]*)/g, (_m, id: string, rest: string) => {
    const key = keyFor(id)
    if (key && format === 'notes') {
      const at = rest.toLowerCase().indexOf(key.toLowerCase())
      if (at >= 0 && rest.slice(0, at).split(/\s+/).filter(Boolean).length <= 12) {
        return `${rest.slice(0, at)}[[${id}|${rest.slice(at, at + key.length)}]]${rest.slice(at + key.length)}`
      }
    }
    const phrase = rest.match(/^[^,.;:!?]+/)?.[0] ?? ''
    const cut = phrase.split(/\s+/).filter(Boolean).slice(0, 10).join(' ')
    if (!cut) return `[[${id}|]]${rest}`
    const idx = rest.indexOf(cut)
    return `[[${id}|${cut}]]${rest.slice(idx + cut.length)}`
  })
  return p.replace(/\*\*/g, '')
}

/**
 * `hint.script`: the audioscript given on its own (checking an existing task: script and task
 * sheet uploaded separately). It is used whole instead of being looked for in `raw`.
 */
export function parseListeningBundle(raw: string, hint: { format?: ListeningFormat; level?: TaskLevel; script?: string } = {}): ImportResult {
  const text = raw.replace(/\r\n?/g, '\n').replace(/ /g, ' ')
  const lines = text.split('\n')
  const warnings: string[] = []
  const lower = text.toLowerCase()

  // Format and level
  let format: ListeningFormat | null = hint.format ?? null
  if (!format) {
    if (/decide if the statements are true|true\s*(\(t\))?\s*or\s*false|\btrue\/false\b/.test(lower)) format = 'true-false'
    else if (/complete the table with your notes|notes on |…{3,}|\.{6,}|_{4,}/.test(lower)) format = 'notes'
  }
  const level = hint.level ?? ((text.match(LEVEL_RE)?.[1] as TaskLevel | undefined) ?? null)

  // Instruction
  const instructionLine = lines.map(stripMd).find((l) => /^listen to the text/i.test(l)) ?? ''
  if (!format) format = /true|false/i.test(instructionLine) ? 'true-false' : 'notes'

  // Title and source
  const titleMatch = text.match(/[“"]([^”"\n]{3,120})[”"]/)
  const notesTitle = lines.map(stripMd).find((l) => /^notes on\b/i.test(l)) ?? ''
  const topicMatch = instructionLine.match(/listen to the text about (.+?)\. based on/i)
  const sourceLine = lines.map(stripMd).find((l) => /^source\s*:/i.test(l)) ?? ''

  // Answer key: "1. F", "(2) T", "3 – aquifer", "0 T 1 F 2 T" on one line, or a T/F column in a table.
  const tfKey = new Map<string, boolean>()
  const notesKey = new Map<string, string[]>()
  const keyStart = lines.findIndex((l) => /answer key|^\s*\**\s*key\s*\**\s*$|megoldókulcs|^\s*\**answers\**\s*$/i.test(stripMd(l)))
  const keyLines = keyStart >= 0 ? lines.slice(keyStart + 1) : []
  for (const line of keyLines) {
    const l = stripMd(line)
    if (/^\|/.test(line.trim())) continue
    for (const m of l.matchAll(/\(?\b(\d{1,2})\)?[.):]?\s*[-–—:]?\s*\b(T|F|TRUE|FALSE)\b/gi)) {
      const v = parseTf(m[2])
      if (v !== null) tfKey.set(m[1], v)
    }
    const note = l.match(/^\(?(\d{1,2})\)?[.):]?\s*[-–—:]?\s+(.+)$/)
    if (note && format === 'notes') {
      const answer = note[2]
        .replace(/\(\s*\d+\s*words?\s*\)/i, '')
        .replace(/\bword count\s*:?\s*\d+/i, '')
        .trim()
      const variants = answer
        .split(/\s*(?:\/|;|\bor\b|\[|\]|\(also:?|\(|\))\s*/i)
        .map((s) => s.replace(/^(also|accept)\s*:?\s*/i, '').replace(/[.,]$/, '').trim())
        .filter((s) => s && !/^\d+\s*words?$/i.test(s) && !/^(optional|acceptable)/i.test(s))
      if (variants.length) notesKey.set(note[1], [...new Set(variants)])
    }
  }

  // Tables: the T/F task table (STATEMENT column) and the self-check table (T/F, trap type).
  const statements = new Map<string, ListeningStatement>()
  const traps = new Map<string, TrapType>()
  for (const table of tableRows(lines)) {
    const header = table[0].map((h) => h.toLowerCase())
    const hasHeader = header.some((h) => /statement|trap|t\/f|true|item|#/.test(h))
    const rows = hasHeader ? table.slice(1) : table
    const stCol = header.findIndex((h) => h.includes('statement'))
    const tfCol = header.findIndex((h) => /t\/f|true or false|^true|answer/.test(h))
    const trapCol = header.findIndex((h) => h.includes('trap'))
    const answerCol = header.findIndex((h) => /^(answers?|key)$/.test(h))
    for (const row of rows) {
      const id = row[0]?.match(/^\(?(\d{1,2})\)?\.?$/)?.[1]
      if (!id) continue
      // A notes answer-key table: "# | Answer | Words | Category | …".
      if (format === 'notes') {
        if (answerCol >= 0 && row[answerCol] && !notesKey.has(id)) {
          notesKey.set(id, row[answerCol].split(/\s*\/\s*/).map((s) => s.trim()).filter(Boolean))
        }
        continue
      }
      const stText = stCol >= 0 ? row[stCol] : !hasHeader && row.length >= 2 && wordCount(row[1]) >= 4 ? row[1] : ''
      const tf = tfCol >= 0 ? parseTf(row[tfCol] ?? '') : !hasHeader ? parseTf(row[2] ?? '') : null
      if (stText && wordCount(stText) >= 3) statements.set(id, { id, text: stText, answer: tf ?? tfKey.get(id) ?? true })
      if (tf !== null && !tfKey.has(id)) tfKey.set(id, tf)
      if (trapCol >= 0) {
        const trap = (row[trapCol] ?? '').toLowerCase()
        if (trap.includes('conjunction')) traps.set(id, 'conjunction')
        else if (trap.includes('swap')) traps.set(id, 'swap')
      }
    }
  }
  // Statements written as "1. The course …" lines (no table).
  if (format === 'true-false' && statements.size === 0) {
    for (const line of lines) {
      const m = stripMd(line).match(/^(\d{1,2})[.)]\s+(.{12,})$/)
      if (!m) continue
      const tail = m[2].match(/^(.*?)\s*[-–—|]?\s*\b(T|F|TRUE|FALSE)\s*$/i)
      const text = tail ? tail[1] : m[2]
      if (wordCount(text) < 4) continue
      statements.set(m[1], { id: m[1], text, answer: (tail ? parseTf(tail[2]) : null) ?? tfKey.get(m[1]) ?? true })
    }
  }

  // Notes lines: "- Place of research: ……… (0) Hungary"
  const notes: string[] = []
  const noteExample = new Map<string, string>()
  if (format === 'notes') {
    const gapRe = /(?:[.…_]{3,}\s*)?\((\d{1,2})\)(?:\s*[.…_]{3,})?/g
    for (const line of lines) {
      const l = stripMd(line).replace(/^[-•*–]\s*/, '')
      // The filled-in example written without dots: "Crisis once ignored: climate change (0)".
      const filled = l.match(/^(.{3,80}?:)\s*([^:.…_()]{1,40}?)\s*\(0\)\s*$/)
      if (filled && !/listen to the text/i.test(l)) {
        noteExample.set('0', filled[2].trim())
        notes.push(`${filled[1]} {{0}}`)
        continue
      }
      if (!/[.…_]{3,}/.test(l) || !/\(\d{1,2}\)/.test(l) || /^\|/.test(line.trim())) continue
      let example = ''
      const converted = l.replace(gapRe, (_m, id: string) => `{{${id}}}`).replace(/\{\{0\}\}\s*(.+)$/, (_m, ex: string) => {
        example = ex.trim()
        return '{{0}}'
      })
      if (example) noteExample.set('0', example)
      notes.push(converted.replace(/\s{2,}/g, ' ').trim())
    }
  }

  // The annotated script: the run of prose paragraphs around the bold markers.
  const paragraphs = text.split(/\n\s*\n|\n(?=\S)/).map((p) => p.trim()).filter(Boolean)
  const isProse = (p: string) =>
    wordCount(p) >= 12 &&
    !/^\|/.test(p) &&
    !/^[\w ]{1,20}:\s/.test(stripMd(p)) &&
    !/^listen to the text/i.test(stripMd(p)) &&
    !/\b(bold text|marker numbers?|in parentheses|annotated|compliance|self-check)\b/i.test(p) &&
    // Not an inline answer key ("0 T, 1 F, 2 T …"): prose is mostly real words.
    stripMd(p).split(/\s+/).filter((w) => w.replace(/[^\p{L}]/gu, '').length > 2).length >= wordCount(p) * 0.6
  const marked = paragraphs.map((p, i) => (MARKED_RE.test(p) ? i : -1)).filter((i) => i >= 0)
  let scriptParas: string[] = []
  let markers = 0
  const keyFor = (id: string) => (format === 'notes' ? (notesKey.get(id)?.[0] ?? (id === '0' ? noteExample.get('0') : undefined)) : undefined)
  if (hint.script?.trim()) {
    // A script given on its own: every paragraph that is spoken text (sentences or speaker lines),
    // without headings like "LISTENING COMPREHENSION — AUDIOSCRIPT" or the title.
    scriptParas = hint.script
      .replace(/\r\n?/g, '\n')
      .replace(/ /g, ' ')
      .split(/\n\s*\n|\n(?=\S)/)
      .map((p) => p.trim())
      .filter((p) => p && (/[.!?]["”’)]*\s*$|[.!?]\s/.test(stripMd(p)) || /^[A-Z][\w .'’-]{0,30}:\s/.test(stripMd(p)) || MARKED_RE.test(p)))
      .filter((p) => !/^listen to the text/i.test(stripMd(p)) && !/^\|/.test(p))
      .map((p) => toMarkerSyntax(p, keyFor, format))
    markers = scriptParas.join(' ').match(/\[\[\d{1,2}/g)?.length ?? 0
  } else if (marked.length) {
    let from = marked[0]
    let to = marked[marked.length - 1]
    while (from > 0 && isProse(paragraphs[from - 1]) && !HEADING_STOP_RE.test(paragraphs[from - 1])) from--
    while (to < paragraphs.length - 1 && isProse(paragraphs[to + 1]) && !HEADING_STOP_RE.test(paragraphs[to + 1])) to++
    scriptParas = paragraphs.slice(from, to + 1).map((p) => toMarkerSyntax(p, keyFor, format))
    markers = scriptParas.join(' ').match(/\[\[\d{1,2}/g)?.length ?? 0
  } else {
    // A clean script only: the longest run of prose paragraphs.
    let best: [number, number] = [0, -1]
    let start = -1
    paragraphs.forEach((p, i) => {
      if (isProse(p) && !HEADING_STOP_RE.test(p)) {
        if (start < 0) start = i
        if (i - start > best[1] - best[0]) best = [start, i]
      } else start = -1
    })
    scriptParas = paragraphs.slice(best[0], best[1] + 1).map(stripMd)
  }
  if (!scriptParas.length) warnings.push('No audioscript found.')

  const spec = levelSpec(level ?? 'B2', format)
  const content: ListeningTaskContent = {
    kind: 'listening',
    format,
    style: /^[A-Z][\w .'-]{0,30}:\s/m.test(scriptParas.join('\n')) ? 'dialogue' : 'monologue',
    instructions: instructionLine || standardInstruction(format, topicMatch?.[1] ?? '', level ?? 'B2'),
    topic: format === 'true-false' ? (topicMatch?.[1] ?? '') : notesTitle.replace(/^notes on\s*/i, ''),
    script: scriptParas.join('\n\n'),
  }

  if (format === 'true-false') {
    const found = [...statements.keys(), ...tfKey.keys()]
    // The example row is always there, even when only the key or the self-check table was uploaded.
    const ids = [...new Set(found.length ? ['0', ...found] : [])].sort((a, b) => Number(a) - Number(b))
    const list = (ids.length ? ids : Array.from({ length: spec.items + 1 }, (_, i) => String(i))).map((id) => {
      const s = statements.get(id)
      const answer = tfKey.get(id) ?? s?.answer ?? true
      const row: ListeningStatement = { id, text: s?.text ?? '', answer }
      const trap = traps.get(id)
      if (!answer && trap) row.trap = trap
      return row
    })
    content.statements = list
    if (statements.size === 0) warnings.push('No statements found: type them into the table.')
    if (tfKey.size === 0 && statements.size > 0) warnings.push('No answer key found: set T or F for each statement.')
  } else {
    const ids = [...new Set([...notes.join(' ').matchAll(/\{\{(\d{1,2})\}\}/g)].map((m) => m[1]).concat([...notesKey.keys()]))].sort((a, b) => Number(a) - Number(b))
    const answers: ListeningNoteAnswer[] = ids.map((id) => ({ id, accepted: notesKey.get(id) ?? (id === '0' && noteExample.get('0') ? [noteExample.get('0') as string] : ['']) }))
    content.notes = notes.length ? notes : ids.map((id) => `{{${id}}}`)
    content.answers = answers.length ? answers : [{ id: '0', accepted: [''] }]
    if (notes.length === 0) warnings.push('No notes lines with numbered gaps found.')
    if (notesKey.size === 0) warnings.push('No answer key found: type the answers in.')
  }

  // A clean script (no markers): place the answer points automatically, for the teacher to check.
  let autoPlaced: string[] = []
  if (markers === 0 && content.script) {
    const auto = autoMarkScript(content)
    content.script = auto.script
    autoPlaced = auto.placed
    markers = auto.placed.length
    if (auto.placed.length) warnings.push(`Answer points placed automatically for items ${auto.placed.join(', ')}: check them in the preview.`)
    if (auto.missing.length) warnings.push(`Couldn't find where items ${auto.missing.join(', ')} are spoken: mark them as [[n|words]].`)
  }

  const notesStart = lines.findIndex((l) => /compliance summary|self-check|revision note/i.test(l))
  if (notesStart >= 0) {
    const authorNotes = lines.slice(notesStart).map(stripMd).filter((l) => l && !l.startsWith('|')).join('\n').slice(0, 6000)
    if (authorNotes) content.authorNotes = authorNotes
  }

  // The title line under the "LISTENING COMPREHENSION" heading, else a quoted title.
  const plain = lines.map(stripMd)
  const headingAt = plain.findIndex((l) => /^listening comprehension\b/i.test(l))
  const titleLine = headingAt >= 0 ? plain.slice(headingAt + 1, headingAt + 3).find((l) => l && wordCount(l) >= 2 && wordCount(l) <= 10 && /[A-Za-z]{3}/.test(l) && !/^task\b/i.test(l) && !/^listen/i.test(l)) : undefined
  const quoted = titleMatch?.[1] && /\p{L}{3,}\s+\p{L}/u.test(titleMatch[1]) ? titleMatch[1] : undefined
  const title = stripMd(titleLine ?? quoted ?? notesTitle ?? '') || (topicMatch?.[1] ?? '')
  return {
    content,
    level,
    title: title.slice(0, 160),
    sourceRef: sourceLine.replace(/^source\s*:\s*/i, '').slice(0, 500),
    found: {
      script: scriptParas.length > 0,
      markers,
      statements: statements.size,
      notes: notes.length,
      key: format === 'true-false' ? tfKey.size : notesKey.size,
      autoMarked: autoPlaced.length,
    },
    warnings,
  }
}
