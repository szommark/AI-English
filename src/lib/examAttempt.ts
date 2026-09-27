// In-progress Exam Prep attempts live in sessionStorage (per paper and mode), so an
// accidental refresh doesn't wipe a 60-minute booklet. Cleared when the attempt is finished.
import type { ExamAnswers } from './examScoring'

export type ExamMode = 'exam' | 'practice'

export type AttemptView =
  | { name: 'section'; sectionId: string }
  | { name: 'result'; sectionId: string; reason?: 'timeUp' | 'recordingEnded' }
  | { name: 'summary' }

export interface ExamAttempt {
  mode: ExamMode
  answers: ExamAnswers
  /** Section ids, in the order they were submitted. */
  submitted: string[]
  view: AttemptView
  /** Exam mode: when each section's clock started (ms since epoch). */
  sectionStartedAt: Record<string, number>
  /** Exam mode: when each section's recording was started (ms since epoch). */
  audioStartedAt: Record<string, number>
}

const key = (paperId: string, mode: ExamMode) => `ai-english:exam:${paperId}:${mode}`

export function loadAttempt(paperId: string, mode: ExamMode): ExamAttempt | null {
  try {
    const raw = sessionStorage.getItem(key(paperId, mode))
    if (!raw) return null
    const parsed = JSON.parse(raw) as ExamAttempt
    return parsed && parsed.mode === mode && parsed.answers && parsed.view ? parsed : null
  } catch {
    return null
  }
}

export function saveAttempt(paperId: string, attempt: ExamAttempt): void {
  try {
    sessionStorage.setItem(key(paperId, attempt.mode), JSON.stringify(attempt))
  } catch {
    // Storage unavailable or full: the attempt still works, it just won't survive a refresh.
  }
}

export function clearAttempt(paperId: string, mode: ExamMode): void {
  try {
    sessionStorage.removeItem(key(paperId, mode))
  } catch {
    // Nothing to clear.
  }
}

export function newAttempt(mode: ExamMode, firstSectionId: string): ExamAttempt {
  return {
    mode,
    answers: {},
    submitted: [],
    view: { name: 'section', sectionId: firstSectionId },
    sectionStartedAt: {},
    audioStartedAt: {},
  }
}
