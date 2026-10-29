import { GAP, matchesAnswer, matchesGap, sentenceTiles } from './grammarExercises.js'
import { getGrammarItem } from '../data/grammarCurriculum.js'

// Mini courses (Teacher Toolkit, /teacher/tools/courses; students /my-courses). A course is 1–4
// units at one CEFR level; a unit is 4–7 modules in coursebook order; a module is a list of
// one-screen steps. Shared by the browser and api/_lib/courses.ts, so keep it free of browser
// imports. Design: docs/mini-courses-design.md.

export type CourseLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
export type ExplainLang = 'hu' | 'en' | 'de'
export type ModuleKind = 'vocabulary' | 'reading' | 'listening' | 'grammar' | 'pronunciation' | 'speaking' | 'writing' | 'unit_check'
/** A doubled module's job: Reading 2 / Listening 2 = 'second'; Speaking and Writing 'guided' → 'free'. */
export type ModuleVariant = 'guided' | 'free' | 'second'
export type UnitTemplate = 'balanced' | 'listening-speaking' | 'reading-writing' | 'compact' | 'custom'
export type InputSkill = 'reading' | 'listening'
export type PublishStatus = 'draft' | 'published'

export const COURSE_LEVELS: CourseLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
export const EXPLAIN_LANGS: ExplainLang[] = ['hu', 'en', 'de']
export const MODULE_KINDS: ModuleKind[] = ['vocabulary', 'reading', 'listening', 'grammar', 'pronunciation', 'speaking', 'writing', 'unit_check']
export const UNIT_TEMPLATES: UnitTemplate[] = ['balanced', 'listening-speaking', 'reading-writing', 'compact', 'custom']

export const MAX_UNITS_PER_COURSE = 4
export const MIN_MODULES = 4
export const MAX_MODULES = 7
export const MAX_GRAMMAR_PER_UNIT = 2
export const COURSE_TITLE_MAX = 160
export const COURSE_TOPIC_MAX = 160
export const UNIT_NOTES_MAX = 500
/** AI calls (unit outlines + modules) a teacher may make per UTC day. */
export const COURSE_GENERATIONS_PER_DAY = 60

/** Module kinds that can be built today; Pronunciation shows as "coming soon". */
export const AVAILABLE_KINDS: ReadonlySet<ModuleKind> = new Set(['vocabulary', 'reading', 'listening', 'grammar', 'speaking', 'writing', 'unit_check'])

// --- Templates and builder rules -----------------------------------------------------------

/**
 * 'input' / 'output' stand for the unit's skill choice: Reading (+ Writing) or Listening
 * (+ Speaking). In Balanced only the input changes; both productive skills are always there.
 */
type TemplateSlot = ModuleKind | 'input' | 'output'

const TEMPLATE_SLOTS: Record<Exclude<UnitTemplate, 'custom'>, TemplateSlot[]> = {
  balanced: ['vocabulary', 'input', 'grammar', 'pronunciation', 'speaking', 'writing', 'unit_check'],
  'listening-speaking': ['vocabulary', 'listening', 'grammar', 'pronunciation', 'speaking', 'speaking', 'unit_check'],
  'reading-writing': ['vocabulary', 'reading', 'grammar', 'writing', 'reading', 'writing', 'unit_check'],
  compact: ['vocabulary', 'input', 'grammar', 'output', 'unit_check'],
}

/** Whether the template lets the teacher choose Reading or Listening (Compact: the skill pair). */
export function templateHasInputChoice(template: UnitTemplate): boolean {
  return template === 'balanced' || template === 'compact'
}

/** The template's modules as designed, Pronunciation included (for showing it as "coming soon"). */
export function templateSlots(template: Exclude<UnitTemplate, 'custom'>, input: InputSkill = 'reading'): ModuleKind[] {
  return TEMPLATE_SLOTS[template].map((s) => (s === 'input' ? input : s === 'output' ? (input === 'reading' ? 'writing' : 'speaking') : s))
}

/**
 * The template's modules in order (custom: the compact plan, as a starting point). Modules that
 * can't be built yet (Pronunciation) are left out until they can; withCheck false drops the Unit
 * check, withGrammar false the Grammar module.
 */
export function templateKinds(template: UnitTemplate, input: InputSkill = 'reading', withCheck = true, withGrammar = true): ModuleKind[] {
  return templateSlots(template === 'custom' ? 'compact' : template, input).filter(
    (k) => AVAILABLE_KINDS.has(k) && (withCheck || k !== 'unit_check') && (withGrammar || k !== 'grammar'),
  )
}

