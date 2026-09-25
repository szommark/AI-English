import { request } from './vocabListsApi'
import type { MyWord, PracticeSession, ReviewInput, ReviewResult, StudentListProgress, VocabOverview } from './vocab'

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

export async function fetchMyWords(): Promise<MyWord[]> {
  const body = await request<{ cards: MyWord[] }>('action=cards')
  return body.cards
}

/** Deletes a Tutor Bot / catalog card (also the undo on the Tutor Bot feedback card). */
export async function removeCard(cardId: string): Promise<void> {
  await request('action=remove', { method: 'POST', body: { cardId } })
}

export async function setCardSuspended(cardId: string, suspended: boolean): Promise<void> {
  await request('action=suspend', { method: 'POST', body: { cardId, suspended } })
}
