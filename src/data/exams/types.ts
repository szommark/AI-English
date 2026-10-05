// Exam Prep content model. Papers are static, version-controlled content (like
// grammarCurriculum.ts); only user state will ever live in the database. Every paper is
// transcribed verbatim from its source PDF — target-language text stays in the target
// language, Hungarian booklet text stays Hungarian.

export type ExamType = 'erettsegi' | 'nyelvvizsga'
export type ExamLanguage = 'en' | 'de'
export type ExamLevel = 'kozep' | 'emelt' | 'B1' | 'B2' | 'C1'
export type SectionKind = 'reading' | 'language-use' | 'listening' | 'writing'
/** Nyelvvizsga: general English or a professional language (gazdasági = economics and management). */
export type ExamTrack = 'general' | 'business'

/** What the picker, the breadcrumb and the catalog need, without loading the paper's content. */
export interface ExamPaperMeta {
  id: string
  type: ExamType
  language: ExamLanguage
  level: ExamLevel
  /** The paper's own label, e.g. `2025. május`, `Minta 1.` */
  sittingLabelHu: string
  /** Nyelvvizsga only: which exam of the centre the paper belongs to. */
  track?: ExamTrack
}

export interface ExamPaper extends ExamPaperMeta {
  /** Where the content comes from (exam board, paper code, answer key). */
  source: string
  /** General notes printed on the booklet covers, verbatim. */
  noticesHu?: string[]
  sections: ExamSection[]
}

export interface ExamSection {
  id: string
  kind: SectionKind
  /** As printed, e.g. `I. Olvasott szöveg értése`. */
  titleHu: string
  timeLimitMin?: number
  /** Text printed at the start of the section (e.g. the listening booklet's instructions). */
  intro?: string[]
  audio?: SectionAudio
  /**
   * Raw points (feladatpont) → scaled points (vizsgapont), indexed by raw score:
   * `conversion[raw]`. Érettségi only.
   */
  conversion?: number[]
  /** Listening transcripts, shown in review after the section is submitted. */
  transcripts?: Transcript[]
  tasks: ExamTask[]
}

export interface SectionAudio {
  /** Object path in the private `exam-audio` Supabase Storage bucket. */
  storagePath: string
  durationSec: number
  /** Where each task starts in the recording, for "jump to task" in practice mode. */
  taskMarkers?: { taskId: string; startSec: number }[]
}

export interface Transcript {
  taskId: string
  title: string
  paragraphs: string[]
}

/**
 * Passage text. `{{id}}` inside `text` is an inline gap for the task's item (or example)
 * with that id; a block with `itemId` is the stem for that item (e.g. a paragraph that
 * needs a heading), and the item's control is rendered right after it.
 */
export interface PassageBlock {
  style?: 'title' | 'heading' | 'label' | 'note' | 'bullet'
  text: string
  itemId?: string
}

export interface DataTable {
  title?: string
  caption?: string
  head: string[]
  rows: string[][]
  /** Columns (by index) whose cells are numbers, right-aligned. */
  numericColumns?: number[]
}

export interface BankOption {
  key: string
  text: string
}

export interface TaskRules {
  /** Nyelvvizsga: if every true/false answer in the task is the same, the task scores 0. */
  allSameBooleanIsZero?: boolean
  /**
   * Érettségi multi-select: −1 per tick beyond the allowed number (floor 0); if every box
   * is ticked, the task scores 0.
   */
  multiSelectPenalty?: boolean
}

export interface ExamTask {
  /** Unique within the paper. */
  id: string
  /** The number printed on the paper, e.g. `1.` or `Task 2`. */
  label: string
  /** A title printed next to the task number (writing tasks). */
  title?: string
  /** Verbatim, in the language printed on the paper. */
  instructions: string
  passage?: PassageBlock[]
  bankTitle?: string
  bank?: BankOption[]
  /** How many bank options the instructions say are left over ("one/six extra"). */
  unusedBankCount?: number
  /** Answer labels for `boolean` items: [true, false]. */
  booleanLabels?: [string, string]
  /** Answer options shared by every `mcq` item in the task that has none of its own (A/B/C true/false/not stated). */
  options?: BankOption[]
  /** A data table printed with the task (e.g. the table a writing task describes). */
  table?: DataTable
  /** Worked examples, shown pre-filled and read-only. */
  examples?: ExamItem[]
  items: ExamItem[]
  rules?: TaskRules
}

