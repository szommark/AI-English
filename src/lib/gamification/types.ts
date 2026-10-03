/** What one XP award produced — returned by the API so the frontend can show the toast. */
export interface AwardResult {
  activityType: string
  baseXp: number
  bonusXp: number
  /** baseXp + bonusXp. */
  totalAwarded: number
  /** True when a daily/weekly cap cut the award (possibly to 0). */
  capped: boolean
  /** The learner's new cumulative XP. */
  totalXp: number
  level: number
  previousLevel: number
  leveledUp: boolean
}

export type XpLanguage = 'en' | 'de'

/** GET /api/gamification?action=me */
export interface GamificationMe {
  totalXp: number
  level: number
  xpIntoLevel: number
  xpForNextLevel: number
}
