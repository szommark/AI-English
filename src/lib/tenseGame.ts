// Round logic for the Grammar Coach "Past · Present · Future" game (no React, no network).
import { TENSE_GAME_QUESTIONS, TIME_FRAMES, type TenseGameLevel, type TenseGameQuestion } from '../data/tenseGameQuestions.ts'

export const QUESTIONS_PER_FRAME = 3
export const ROUND_LENGTH = QUESTIONS_PER_FRAME * TIME_FRAMES.length

/** How a question ended: right first time, right on the one retry, or missed (two wrong answers or skipped). */
export type QuestionOutcome = 'first-try' | 'retry' | 'missed'

const OUTCOME_POINTS: Record<QuestionOutcome, number> = { 'first-try': 1, retry: 0.5, missed: 0 }

function shuffle<T>(items: T[], random: () => number): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/**
 * Three questions per time frame at the level, in a mixed order where the same frame never
 * comes three times in a row. Questions from `recentIds` (the last round) are used only when
 * a frame has run out of fresh ones.
 */
export function buildRound(level: TenseGameLevel, recentIds: string[] = [], random: () => number = Math.random): TenseGameQuestion[] {
  const recent = new Set(recentIds)
  const picked = TIME_FRAMES.flatMap((frame) => {
    const pool = TENSE_GAME_QUESTIONS.filter((q) => q.level === level && q.frame === frame)
    const fresh = shuffle(pool.filter((q) => !recent.has(q.id)), random)
    const used = shuffle(pool.filter((q) => recent.has(q.id)), random)
    return [...fresh, ...used].slice(0, QUESTIONS_PER_FRAME)
  })
  for (let attempt = 0; attempt < 20; attempt++) {
    const order = shuffle(picked, random)
    if (order.every((q, i) => i < 2 || q.frame !== order[i - 1].frame || q.frame !== order[i - 2].frame)) return order
  }
  return shuffle(picked, random)
}

/** The round's share of points (0–1): half a point for a question answered on the retry. */
export function roundScore(outcomes: QuestionOutcome[]): number {
  if (outcomes.length === 0) return 0
  return outcomes.reduce((sum, o) => sum + OUTCOME_POINTS[o], 0) / outcomes.length
}
