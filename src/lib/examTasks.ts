// Exam task maker (Teacher Toolkit): shared types, limits and validation for the client and
// api/teacher-tools.ts. Built for all four exam parts of the Zöld Út-style B1/B2/C1 exam
// (listening, reading, writing, oral exam task sheet); only listening is implemented so far.
// The listening rules come from the master prompt listening_exam_generator_prompt_2_4.md and
// the "Listening Task Publication Criteria" review (src/data/examTaskCriteria.ts).

export type ExamPart = 'listening' | 'reading' | 'writing' | 'speaking'
export type TaskLevel = 'B1' | 'B2' | 'C1'
export type ListeningFormat = 'true-false' | 'notes'
export type ExamField = 'general' | 'business' | 'technical' | 'agri-env'
export type ScriptStyle = 'monologue' | 'dialogue' | 'panel'
export type TaskOrigin = 'generated' | 'uploaded' | 'pasted'
export type TrapType = 'swap' | 'conjunction'

export const EXAM_PARTS: ExamPart[] = ['listening', 'reading', 'writing', 'speaking']
/** Exam parts the maker can build today; the others show as "coming soon". */
export const READY_PARTS: ExamPart[] = ['listening']
export const TASK_LEVELS: TaskLevel[] = ['B1', 'B2', 'C1']
export const LISTENING_FORMATS: ListeningFormat[] = ['true-false', 'notes']
export const EXAM_FIELDS: ExamField[] = ['general', 'business', 'technical', 'agri-env']
export const SCRIPT_STYLES: ScriptStyle[] = ['monologue', 'dialogue', 'panel']

/**
 * The three notes layouts of the real B2/C1 exams (the user's analysis of 8 notes tasks):
 * - 'flat-bullets': one title, one list of short bullet fragments, at most one dash sub-level;
 * - 'label-table': a two-column NOTES table, a descriptive label on the left, the blank on the right;
 * - 'outline': notes grouped under section headings (numbered or not, some phrased as questions),
 *   nested up to three levels.
 * Old tasks have no subtype: they are 'flat-bullets'.
 */
export type NotesSubtype = 'flat-bullets' | 'label-table' | 'outline'
export const NOTES_SUBTYPES: NotesSubtype[] = ['flat-bullets', 'label-table', 'outline']

/** A true/false row. Row "0" is the example. */
export interface ListeningStatement {
  id: string
  text: string
  answer: boolean
  /** How a false statement was made false (2_4 trap taxonomy); unset on true rows. */
  trap?: TrapType
}

/** The key for a notes gap `{{id}}`. The first accepted answer is the one spoken in the script. */
export interface ListeningNoteAnswer {
  id: string
  accepted: string[]
}

export interface ListeningTaskContent {
  kind: 'listening'
  format: ListeningFormat
  style: ScriptStyle
  /** The instruction sentence, as printed on the task sheet. */
  instructions: string
  /** True/false: the topic phrase in the instruction; notes: the box title ("Notes on …"). */
  topic: string
  /**
   * The annotated audioscript. Paragraphs are separated by blank lines; dialogue lines may
   * start with a speaker label ("Interviewer: "). Each item's answer point is marked
   * `[[3|the words where it is spoken]]`; removing the markers gives the recording script.
   */
  script: string
  /** True/false rows, "0" (the example) first. */
  statements?: ListeningStatement[]
  /** Notes only: the layout of the notes box (unset = 'flat-bullets'). */
  subtype?: NotesSubtype
  /**
   * Notes lines in order; a gap is `{{id}}`, "0" is the example. Light markup (see parseNoteLine):
   * "# heading" (outline section heading, e.g. "# 1. Frictional type"), two leading spaces per
   * sub-level (at most 3 levels), and "label || {{n}}" for a row of the label table.
   */
  notes?: string[]
  answers?: ListeningNoteAnswer[]
  /** The generator's or the uploader's own notes (self-check, revision notes). Not checked. */
  authorNotes?: string
}

export type ExamTaskContent = ListeningTaskContent

/**
 * A task starts as a draft; the creator publishes it for review, and only then can send it to
 * testers. A content change (a new revision) puts it back to draft until it is published again.
 */
export type ExamTaskStatus = 'draft' | 'published'