export type TextMatch = 'exact' | 'exact-ci' | 'keywords'

export interface TextAnswer {
  /** Accepted answers as printed in the key; any variant counts. Shown as the expected answer. */
  accepted: string[]
  /**
   * `exact`: trim + collapse spaces, case-sensitive. `exact-ci`: same, case-insensitive.
   * `keywords`: every group needs at least one stem present in the normalized answer.
   */
  match: TextMatch
  keywords?: string[][]
  maxWords?: number
}

interface ItemBase {
  /** The number printed on the paper; unique within its task. */
  id: string
  reviewNote?: string
}

/** Pick a bank key for a numbered gap or paragraph. */
export interface ChoiceItem extends ItemBase {
  type: 'choice'
  answer: string
  /** Other keys the answer key accepts for this item (it still has one printed answer). */
  alsoAccept?: string[]
}

export interface BooleanItem extends ItemBase {
  type: 'boolean'
  statement: string
  answer: boolean
}

export interface ShortTextItem extends ItemBase {
  type: 'short-text'
  /** Question text, when the item isn't an inline gap in the passage. */
  prompt?: string
  /** The word to put in the right form (word-formation tasks). */
  baseWord?: string
  answer: TextAnswer
}

/**
 * Multiple choice with its own options per question (érettségi angol: A–D per gap or
 * question, or the shared true/false/not-stated options on the task). With `stem` the
 * question is listed under the passage; without, it is an inline gap {{id}} in the passage.
 */
export interface McqItem extends ItemBase {
  type: 'mcq'
  stem?: string
  /** Own options; falls back to the task's `options`. */
  options?: BankOption[]
  answer: string
  /** Other keys the answer key accepts for this item. */
  alsoAccept?: string[]
}

/**
 * Érettségi német olvasott szöveg: the parts of a text are shuffled; the learner puts them in
 * order after the printed first part. Scored by links: one point for each part that follows (or,
 * for the last one, closes) its right neighbour.
 */
export interface OrderItem extends ItemBase {
  type: 'order'
  parts: BankOption[]
  /** Key of the part printed first, as the example. */
  first: string
  /** The other parts' keys in the right order. */
  answer: string[]
  /** The number printed for the first position after the example. */
  start: number
}

/** Listening: the statement contains wrong information; the learner writes the correction. */
export interface CorrectionItem extends ItemBase {
  type: 'correction'
  statement: string
  answer: TextAnswer
}

export interface MultiSelectItem extends ItemBase {
  type: 'multi-select'
  /** The statement the ticks belong to (a row of a matching table). */
  stem?: string
  /** An option already ticked as the worked example, shown read-only above the others. */
  exampleOption?: string
  options: BankOption[]
  /** The option keys that should be ticked; each is worth one point. */
  answer: string[]
  /** How many ticks are allowed. */
  pick: number
}

export type WritingRegister = 'formal-email' | 'formal-letter' | 'informal-message' | 'forum-post' | 'description'

/**
 * A "complete the sentences" writing task: the paper prints the opening of each sentence and
 * the learner continues it. The answer is the continuations, one per line, in order.
 */
export interface SentenceStarters {
  /** The worked example sentence, printed in full. */
  example: string
  starters: string[]
}

export interface ProductionItem extends ItemBase {
  type: 'production'
  /** Situation and task text, verbatim. */
  prompt: string[]
  /** The content points to cover. */
  contentPoints: string[]
  /** Text printed after the content points (e.g. word-count instruction). */
  promptAfter?: string[]
  minWords: number
  maxWords: number
  /** Pre-printed salutation; not editable and excluded from the word count. */
  opening?: string
  /** Sentence openings to continue, instead of one free text; only the learner's words count. */
  sentenceStarters?: SentenceStarters
  register: WritingRegister
  rubricId: string
  /** The scoring criteria printed under the task, when the paper prints them. */
  criteria?: { labelHu: string; points: number }[]
  modelAnswer?: string
}

export type ExamItem = ChoiceItem | BooleanItem | McqItem | OrderItem | ShortTextItem | CorrectionItem | MultiSelectItem | ProductionItem
