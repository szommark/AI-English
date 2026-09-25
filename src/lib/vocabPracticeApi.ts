import { request } from './vocabListsApi'
import type {
  AddToSrsResult,
  CompileInput,
  DrillAnswerInput,
  DrillRun,
  PracticeSession,
  ReviewInput,
  ReviewResult,
  VocabOverview,
  WordlistDetail,
  WordlistRef,
  WordlistsResponse,
} from './vocab'

// Client for the student side of /api/vocab: spaced repetition, My wordlists and Fast
// practice. See api/vocab.ts.

export function fetchVocabOverview(): Promise<VocabOverview> {
  return request('action=overview')
}

export function fetchPracticeSession(): Promise<PracticeSession> {
  return request('action=session')
}

export function submitReview(input: ReviewInput): Promise<ReviewResult> {
  return request('action=review', { method: 'POST', body: input })
}

/** Deletes a Tutor Bot / student card (also the undo on the Tutor Bot feedback card). */
export async function removeCard(cardId: string): Promise<void> {
  await request('action=remove', { method: 'POST', body: { cardId } })
}

export async function setCardSuspended(cardId: string, suspended: boolean): Promise<void> {
  await request('action=suspend', { method: 'POST', body: { cardId, suspended } })
}

// --- My wordlists (design §7.2) ------------------------------------------------------------

const listId = (id: string) => encodeURIComponent(id)

export function fetchWordlists(): Promise<WordlistsResponse> {
  return request('action=wordlists')
}

export function fetchWordlist(ref: WordlistRef): Promise<WordlistDetail> {
  return request(`action=wordlist&kind=${ref.kind}${ref.id ? `&id=${listId(ref.id)}` : ''}`)
}

export function compileWordlist(input: CompileInput): Promise<WordlistDetail> {
  return request('action=wordlist-compile', { method: 'POST', body: input })
}

export function regenerateWordlist(id: string): Promise<WordlistDetail> {
  return request(`action=wordlist-regenerate&id=${listId(id)}`, { method: 'POST' })
}

export function renameWordlist(id: string, title: string): Promise<WordlistDetail> {
  return request(`action=wordlist&id=${listId(id)}`, { method: 'PATCH', body: { title } })
}

export async function deleteWordlist(id: string): Promise<void> {
  await request(`action=wordlist&id=${listId(id)}`, { method: 'DELETE' })
}

export function addWordToList(id: string, term: string): Promise<WordlistDetail> {
  return request(`action=wordlist-word&id=${listId(id)}`, { method: 'POST', body: { term } })
}

export function removeWordFromList(id: string, itemId: string): Promise<WordlistDetail> {
  return request(`action=wordlist-word&id=${listId(id)}&itemId=${encodeURIComponent(itemId)}`, { method: 'DELETE' })
}

export function addListToSrs(id: string): Promise<AddToSrsResult> {
  return request(`action=wordlist-srs&id=${listId(id)}`, { method: 'POST' })
}

// --- Fast practice (design §7.1) ---------------------------------------------------------

export function startDrill(list: WordlistRef, itemIds: string[]): Promise<DrillRun> {
  return request('action=drill-start', { method: 'POST', body: { list, itemIds } })
}

export async function submitDrillAnswer(input: DrillAnswerInput): Promise<void> {
  await request('action=drill-answer', { method: 'POST', body: input })
}

export async function finishDrill(runId: string): Promise<void> {
  await request('action=drill-finish', { method: 'POST', body: { runId } })
}
