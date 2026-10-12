// Shared types and constants for the Tense Explorer sentence engine.
// Static, rule-based and offline: no network, no LLM. Keep this file importable by plain
// Node type-stripping (erasable TypeScript only, `.ts` import specifiers, no JSX).

export type TenseId =
  | 'present-simple' | 'present-continuous' | 'present-perfect' | 'present-perfect-continuous'
  | 'past-simple' | 'past-continuous' | 'past-perfect' | 'past-perfect-continuous'
  | 'future-simple' | 'future-continuous' | 'future-perfect' | 'future-perfect-continuous'
  | 'be-going-to'

// Grid order: rows Simple, Continuous, Perfect, Perfect continuous; columns Present, Past,
// Future; then be going to under Future.
export const TENSE_IDS: TenseId[] = [
  'present-simple', 'past-simple', 'future-simple',
  'present-continuous', 'past-continuous', 'future-continuous',
  'present-perfect', 'past-perfect', 'future-perfect',
  'present-perfect-continuous', 'past-perfect-continuous', 'future-perfect-continuous',
  'be-going-to',
]

export type Polarity = 'affirmative' | 'question' | 'negative'

export type Subject = 'I' | 'you' | 'he' | 'she' | 'we' | 'they'
export const SUBJECTS: Subject[] = ['I', 'you', 'he', 'she', 'we', 'they']

export interface ParsedPhrase { verb: string; rest: string }
export type ParseError = 'empty' | 'too-long' | 'not-english'

export interface VerbForms {
  base: string
  thirdPerson: string
  past: string
  pastParticiple: string
  gerund: string
}

export type VerbWarning = 'stative-continuous' | 'be-continuous'

/** Longest phrase (after trimming) the explorer accepts. */
export const MAX_PHRASE_LENGTH = 40

/** Tenses with a continuous (-ing) main verb; used for the stative / be warnings. */
export const CONTINUOUS_TENSES: TenseId[] = [
  'present-continuous', 'past-continuous', 'future-continuous',
  'present-perfect-continuous', 'past-perfect-continuous', 'future-perfect-continuous',
]
