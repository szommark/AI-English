// Vocabulary Builder helpers and constants shared by the client and api/ — same
// cross-boundary pattern as src/lib/types.ts. See docs/vocabulary-builder-design.md.
import type { CefrLevel } from '../data/grammarCurriculum.js'

// Design doc §11 — initial values, all tuneable.
export const ENRICH_BATCH_SIZE = 15
export const LIST_MAX_ITEMS = 100
export const REQUEST_RETENTION = 0.9
export const FAST_ANSWER_MS = 4000
/** Per list: each list has its own review session (design §7). */
export const NEW_CARDS_PER_DAY = 10
export const MAX_REVIEWS_PER_SESSION = 40
/**
 * A list needs this many words for spaced repetition: its meaning exercise draws the
 * wrong options from the list itself, so 3 words give 3 options.
 */
export const SRS_MIN_WORDS = 3
export const MAX_TUTOR_ITEMS_PER_SESSION = 5
export const MASTERED_STABILITY_DAYS = 21
export const TUTOR_TARGET_WORDS = 4
/**
 * A review that schedules the next gap at this many days or more retires the card as
 * mastered (design §6.4): with REQUEST_RETENTION 0.9, about 6 reviews over ~7 months when
 * every answer is right, 8–12 with a few mistakes.
 */
export const RETIRE_INTERVAL_DAYS = 365

export type VocabKind = 'word' | 'phrase'

// Must match the `origin` check constraints in
// supabase/migrations/20260926120000_vocabulary_student_lists.sql exactly.
export type VocabOrigin = 'catalog' | 'teacher' | 'tutor' | 'student'

// Must match the `vocab_reviews.exercise` check constraint exactly.
export type VocabExercise = 'recognition' | 'recall' | 'context' | 'listening' | 'production' | 'conversation'

export const VOCAB_POS = ['noun', 'verb', 'adjective', 'adverb', 'phrase', 'other'] as const
export type VocabPos = (typeof VOCAB_POS)[number]

/** One vocab_items row, camelCased for API responses. */
export interface VocabItem {
  id: string
  term: string
  termNormalized: string
  kind: VocabKind
  pos: VocabPos | null
  cefrLevel: CefrLevel | null
  topics: string[]
  meaningHu: string | null
  definitionEn: string | null
  exampleEn: string | null
  origin: VocabOrigin
  ownerTeacherId: string | null
  enrichmentStatus: 'pending' | 'done' | 'failed'
}

/** One entry of POST /api/vocab?action=enrich's response, in request order. */
export interface EnrichResult {
  term: string
  termNormalized: string
  kind: VocabKind
  pos: VocabPos | null
  cefrLevel: CefrLevel | null
  meaningHu: string | null
  definitionEn: string | null
  exampleEn: string | null
  status: 'done' | 'failed'
  fromCache: boolean
}

const EDGE_PUNCTUATION = /^[\p{P}\p{S}\s]+|[\p{P}\p{S}\s]+$/gu

/**
 * Canonical form used for dedup and cache lookups: trimmed, lowercased, internal
 * whitespace collapsed, surrounding punctuation stripped. Internal apostrophes and
 * hyphens survive ("don't", "well-known"); typographic apostrophes become ASCII ones
 * so "don’t" and "don't" are the same term. Returns '' for punctuation-only input.
 */
export function normalizeTerm(raw: string): string {
  return raw
    .replace(/[‘’ʼ]/g, "'")
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(EDGE_PUNCTUATION, '')
}

export function termKind(term: string): VocabKind {
  return normalizeTerm(term).includes(' ') ? 'phrase' : 'word'
}

// --- Teacher word lists (Phase 2, design §5.1) -------------------------------------------

export const LIST_TITLE_MAX_LENGTH = 120
export const LIST_DESCRIPTION_MAX_LENGTH = 1000
export const TERM_MAX_LENGTH = 100
/** Meaning, definition and example sentence. */
export const ITEM_FIELD_MAX_LENGTH = 500

