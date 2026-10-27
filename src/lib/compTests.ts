import type { ExamItem, ExamTask as PaperTask, PassageBlock } from '../data/exams/types.js'
import { answerKey, scoreTask, type ExamAnswers, type ItemResult } from './examScoring.js'
import { getGrammarItem } from '../data/grammarCurriculum.js'

// Comprehension tests (Teacher Toolkit, /teacher/tools/comp-tests): a reading or listening text
// with a few sections of questions, made by the teacher with AI and edited by hand, printed or
// assigned to students, who take it in the app (/my-tests). Shared by the browser and
// api/_lib/compTests.ts, so keep it free of browser imports.
//
// Unlike the exam task maker (src/lib/examTasks.ts), nothing here follows an official exam
// format: any CEFR level, any mix of the five task types, any length. The sections are turned
// into Exam Prep tasks (toPaperTasks) so students see Exam Prep's item controls and the answers
// are scored by src/lib/examScoring.ts.

export type CompSkill = 'reading' | 'listening'
export type CompLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
export type CompTaskType = 'mcq' | 'true-false' | 'gap-fill' | 'matching' | 'short-answer'
export type CompStyle = 'monologue' | 'dialogue'

export const COMP_SKILLS: CompSkill[] = ['reading', 'listening']
export const COMP_LEVELS: CompLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
export const COMP_TASK_TYPES: CompTaskType[] = ['mcq', 'true-false', 'gap-fill', 'matching', 'short-answer']
export const COMP_STYLES: CompStyle[] = ['monologue', 'dialogue']

// --- Content -------------------------------------------------------------------------------
// Item ids are numbers as strings, "1".."n", running through the whole test; section ids are
// "s1".."sn". normalizeContent renumbers both after every edit.

export interface McqSectionItem {
  id: string
  stem: string
  /** Options in order; their keys are A, B, C, … */
  options: string[]
  /** The right option's key. */
  answer: string
}

export interface TrueFalseSectionItem {
  id: string
  statement: string
  answer: boolean
}

export interface GapFillAnswer {
  id: string
  /** Accepted answers; the first is the one shown in the key. */
  accepted: string[]
}

export interface MatchingSectionItem {
  id: string
  text: string
  /** The matching option's key (A, B, …). */
  answer: string
}

export interface ShortAnswerSectionItem {
  id: string
  question: string
  accepted: string[]
}

interface SectionBase {
  id: string
  instructions: string
}

export type CompSection =
  | (SectionBase & { type: 'mcq'; items: McqSectionItem[] })
  | (SectionBase & { type: 'true-false'; items: TrueFalseSectionItem[] })
  /** A summary of the text with gaps `{{id}}`; the answers come from the text. */
  | (SectionBase & { type: 'gap-fill'; summary: string; items: GapFillAnswer[]; maxWords: number })
  /** Match each item to an option (keys A, B, …); there may be more options than items. */
  | (SectionBase & { type: 'matching'; options: string[]; items: MatchingSectionItem[] })
  | (SectionBase & { type: 'short-answer'; items: ShortAnswerSectionItem[]; maxWords: number })

export interface CompTestContent {
  /**
   * Reading: the text the students read. Listening: the audioscript. Paragraphs are separated by
   * blank lines; dialogue lines start with a speaker label ("Anna: ").
   */
  text: string
  /** Listening only: one voice or two (TTS). */
  style?: CompStyle
  sections: CompSection[]
  /** What the teacher asked the generator to focus on; shown in the editor, not to students. */
  focus?: CompFocus
}

export interface CompFocus {
  /** Grammar points the text uses (English titles: curriculum titles or the teacher's own). */
  grammar: string[]
  /** Words and phrases the text should use; some items test them. */
  vocabulary: string[]
}

export interface CompTestSummary {
  id: string
  skill: CompSkill
  level: CompLevel
  title: string
  topic: string
  itemCount: number
  assignedCount: number
  submittedCount: number
  updatedAt: string
}

