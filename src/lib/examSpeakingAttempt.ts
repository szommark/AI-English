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

// --- Practice mode: each task on its own, as a rehearsal or a test -------------------------

export type SpeakingPracticeTab = 'rehearsal' | 'test'

/** One go at one task in one tab. `round` changes when the learner starts it again. */
export interface SpeakingPracticeRun {
  messages: ChatMessage[]
  done: boolean
  round: number
  startedAt?: number
  /** The AI's estimate for this task only. */
  assessment?: SpeakingAssessment
}

export interface SpeakingPractice {
  taskId: string
  tab: SpeakingPracticeTab
  /** `${taskId}:${tab}` → that run. */
  runs: Record<string, SpeakingPracticeRun>
  /** Rehearsal, per task: how many sample lines have been shown, and whether the learner's own try is on. */
  sampleShown: Record<string, number>
  trying: Record<string, boolean>
}

export const practiceRunKey = (taskId: string, tab: SpeakingPracticeTab) => `${taskId}:${tab}`

export function newPracticeRun(round = 0): SpeakingPracticeRun {
  return { messages: [], done: false, round }
}

const practiceKey = (paperId: string) => `ai-english:exam-speaking-practice:${paperId}`
const modeKey = (paperId: string) => `ai-english:exam-speaking-mode:${paperId}`

export function newSpeakingPractice(taskId: string): SpeakingPractice {
  return { taskId, tab: 'rehearsal', runs: {}, sampleShown: {}, trying: {} }
}

export function loadSpeakingPractice(paperId: string): SpeakingPractice | null {
  try {
    const raw = sessionStorage.getItem(practiceKey(paperId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as SpeakingPractice
    return parsed?.taskId && parsed.runs ? { ...newSpeakingPractice(parsed.taskId), ...parsed } : null
  } catch {
    return null
  }
}

export function saveSpeakingPractice(paperId: string, practice: SpeakingPractice): void {
  try {
    sessionStorage.setItem(practiceKey(paperId), JSON.stringify(practice))
  } catch {
    // Storage unavailable or full: practice still works, it just won't survive a refresh.
  }
}

export function clearSpeakingPractice(paperId: string): void {
  try {
    sessionStorage.removeItem(practiceKey(paperId))
  } catch {
    // Nothing to clear.
  }
}

/** Which mode the speaking page was in, so a refresh returns there. */
export type SpeakingPageMode = 'exam' | 'practice'

export function loadSpeakingMode(paperId: string): SpeakingPageMode | null {
  try {
    const raw = sessionStorage.getItem(modeKey(paperId))
    return raw === 'exam' || raw === 'practice' ? raw : null
  } catch {
    return null
  }
}

export function saveSpeakingMode(paperId: string, mode: SpeakingPageMode | null): void {
  try {
    if (mode) sessionStorage.setItem(modeKey(paperId), mode)
    else sessionStorage.removeItem(modeKey(paperId))
  } catch {
    // Storage unavailable: a refresh lands on the intro.
  }
}