/** Whether every module of the plan can be built today. */
export function planAvailable(kinds: ModuleKind[]): boolean {
  return kinds.every((k) => AVAILABLE_KINDS.has(k))
}

const DOUBLE_OK: ReadonlySet<ModuleKind> = new Set(['reading', 'listening', 'speaking', 'writing'])
const INPUT: ReadonlySet<ModuleKind> = new Set(['reading', 'listening'])
const OUTPUT: ReadonlySet<ModuleKind> = new Set(['speaking', 'writing'])

export type PlanProblem =
  | 'too_few'
  | 'too_many'
  | 'vocabulary_first'
  | 'check_last'
  | 'needs_pair'
  | 'grammar_after_input'
  | 'output_after_input'
  | 'pronunciation_needs_spoken'
  | 'pronunciation_after_input'
  | 'too_many_of_kind'
  | 'unavailable'

/**
 * What is wrong with a unit's module plan (empty = fine). Rules (design §Builder rules): 4–7
 * modules; Vocabulary first and once; at least one skill pair, Reading + Writing or Listening +
 * Speaking, the productive skill after the first text; Grammar optional, once, after the first
 * text; the Unit check optional, last and once; Pronunciation only with Listening or Speaking;
 * Reading/Listening/Speaking/Writing at most twice.
 */
export function planProblems(kinds: ModuleKind[], opts: { allowUnavailable?: boolean } = {}): PlanProblem[] {
  const problems = new Set<PlanProblem>()
  if (kinds.length < MIN_MODULES) problems.add('too_few')
  if (kinds.length > MAX_MODULES) problems.add('too_many')
  const count = (k: ModuleKind) => kinds.filter((x) => x === k).length
  const has = (k: ModuleKind) => count(k) > 0
  if (kinds[0] !== 'vocabulary' || count('vocabulary') !== 1) problems.add('vocabulary_first')
  if (has('unit_check') && (kinds[kinds.length - 1] !== 'unit_check' || count('unit_check') !== 1)) problems.add('check_last')
  if (!((has('reading') && has('writing')) || (has('listening') && has('speaking')))) problems.add('needs_pair')
  const firstInput = kinds.findIndex((k) => INPUT.has(k))
  for (const k of ['grammar', 'pronunciation'] as const) {
    if (count(k) > 1) problems.add('too_many_of_kind')
  }
  const grammarAt = kinds.indexOf('grammar')
  if (grammarAt >= 0 && firstInput >= 0 && grammarAt < firstInput) problems.add('grammar_after_input')
  const firstOutput = kinds.findIndex((k) => OUTPUT.has(k))
  if (firstOutput >= 0 && firstInput >= 0 && firstOutput < firstInput) problems.add('output_after_input')
  const pronAt = kinds.indexOf('pronunciation')
  if (pronAt >= 0) {
    if (!kinds.some((k) => k === 'listening' || k === 'speaking')) problems.add('pronunciation_needs_spoken')
    if (firstInput >= 0 && pronAt < firstInput) problems.add('pronunciation_after_input')
  }
  for (const k of DOUBLE_OK) if (count(k) > 2) problems.add('too_many_of_kind')
  if (!opts.allowUnavailable && !planAvailable(kinds)) problems.add('unavailable')
  return [...problems]
}

/** Each module's job, from its place in the plan. */
export function planVariants(kinds: ModuleKind[]): (ModuleVariant | null)[] {
  return kinds.map((k, i) => {
    const before = kinds.slice(0, i).filter((x) => x === k).length
    const total = kinds.filter((x) => x === k).length
    if (k === 'reading' || k === 'listening') return before > 0 ? 'second' : null
    if (k === 'speaking' || k === 'writing') return total > 1 ? (before > 0 ? 'free' : 'guided') : null
    return null
  })
}

const KIND_TITLES: Record<ModuleKind, string> = {
  vocabulary: 'Vocabulary',
  reading: 'Reading',
  listening: 'Listening',
  grammar: 'Grammar',
  pronunciation: 'Pronunciation',
  speaking: 'Speaking',
  writing: 'Writing',
  unit_check: 'Unit check',
}

/** The module's default English title, e.g. "Reading 2" or "Writing (guided)". */
export function defaultModuleTitle(kind: ModuleKind, variant: ModuleVariant | null): string {
  const base = KIND_TITLES[kind]
  if (variant === 'second') return `${base} 2`
  if (variant) return `${base} (${variant})`
  return base
}

