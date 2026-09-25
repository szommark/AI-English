import type { PracticeCard, PracticeExercise } from './vocab'

// Pure helpers for the student practice session (design §7). Steps 1–4 are rendered and
// checked in the browser; only the result goes to the server for scheduling.

/** Typed answers at least this long accept a one-letter typo (as Hard). Shorter words
 *  are too easily a different word ("go" / "do"). */
export const TYPO_MIN_LENGTH = 4

/** Lowercase, straight apostrophes, collapsed spaces, no surrounding punctuation. */
export function normalizeAnswer(text: string): string {
  return text
    .replace(/[‘’ʼ]/g, "'")
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/^[\p{P}\p{S}\s]+|[\p{P}\p{S}\s]+$/gu, '')
}

/**
 * Optimal string alignment distance (Levenshtein plus adjacent swaps, so "tabel" is one
 * edit from "table"), stopping early once it exceeds `max`.
 */
function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1
  let prevPrev: number[] = []
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const cur = [i]
    let rowMin = i
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        cur[j] = Math.min(cur[j], prevPrev[j - 2] + 1)
      }
      rowMin = Math.min(rowMin, cur[j])
    }
    if (rowMin > max) return max + 1
    prevPrev = prev
    prev = cur
  }
  return prev[b.length]
}

export type AnswerCheck = 'exact' | 'typo' | 'wrong'

/**
 * Tolerant matching for typed answers (design §7, step 2): case and punctuation don't
 * matter; one wrong, missing or extra letter is a typo (rated Hard, not Again).
 */
export function checkTypedAnswer(expected: string, given: string): AnswerCheck {
  const e = normalizeAnswer(expected)
  const g = normalizeAnswer(given)
  if (!g) return 'wrong'
  if (e === g) return 'exact'
  if (e.length >= TYPO_MIN_LENGTH && editDistance(e, g, 1) === 1) return 'typo'
  return 'wrong'
}

export interface GapSentence {
  before: string
  after: string
  /** The term as it appears in the sentence (its original capitalisation). */
  answer: string
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Splits an example sentence around the term, for the gap-fill exercises. Matches whole
 * words, case-insensitively, with any run of spaces between a phrase's words. Returns
 * null when the sentence doesn't contain the term as written (e.g. an inflected form),
 * in which case the session falls back to recall.
 */
export function gapSentence(sentence: string | null, term: string): GapSentence | null {
  if (!sentence) return null
  const words = term.trim().split(/\s+/).filter(Boolean).map(escapeRegExp)
  if (words.length === 0) return null
  const re = new RegExp(`(^|[^\\p{L}\\p{N}'])(${words.join('\\s+')})(?=$|[^\\p{L}\\p{N}'])`, 'iu')
  const m = re.exec(sentence)
  if (!m) return null
  const start = m.index + m[1].length
  return { before: sentence.slice(0, start), after: sentence.slice(start + m[2].length), answer: m[2] }
}

/**
 * The sentence for the gap-fill and listening steps: a Tutor Bot card's own corrected
 * line when it contains the term (design §7), else the item's example sentence.
 */
export function practiceSentence(card: Pick<PracticeCard, 'term' | 'contextCorrected' | 'exampleEn'>): string | null {
  return [card.contextCorrected, card.exampleEn].find((s) => gapSentence(s, card.term) !== null) ?? null
}

/**
 * The exercise for a card's ladder step (design §7), stepping down when this one can't
 * run: no distractors → recall; no usable sentence → recall; no speech synthesis →
 * context (or recall). A card without a Hungarian meaning can't be shown as recognition
 * or recall, so it goes to context, or listening as a last resort.
 */
export function chooseExercise(card: PracticeCard, speechSupported: boolean): PracticeExercise {
  const hasGap = practiceSentence(card) !== null
  const hasMeaning = Boolean(card.meaningHu)
  const fallback: PracticeExercise = hasMeaning ? 'recall' : hasGap ? 'context' : 'listening'

  switch (card.ladderStep) {
    case 1:
      return hasMeaning && card.distractors.length > 0 ? 'recognition' : fallback
    case 2:
      return fallback
    case 3:
      return hasGap ? 'context' : fallback
    default:
      if (speechSupported) return 'listening'
      return hasGap ? 'context' : fallback
  }
}

/** Full practice rounds, easiest first (design §7.1). */
export const DRILL_ROUNDS: readonly PracticeExercise[] = ['recognition', 'recall', 'context', 'listening']

/**
 * Whether an exercise can run for a card at all. Full practice skips what can't run
 * instead of stepping down, so no card gets the same exercise twice.
 */
export function canRunExercise(card: PracticeCard, exercise: PracticeExercise, speechSupported: boolean): boolean {
  switch (exercise) {
    case 'recognition':
      return Boolean(card.meaningHu) && card.distractors.length > 0
    case 'recall':
      return Boolean(card.meaningHu)
    case 'context':
      return practiceSentence(card) !== null
    case 'listening':
      return speechSupported
  }
}

export interface DrillStep {
  card: PracticeCard
  exercise: PracticeExercise
  /** 0-based index into DRILL_ROUNDS. */
  round: number
}

/**
 * The Full practice queue: round by round (every card's recognition, then every card's
 * recall, …), cards shuffled within each round so the order gives nothing away. Rounds
 * no card can run are left out.
 */
export function drillQueue(cards: readonly PracticeCard[], speechSupported: boolean, random: () => number = Math.random): DrillStep[] {
  return DRILL_ROUNDS.flatMap((exercise, round) =>
    shuffle(
      cards.filter((card) => canRunExercise(card, exercise, speechSupported)),
      random,
    ).map((card) => ({ card, exercise, round })),
  )
}

/** Fisher–Yates; `random` is injectable for checks. */
export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** First letter of each word, the rest as underscores: "book a table" → "b___ a t____". */
export function answerHint(term: string): string {
  return term
    .trim()
    .split(/\s+/)
    .map((w) => w[0] + '_'.repeat(Math.max(0, w.length - 1)))
    .join(' ')
}