/** One row of the list editor, as sent to POST/PUT /api/vocab?action=list. */
export interface VocabListItemInput {
  term: string
  meaningHu: string
  definitionEn?: string | null
  exampleEn?: string | null
  pos?: VocabPos | null
  cefrLevel?: CefrLevel | null
}

/** Body of POST /api/vocab?action=list (create) and PUT ...&id= (update). */
export interface VocabListInput {
  title: string
  description?: string | null
  cefrLevel?: CefrLevel | null
  items: VocabListItemInput[]
}

export interface VocabList {
  id: string
  title: string
  description: string | null
  cefrLevel: CefrLevel | null
  archivedAt: string | null
  createdAt: string
  updatedAt: string
}

/** One entry of GET /api/vocab?action=lists. */
export interface VocabListSummary extends VocabList {
  termCount: number
  assignedCount: number
  completedCount: number
  /** Learned cards summed over assigned students; out of termCount × assignedCount. */
  learned: number
}

export interface VocabListItemRow {
  itemId: string
  term: string
  termNormalized: string
  meaningHu: string | null
  definitionEn: string | null
  exampleEn: string | null
  pos: VocabPos | null
  cefrLevel: CefrLevel | null
  position: number
}

/** Per student per list (design §6.2): matched on term_normalized, not item_id. */
export interface VocabListProgress {
  learned: number
  started: number
  total: number
}

export interface VocabListAssignment extends VocabListProgress {
  studentId: string
  email: string
  assignedAt: string
  completedAt: string | null
  /** false once the student disconnected; the assignment and progress stay. */
  connected: boolean
}

/** GET /api/vocab?action=list&id= (also returned by create/update). */
export interface VocabListDetail {
  list: VocabList
  items: VocabListItemRow[]
  assignments: VocabListAssignment[]
}

export interface VocabCardCounts {
  cardsCreated: number
  cardsUpgraded: number
  cardsUnchanged: number
}

/** POST /api/vocab?action=assign. */
export interface VocabAssignResult extends VocabCardCounts {
  studentCount: number
  assignmentsCreated: number
}

/** PUT /api/vocab?action=list&id=: cards created for terms added to an assigned list. */
export interface VocabListUpdateResult extends VocabListDetail {
  addedTermCards: VocabCardCounts | null
}

/** One entry of GET /api/vocab?action=student-lists&studentId=. */
export interface VocabStudentListProgress extends VocabListProgress {
  listId: string
  title: string
  cefrLevel: CefrLevel | null
  archivedAt: string | null
  assignedAt: string
  completedAt: string | null
}

// --- Student practice (Phase 3, design §6–§7) --------------------------------------------

/** Exercises a student can report from the practice session (steps 1–4). */
export const PRACTICE_EXERCISES = ['recognition', 'recall', 'context', 'listening'] as const
export type PracticeExercise = (typeof PRACTICE_EXERCISES)[number]

/**
 * Wrong options shown next to the right meaning in a recognition exercise; fewer when a
 * list is shorter (a 3-word list gives 2).
 */
export const RECOGNITION_DISTRACTORS = 3

/** What an exercise needs to show a word (design §7). */
export interface ExerciseContent {
  term: string
  kind: VocabKind
  meaningHu: string | null
  definitionEn: string | null
  exampleEn: string | null
  /** Tutor Bot cards: the learner's own line, said better — preferred for gap-fills (§7). */
  contextCorrected: string | null
  /** Hungarian meanings of other items, for the recognition exercise. */
  distractors: string[]
}

/** One card of GET /api/vocab?action=session, with the content its exercises need. */
export interface PracticeCard extends ExerciseContent {
  cardId: string
  termNormalized: string
  /** 1 = recognition … 4 = listening; the client may step down when an exercise can't run. */
  ladderStep: number
  /** FSRS state: 0 = New. */
  state: number
}

export interface PracticeSession {
  cards: PracticeCard[]
  dueCount: number
  newCount: number
}

/** Body of POST /api/vocab?action=review. */
export interface ReviewInput {
  cardId: string
  exercise: PracticeExercise
  correct: boolean
  /** A hint, a second attempt or a one-letter typo: right, but rated Hard. */
  usedHint: boolean
  responseMs: number | null
}