export interface CompTest {
  id: string
  skill: CompSkill
  level: CompLevel
  title: string
  topic: string
  /** Listening: how many times a student may play the recording (0 = no limit). */
  maxPlays: number
  content: CompTestContent
  /** Whether the current recording matches the script (or is the teacher's own upload). */
  hasAudio: boolean
  audioUploaded: boolean
  createdAt: string
  updatedAt: string
}

export interface CompTestInput {
  skill: CompSkill
  level: CompLevel
  title: string
  topic: string
  maxPlays: number
  content: CompTestContent
}

/** What the teacher asks the generator for. */
export interface CompGenerateInput {
  skill: CompSkill
  level: CompLevel
  topic: string
  /** Reading: words. Listening: minutes. */
  length: number
  style: CompStyle
  tasks: { type: CompTaskType; count: number }[]
  /** Optional: Grammar Coach curriculum ids (src/data/grammarCurriculum.ts), at the level or below. */
  grammar?: string[]
  /** Optional: a grammar point in the teacher's own words. */
  grammarOther?: string
  /** Optional: words and phrases to use in the text. */
  vocabulary?: string[]
}

// --- Assignments and results ---------------------------------------------------------------

export interface CompItemOutcome {
  /** answerKey(sectionId, itemId) */
  key: string
  correct: boolean
  given: string
  expected: string
  /** The teacher changed the automatic mark. */
  overridden?: boolean
}

export interface CompResult {
  score: number
  max: number
  items: CompItemOutcome[]
}

export interface CompAssignment {
  id: string
  studentId: string
  studentEmail: string
  assignedAt: string
  dueAt: string | null
  submittedAt: string | null
  score: number | null
  max: number | null
}

export interface CompAssignmentDetail extends CompAssignment {
  /** The test as the student answered it (a snapshot taken at submission). */
  content: CompTestContent | null
  answers: ExamAnswers
  result: CompResult | null
}

/** A student's assigned test in their list. */
export interface MyCompTestSummary {
  assignmentId: string
  title: string
  skill: CompSkill
  level: CompLevel
  teacherEmail: string
  assignedAt: string
  dueAt: string | null
  submittedAt: string | null
  score: number | null
  max: number | null
}

/**
 * A student's assigned test. Before submission the content carries no answers (stripKeys);
 * listening content carries no script either. After submission it is the full snapshot.
 */
export interface MyCompTest extends MyCompTestSummary {
  maxPlays: number
  content: CompTestContent
  audioUrl: string | null
  answers: ExamAnswers | null
  result: CompResult | null
}

// --- Limits --------------------------------------------------------------------------------

export const COMP_TITLE_MAX = 160
export const COMP_TOPIC_MAX = 160
export const COMP_TEXT_MAX = 14_000
export const COMP_LINE_MAX = 400
export const COMP_SUMMARY_MAX = 3_000
export const COMP_MAX_SECTIONS = 6
export const COMP_MAX_SECTION_ITEMS = 15
export const COMP_MAX_ITEMS = 40
export const COMP_MAX_OPTIONS = 10
export const COMP_MAX_ACCEPTED = 6
export const COMP_MAX_PLAYS = 3
/** AI generations per teacher per UTC day. */
export const COMP_GENERATIONS_PER_DAY = 20
export const COMP_READING_WORDS: [number, number] = [80, 1500]
export const COMP_LISTENING_MINUTES: [number, number] = [1, 8]
export const COMP_AUDIO_UPLOAD_MAX_BYTES = 20 * 1024 * 1024
/** Grammar points per test (curriculum picks and the teacher's own together). */
export const COMP_MAX_GRAMMAR = 3
export const COMP_GRAMMAR_OTHER_MAX = 120
export const COMP_MAX_VOCAB = 40
export const COMP_VOCAB_TERM_MAX = 60

/** Default reading length (words) and listening length (minutes) per level. */
export const COMP_DEFAULT_LENGTH: Record<CompLevel, { words: number; minutes: number }> = {
  A1: { words: 150, minutes: 1 },
  A2: { words: 220, minutes: 2 },
  B1: { words: 350, minutes: 3 },
  B2: { words: 500, minutes: 3 },
  C1: { words: 650, minutes: 4 },
  C2: { words: 800, minutes: 5 },
}

/**
 * Speaking speed of the recording per level (words a minute, pauses included), which also turns
 * a listening length in minutes into a script length in words.
 */
