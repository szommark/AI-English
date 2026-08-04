export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ScriptLine {
  speaker: string
  line: string
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

export interface Scenario {
  id: string
  title: string
  description: string
  aiRole: string
  setting: string
  systemPrompt: string
  rehearsalPhrases: string[]
  rehearsalScript: ScriptLine[]
  /**
   * Where the character's mouth sits in the scenario photo, used to anchor the speech
   * bubble and define the zone it must never cover. Percentages are relative to the
   * *rendered* <img> box, which must always display the photo uncropped (no object-cover).
   * Recalibrate at /dev/mouth-calibrator (dev server only) rather than eyeballing these.
   */
  mouth: MouthAnchor
}

export interface FeedbackCorrection {
  original: string
  corrected: string
  note: string
}

export interface FeedbackResult {
  strengths: string[]
  corrections: FeedbackCorrection[]
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
