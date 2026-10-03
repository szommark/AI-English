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
  /** True only for the activity that reached this week's goal. */
  weeklyGoalMet: boolean
}

export type XpLanguage = 'en' | 'de'

/** GET /api/gamification?action=me (and the reply to ?action=goal). */
export interface GamificationMe {
  totalXp: number
  level: number
  xpIntoLevel: number
  xpForNextLevel: number
  /** The learner's chosen goal; applies from next week if it was just changed. */
  weeklyGoalDays: number
  week: {
    /** The goal in force this week. */
    goalDays: number
    activeDays: number
  }
  /** Consecutive weeks with the goal met, counting this week once it is met. */
  weekStreak: number
  bestWeekStreak: number
  /** 0 once the streak has lapsed beyond what the freezes cover. */
  dailyStreak: number
  freezes: number
  activeToday: boolean
  /** A streak of 2+ days lapsed and a new one started today. */
  streakRestartedToday: boolean
}
