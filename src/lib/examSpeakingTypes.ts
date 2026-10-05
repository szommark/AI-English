// Shapes shared by the speaking exam's browser code and api/tutor.ts. Type-only, so api/
// can import it with a `.js` specifier.
import type { SpeakingCriterion } from '../data/exams/speaking.js'
import type { ChatMessage, FeedbackCorrection } from './types.js'

export interface SpeakingTurnRequest {
  paperId: string
  taskId: string
  /** This task's conversation so far; empty for the examiner's opening turn. */
  history: ChatMessage[]
}

export interface SpeakingTurnResponse {
  reply: string
  /** The examiner closed the task with this turn. */
  taskDone: boolean
}

export interface SpeakingAssessRequest {
  paperId: string
  /** Task id → that task's conversation. */
  transcripts: Record<string, ChatMessage[]>
  uiLang: 'hu' | 'en' | 'de'
}

export interface SpeakingTaskAssessment {
  taskId: string
  /** The learner said something in this task. */
  attempted: boolean
  scores: Record<SpeakingCriterion, number>
  total: number
  max: number
  comment: string
}

/** The AI's estimate — not an official score. */
export interface SpeakingAssessment {
  tasks: SpeakingTaskAssessment[]
  total: number
  max: number
  summary: string
  strengths: string[]
  corrections: FeedbackCorrection[]
}
