export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ScriptLine {
  speaker: string
  line: string
  lineHu: string
}

export interface PracticeLine {
  en: string
  hu: string
}

export interface MouthAnchor {
  /** Center X of the character's mouth, as % of the rendered photo width (0-100). */
  mouthX: number
  /** Center Y of the character's mouth, as % of the rendered photo height (0-100). */
  mouthY: number
  /** Width of the mouth exclusion box, as % of photo width. Box is centered on mouthX/mouthY. */
  mouthBoxWidth: number
  /** Height of the mouth exclusion box, as % of photo height. Box is centered on mouthX/mouthY. */
  mouthBoxHeight: number
}

export type VoiceGender = 'male' | 'female'

export interface Scenario {
  id: string
  title: string
  titleHu: string
  description: string
  aiRole: string
  setting: string
  systemPrompt: string
  rehearsalPhrases: PracticeLine[]
  rehearsalScript: ScriptLine[]
  /**
   * Where the character's mouth sits in the scenario photo, used to anchor the speech
   * bubble and define the zone it must never cover. Percentages are relative to the
   * *rendered* <img> box, which must always display the photo uncropped (no object-cover).
   * Recalibrate at /dev/mouth-calibrator (dev server only) rather than eyeballing these.
   */
  mouth: MouthAnchor
  /** Set by hand against the character photo — never inferred from the image or filename. */
  voiceGender: VoiceGender
}

export interface FeedbackCorrection {
  original: string
  corrected: string
  note: string
  category?: string
}

export interface FeedbackResult {
  strengths: string[]
  corrections: FeedbackCorrection[]
  vocabularyNoted?: string[]
}

export interface ChatTurnResponse {
  reply: string
  done: boolean
  feedback?: FeedbackResult
}

export interface CapStatus {
  allowed: boolean
  remaining: number
  resetAt: string
}

export interface PronunciationScores {
  accuracy: number
  fluency: number
  completeness: number
  pronunciation: number
}

export interface PronunciationWordDetail {
  word: string
  accuracyScore: number
  errorType: string
}

export interface PronunciationCheckResult {
  scores: PronunciationScores
  words: PronunciationWordDetail[]
  audioSeconds: number
}

export interface RuleBoxWidget {
  type: 'rule-box'
  title: string
  text: string
}

export interface ExampleSentenceWidget {
  type: 'example-sentence'
  tokens: { text: string; highlighted?: boolean }[]
}

export interface ComparisonTableWidget {
  type: 'comparison-table'
  headers: string[]
  rows: string[][]
}

export interface SentenceStructureDiagramWidget {
  type: 'sentence-structure-diagram'
  blocks: { label: string; text: string }[]
}

export interface BulletListWidget {
  type: 'bullet-list'
  title?: string
  items: string[]
}

export type GrammarWidget =
  | RuleBoxWidget
  | ExampleSentenceWidget
  | ComparisonTableWidget
  | SentenceStructureDiagramWidget
  | BulletListWidget

export interface GrammarSegment {
  widget: GrammarWidget
  narration: string
}

export interface GrammarLesson {
  segments: GrammarSegment[]
  practice: PracticeLine[]
}
