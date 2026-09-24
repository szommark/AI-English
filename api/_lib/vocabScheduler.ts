import { createEmptyCard, fsrs, Rating, State, type Card, type Grade } from 'ts-fsrs'
import { FAST_ANSWER_MS, REQUEST_RETENTION, type VocabExercise } from '../../src/lib/vocab.js'

// Thin, pure wrapper around ts-fsrs for the Vocabulary Builder (design doc §6). No DB
// access here — callers load a vocab_cards row, pass it in, and write the result back.
// Server-side only, so scheduling state can't be edited by the client.

const scheduler = fsrs({ request_retention: REQUEST_RETENTION, enable_fuzz: true })

/** Step 5 (Production) arrives in Phase 6; until then the ladder tops out at Listening. */
export const LADDER_MAX_STEP = 4
export const LADDER_MIN_STEP = 1

/** The FSRS columns of a vocab_cards row, as Supabase returns them. */
export interface VocabCardFsrsRow {
  due: string
  stability: number
  difficulty: number
  elapsed_days: number
  scheduled_days: number
  learning_steps: number
  reps: number
  lapses: number
  state: number
  last_review: string | null
}

export interface VocabCardScheduleRow extends VocabCardFsrsRow {
  ladder_step: number
  first_learned_at: string | null
}

export function cardRowToFsrs(row: VocabCardFsrsRow): Card {
  return {
    due: new Date(row.due),
    stability: row.stability,
    difficulty: row.difficulty,
    elapsed_days: row.elapsed_days,
    scheduled_days: row.scheduled_days,
    learning_steps: row.learning_steps,
    reps: row.reps,
    lapses: row.lapses,
    state: row.state as State,
    last_review: row.last_review ? new Date(row.last_review) : undefined,
  }
}

export function fsrsToCardRowFields(card: Card): VocabCardFsrsRow {
  return {
    due: card.due.toISOString(),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsed_days,
    scheduled_days: card.scheduled_days,
    learning_steps: card.learning_steps,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state,
    last_review: card.last_review ? card.last_review.toISOString() : null,
  }
}

/** FSRS fields for a brand-new card: state New, due now. */
export function newCardFields(now: Date): VocabCardFsrsRow {
  return fsrsToCardRowFields(createEmptyCard(now))
}

/**
 * Students never press Again/Hard/Good/Easy — the exercise result maps to a rating
 * (design §6.1). `usedHint` covers both a hint and a second attempt. Easy is never given
 * on recognition: multiple choice is too easy to guess fast.
 */
export function ratingFromResult(result: {
  correct: boolean
  usedHint: boolean
  responseMs: number | null
  exercise: VocabExercise
}): Grade {
  if (!result.correct) return Rating.Again
  if (result.usedHint) return Rating.Hard
  if (result.responseMs !== null && result.responseMs < FAST_ANSWER_MS && result.exercise !== 'recognition') {
    return Rating.Easy
  }
  return Rating.Good
}

function nextLadderStep(current: number, rating: Grade): number {
  if (rating === Rating.Good || rating === Rating.Easy) return Math.min(current + 1, LADDER_MAX_STEP)
  if (rating === Rating.Again) return Math.max(current - 1, LADDER_MIN_STEP)
  return current
}

export interface ReviewOutcome {
  fields: VocabCardFsrsRow & { ladder_step: number; first_learned_at: string | null }
  /** The card's state before this review, for vocab_reviews.state_before. */
  stateBefore: number
}

export function applyReview(row: VocabCardScheduleRow, rating: Grade, now: Date): ReviewOutcome {
  const { card } = scheduler.next(cardRowToFsrs(row), now, rating)
  const learnedNow = row.first_learned_at === null && card.state === State.Review

  return {
    fields: {
      ...fsrsToCardRowFields(card),
      ladder_step: nextLadderStep(row.ladder_step, rating),
      // Sticky: a later lapse never clears it, so a completed teacher list stays completed.
      first_learned_at: learnedNow ? now.toISOString() : row.first_learned_at,
    },
    stateBefore: row.state,
  }
}