export interface ReviewResult {
  /** 1 Again, 2 Hard, 3 Good, 4 Easy. */
  rating: number
  due: string
  state: number
  ladderStep: number
  /** True when this review graduated the card for the first time (design §6.2). */
  learnedNow: boolean
  /** Titles of teacher lists this review completed. */
  completedLists: string[]
}

/**
 * One list's words in spaced repetition (design §7): every list has its own pipeline and
 * review session. A word on two lists has one card, so its progress shows on both.
 */
export interface ListSrs {
  /** Reviews due now. */
  dueCount: number
  /** New cards this list's session can still start today (NEW_CARDS_PER_DAY minus today's). */
  newAvailable: number
  /** Earliest future due date among non-new cards, when nothing is due now. */
  nextDue: string | null
  /** Cards per stage of the pipeline; paused cards are counted apart from the others. */
  stages: Record<CardStage, number> & { paused: number }
  /** Cards in rotation (not paused, not mastered) per exercise they are at (ladder step). */
  exercises: Record<PracticeExercise, number>
}

/**
 * GET /api/vocab?action=overview — the landing tile's badge: words that can be practised
 * now over every list with a review session, each word counted once.
 */
export interface VocabOverview {
  dueCount: number
  newAvailable: number
}

// --- Tutor Bot words (Phase 4, design §5.2) ------------------------------------------------

/** One word the Tutor Bot session added to the deck (POST /api/tutor?action=end). */
export interface AddedTutorWord {
  cardId: string
  term: string
  meaningHu: string | null
  reason: 'switched' | 'asked' | 'lacked'
}

/** Where a card is on its way to "learned" and then "mastered". */
export type CardStage = 'new' | 'learning' | 'learned' | 'mastered'

/**
 * Mastered once retired (design §6.4); learned once graduated (sticky, design §6.2); New
 * while FSRS state is 0.
 */
export function cardStage(card: { state: number; first_learned_at: string | null; retired_at: string | null }): CardStage {
  if (card.retired_at) return 'mastered'
  return card.first_learned_at ? 'learned' : card.state === 0 ? 'new' : 'learning'
}

// --- Fast practice and My wordlists (design §7.1–§7.2) ------------------------------------

/** Words per Fast practice run; a whole teacher list always fits. */
export const DRILL_MAX_WORDS = LIST_MAX_ITEMS

/** Topics offered when compiling a list; the student can also type their own. */
export const VOCAB_TOPICS = [
  'travel',
  'food',
  'work',
  'shopping',
  'health',
  'home',
  'free-time',
  'education',
  'nature',
  'people',
] as const
export type VocabTopicId = (typeof VOCAB_TOPICS)[number]

/** English topic names for the word-picking prompt (UI labels live in i18n). */
export const VOCAB_TOPIC_PROMPT: Record<VocabTopicId, string> = {
  travel: 'travel and holidays',
  food: 'food and drink',
  work: 'work and the office',
  shopping: 'shopping',
  health: 'health and the body',
  home: 'home and family',
  'free-time': 'free time and hobbies',
  education: 'school and education',
  nature: 'nature and weather',
  people: 'feelings and describing people',
}

export function isVocabTopicId(topic: string): topic is VocabTopicId {
  return (VOCAB_TOPICS as readonly string[]).includes(topic)
}

export const COMPILE_MIN_WORDS = 1
export const COMPILE_MAX_WORDS = 10
/** New lists, and word-bank additions to a list, per student per UTC day (each can cost model calls). */
export const COMPILES_PER_DAY = 5
export const CUSTOM_TOPIC_MAX_LENGTH = 60
/** Words a student list can grow to by adding words. */
export const STUDENT_LIST_MAX_ITEMS = LIST_MAX_ITEMS
/** Typed words added to a list in one go. */
export const ADD_WORDS_MAX = 20

