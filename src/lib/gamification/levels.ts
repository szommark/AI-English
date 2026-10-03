import { LEVEL_BASE_STEP, LEVEL_STEP_INCREMENT } from './constants.js'

// XP levels (docs/gamification-design.md §4.1). KEEP IN SYNC with
// gamification_level_for_xp() in supabase/migrations/20261003140000_gamification_core.sql,
// which stores the level on learner_gamification.

/** Cumulative XP needed to reach `level` (level 1 = 0, level 2 = 100, level 5 = 520). */
export function xpToReachLevel(level: number): number {
  const n = Math.max(0, Math.floor(level) - 1)
  return LEVEL_BASE_STEP * n + (LEVEL_STEP_INCREMENT * n * (n - 1)) / 2
}

/** The highest level whose cumulative XP is at most `totalXp`. */
export function levelFromTotalXp(totalXp: number): number {
  const total = Math.max(0, Math.floor(totalXp))
  let level = 1
  while (xpToReachLevel(level + 1) <= total) level += 1
  return level
}

export interface LevelProgress {
  level: number
  /** XP earned since reaching the current level. */
  xpIntoLevel: number
  /** XP between the current level and the next one. */
  xpForNextLevel: number
}

export function progressInLevel(totalXp: number): LevelProgress {
  const total = Math.max(0, Math.floor(totalXp))
  const level = levelFromTotalXp(total)
  const start = xpToReachLevel(level)
  return { level, xpIntoLevel: total - start, xpForNextLevel: xpToReachLevel(level + 1) - start }
}