export const COMP_WPM: Record<CompLevel, number> = { A1: 95, A2: 110, B1: 125, B2: 140, C1: 150, C2: 160 }

export function targetWords(input: Pick<CompGenerateInput, 'skill' | 'level' | 'length'>): number {
  return input.skill === 'reading' ? Math.round(input.length) : Math.round(input.length * COMP_WPM[input.level])
}

// --- Helpers -------------------------------------------------------------------------------

export const optionKey = (index: number) => String.fromCharCode(65 + index)

export function countWords(text: string): number {
  return text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length
}

export function itemCount(content: CompTestContent): number {
  return content.sections.reduce((n, s) => n + s.items.length, 0)
}

const SPEAKER_RE = /^((?:[A-Z][\w.'’-]*\s?){1,3}):\s+/

/** Whether the script is a dialogue (speaker labels at line starts). */
export function hasSpeakers(text: string): boolean {
  return text.split('\n').filter((l) => SPEAKER_RE.test(l.trim())).length >= 2
}

/** Default instruction line for a section, in English (the language of the test). */
export function defaultInstructions(type: CompTaskType, skill: CompSkill, maxWords = 3): string {
  const source = skill === 'reading' ? 'the text' : 'the recording'
  switch (type) {
    case 'mcq':
      return `Choose the correct answer (A, B, C or D) according to ${source}.`
    case 'true-false':
      return `Decide whether these statements are true or false according to ${source}.`
    case 'gap-fill':
      return `Complete the summary. Use no more than ${words(maxWords)} from ${source} in each gap.`
    case 'matching':
      return `Match each item (1, 2, …) with the correct option (A, B, …). There are more options than you need.`
    case 'short-answer':
      return `Answer the questions in no more than ${words(maxWords)}.`
  }
}

function words(n: number): string {
  const names = ['', 'ONE WORD', 'TWO WORDS', 'THREE WORDS', 'FOUR WORDS', 'FIVE WORDS', 'SIX WORDS']
  return names[n] ?? `${n} WORDS`
}

// --- Gap-fill editing markup ---------------------------------------------------------------
// In the editor a gap-fill summary is one text where each gap is written as its answers in
// square brackets: "Mia moved to [Leeds] in [2019|twenty nineteen]."

const GAP_RE = /\{\{([^}]+)\}\}/g

export function summaryToMarkup(summary: string, items: GapFillAnswer[]): string {
  const byId = new Map(items.map((i) => [i.id, i]))
  return summary.replace(GAP_RE, (_, id: string) => `[${(byId.get(id)?.accepted ?? []).join('|')}]`)
}

/** Parses the editor markup; gap ids are temporary ("g1", …) until normalizeContent numbers them. */
export function markupToSummary(markup: string): { summary: string; items: GapFillAnswer[] } {
  const items: GapFillAnswer[] = []
  const summary = markup.replace(/\[([^\]]*)\]/g, (_, inner: string) => {
    const id = `g${items.length + 1}`
    items.push({ id, accepted: inner.split('|').map((s) => s.trim()).filter(Boolean) })
    return `{{${id}}}`
  })
  return { summary, items }
}

// --- Validation ----------------------------------------------------------------------------

export class CompValidationError extends Error {}

function fail(message: string): never {
  throw new CompValidationError(message)
}

function str(v: unknown, max: number, what: string, { allowEmpty = false } = {}): string {
  if (typeof v !== 'string') fail(`${what} must be text`)
  const s = v.replace(/\r\n?/g, '\n').trim()
  if (!allowEmpty && !s) fail(`${what} is empty`)
  if (s.length > max) fail(`${what} is longer than ${max} characters`)
  return s
}

function line(v: unknown, what: string): string {
  return str(v, COMP_LINE_MAX, what).replace(/\s+/g, ' ')
}

function accepted(v: unknown, what: string): string[] {
  const list = (Array.isArray(v) ? v : typeof v === 'string' ? v.split('|') : [])
    .map((a) => (typeof a === 'string' ? a.replace(/\s+/g, ' ').trim() : ''))
    .filter(Boolean)
  const unique = [...new Set(list)].slice(0, COMP_MAX_ACCEPTED)
  if (unique.length === 0) fail(`${what} has no answer`)
  for (const a of unique) if (a.length > COMP_LINE_MAX) fail(`${what} answer is too long`)
  return unique
}

/** A key answer over the word limit would mark the student who writes it wrong. */
function withinWordLimit(list: string[], maxWords: number, what: string) {
  const long = list.find((a) => countWords(a) > maxWords)
  if (long) fail(`${what}: "${long}" is longer than the ${maxWords}-word limit`)
}

/** The most words any accepted answer has (the generator raises a section's limit to it). */
export function longestAnswerWords(lists: string[][]): number {
  return Math.max(0, ...lists.flat().map(countWords))
}

function maxWordsOf(v: unknown): number {
  const n = typeof v === 'number' && Number.isInteger(v) ? v : 3
  return Math.min(6, Math.max(1, n))
}

function oneOf<T extends string>(list: readonly T[], v: unknown, what: string): T {
  const found = list.find((x) => x === v)
  if (!found) fail(`${what} is not valid`)
  return found
}

function sanitizeSection(raw: unknown, index: number): CompSection {
  if (!raw || typeof raw !== 'object') fail(`Section ${index + 1} is not valid`)
  const r = raw as Record<string, unknown>
  const type = oneOf(COMP_TASK_TYPES, r.type, `Section ${index + 1} type`)
  const what = `Section ${index + 1}`
  const instructions = line(r.instructions, `${what} instructions`)
  const rawItems = Array.isArray(r.items) ? r.items : []
  if (rawItems.length > COMP_MAX_SECTION_ITEMS) fail(`${what} has more than ${COMP_MAX_SECTION_ITEMS} items`)
  const item = (i: number) => (rawItems[i] && typeof rawItems[i] === 'object' ? (rawItems[i] as Record<string, unknown>) : {})
  const itemId = (i: number) => (typeof item(i).id === 'string' && item(i).id ? (item(i).id as string) : `i${index}-${i}`)
  const base = { id: `s${index + 1}`, instructions }

  switch (type) {
    case 'mcq': {
      const items = rawItems.map((_, i) => {
        const it = item(i)
        const options = (Array.isArray(it.options) ? it.options : []).map((o, k) => line(o, `${what} question ${i + 1} option ${optionKey(k)}`))
        if (options.length < 2 || options.length > 5) fail(`${what} question ${i + 1} needs 2–5 options`)
        const keys = options.map((_, k) => optionKey(k))
        return { id: itemId(i), stem: line(it.stem, `${what} question ${i + 1}`), options, answer: oneOf(keys, it.answer, `${what} question ${i + 1} answer`) }
      })
      return { ...base, type, items }
    }
    case 'true-false': {
      const items = rawItems.map((_, i) => {
        const it = item(i)
        if (typeof it.answer !== 'boolean') fail(`${what} statement ${i + 1} has no answer`)
        return { id: itemId(i), statement: line(it.statement, `${what} statement ${i + 1}`), answer: it.answer }
      })
      return { ...base, type, items }
    }
    case 'gap-fill': {
      const summary = str(r.summary, COMP_SUMMARY_MAX, `${what} summary`)
      const keyed = new Map(rawItems.map((_, i) => [itemId(i), accepted(item(i).accepted, `${what} gap ${i + 1}`)]))
      const items: GapFillAnswer[] = []
      for (const m of summary.matchAll(GAP_RE)) {
        const list = keyed.get(m[1])
        if (!list) fail(`${what} gap {{${m[1]}}} has no answer`)
        if (items.some((x) => x.id === m[1])) fail(`${what} gap {{${m[1]}}} appears twice`)
        items.push({ id: m[1], accepted: list })
      }
      if (items.length === 0) fail(`${what} summary has no gaps`)
      if (items.length > COMP_MAX_SECTION_ITEMS) fail(`${what} has more than ${COMP_MAX_SECTION_ITEMS} gaps`)
      const maxWords = maxWordsOf(r.maxWords)
      items.forEach((it, i) => withinWordLimit(it.accepted, maxWords, `${what} gap ${i + 1}`))
      return { ...base, type, summary, items, maxWords }
    }
    case 'matching': {
      const options = (Array.isArray(r.options) ? r.options : []).map((o, k) => line(o, `${what} option ${optionKey(k)}`))
      if (options.length < 2 || options.length > COMP_MAX_OPTIONS) fail(`${what} needs 2–${COMP_MAX_OPTIONS} options`)
      const keys = options.map((_, k) => optionKey(k))
      const items = rawItems.map((_, i) => {
        const it = item(i)
        return { id: itemId(i), text: line(it.text, `${what} item ${i + 1}`), answer: oneOf(keys, it.answer, `${what} item ${i + 1} answer`) }
      })
      if (items.length > options.length) fail(`${what} has more items than options`)
      return { ...base, type, options, items }
    }
    case 'short-answer': {
      const items = rawItems.map((_, i) => {
        const it = item(i)
        return { id: itemId(i), question: line(it.question, `${what} question ${i + 1}`), accepted: accepted(it.accepted, `${what} question ${i + 1}`) }
      })
      const maxWords = maxWordsOf(r.maxWords)
      items.forEach((it, i) => withinWordLimit(it.accepted, maxWords, `${what} question ${i + 1}`))
      return { ...base, type, items, maxWords }
    }
  }
}

/** Numbers the sections s1.. and the items 1.. through the whole test (gap markers follow). */
export function normalizeContent(content: CompTestContent): CompTestContent {
  let n = 0
  const sections = content.sections.map((s, si): CompSection => {
    const id = `s${si + 1}`
    if (s.type === 'gap-fill') {
      const map = new Map<string, string>()
      const items = s.items.map((it) => {
        const next = String(++n)
        map.set(it.id, next)
        return { ...it, id: next }
      })
      const summary = s.summary.replace(GAP_RE, (whole, old: string) => (map.has(old) ? `{{${map.get(old)}}}` : whole))
      return { ...s, id, summary, items }
    }
    if (s.type === 'mcq') return { ...s, id, items: s.items.map((it) => ({ ...it, id: String(++n) })) }
    if (s.type === 'true-false') return { ...s, id, items: s.items.map((it) => ({ ...it, id: String(++n) })) }
    if (s.type === 'matching') return { ...s, id, items: s.items.map((it) => ({ ...it, id: String(++n) })) }
    return { ...s, id, items: s.items.map((it) => ({ ...it, id: String(++n) })) }
  })
  return { ...content, sections }
}

/** Throws CompValidationError with a readable message; returns clean, renumbered content. */
export function sanitizeContent(raw: unknown, skill: CompSkill): CompTestContent {
  if (!raw || typeof raw !== 'object') fail('Content is missing')
  const r = raw as Record<string, unknown>
  const text = str(r.text, COMP_TEXT_MAX, skill === 'reading' ? 'The text' : 'The script')
  const sectionsRaw = Array.isArray(r.sections) ? r.sections : []
  if (sectionsRaw.length === 0) fail('Add at least one task')
  if (sectionsRaw.length > COMP_MAX_SECTIONS) fail(`At most ${COMP_MAX_SECTIONS} tasks`)
  const sections = sectionsRaw.map(sanitizeSection)
  for (const [i, s] of sections.entries()) if (s.items.length === 0) fail(`Section ${i + 1} has no items`)
  const content: CompTestContent = {
    text,
    ...(skill === 'listening' ? { style: r.style === 'dialogue' || (r.style === undefined && hasSpeakers(text)) ? 'dialogue' : 'monologue' } : {}),
    sections,
  }
  const focus = sanitizeFocus(r.focus)
  if (focus) content.focus = focus
  if (itemCount(content) > COMP_MAX_ITEMS) fail(`At most ${COMP_MAX_ITEMS} items in a test`)
  return normalizeContent(content)
}

export function sanitizeTestInput(raw: unknown): CompTestInput {
  if (!raw || typeof raw !== 'object') fail('Invalid test')
  const r = raw as Record<string, unknown>
  const skill = oneOf(COMP_SKILLS, r.skill, 'skill')
  const plays = typeof r.maxPlays === 'number' && Number.isInteger(r.maxPlays) ? r.maxPlays : 2
  return {
    skill,
    level: oneOf(COMP_LEVELS, r.level, 'level'),
    title: line(r.title, 'Title').slice(0, COMP_TITLE_MAX),
    topic: typeof r.topic === 'string' ? r.topic.replace(/\s+/g, ' ').trim().slice(0, COMP_TOPIC_MAX) : '',
    maxPlays: Math.min(COMP_MAX_PLAYS, Math.max(0, plays)),
    content: sanitizeContent(r.content, skill),
  }
}

export function sanitizeGenerateInput(raw: unknown): CompGenerateInput {
  if (!raw || typeof raw !== 'object') fail('Invalid request')
  const r = raw as Record<string, unknown>
  const skill = oneOf(COMP_SKILLS, r.skill, 'skill')
  const level = oneOf(COMP_LEVELS, r.level, 'level')
  const topic = line(r.topic, 'Topic').slice(0, COMP_TOPIC_MAX)
  const length = typeof r.length === 'number' && Number.isFinite(r.length) ? r.length : NaN
  const [min, max] = skill === 'reading' ? COMP_READING_WORDS : COMP_LISTENING_MINUTES
  if (!(length >= min && length <= max)) fail(`length must be ${min}–${max}`)
  const tasks = (Array.isArray(r.tasks) ? r.tasks : []).map((t, i) => {
    const o = (t && typeof t === 'object' ? t : {}) as Record<string, unknown>
    const count = typeof o.count === 'number' && Number.isInteger(o.count) ? o.count : 0
    if (count < 2 || count > COMP_MAX_SECTION_ITEMS) fail(`Task ${i + 1}: 2–${COMP_MAX_SECTION_ITEMS} items`)
    return { type: oneOf(COMP_TASK_TYPES, o.type, `Task ${i + 1} type`), count }
  })
  if (tasks.length === 0) fail('Choose at least one task type')
  if (tasks.length > COMP_MAX_SECTIONS) fail(`At most ${COMP_MAX_SECTIONS} tasks`)
  if (tasks.reduce((n, t) => n + t.count, 0) > COMP_MAX_ITEMS) fail(`At most ${COMP_MAX_ITEMS} items in a test`)

  const grammar = [...new Set((Array.isArray(r.grammar) ? r.grammar : []).filter((g): g is string => typeof g === 'string'))]
  for (const id of grammar) {
    const found = getGrammarItem(id)
    if (!found) fail(`Unknown grammar point ${id}`)
    if (COMP_LEVELS.indexOf(found.level) > COMP_LEVELS.indexOf(level)) fail(`Grammar point "${found.item.title}" is above ${level}`)
  }
  const grammarOther = typeof r.grammarOther === 'string' ? r.grammarOther.replace(/\s+/g, ' ').trim() : ''
  if (grammarOther.length > COMP_GRAMMAR_OTHER_MAX) fail(`The grammar point is longer than ${COMP_GRAMMAR_OTHER_MAX} characters`)
  if (grammar.length + (grammarOther ? 1 : 0) > COMP_MAX_GRAMMAR) fail(`At most ${COMP_MAX_GRAMMAR} grammar points`)
  const vocabulary = cleanVocabulary(r.vocabulary)
  if (vocabulary.length > COMP_MAX_VOCAB) fail(`At most ${COMP_MAX_VOCAB} words`)

  return {
    skill,
    level,
    topic,
    length,
    style: r.style === 'dialogue' ? 'dialogue' : 'monologue',
    tasks,
    ...(grammar.length ? { grammar } : {}),
    ...(grammarOther ? { grammarOther } : {}),
    ...(vocabulary.length ? { vocabulary } : {}),
  }
}

/** The grammar focus as English titles: the curriculum picks, then the teacher's own. */
export function grammarTitles(input: Pick<CompGenerateInput, 'grammar' | 'grammarOther'>): string[] {
  return [...(input.grammar ?? []).map((id) => getGrammarItem(id)?.item.title ?? id), ...(input.grammarOther ? [input.grammarOther] : [])]
}

// --- Vocabulary focus ----------------------------------------------------------------------

/**
 * Splits pasted text into terms (one per line, or comma/semicolon separated), trims them and
 * drops duplicates (case-insensitive) and over-long ones. Not capped: callers decide.
 */
export function splitVocabulary(text: string): string[] {
  return cleanVocabulary(text.split(/[\n,;]+/))
}

export function cleanVocabulary(raw: unknown): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const v of Array.isArray(raw) ? raw : []) {
    if (typeof v !== 'string') continue
    const term = v.replace(/\s+/g, ' ').trim()
    const key = term.toLowerCase()
    if (!term || term.length > COMP_VOCAB_TERM_MAX || seen.has(key)) continue
    seen.add(key)
    out.push(term)
  }
  return out
}