/** Minutes a learner needs, by kind (design §Module specs). */
export const EST_MINUTES: Record<ModuleKind, number> = {
  vocabulary: 7,
  reading: 11,
  listening: 9,
  grammar: 11,
  pronunciation: 6,
  speaking: 9,
  writing: 12,
  unit_check: 6,
}

/** Vocabulary items per unit, by level. */
export const VOCAB_COUNT: Record<CourseLevel, number> = { A1: 8, A2: 9, B1: 11, B2: 12, C1: 13, C2: 13 }
/** Reading text length in words, by level. */
export const READING_WORDS: Record<CourseLevel, number> = { A1: 100, A2: 150, B1: 250, B2: 400, C1: 500, C2: 550 }
/** Listening script length in words (about 1–3 minutes at the level's speed), by level. */
export const LISTENING_WORDS: Record<CourseLevel, number> = { A1: 90, A2: 120, B1: 200, B2: 300, C1: 380, C2: 420 }
/** A writing task's word range, by level. */
export const WRITING_WORDS: Record<CourseLevel, [number, number]> = { A1: [20, 35], A2: [40, 60], B1: [80, 120], B2: [130, 170], C1: [180, 220], C2: [200, 260] }
/** A speaking task's length in seconds, by level. */
export const SPEAKING_SECONDS: Record<CourseLevel, number> = { A1: 30, A2: 45, B1: 60, B2: 90, C1: 120, C2: 120 }

/** Grammar points a unit at this level may pick: that level's and the ones below it. */
export function grammarAllowed(id: string, level: CourseLevel): boolean {
  const found = getGrammarItem(id)
  return !!found && COURSE_LEVELS.indexOf(found.level) <= COURSE_LEVELS.indexOf(level)
}

export function grammarTitle(id: string): string {
  return getGrammarItem(id)?.item.title ?? id
}

// --- Content -------------------------------------------------------------------------------
// Step ids are "1".."n" within a module; normalizeSteps renumbers them after every edit.

export interface CourseWord {
  term: string
  /** A short learner-friendly English definition. */
  meaning: string
  /** An example sentence using the term. */
  example: string
  pos?: string
}

export type CourseStep =
  /** Text to read: a warm-up question, a grammar box, a tip. Paragraphs separated by blank lines; **bold** allowed. */
  | { id: string; type: 'info'; title: string; body: string }
  /** Meet the words: one card per word with audio. */
  | { id: string; type: 'words'; words: CourseWord[] }
  /** Read the module's passage. */
  | { id: string; type: 'text' }
  /** Pick one option. */
  | { id: string; type: 'choice'; prompt: string; options: string[]; answer: number; explain?: string }
  /** A sentence with one gap ("___"): tap a word from `options`, or type when there are none. */
  | { id: string; type: 'gap'; sentence: string; accepted: string[]; options?: string[]; explain?: string }
  /** Match each left item to its right item. */
  | { id: string; type: 'match'; prompt: string; pairs: { left: string; right: string }[] }
  /** Put the word tiles in order to make `answer`. */
  | { id: string; type: 'order'; prompt: string; answer: string; explain?: string }
  /** Listen to the module's recording (listening modules; the script is the passage). */
  | { id: string; type: 'listen' }
  /** Write a short text; the AI gives feedback and a score out of 10. */
  | { id: string; type: 'write'; prompt: string; minWords: number; maxWords: number; model?: string; targets?: string[] }
  /**
   * Answer out loud (speech recognition, or typed when there is no microphone); the AI gives
   * feedback and a score out of 10. modelFirst: the model answer is shown before answering
   * (guided), otherwise after the feedback.
   */
  | { id: string; type: 'speak'; prompt: string; seconds: number; model?: string; modelFirst?: boolean; targets?: string[] }

export type StepType = CourseStep['type']
export const STEP_TYPES: StepType[] = ['info', 'words', 'text', 'listen', 'choice', 'gap', 'match', 'order', 'write', 'speak']
export const QUESTION_TYPES: ReadonlySet<StepType> = new Set(['choice', 'gap', 'match', 'order'])
/** Steps marked by the AI (on the server) rather than by a key. */
export const OPEN_TYPES: ReadonlySet<StepType> = new Set(['write', 'speak'])
/** What an open step is worth. */
export const OPEN_MAX = 10

