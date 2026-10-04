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
  /** Challenges this activity completed (usually none). */
  completedChallenges: CompletedChallenge[]
}

// --- Class challenges (design §7.3) ---

export type ChallengeKind = 'collective' | 'individual'
export type ChallengeTargetType = 'active_days' | 'activities' | 'xp' | 'word_list'
/** For 'activities': any, a features.ts section id, or a Vocabulary activity (individual only). */
export type ChallengeActivity =
  | 'any'
  | 'conversational-english'
  | 'tutor-bot'
  | 'grammar-coach'
  | 'pronunciation-session'
  | 'vocabulary.fast_practice'
  | 'vocabulary.game'
  | 'vocabulary.own_list'
export type ChallengeStatus = 'upcoming' | 'active' | 'ended' | 'cancelled'

export interface ChallengeTarget {
  type: ChallengeTargetType
  activity: ChallengeActivity | null
  listId: string | null
  /** The word list's title, for word_list targets (null if the list was deleted). */
  listTitle: string | null
  /** Individual: each student's target. Collective: the class total. */
  value: number
}

/** A challenge as the learner sees it on "Az én fejlődésem". */
export interface StudentChallenge {
  id: string
  title: string
  description: string | null
  kind: ChallengeKind
  target: ChallengeTarget
  /** YYYY-MM-DD, inclusive, Europe/Budapest. */
  startsOn: string
  endsOn: string
  status: ChallengeStatus
  rewardXp: number
  /** The learner's own count (their contribution, for a collective challenge). */
  myValue: number
  /** Collective only: the class total. */
  classTotal: number | null
  completed: boolean
  completedAt: string | null
}

/** A challenge the learner just completed, for the toast. */
export interface CompletedChallenge {
  id: string
  title: string
  kind: ChallengeKind
  rewardXp: number
}

/** A new challenge from the learner's teacher, announced once. */
export interface ChallengeAnnouncement {
  id: string
  title: string
  kind: ChallengeKind
  endsOn: string
}

/** A challenge as its teacher sees it. */
export interface TeacherChallenge {
  id: string
  title: string
  description: string | null
  kind: ChallengeKind
  audience: 'class' | 'selected'
  /** For audience 'selected'. */
  recipientIds: string[]
  target: ChallengeTarget
  startsOn: string
  endsOn: string
  status: ChallengeStatus
  rewardXp: number
  createdAt: string
  /** Every current participant with their count and whether they completed it. */
  participants: { studentId: string; value: number; completed: boolean }[]
  /** Sum of the participants' counts. */
  total: number
}

// --- Class comparison and the public leaderboard (design §8) ---

/** CEFR bands: A1–A2, B1–B2, C1–C2 (no estimate yet: alap). */
export type LeagueKey = 'alap' | 'kozep' | 'felso'

export interface LeaderboardEntry {
  /** 1-based; equal XP shares a rank. */
  rank: number
  nickname: string
  level: number
  xp: number
  isMe: boolean
}

/** GET ?action=leaderboard */
export interface LeaderboardView {
  /** The admin switch; when false nothing else is filled in. */
  enabled: boolean
  /** A teacher of the learner has turned the public leaderboard off for their class. */
  blockedByTeacher: boolean
  optedIn: boolean
  nickname: string | null
  /** The learner's league (from their latest CEFR estimate). */
  league: LeagueKey
  /** This week's top of the league, learners with XP only. */
  entries: LeaderboardEntry[]
  /** The learner's own row when they are on the leaderboard but not in `entries`. */
  me: LeaderboardEntry | null
  /** Learners in the league with XP this week. */
  participants: number
}

export interface ClassRankingEntry {
  rank: number
  xp: number
  isMe: boolean
  /** Set only for classmates on the public leaderboard. */
  nickname: string | null
  /** For classmates shown as "Osztálytárs N" (no nickname, not the learner). */
  classmateNo: number | null
}

/** GET ?action=class-ranking */
export interface ClassRankingView {
  enabled: boolean
  /** One per teacher who turned class comparison on. */
  classes: { teacherLabel: string; entries: ClassRankingEntry[] }[]
}

/** GET/POST ?action=class-settings (teacher) */
export interface TeacherClassSettings {
  classComparison: boolean
  leaderboardAllowed: boolean
  /** The admin switches, so the teacher knows whether their settings have any effect yet. */
  globalClassComparison: boolean
  globalLeaderboard: boolean
}

/** GET ?action=admin-gamification */
export interface AdminGamificationSettings {
  publicLeaderboard: boolean
  classComparison: boolean
  /** Everyone on the public leaderboard, for nickname moderation. */
  participants: { userId: string; nickname: string; email: string; optInAt: string | null }[]
}

/** POST ?action=challenge body. */
export interface NewChallenge {
  title: string
  description?: string | null
  kind: ChallengeKind
  /** Individual only; omitted or empty = the whole class. */
  studentIds?: string[]
  targetType: ChallengeTargetType
  targetActivity?: ChallengeActivity | null
  targetListId?: string | null
  targetValue: number
  start: 'today' | 'next-monday'
  weeks: number
  rewardXp: number
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
  /** Active and upcoming first, then recently ended. */
  challenges: StudentChallenge[]
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
/** Level, week and streaks only, without the learner's one-time notices. */
export type GamificationState = Omit<GamificationMe, 'unseenTeacherBonuses' | 'newChallenges' | 'completedChallenges' | 'newBadges'>

export interface StudentGamification {
  me: GamificationState
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
  /** New challenges the learner hasn't seen yet (announced once, then acknowledged). */
  newChallenges: ChallengeAnnouncement[]
  /** Challenges completed while loading this state — e.g. the class reached a collective target. */
  completedChallenges: CompletedChallenge[]
  /** Badges earned with those completions. */
  newBadges: EarnedBadge[]
}

/** Bonus XP a teacher gave, with the teacher's reason. */
export interface TeacherBonus {
  amount: number
  reason: string
  createdAt: string
}
