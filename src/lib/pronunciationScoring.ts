// Scoring for one pronunciation-session item. The free perception exercises (cards, forced
// choice, odd-one-out, dictation) share one perception score; the Azure-scored production
// exercise is the last stage and, being a single noisy attempt, must not dominate the total.

/** Hard ceiling for the production exercise's share of the overall score. */
export const MAX_PRODUCTION_WEIGHT = 0.5

/** Production share actually used — with four perception exercises that's 15% each vs. 40%. */
export const PRODUCTION_WEIGHT = 0.4

/** Average of the perception exercises' accuracy ratios (0–1 each), as a 0–100 score. */
export function perceptionScoreFromRatios(ratios: number[]): number {
  if (ratios.length === 0) return 0
  return Math.round((ratios.reduce((sum, r) => sum + r, 0) / ratios.length) * 100)
}

export function overallSessionScore(perceptionScore: number, productionScore: number): number {
  const productionWeight = Math.min(PRODUCTION_WEIGHT, MAX_PRODUCTION_WEIGHT)
  return Math.round(perceptionScore * (1 - productionWeight) + productionScore * productionWeight)
}