export interface ModulePassage {
  title: string
  /** Paragraphs separated by blank lines; a dialogue's lines start with "Name: ". */
  text: string
  /** Listening: one voice or two. */
  style?: 'monologue' | 'dialogue'
}

export interface ModuleContent {
  /** One line telling the learner what this module does. */
  intro: string
  /** Reading modules, the listening script, and any module that refers back to the unit's text. */
  passage?: ModulePassage
  steps: CourseStep[]
  /** Listening: the recording in the course-audio bucket (set by the server; key = what it was made from). */
  audio?: { path: string; key: string }
}

/** The AI outline of a unit, written before its modules (and fed to every module prompt). */
export interface CourseBlueprint {
  /** 2–3 "I can …" statements. */
  canDos: string[]
  words: CourseWord[]
  /** What the reading/listening text is: genre, situation, what happens. */
  passageBrief: string
  /** How the grammar point(s) show up in this unit's texts. */
  grammarNotes: string
  /** The teacher's own text for the unit's first reading or listening module. */
  sourceText?: string
}

export const MAX_STEPS = 20
export const MAX_WORDS = 20
export const STEP_TEXT_MAX = 600
export const INFO_BODY_MAX = 2_000
export const PASSAGE_MAX = 6_000
export const MAX_OPTIONS = 5
export const MAX_PAIRS = 8
export const MAX_ACCEPTED = 6
export const MAX_TARGETS = 8
/** The teacher's own text for a unit (an article, or a listening script). */
export const SOURCE_TEXT_MAX = 6_000
export const OPEN_ANSWER_MAX = 3_000

export class CourseValidationError extends Error {}

function str(v: unknown, max: number, field: string, required = true): string {
  const s = typeof v === 'string' ? v.trim() : ''
  if (required && !s) throw new CourseValidationError(`${field} is required`)
  if (s.length > max) throw new CourseValidationError(`${field} is longer than ${max} characters`)
  return s
}

function optStr(v: unknown, max: number): string | undefined {
  const s = typeof v === 'string' ? v.trim().slice(0, max) : ''
  return s || undefined
}

function int(v: unknown, min: number, max: number, field: string): number {
  const n = typeof v === 'number' ? Math.round(v) : typeof v === 'string' ? parseInt(v, 10) : NaN
  if (!Number.isFinite(n) || n < min || n > max) throw new CourseValidationError(`${field} must be ${min}–${max}`)
  return n
}

function cleanTargets(v: unknown): string[] {
  return [...new Set((Array.isArray(v) ? v : []).map((t) => (typeof t === 'string' ? t.trim().slice(0, 80) : '')).filter(Boolean))].slice(0, MAX_TARGETS)
}

const obj = (v: unknown) => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {})
const list = (v: unknown) => (Array.isArray(v) ? v : [])

export function sanitizeWord(raw: unknown): CourseWord {
  const w = obj(raw)
  const word: CourseWord = {
    term: str(w.term, 80, 'term'),
    meaning: str(w.meaning, 200, 'meaning'),
    example: str(w.example, 300, 'example', false),
  }
  const pos = optStr(w.pos, 30)
  if (pos) word.pos = pos
  return word
}

