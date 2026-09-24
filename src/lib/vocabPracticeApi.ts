import { request } from './vocabListsApi'
import type { PracticeSession, ReviewInput, ReviewResult, StudentListProgress, VocabOverview } from './vocab'

// Client for the student side of /api/vocab (Phase 3: practice). See api/vocab.ts.

export function fetchVocabOverview(): Promise<VocabOverview> {
  return request('action=overview')
}

export function fetchPracticeSession(): Promise<PracticeSession> {
  return request('action=session')
}

export function submitReview(input: ReviewInput): Promise<ReviewResult> {
  return request('action=review', { method: 'POST', body: input })
}

export async function fetchMyVocabLists(): Promise<StudentListProgress[]> {
  const body = await request<{ lists: StudentListProgress[] }>('action=my-lists')
  return body.lists
}
