import { request } from './vocabListsApi'
import { publishXpResult } from './gamification/xpEvents'
import type { AwardResult } from './gamification/types'
import type {
  AddToSrsResult,
  AddWordsResult,
  CompileInput,
  DrillAnswerInput,
  DrillRun,
  PracticeSession,
  ReviewInput,
  ReviewResult,
  TestAnswerInput,
  TestResult,
  TestRun,
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

/** One list's review session: its due words, then its new words for today. */
export function fetchPracticeSession(ref: WordlistRef): Promise<PracticeSession> {
  return request(`action=session&${refQuery(ref)}`)
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

/** Puts a mastered card back into spaced repetition, due now. */
export async function reviewCardAgain(cardId: string): Promise<void> {
  await request('action=review-again', { method: 'POST', body: { cardId } })
}

// --- My wordlists (design §7.2) ------------------------------------------------------------

const listId = (id: string) => encodeURIComponent(id)
const refQuery = (ref: WordlistRef) => `kind=${ref.kind}${ref.id ? `&id=${listId(ref.id)}` : ''}`

export function fetchWordlists(): Promise<WordlistsResponse> {
  return request('action=wordlists')
}

export function fetchWordlist(ref: WordlistRef): Promise<WordlistDetail> {
  return request(`action=wordlist&${refQuery(ref)}`)
}

export function compileWordlist(input: CompileInput): Promise<WordlistDetail> {
  return request('action=wordlist-compile', { method: 'POST', body: input })
}

/** More words for the list's topic and level, added to the end. Counts as a compile. */
export function addBankWords(id: string, count: number): Promise<WordlistDetail> {
  return request(`action=wordlist-more&id=${listId(id)}`, { method: 'POST', body: { count } })
}

export function renameWordlist(id: string, title: string): Promise<WordlistDetail> {
  return request(`action=wordlist&id=${listId(id)}`, { method: 'PATCH', body: { title } })
}

export async function deleteWordlist(id: string): Promise<void> {
  await request(`action=wordlist&id=${listId(id)}`, { method: 'DELETE' })
}

export function addWordsToList(id: string, terms: string[]): Promise<AddWordsResult> {
  return request(`action=wordlist-word&id=${listId(id)}`, { method: 'POST', body: { terms } })
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
  const body = await request<{ xp?: AwardResult | null }>('action=drill-finish', { method: 'POST', body: { runId } })
  // A finished round earns Vocabulary XP server-side; the result drives the toast.
  publishXpResult(body?.xp)
}

// --- Fast practice tests (design §7.1) -----------------------------------------------------

/** A test of a list: the server picks its words at random. */
export function startTest(list: WordlistRef): Promise<TestRun> {
  return request('action=test-start', { method: 'POST', body: { list } })
}

export async function submitTestAnswer(input: TestAnswerInput): Promise<void> {
  await request('action=test-answer', { method: 'POST', body: input })
}

export function finishTest(testId: string): Promise<TestResult> {
  return request('action=test-finish', { method: 'POST', body: { testId } })
}