export interface ExamTaskSummary {
  id: string
  examPart: ExamPart
  level: TaskLevel
  format: string
  field: ExamField
  title: string
  origin: TaskOrigin
  revision: number
  status: ExamTaskStatus
  /** The revision published last (null: never published), and when. */
  publishedRevision: number | null
  publishedAt: string | null
  updatedAt: string
  /** The creator's email (shown on tasks sent to the caller). */
  ownerEmail?: string
  isOwner: boolean
  reviewerCount: number
  /** Submitted tests of the current revision. */
  submittedCount: number
  /** The caller's own test of the current revision (reviewers). */
  myReviewSubmitted?: boolean
}

export interface ExamTask extends Omit<ExamTaskSummary, 'reviewerCount' | 'submittedCount' | 'myReviewSubmitted'> {
  sourceRef: string
  content: ExamTaskContent
  /** Whether a recording for the current script exists (TTS render or upload). */
  hasAudio: boolean
  createdAt: string
}

export interface ExamTaskInput {
  examPart: ExamPart
  level: TaskLevel
  field: ExamField
  title: string
  origin: TaskOrigin
  sourceRef: string
  content: ExamTaskContent
}

// --- Test mode ---------------------------------------------------------------------------

export type ItemVerdict = 'accept' | 'reject'

export interface ItemReview {
  verdict: ItemVerdict
  /** Criterion ids (src/data/examTaskCriteria.ts) the reviewer gives as reasons. */
  reasons: string[]
  note?: string
}

export type TaskRecommendation = 'publish' | 'revise' | 'reject'

export interface ExamTaskReview {
  reviewerId: string
  reviewerEmail: string
  revision: number
  /** The reviewer's own answers as a candidate: item id → true/false or the typed note. */
  answers: Record<string, boolean | string>
  verdicts: Record<string, ItemReview>
  recommendation: TaskRecommendation | null
  overallNote: string
  submittedAt: string | null
}

export interface ReviewerStatus {
  reviewerId: string
  email: string
  invitedAt: string
  /** Submitted a test of the current revision. */
  submitted: boolean
}

export interface TeacherRef {
  id: string
  email: string
}

export interface TeacherPool {
  id: string
  name: string
  memberIds: string[]
}

export const TASK_REVIEW_KEY = 'task'

// --- Limits ------------------------------------------------------------------------------

export const TASK_TITLE_MAX = 160
export const SOURCE_REF_MAX = 500
export const SCRIPT_MAX_LENGTH = 12_000
export const LINE_MAX_LENGTH = 400
export const MAX_ITEMS = 20
export const AUTHOR_NOTES_MAX = 6_000
export const REVIEW_NOTE_MAX = 600
export const OVERALL_NOTE_MAX = 2_000
export const POOL_NAME_MAX = 80
export const POOL_MAX_MEMBERS = 50
/** AI generations per teacher per UTC day. */
export const TASK_GENERATIONS_PER_DAY = 15
/** Source text sent to the model (words); longer articles are cut. */
export const SOURCE_MAX_WORDS = 1_400
export const AUDIO_UPLOAD_MAX_BYTES = 15 * 1024 * 1024

// --- Level calibration (master prompt 2_4, section 2) -----------------------------------

export interface LevelSpec {
  wordsMin: number
  wordsMax: number
  /** Live items (rows 1..n), plus the example row 0. */
  items: number
  /** Words per note answer (notes only). */
  answerWords?: number
  /** Max numeric answers (notes). */
  maxNumeric?: number
  /** Average sentence length band (publication criteria A). */
  sentenceAvg: [number, number]
  /** Speech rate for TTS, words per minute. */
  wpm: number
  /** Named entities allowed in the script. */
  maxNames: number
}

/**
 * `field` matters for notes only: every real B2/C1 notes task allows 3 words per answer except
 * C1 Technical English, which allows 2.
 */
export function levelSpec(level: TaskLevel, format: ListeningFormat, field?: ExamField): LevelSpec {
  const sentenceAvg: Record<TaskLevel, [number, number]> = { B1: [12, 15], B2: [16, 20], C1: [20, 25] }
  const wpm: Record<TaskLevel, number> = { B1: 125, B2: 145, C1: 145 }
  const maxNames: Record<TaskLevel, number> = { B1: 4, B2: 6, C1: 8 }
  const base = { sentenceAvg: sentenceAvg[level], wpm: wpm[level], maxNames: maxNames[level] }
  if (format === 'true-false') return { ...base, wordsMin: 400, wordsMax: 450, items: 7 }
  if (level === 'B1') return { ...base, wordsMin: 300, wordsMax: 350, items: 8, answerWords: 1, maxNumeric: 1 }
  const answerWords = level === 'C1' && field === 'technical' ? 2 : 3
  return { ...base, wordsMin: level === 'B2' ? 350 : 450, wordsMax: level === 'B2' ? 400 : 550, items: 13, answerWords, maxNumeric: 2 }
}