function sanitizeStep(raw: unknown): CourseStep {
  const s = obj(raw)
  const id = typeof s.id === 'string' ? s.id : ''
  switch (s.type) {
    case 'info':
      return { id, type: 'info', title: str(s.title, 160, 'title'), body: str(s.body, INFO_BODY_MAX, 'body') }
    case 'words': {
      const words = list(s.words).map(sanitizeWord)
      if (words.length === 0 || words.length > MAX_WORDS) throw new CourseValidationError(`a words step needs 1–${MAX_WORDS} words`)
      return { id, type: 'words', words }
    }
    case 'text':
      return { id, type: 'text' }
    case 'choice': {
      const options = list(s.options).map((o) => str(o, 300, 'option'))
      if (options.length < 2 || options.length > MAX_OPTIONS) throw new CourseValidationError(`a choice needs 2–${MAX_OPTIONS} options`)
      const answer = typeof s.answer === 'number' && Number.isInteger(s.answer) ? s.answer : -1
      if (answer < 0 || answer >= options.length) throw new CourseValidationError('a choice needs its right option')
      const explain = optStr(s.explain, STEP_TEXT_MAX)
      return { id, type: 'choice', prompt: str(s.prompt, STEP_TEXT_MAX, 'prompt'), options, answer, ...(explain ? { explain } : {}) }
    }
    case 'gap': {
      const sentence = str(s.sentence, STEP_TEXT_MAX, 'sentence')
      if (sentence.split(GAP).length !== 2) throw new CourseValidationError(`a gap sentence needs exactly one ${GAP}`)
      const accepted = [...new Set(list(s.accepted).map((a) => str(a, 80, 'answer')))].slice(0, MAX_ACCEPTED)
      if (accepted.length === 0) throw new CourseValidationError('a gap needs an answer')
      const options = [...new Set(list(s.options).map((o) => str(o, 80, 'option')))]
      if (options.length > MAX_OPTIONS + 1) throw new CourseValidationError(`a gap has at most ${MAX_OPTIONS + 1} options`)
      if (options.length && !options.some((o) => matchesAnswer(o, accepted))) throw new CourseValidationError('a gap’s options must include its answer')
      const explain = optStr(s.explain, STEP_TEXT_MAX)
      return { id, type: 'gap', sentence, accepted, ...(options.length >= 2 ? { options } : {}), ...(explain ? { explain } : {}) }
    }
    case 'match': {
      const pairs = list(s.pairs).map((p) => ({ left: str(obj(p).left, 200, 'left'), right: str(obj(p).right, 200, 'right') }))
      if (pairs.length < 2 || pairs.length > MAX_PAIRS) throw new CourseValidationError(`a match needs 2–${MAX_PAIRS} pairs`)
      if (new Set(pairs.map((p) => p.right.toLowerCase())).size !== pairs.length) throw new CourseValidationError('a match’s right items must differ')
      return { id, type: 'match', prompt: str(s.prompt, STEP_TEXT_MAX, 'prompt'), pairs }
    }
    case 'order': {
      const answer = str(s.answer, 200, 'answer')
      const tiles = sentenceTiles(answer)
      if (tiles.length < 3 || tiles.length > 14) throw new CourseValidationError('an order sentence needs 3–14 words')
      const explain = optStr(s.explain, STEP_TEXT_MAX)
      return { id, type: 'order', prompt: str(s.prompt, STEP_TEXT_MAX, 'prompt'), answer, ...(explain ? { explain } : {}) }
    }
    case 'listen':
      return { id, type: 'listen' }
    case 'write': {
      const minWords = int(s.minWords, 5, 400, 'minWords')
      const maxWords = int(s.maxWords, minWords, 500, 'maxWords')
      const model = optStr(s.model, 2_000)
      const targets = cleanTargets(s.targets)
      return { id, type: 'write', prompt: str(s.prompt, STEP_TEXT_MAX, 'prompt'), minWords, maxWords, ...(model ? { model } : {}), ...(targets.length ? { targets } : {}) }
    }
    case 'speak': {
      const model = optStr(s.model, 2_000)
      const targets = cleanTargets(s.targets)
      return {
        id,
        type: 'speak',
        prompt: str(s.prompt, STEP_TEXT_MAX, 'prompt'),
        seconds: int(s.seconds, 10, 300, 'seconds'),
        ...(model ? { model } : {}),
        ...(model && s.modelFirst === true ? { modelFirst: true } : {}),
        ...(targets.length ? { targets } : {}),
      }
    }
    default:
      throw new CourseValidationError('unknown step type')
  }
}

/** Renumbers step ids "1".."n". */
export function normalizeSteps(steps: CourseStep[]): CourseStep[] {
  return steps.map((s, i) => ({ ...s, id: String(i + 1) }))
}

/** Validates a module's content (a teacher's save or the generator's reply); throws CourseValidationError. */
export function sanitizeModuleContent(raw: unknown): ModuleContent {
  const c = obj(raw)
  const steps = list(c.steps).map(sanitizeStep)
  if (steps.length === 0 || steps.length > MAX_STEPS) throw new CourseValidationError(`a module needs 1–${MAX_STEPS} steps`)
  const p = obj(c.passage)
  const style: ModulePassage['style'] = p.style === 'dialogue' || p.style === 'monologue' ? p.style : undefined
  const passage =
    typeof p.text === 'string' && p.text.trim() ? { title: str(p.title, 160, 'passage title', false), text: str(p.text, PASSAGE_MAX, 'passage'), ...(style ? { style } : {}) } : undefined
  if (!passage && steps.some((s) => s.type === 'text' || s.type === 'listen')) throw new CourseValidationError('a text or listen step needs a passage')
  const a = obj(c.audio)
  const audio = typeof a.path === 'string' && AUDIO_PATH_RE.test(a.path) && typeof a.key === 'string' && /^[0-9a-f]{40}$/.test(a.key) ? { path: a.path, key: a.key } : undefined
  return { intro: str(c.intro, 300, 'intro', false), ...(passage ? { passage } : {}), steps: normalizeSteps(steps), ...(audio ? { audio } : {}) }
}

