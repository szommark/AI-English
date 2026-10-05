// An in-progress speaking exam lives in sessionStorage (per paper), like the written
// attempts in examAttempt.ts, so a refresh doesn't lose the conversation so far.
import type { SpeakingAssessment } from './examSpeakingTypes'
import type { ChatMessage } from './types'

export type SpeakingView = { name: 'overview' } | { name: 'task'; taskId: string } | { name: 'results' }

export interface SpeakingAttempt {
  view: SpeakingView
  /** Task id → that task's conversation. */
  transcripts: Record<string, ChatMessage[]>
  /** Task ids the examiner (or the learner) has closed. */
  done: string[]
  /** When each task was started (ms since epoch), for the elapsed-time hint. */
  startedAt: Record<string, number>
  assessment?: SpeakingAssessment
}

const key = (paperId: string) => `ai-english:exam-speaking:${paperId}`

export function newSpeakingAttempt(): SpeakingAttempt {
  return { view: { name: 'overview' }, transcripts: {}, done: [], startedAt: {} }
}

export function loadSpeakingAttempt(paperId: string): SpeakingAttempt | null {
  try {
    const raw = sessionStorage.getItem(key(paperId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as SpeakingAttempt
    return parsed?.view && parsed.transcripts && Array.isArray(parsed.done) ? { ...newSpeakingAttempt(), ...parsed } : null
  } catch {
    return null
  }
}

export function saveSpeakingAttempt(paperId: string, attempt: SpeakingAttempt): void {
  try {
    sessionStorage.setItem(key(paperId), JSON.stringify(attempt))
  } catch {
    // Storage unavailable or full: the exam still works, it just won't survive a refresh.
  }
}

export function clearSpeakingAttempt(paperId: string): void {
  try {
    sessionStorage.removeItem(key(paperId))
  } catch {
    // Nothing to clear.
  }
}