/** The standard instruction sentence (2_4 section 3). */
export function standardInstruction(format: ListeningFormat, topic: string, level: TaskLevel, field?: ExamField): string {
  if (format === 'true-false') {
    return `Listen to the text about ${topic.trim() || '…'}. Based on the text, decide if the statements are true (T) or false (F). Write your answers in the table below, according to the example (0). Please note that if all your answers are marked as true or as false, your answers will be disqualified.`
  }
  const n = levelSpec(level, 'notes', field).answerWords ?? 3
  const limit = n === 1 ? '1 word' : `no more than ${n} words`
  return `Listen to the text. Use what you heard to complete the table with your notes of ${limit} each, according to the example (0).`
}

export function emptyListeningContent(
  format: ListeningFormat,
  level: TaskLevel,
  subtype: NotesSubtype = 'flat-bullets',
  field?: ExamField,
): ListeningTaskContent {
  const n = levelSpec(level, format).items
  const ids = Array.from({ length: n + 1 }, (_, i) => String(i))
  return {
    kind: 'listening',
    format,
    style: 'monologue',
    instructions: standardInstruction(format, '', level, field),
    topic: '',
    script: '',
    ...(format === 'true-false'
      ? { statements: ids.map((id) => ({ id, text: '', answer: true })) }
      : { subtype, notes: notesTemplate(subtype, ids), answers: ids.map((id) => ({ id, accepted: [''] })) }),
  }
}

// --- Notes markup --------------------------------------------------------------------------
//
// Notes stay plain lines with {{n}} gaps; three bits of markup carry the layout:
//   "# 1. Frictional type"           a section heading (outline); the text after "# " is printed
//   "  - learn {{0}}"                two leading spaces per sub-level (0–2); a leading -, – or •
//                                    is only decoration
//   "opening time of the market || {{0}}"  a label-table row: label cell || answer cell

export const NOTES_MAX_DEPTH = 2

export interface NoteLine {
  kind: 'heading' | 'line' | 'row'
  /** Sub-level 0–2 (lines only). */
  depth: number
  /** The text without markup; for a row, the answer (right) cell. */
  text: string
  /** Rows: the label (left) cell. */
  label?: string
}

const BULLET_RE = /^[-–•*]\s+/

