import { fillPendingItems, pickDistractors } from './vocabPractice.js'
import { cardsStartedToday, loadDeck, sessionPlan, type SrsContext } from './vocabListSrs.js'
import { VocabApiError, allListTerms, loadListWords } from './vocabWordlists.js'
import {
  RECOGNITION_DISTRACTORS,
  SRS_MIN_WORDS,
  type PracticeCard,
  type PracticeSession,
  type VocabOverview,
  type WordlistRef,
} from '../../src/lib/vocab.js'

// Review sessions per list (design §7): a session only ever holds one list's words, and
// its meaning exercise takes the wrong options from that list too. Reviews themselves are
// recorded per card (recordReview in vocabPractice.ts), so a word on two lists moves on
// both.

/**
 * GET session&kind=&id=: the list's due reviews, then its new words for today. The list
 * needs SRS_MIN_WORDS words (409 otherwise).
 */
export async function buildListSession(userId: string, ref: WordlistRef, now = new Date()): Promise<PracticeSession> {
  const { rows, ctx } = await loadListWords(userId, ref, now)
  if (rows.length < SRS_MIN_WORDS) {
    throw new VocabApiError(409, `A list needs at least ${SRS_MIN_WORDS} words for spaced repetition`)
  }

  const { due, fresh } = sessionPlan(
    rows.map((r) => r.term_normalized),
    ctx,
  )
  const byTerm = new Map(rows.map((r) => [r.term_normalized, r]))
  const sessionRows = [...due, ...fresh].map((c) => byTerm.get(c.term_normalized)!)
  const inSession = new Set(sessionRows)

  // Session words first, so the one enrichment batch fills them before the other words,
  // whose meanings serve as distractors.
  await fillPendingItems(userId, [...sessionRows, ...rows.filter((r) => !inSession.has(r))])
  const pool = rows.map((r) => r.vocab_items.meaning_hu)

  const cards: PracticeCard[] = sessionRows.map((r) => ({
    cardId: r.card!.id,
    term: r.vocab_items.term,
    termNormalized: r.term_normalized,
    kind: r.vocab_items.kind,
    meaningHu: r.vocab_items.meaning_hu,
    definitionEn: r.vocab_items.definition_en,
    exampleEn: r.vocab_items.example_en,
    contextCorrected: r.context_corrected,
    ladderStep: r.card!.ladder_step,
    state: r.card!.state,
    distractors: r.card!.ladder_step === 1 ? pickDistractors(r.vocab_items.meaning_hu, pool, RECOGNITION_DISTRACTORS) : [],
  }))

  return { cards, dueCount: due.length, newCount: fresh.length }
}

/**
 * GET overview, for the landing tile's badge: the words every list's session would bring
 * now, each counted once. Lists too short for a session don't count.
 */
export async function loadOverview(userId: string, now = new Date()): Promise<VocabOverview> {
  const [deck, startedToday] = await Promise.all([loadDeck(userId), cardsStartedToday(userId, now)])
  const ctx: SrsContext = { cards: new Map(deck.map((c) => [c.term_normalized, c])), startedToday, now }
  const due = new Set<string>()
  const fresh = new Set<string>()
  for (const terms of await allListTerms(userId, deck)) {
    if (new Set(terms).size < SRS_MIN_WORDS) continue
    const plan = sessionPlan(terms, ctx)
    for (const c of plan.due) due.add(c.id)
    for (const c of plan.fresh) fresh.add(c.id)
  }
  return { dueCount: due.size, newAvailable: fresh.size }
}