const SUFFIXES = ['', 's', 'es', 'd', 'ed', 'ing', 'er', 'est', 'ies', 'ied', 'ly']

/** Whether a text word is the term word or a regular form of it (plan → plans, planned, planning). */
function formOf(token: string, word: string): boolean {
  if (token === word) return true
  const stems = new Set([word, word.replace(/e$/, ''), word.replace(/y$/, ''), word + word.slice(-1)])
  for (const stem of stems) {
    if (stem.length < 3 || !token.startsWith(stem)) continue
    if (SUFFIXES.includes(token.slice(stem.length))) return true
  }
  return false
}

/**
 * Which focus terms the text uses, in regular forms; a phrase may have up to two words between
 * its parts ("pick it up"). Irregular forms (go → went) are not recognised.
 */
export function vocabCoverage(text: string, terms: string[]): { used: string[]; missing: string[] } {
  const tokens = text.toLowerCase().replace(/[’']/g, "'").match(/[\p{L}\p{N}'-]+/gu) ?? []
  const used: string[] = []
  const missing: string[] = []
  for (const term of terms) {
    const words = term.toLowerCase().replace(/[’']/g, "'").match(/[\p{L}\p{N}'-]+/gu) ?? []
    const found =
      words.length > 0 &&
      tokens.some((_, start) => {
        let at = start
        for (const [i, w] of words.entries()) {
          const limit = i === 0 ? at : Math.min(tokens.length - 1, at + 2)
          let hit = -1
          for (let k = at; k <= limit; k++) {
            if (formOf(tokens[k], w)) {
              hit = k
              break
            }
          }
          if (hit < 0) return false
          at = hit + 1
        }
        return true
      })
    ;(found ? used : missing).push(term)
  }
  return { used, missing }
}

function sanitizeFocus(raw: unknown): CompFocus | undefined {
  if (!raw || typeof raw !== 'object') return undefined
  const r = raw as Record<string, unknown>
  const grammar = (Array.isArray(r.grammar) ? r.grammar : [])
    .filter((g): g is string => typeof g === 'string' && !!g.trim())
    .map((g) => g.replace(/\s+/g, ' ').trim().slice(0, COMP_GRAMMAR_OTHER_MAX))
    .slice(0, COMP_MAX_GRAMMAR)
  const vocabulary = cleanVocabulary(r.vocabulary).slice(0, COMP_MAX_VOCAB)
  return grammar.length || vocabulary.length ? { grammar, vocabulary } : undefined
}

// --- Students ------------------------------------------------------------------------------

/** The content without any answers (and, for listening, without the script). */
export function stripKeys(content: CompTestContent, skill: CompSkill): CompTestContent {
  return {
    text: skill === 'reading' ? content.text : '',
    ...(content.style ? { style: content.style } : {}),
    sections: content.sections.map((s): CompSection => {
      switch (s.type) {
        case 'mcq':
          return { ...s, items: s.items.map((it) => ({ ...it, answer: '' })) }
        case 'true-false':
          return { ...s, items: s.items.map((it) => ({ ...it, answer: false })) }
        case 'gap-fill':
          return { ...s, items: s.items.map((it) => ({ ...it, accepted: [] })) }
        case 'matching':
          return { ...s, items: s.items.map((it) => ({ ...it, answer: '' })) }
        case 'short-answer':
          return { ...s, items: s.items.map((it) => ({ ...it, accepted: [] })) }
      }
    }),
  }
}

/** Each section as an Exam Prep task, for TaskView and examScoring. */
export function toPaperTasks(content: CompTestContent): PaperTask[] {
  return content.sections.map((s, i): PaperTask => {
    const base = { id: s.id, label: `Task ${i + 1}`, instructions: s.instructions }
    switch (s.type) {
      case 'mcq':
        return {
          ...base,
          items: s.items.map((it): ExamItem => ({
            id: it.id,
            type: 'mcq',
            stem: it.stem,
            options: it.options.map((text, k) => ({ key: optionKey(k), text })),
            answer: it.answer,
          })),
        }
      case 'true-false':
        return {
          ...base,
          booleanLabels: ['True', 'False'],
          items: s.items.map((it): ExamItem => ({ id: it.id, type: 'boolean', statement: it.statement, answer: it.answer })),
        }
      case 'gap-fill':
        return {
          ...base,
          passage: s.summary
            .split(/\n\s*\n/)
            .map((p) => p.trim())
            .filter(Boolean)
            .map((text): PassageBlock => ({ text })),
          items: s.items.map((it): ExamItem => ({
            id: it.id,
            type: 'short-text',
            answer: { accepted: it.accepted, match: 'exact-ci', maxWords: s.maxWords },
          })),
        }
      case 'matching':
        return {
          ...base,
          bank: s.options.map((text, k) => ({ key: optionKey(k), text })),
          passage: s.items.map((it): PassageBlock => ({ text: it.text, itemId: it.id })),
          items: s.items.map((it): ExamItem => ({ id: it.id, type: 'choice', answer: it.answer })),
        }
      case 'short-answer':
        return {
          ...base,
          items: s.items.map((it): ExamItem => ({
            id: it.id,
            type: 'short-text',
            prompt: it.question,
            answer: { accepted: it.accepted, match: 'exact-ci', maxWords: s.maxWords },
          })),
        }
    }
  })
}

/** Keys of the items a teacher may re-mark (typed answers). */
export function isTypedItem(content: CompTestContent, key: string): boolean {
  const [sectionId] = key.split('/')
  const s = content.sections.find((x) => x.id === sectionId)
  return s?.type === 'gap-fill' || s?.type === 'short-answer'
}

/** Normalizes typed answers a little more than Exam Prep does: quotes, final punctuation. */
function normalizeTyped(answers: ExamAnswers): ExamAnswers {
  const out: ExamAnswers = {}
  for (const [k, v] of Object.entries(answers)) {
    out[k] = typeof v === 'string' ? v.replace(/[’‘]/g, "'").replace(/[.!?,;:]+$/, '').trim() : v
  }
  return out
}

/**
 * Scores the answers. One point per item. `overrides` (answer key → right/wrong) are the
 * teacher's re-marks of typed answers and win over the automatic mark.
 */
export function scoreComp(content: CompTestContent, answers: ExamAnswers, overrides: Record<string, boolean> = {}): CompResult {
  const tasks = toPaperTasks(content)
  const items: CompItemOutcome[] = []
  const clean = normalizeTyped(answers)
  for (const task of tasks) {
    for (const r of scoreTask(task, clean).items as ItemResult[]) {
      const key = answerKey(task.id, r.itemId)
      const override = overrides[key]
      const raw = answers[key]
      items.push({
        key,
        correct: override ?? r.correct,
        given: typeof raw === 'string' ? raw : r.given,
        expected: r.expected,
        ...(override !== undefined && override !== r.correct ? { overridden: true } : {}),
      })
    }
  }
  return { score: items.filter((i) => i.correct).length, max: items.length, items }
}

/** Keeps only answers to items that exist, in the shape each item takes. */
export function sanitizeAnswers(content: CompTestContent, raw: unknown): ExamAnswers {
  const src = raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {}
  const out: ExamAnswers = {}
  for (const s of content.sections) {
    for (const it of s.items) {
      const key = answerKey(s.id, it.id)
      const v = src[key]
      if (s.type === 'true-false') {
        if (typeof v === 'boolean') out[key] = v
      } else if (typeof v === 'string' && v.trim()) {
        out[key] = v.slice(0, COMP_LINE_MAX)
      }
    }
  }
  return out
}