/** One notes line with its markup read; null for a blank line. */
export function parseNoteLine(raw: string): NoteLine | null {
  const line = raw.replace(/\t/g, '  ').replace(/\s+$/, '')
  const body = line.trimStart()
  if (!body) return null
  const heading = body.match(/^#{1,3}\s+(.*)$/)
  if (heading) return { kind: 'heading', depth: 0, text: heading[1].trim() }
  const bar = body.indexOf('||')
  if (bar >= 0) return { kind: 'row', depth: 0, label: body.slice(0, bar).replace(BULLET_RE, '').trim(), text: body.slice(bar + 2).trim() }
  const depth = Math.min(NOTES_MAX_DEPTH, Math.floor((line.length - body.length) / 2))
  return { kind: 'line', depth, text: body.replace(BULLET_RE, '') }
}

/** A parsed line as plain text: a row reads "label: answer cell". */
export function noteLinePlain(line: NoteLine): string {
  if (line.kind !== 'row' || !line.label) return line.text
  return `${line.label}${/[:?]$/.test(line.label) ? '' : ':'} ${line.text}`.trim()
}

/**
 * The line holding gap `itemId` with what it hangs under: the nearest heading above it, then the
 * shallower lines it is nested in (a "(Give 2 examples.)" lead-in), the line itself last.
 */
export function noteChain(notes: string[], itemId: string): NoteLine[] {
  const idx = notes.findIndex((l) => l.includes(`{{${itemId}}}`))
  const own = idx >= 0 ? parseNoteLine(notes[idx]) : null
  if (!own) return []
  const chain = [own]
  if (own.kind === 'heading') return chain
  let want = own.depth
  for (let k = idx - 1; k >= 0; k--) {
    const p = parseNoteLine(notes[k])
    if (!p) continue
    if (p.kind === 'heading') {
      chain.unshift(p)
      break
    }
    if (p.kind === 'line' && p.depth < want) {
      chain.unshift(p)
      want = p.depth
    }
  }
  return chain
}

/** Starter lines for an empty notes box. */
export function notesTemplate(subtype: NotesSubtype, ids: string[]): string[] {
  if (subtype === 'label-table') return ids.map((id) => `|| {{${id}}}`)
  if (subtype === 'outline') {
    return ids.flatMap((id, i) => [...(i % 5 === 0 ? [`# ${Math.floor(i / 5) + 1}. …`] : []), `{{${id}}}`])
  }
  return ids.map((id) => `{{${id}}}`)
}

/** Rewrites the lines when the teacher switches layout: rows ↔ "label: gap" lines. */
export function convertNotes(notes: string[], to: NotesSubtype): string[] {
  const out: string[] = []
  for (const raw of notes) {
    const line = parseNoteLine(raw)
    if (line && to === 'label-table' && line.kind === 'line' && line.text.includes('{{')) {
      const at = line.text.indexOf('{{')
      let label = line.text.slice(0, at).replace(/[\s:–-]+$/, '')
      // A bare blank under a lead-in line ("competition from: (Give 1 example.)") takes the lead-in as its label.
      const prev = out.length ? parseNoteLine(out[out.length - 1]) : null
      if (!label && prev?.kind === 'line' && !prev.text.includes('{{')) {
        label = prev.text.replace(/[\s:–-]+$/, '')
        out.pop()
      }
      out.push(`${label} || ${line.text.slice(at)}`.trim())
    } else if (line && to !== 'label-table' && line.kind === 'row') out.push(noteLinePlain(line))
    else out.push(raw)
  }
  return out
}

/** The item ids a task asks for, example "0" first. */
export function itemIds(content: ListeningTaskContent): string[] {
  if (content.format === 'true-false') return (content.statements ?? []).map((s) => s.id)
  return (content.answers ?? []).map((a) => a.id)
}

// --- Validation (server side before every write; also used on import) -------------------

function str(v: unknown, max: number, what: string, { required = false } = {}): string {
  if (v === undefined || v === null) {
    if (required) throw new Error(`${what} is required`)
    return ''
  }
  if (typeof v !== 'string') throw new Error(`${what} must be text`)
  const s = v.replace(/\r\n?/g, '\n').trim()
  if (required && !s) throw new Error(`${what} is required`)
  if (s.length > max) throw new Error(`${what} is longer than ${max} characters`)
  return s
}

function oneOf<T extends string>(v: unknown, list: readonly T[], what: string): T {
  if (typeof v !== 'string' || !(list as readonly string[]).includes(v)) throw new Error(`Invalid ${what}`)
  return v as T
}

const ITEM_ID_RE = /^\d{1,2}$/

export function sanitizeListeningContent(raw: unknown): ListeningTaskContent {
  if (typeof raw !== 'object' || raw === null) throw new Error('content must be an object')
  const r = raw as Record<string, unknown>
  const format = oneOf(r.format, LISTENING_FORMATS, 'format')
  const out: ListeningTaskContent = {
    kind: 'listening',
    format,
    style: SCRIPT_STYLES.includes(r.style as ScriptStyle) ? (r.style as ScriptStyle) : 'monologue',
    instructions: str(r.instructions, LINE_MAX_LENGTH * 2, 'instructions'),
    topic: str(r.topic, LINE_MAX_LENGTH, 'topic'),
    script: str(r.script, SCRIPT_MAX_LENGTH, 'script'),
  }
  const authorNotes = str(r.authorNotes, AUTHOR_NOTES_MAX, 'authorNotes')
  if (authorNotes) out.authorNotes = authorNotes

  const seen = new Set<string>()
  const checkId = (id: unknown): string => {
    if (typeof id !== 'string' || !ITEM_ID_RE.test(id) || seen.has(id)) throw new Error('Invalid or repeated item id')
    seen.add(id)
    return id
  }

  if (format === 'true-false') {
    const list = Array.isArray(r.statements) ? r.statements : []
    if (list.length === 0 || list.length > MAX_ITEMS + 1) throw new Error('statements must have 1–21 rows')
    out.statements = list.map((s) => {
      const rec = (typeof s === 'object' && s !== null ? s : {}) as Record<string, unknown>
      const row: ListeningStatement = {
        id: checkId(rec.id),
        text: str(rec.text, LINE_MAX_LENGTH, 'statement'),
        answer: rec.answer === true,
      }
      if (rec.trap === 'swap' || rec.trap === 'conjunction') row.trap = rec.trap
      return row
    })
  } else {
    if (NOTES_SUBTYPES.includes(r.subtype as NotesSubtype)) out.subtype = r.subtype as NotesSubtype
    const notes = Array.isArray(r.notes) ? r.notes : []
    if (notes.length > 60) throw new Error('Too many note lines')
    // Leading spaces are the sub-level markup: keep up to three levels' worth.
    out.notes = notes.map((n) => {
      const line = str(n, LINE_MAX_LENGTH, 'note line')
      const raw = typeof n === 'string' ? n.replace(/\t/g, '  ') : ''
      const indent = Math.min(raw.length - raw.trimStart().length, NOTES_MAX_DEPTH * 2)
      return line ? ' '.repeat(indent) + line : line
    })
    const list = Array.isArray(r.answers) ? r.answers : []
    if (list.length === 0 || list.length > MAX_ITEMS + 1) throw new Error('answers must have 1–21 rows')
    out.answers = list.map((a) => {
      const rec = (typeof a === 'object' && a !== null ? a : {}) as Record<string, unknown>
      const accepted = (Array.isArray(rec.accepted) ? rec.accepted : [])
        .map((x) => str(x, 80, 'answer'))
        .filter(Boolean)
        .slice(0, 8)
      return { id: checkId(rec.id), accepted: accepted.length ? accepted : [''] }
    })
  }
  return out
}

export function sanitizeTaskInput(raw: unknown): ExamTaskInput {
  if (typeof raw !== 'object' || raw === null) throw new Error('Invalid task')
  const r = raw as Record<string, unknown>
  const examPart = oneOf(r.examPart, EXAM_PARTS, 'exam part')
  if (!READY_PARTS.includes(examPart)) throw new Error('This exam part is not available yet')
  return {
    examPart,
    level: oneOf(r.level, TASK_LEVELS, 'level'),
    field: EXAM_FIELDS.includes(r.field as ExamField) ? (r.field as ExamField) : 'general',
    title: str(r.title, TASK_TITLE_MAX, 'title', { required: true }),
    origin: oneOf(r.origin, ['generated', 'uploaded', 'pasted'] as const, 'origin'),
    sourceRef: str(r.sourceRef, SOURCE_REF_MAX, 'source'),
    content: sanitizeListeningContent(r.content),
  }
}

export function sanitizeItemReview(raw: unknown, validReasons: Set<string>): ItemReview | null {
  if (typeof raw !== 'object' || raw === null) return null
  const r = raw as Record<string, unknown>
  if (r.verdict !== 'accept' && r.verdict !== 'reject') return null
  const reasons = (Array.isArray(r.reasons) ? r.reasons : []).filter((x): x is string => typeof x === 'string' && validReasons.has(x))
  const note = typeof r.note === 'string' ? r.note.trim().slice(0, REVIEW_NOTE_MAX) : ''
  return { verdict: r.verdict, reasons: r.verdict === 'reject' ? [...new Set(reasons)] : [], ...(note ? { note } : {}) }
}

/** Environment / environmental-protection topics must be True/False (listening-task-intake skill). */
const ENVIRONMENT_RE =
  /\b(climate|global warming|carbon|emissions?|greenhouse|pollut\w*|biodiversity|conservation|endangered|extinct\w*|deforestation|recycl\w*|waste|plastic|sustainab\w*|renewable|fossil fuels?|environment\w*|ecosystems?|wildlife|habitat|drought|heatwave|circular economy|net zero)\b/gi

/** Counts environment-topic keywords; 3+ distinct ones = treat the source as an environment topic. */
export function looksEnvironmental(text: string): boolean {
  const hits = new Set((text.match(ENVIRONMENT_RE) ?? []).map((w) => w.toLowerCase()))
  return hits.size >= 3
}
