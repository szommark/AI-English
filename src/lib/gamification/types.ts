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
  /** Badges this activity earned (usually none). */
  newBadges: EarnedBadge[]
}

/** A badge's proverb with its Hungarian equivalent (design §6.3). */
export interface Wisdom {
  text: string
  language: 'en' | 'de'
  hungarian: string
}

/** A badge just earned, for the celebration toast. */
export interface EarnedBadge {
  key: string
  nameHu: string
  nameEn: string
  /** lucide-react icon name (see src/components/gamification/badgeIcons.ts). */
  icon: string
  /** Null when the badge has no reviewed wisdom. */
  wisdom: Wisdom | null
}

/**
 * One tile on the badge wall. A hidden badge that isn't earned has no name, criteria or
 * icon; a locked badge has its criteria but never its wisdom.
 */
export interface BadgeWallItem {
  key: string
  category: string
  section: string | null
  hidden: boolean
  earned: boolean
  earnedAt: string | null
  icon: string | null
  nameHu: string | null
  nameEn: string | null
  criteriaHu: string | null
  criteriaEn: string | null
  wisdom: Wisdom | null
}

export interface WeekHistoryItem {
  /** Monday, YYYY-MM-DD (Europe/Budapest). */
  weekStart: string
  activeDays: number
  goalDays: number
  /** Null for the current, still open week. */
  goalMet: boolean | null
  xp: number
}

/** GET /api/gamification?action=overview — the "Az én fejlődésem" panel. */
export interface GamificationOverview {
  me: GamificationMe
  xpBySection: { section: string; xp: number }[]
  /** Most recent first, the current week included. */
  weeks: WeekHistoryItem[]
  badges: BadgeWallItem[]
  /** Most recent first. */
  teacherBonuses: TeacherBonus[]
}

/** One connected student's row in the teacher's class view (GET ?action=class). */
export interface ClassStudentGamification {
  studentId: string
  totalXp: number
  level: number
  week: { goalDays: number; activeDays: number; xp: number }
  weekStreak: number
  bestWeekStreak: number
  dailyStreak: number
  /** YYYY-MM-DD, Europe/Budapest; null if the student has never practised. */
  lastActiveDate: string | null
  /** Null when last week isn't on record (the student hadn't started yet). */
  lastWeekGoalMet: boolean | null
}

export interface ClassGamification {
  students: ClassStudentGamification[]
  summary: {
    students: number
    activeThisWeek: number
    goalMetThisWeek: number
    xpThisWeek: number
    goalMetLastWeek: number
    /** Students with last week on record (the denominator for goalMetLastWeek). */
    lastWeekOnRecord: number
  }
}

/** One student's gamification for their teacher (GET ?action=student). */
export interface StudentGamification {
  me: Omit<GamificationMe, 'unseenTeacherBonuses'>
  xpBySection: { section: string; xp: number }[]
  weeks: WeekHistoryItem[]
  /** Earned badges only, most recent first. */
  badges: BadgeWallItem[]
  bonuses: TeacherBonus[]
  /** Bonus XP the student can still receive this week. */
  bonusRemaining: number
}

/** POST ?action=bonus reply. */
export interface TeacherBonusResult {
  /** False when the amount was over this week's remaining allowance (nothing was given). */
  given: boolean
  bonusRemaining: number
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
  /** Teacher bonuses the learner hasn't seen yet (shown once as a toast, then acknowledged). */
  unseenTeacherBonuses: TeacherBonus[]
}

/** Bonus XP a teacher gave, with the teacher's reason. */
export interface TeacherBonus {
  amount: number
  reason: string
  createdAt: string
}