/** Where the server keeps a listening module's recording: "<moduleId>/<key prefix>.mp3". */
export const AUDIO_PATH_RE = /^[0-9a-f-]{36}\/[0-9a-f]{12}\.mp3$/

export function sanitizeBlueprint(raw: unknown): CourseBlueprint {
  const b = obj(raw)
  const canDos = list(b.canDos)
    .map((x) => (typeof x === 'string' ? x.trim().slice(0, 200) : ''))
    .filter(Boolean)
    .slice(0, 3)
  const words: CourseWord[] = []
  for (const w of list(b.words)) {
    try {
      words.push(sanitizeWord(w))
    } catch {
      // A broken word is dropped, the rest stay.
    }
  }
  if (words.length === 0) throw new CourseValidationError('the outline needs words')
  return {
    canDos,
    words: words.slice(0, MAX_WORDS),
    passageBrief: str(b.passageBrief, 800, 'passageBrief', false),
    grammarNotes: str(b.grammarNotes, 800, 'grammarNotes', false),
  }
}

// --- Answers and scoring -------------------------------------------------------------------
// Answers by step id: choice → option index; gap → the text typed or the option tapped;
// match → for each left item, the index of the right item picked; order → the tiles in the
// order the learner put them; write/speak → the text with the AI's feedback (OpenAnswer),
// stored by the server only.

/** The AI's verdict on a written or spoken answer. */
export interface OpenFeedback {
  /** 0–10. */
  score: number
  /** 2–4 short sentences in the course's explanation language. */
  feedback: string
  /** Up to 4 corrections of the learner's own words. */
  corrections: { wrong: string; right: string }[]
}

export type OpenAnswer = { text: string } & OpenFeedback

export type StepAnswer = number | string | number[] | string[] | OpenAnswer
export type ModuleAnswers = Record<string, StepAnswer>

export function isOpenAnswer(a: unknown): a is OpenAnswer {
  return !!a && typeof a === 'object' && !Array.isArray(a) && typeof (a as OpenAnswer).text === 'string' && typeof (a as OpenAnswer).score === 'number'
}

/** Points a step is worth (0 for steps that only show something). */
export function stepMax(step: CourseStep): number {
  if (step.type === 'match') return step.pairs.length
  if (OPEN_TYPES.has(step.type)) return OPEN_MAX
  return QUESTION_TYPES.has(step.type) ? 1 : 0
}

export function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}

/** Cleans the model's verdict: score 0–10, short feedback, at most 4 corrections. */
export function sanitizeFeedback(raw: unknown): OpenFeedback {
  const r = obj(raw)
  const score = typeof r.score === 'number' ? r.score : typeof r.score === 'string' ? parseFloat(r.score) : NaN
  if (!Number.isFinite(score)) throw new CourseValidationError('feedback needs a score')
  const text = (v: unknown) => (typeof v === 'string' ? v.trim().slice(0, 200) : '')
  return {
    score: Math.max(0, Math.min(OPEN_MAX, Math.round(score))),
    feedback: str(r.feedback, 1_200, 'feedback'),
    corrections: list(r.corrections)
      .map((x) => ({ wrong: text(obj(x).wrong), right: text(obj(x).right) }))
      .filter((x) => x.wrong && x.right && x.wrong !== x.right)
      .slice(0, 4),
  }
}

/** Points the answer earns. */
export function stepScore(step: CourseStep, answer: StepAnswer | undefined): number {
  if (answer === undefined) return 0
  switch (step.type) {
    case 'choice':
      return answer === step.answer ? 1 : 0
    case 'gap':
      return typeof answer === 'string' && matchesGap(step.sentence, answer, step.accepted) ? 1 : 0
    case 'match':
      return Array.isArray(answer) ? step.pairs.filter((_, i) => answer[i] === i).length : 0
    case 'order':
      return Array.isArray(answer) && answer.join(' ').toLowerCase() === sentenceTiles(step.answer).join(' ').toLowerCase() ? 1 : 0
    case 'write':
    case 'speak':
      return isOpenAnswer(answer) ? answer.score : 0
    default:
      return 0
  }
}

