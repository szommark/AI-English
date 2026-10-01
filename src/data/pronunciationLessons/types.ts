// Shape of the Stress Patterns and Connected Speech sessions: short theory, then exercises.
// Hand-authored static content, like pronunciationCurriculum.ts — see
// docs/pronunciation-sessions-brief.md.

/** A phrase the learner can click to hear. `soundsLike` is shown as text only (browser TTS reads carefully). */
export interface TheoryExample {
  text: string
  /** How it comes out in fast speech, as an English-style respelling — e.g. "didja". */
  soundsLike?: string
  /** What to say aloud when it differs from `text` (e.g. the full sentence behind a short chip). */
  audio?: string
}

export interface TheoryBlock {
  headingHu?: string
  bodyHu: string
  examples?: TheoryExample[]
}

export type Step =
  /** Hear `audio` (or read the prompt only), pick one option. Options are shuffled at run time unless keepOrder is set (e.g. ●·· patterns). */
  | { type: 'listen-choose'; audio?: string; promptHu: string; options: string[]; correct: number; explainHu?: string; keepOrder?: boolean }
  /** Hear `audio`, tap the stressed syllable of `target`. `syllables` must join to `target`. */
  | { type: 'syllable-tap'; audio: string; target: string; syllables: string[]; stressed: number; contextHu?: string; explainHu?: string }
  /**
   * Hear `audio`, then tap tokens. mode 'words': `correct` are token indices. mode 'gaps': the
   * learner taps the gaps between words; gap i sits between tokens[i] and tokens[i + 1].
   */
  | { type: 'token-select'; mode: 'words' | 'gaps'; audio: string; tokens: string[]; correct: number[]; promptHu: string; explainHu?: string }
  /** Three unlabeled cards; the odd one out is `words[oddIndex]`. */
  | { type: 'odd-one-out'; promptHu: string; words: [string, string, string]; oddIndex: 0 | 1 | 2; explainHu?: string }
  | { type: 'dictation'; text: string; keyWords: string[]; labelHu: string }
  /** Azure-scored read-aloud. Scored as the unit's production score; can be skipped. */
  | { type: 'production'; sentence: string }

export type LessonBody =
  | { kind: 'steps'; steps: Step[] }
  /** Runs an existing pronunciationCurriculum.ts item through the DrillFunnel (progress is stored under that item's id). */
  | { kind: 'funnel'; soundItemId: string }

export interface LessonUnit {
  id: string
  title: string
  titleHu: string
  summaryHu: string
  theory: TheoryBlock[]
  body: LessonBody
}

export type LessonSessionId = 'stress-patterns' | 'connected-speech'

export interface LessonSession {
  id: LessonSessionId
  title: string
  titleHu: string
  descriptionHu: string
  /** Label for the unit cards: "Unit" for stress, "Layer" for connected speech. */
  unitNoun: { en: string; hu: string }
  units: LessonUnit[]
}