/** A compiled list's level: one CEFR level, or a mix around the learner's level. */
export const MIXED_LEVEL = 'mixed'
export type ListLevel = CefrLevel | typeof MIXED_LEVEL

const CEFR_ORDER: readonly CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

/** A mixed list's levels: the learner's level and its neighbours (B1 → A2, B1, B2). */
export function mixedLevels(learnerLevel: CefrLevel): CefrLevel[] {
  const i = CEFR_ORDER.indexOf(learnerLevel)
  return CEFR_ORDER.slice(Math.max(0, i - 1), i + 2)
}

/** custom = made by the student; conversations = the Tutor Bot words (a virtual list). */
export type WordlistKind = 'custom' | 'teacher' | 'conversations'

/** Identifies a list in API calls; `id` is null for the conversations list. */
export interface WordlistRef {
  kind: WordlistKind
  id: string | null
}

/** One entry of GET /api/vocab?action=wordlists. */
export interface WordlistSummary extends WordlistRef {
  title: string
  cefrLevel: ListLevel | null
  /** Custom lists: a VOCAB_TOPICS id or the student's own topic. */
  topic: string | null
  wordCount: number
  /** Words of the list that are in spaced repetition (paused ones included). */
  inSrs: number
  /** This list's spaced-repetition pipeline; a session needs SRS_MIN_WORDS words. */
  srs: ListSrs
  /** Fast practice runs started on this list. */
  practiceCount: number
  createdAt: string
  /** Teacher lists only. */
  teacher: {
    email: string
    description: string | null
    progress: VocabListProgress
    completedAt: string | null
  } | null
}

export interface WordlistsResponse {
  lists: WordlistSummary[]
  /** Default level for compiling a list. */
  learnerLevel: CefrLevel
  /** Lists compiled, or word-bank additions, today, out of COMPILES_PER_DAY. */
  compiledToday: number
}

/** A list can have a review session: enough words, and at least one of them in spaced repetition. */
export function hasSrsSession(list: Pick<WordlistSummary, 'wordCount' | 'inSrs'>): boolean {
  return list.wordCount >= SRS_MIN_WORDS && list.inSrs > 0
}

/** A word's spaced-repetition card, if it has one. */
export interface WordCard {
  cardId: string
  stage: CardStage
  /** 1 = recognition … 4 = listening: the exercise the word is at in spaced repetition. */
  ladderStep: number
  suspended: boolean
  origin: VocabOrigin
}

export interface WordlistWord {
  itemId: string
  term: string
  cefrLevel: CefrLevel | null
  meaningHu: string | null
  exampleEn: string | null
  /** Tutor Bot words: what the learner said, and the better version. */
  contextOriginal: string | null
  contextCorrected: string | null
  card: WordCard | null
}

/** GET /api/vocab?action=wordlist&kind=&id= (also returned by the list edits). */
export interface WordlistDetail {
  list: WordlistSummary
  words: WordlistWord[]
}

/** Body of POST /api/vocab?action=wordlist-compile. */
export interface CompileInput {
  topic: string
  cefrLevel: ListLevel
  count: number
  title: string
}

/** POST /api/vocab?action=wordlist-word { terms }: typed words added to a custom list. */
export interface AddWordsResult {
  added: string[]
  /** Typed terms the list already had; skipped. */
  alreadyInList: string[]
  detail: WordlistDetail
}

/** POST /api/vocab?action=wordlist-srs: the list's words added to spaced repetition. */
export interface AddToSrsResult {
  cardsCreated: number
  alreadyInSrs: number
  detail: WordlistDetail
}

/** One word of a Fast practice run, with what its exercises need. */
export interface DrillCard extends ExerciseContent {
  itemId: string
}

/** POST /api/vocab?action=drill-start { list, itemIds }. */
export interface DrillRun {
  runId: string
  cards: DrillCard[]
}

/** Body of POST /api/vocab?action=drill-answer. Recorded apart from reviews; never rescheduled. */
export interface DrillAnswerInput {
  runId: string
  itemId: string
  exercise: PracticeExercise
  correct: boolean
  usedHint: boolean
  responseMs: number | null
}