export interface ModuleScore {
  score: number
  max: number
}

export function scoreModule(content: ModuleContent, answers: ModuleAnswers): ModuleScore {
  let score = 0
  let max = 0
  for (const step of content.steps) {
    max += stepMax(step)
    score += stepScore(step, answers[step.id])
  }
  return { score, max }
}

/**
 * Keeps only answers of the right shape for existing question steps. Open answers (write/speak)
 * are never taken from the browser: the server stores them with the AI's feedback.
 */
export function sanitizeAnswers(content: ModuleContent, raw: unknown): ModuleAnswers {
  const input = obj(raw)
  const out: ModuleAnswers = {}
  for (const step of content.steps) {
    const a = input[step.id]
    if (step.type === 'choice' && typeof a === 'number' && Number.isInteger(a)) out[step.id] = a
    else if (step.type === 'gap' && typeof a === 'string') out[step.id] = a.slice(0, 120)
    else if (step.type === 'match' && Array.isArray(a) && a.length <= step.pairs.length && a.every((x) => typeof x === 'number' && Number.isInteger(x))) out[step.id] = a as number[]
    else if (step.type === 'order' && Array.isArray(a) && a.length <= 20 && a.every((x) => typeof x === 'string')) out[step.id] = (a as string[]).map((x) => x.slice(0, 60))
  }
  return out
}

/** A stable shuffle (the same order on every reload), seeded by a string. */
export function seededShuffle<T>(items: T[], seed: string): T[] {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619)
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)
    const j = (h >>> 0) % (i + 1)
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  // Never hand out the tiles already in order.
  if (out.length > 1 && out.every((x, i) => x === items[i])) out.push(out.shift() as T)
  return out
}

/** The order step's tiles, shuffled the same way every time. */
export function orderTiles(step: Extract<CourseStep, { type: 'order' }>, seed: string): string[] {
  return seededShuffle(sentenceTiles(step.answer), `${seed}:${step.id}`)
}

// --- API shapes ----------------------------------------------------------------------------

export interface CourseModule {
  id: string
  position: number
  kind: ModuleKind
  variant: ModuleVariant | null
  title: string
  estMinutes: number
  content: ModuleContent | null
  version: number
  /** Listening: whether the recording matches the current script (always true for other kinds). */
  audioReady: boolean
  /** Listening: a signed URL of the current recording (teacher preview). */
  audioUrl: string | null
}

export interface CourseUnit {
  id: string
  position: number
  title: string
  topic: string
  template: UnitTemplate
  grammarIds: string[]
  canDos: string[]
  blueprint: CourseBlueprint | null
  status: PublishStatus
  modules: CourseModule[]
}

export interface Course {
  id: string
  title: string
  topic: string
  level: CourseLevel
  explainLang: ExplainLang
  status: PublishStatus
  visibility: 'private' | 'public'
  units: CourseUnit[]
  createdAt: string
  updatedAt: string
}

export interface CourseSummary {
  id: string
  title: string
  topic: string
  level: CourseLevel
  status: PublishStatus
  unitCount: number
  moduleCount: number
  enrolledCount: number
  updatedAt: string
}

/** What the teacher asks for when making a unit. */
export interface UnitInput {
  topic: string
  template: UnitTemplate
  /** Compact: the skill pair (reading → Reading + Writing, listening → Listening + Speaking); Balanced: the text. */
  input: InputSkill
  /** Templates: end with a Unit check (custom plans say so themselves). */
  withCheck: boolean
  /** Templates: include the Grammar module (custom plans say so themselves). */
  withGrammar: boolean
  /** The teacher's own text for the first reading or listening module ('' = the AI writes it). */
  sourceText: string
  /** Custom template only: the modules in order. */
  kinds?: ModuleKind[]
  grammarIds: string[]
  notes: string
}

export interface CourseCreateInput {
  title: string
  topic: string
  level: CourseLevel
  explainLang: ExplainLang
  unit: UnitInput
}

export interface CourseEnrollment {
  id: string
  studentId: string
  studentEmail: string
  startedAt: string
  completedAt: string | null
  modulesDone: number
  modulesTotal: number
  /** Average score of the finished modules, 0–100 (null: none finished). */
  scorePct: number | null
}

export type ModuleState = 'locked' | 'open' | 'done'

export interface MyCourseModule {
  id: string
  kind: ModuleKind
  variant: ModuleVariant | null
  title: string
  estMinutes: number
  state: ModuleState
  /** A started, unfinished attempt exists. */
  inProgress: boolean
  score: number | null
  max: number | null
}

export interface MyCourseUnit {
  id: string
  position: number
  title: string
  topic: string
  canDos: string[]
  modules: MyCourseModule[]
}

export interface MyCourseNext {
  moduleId: string
  title: string
  kind: ModuleKind
  estMinutes: number
  unitTitle: string
}

export interface MyCourseSummary {
  enrollmentId: string
  title: string
  topic: string
  level: CourseLevel
  teacherEmail: string
  unitCount: number
  modulesDone: number
  modulesTotal: number
  completedAt: string | null
  next: MyCourseNext | null
}

export interface MyCourse extends MyCourseSummary {
  units: MyCourseUnit[]
}

export interface ModuleAttempt {
  id: string
  moduleId: string
  stepIndex: number
  answers: ModuleAnswers
  content: ModuleContent
  /** Listening: a signed URL of the attempt's recording. */
  audioUrl: string | null
  completedAt: string | null
  score: number | null
  max: number | null
}

export interface ModuleCompletion {
  score: number
  max: number
  xp: number
  unitCompleted: boolean
  courseCompleted: boolean
  next: MyCourseNext | null
}

// --- Input validation ----------------------------------------------------------------------

export function sanitizeUnitInput(raw: unknown, level: CourseLevel): UnitInput & { kinds: ModuleKind[] } {
  const b = obj(raw)
  const template = UNIT_TEMPLATES.find((t) => t === b.template)
  if (!template) throw new CourseValidationError('template is required')
  const input: InputSkill = b.input === 'listening' ? 'listening' : 'reading'
  const withCheck = b.withCheck !== false
  const withGrammar = b.withGrammar !== false
  const kinds = template === 'custom' ? list(b.kinds).filter((k): k is ModuleKind => MODULE_KINDS.includes(k as ModuleKind)) : templateKinds(template, input, withCheck, withGrammar)
  const problems = planProblems(kinds)
  if (problems.length) throw new CourseValidationError(`invalid module plan: ${problems.join(', ')}`)
  const grammarIds = [...new Set(list(b.grammarIds).filter((g): g is string => typeof g === 'string'))]
  // Grammar points are required with a Grammar module and optional without one (they still shape the texts).
  const minGrammar = kinds.includes('grammar') ? 1 : 0
  if (grammarIds.length < minGrammar || grammarIds.length > MAX_GRAMMAR_PER_UNIT) throw new CourseValidationError(`pick ${minGrammar}–${MAX_GRAMMAR_PER_UNIT} grammar points`)
  if (!grammarIds.every((g) => grammarAllowed(g, level))) throw new CourseValidationError('a grammar point is above the course level')
  return {
    topic: str(b.topic, COURSE_TOPIC_MAX, 'topic'),
    template,
    input,
    kinds,
    grammarIds,
    notes: str(b.notes, UNIT_NOTES_MAX, 'notes', false),
    withCheck: kinds.includes('unit_check'),
    withGrammar: kinds.includes('grammar'),
    sourceText: str(b.sourceText, SOURCE_TEXT_MAX, 'your text', false),
  }
}

export function sanitizeCourseFields(raw: unknown): { title: string; topic: string; explainLang: ExplainLang } {
  const b = obj(raw)
  return {
    title: str(b.title, COURSE_TITLE_MAX, 'title'),
    topic: str(b.topic, COURSE_TOPIC_MAX, 'topic', false),
    explainLang: EXPLAIN_LANGS.find((l) => l === b.explainLang) ?? 'en',
  }
}

export function sanitizeCreateInput(raw: unknown): CourseCreateInput & { unit: UnitInput & { kinds: ModuleKind[] } } {
  const b = obj(raw)
  const level = COURSE_LEVELS.find((l) => l === b.level)
  if (!level) throw new CourseValidationError('level is required')
  return { ...sanitizeCourseFields(b), level, unit: sanitizeUnitInput(b.unit, level) }
}

/** Whether every module of the unit has content and every listening module its recording (so it can be published). */
export function unitReady(unit: Pick<CourseUnit, 'modules'>): boolean {
  return unit.modules.length > 0 && unit.modules.every((m) => m.content !== null && m.audioReady)
}
