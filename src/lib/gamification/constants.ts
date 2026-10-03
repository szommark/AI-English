// Every tuneable gamification number lives here (docs/gamification-design.md §3, §4.1),
// shared by the API routes (api/_lib/gamification.ts) and the frontend. Changing a value
// is a one-line edit — except where noted, the SQL in
// supabase/migrations/20261003140000_gamification_core.sql has its own copy that MUST be
// kept in sync.

/** A perfect performance score adds this share of base XP as a bonus. */
export const BONUS_MAX_RATIO = 0.5

/** XP for level 1 → 2. SQL copy: gamification_level_for_xp(). */
export const LEVEL_BASE_STEP = 100
/** Each further level needs this much more than the previous one. SQL copy: gamification_level_for_xp(). */
export const LEVEL_STEP_INCREMENT = 20

/** Learner turns before a Tutor Bot conversation earns XP. */
export const TUTOR_MIN_TURNS_FOR_XP = 6
/** Learner turns before a scenario conversation earns XP. */
export const SCENARIO_MIN_TURNS_FOR_XP = 6

/** Second time the same item within 24 hours. */
export const REPEAT_SECOND_MULTIPLIER = 0.5
/** Third and later times the same item within 24 hours. */
export const REPEAT_THIRD_PLUS_MULTIPLIER = 0

/** POST /api/gamification?action=award refuses (429) at this many XP events in the last minute. */
export const CLIENT_AWARD_RATE_LIMIT_PER_MINUTE = 30

/** weekly_cap_group shared by all mock-exam activity types (seeded, not yet enabled). */
export const EXAM_WEEKLY_XP_CAP_GROUP = 'exam'

/** Calendar days and weeks for caps, active days and streaks. SQL copies: every gamification function. */
export const GAMIFICATION_TIMEZONE = 'Europe/Budapest'

// Weekly goal and streaks (design §5). SQL copies: 20261003150000_gamification_streaks.sql
// (column checks, gamification_close_weeks, gamification_state, set_weekly_goal).

/** Active days per week a learner can choose as their goal. */
export const WEEKLY_GOAL_MIN_DAYS = 2
export const WEEKLY_GOAL_MAX_DAYS = 5
export const DEFAULT_WEEKLY_GOAL_DAYS = 3
/** Freezes a learner can hold; one is earned per week with the goal met, each covers one missed day. */
export const MAX_FREEZES = 2

// Badges (design §6). Thresholds that belong to one badge live in its params
// (badge_definitions); these are the shared definitions behind the metrics.

/** A Sound Bank sound counts as mastered when perception and production are both at least this (0–100). */
export const SOUND_MASTERY_THRESHOLD = 80
/** Weeks of history shown on "Az én fejlődésem". */
export const WEEK_HISTORY_WEEKS = 8

// Teacher tools (design §7).

/** Most bonus XP a student can receive from their teachers in one week (Mon–Sun, Europe/Budapest). */
export const TEACHER_BONUS_WEEKLY_CAP = 50
/** A bonus needs a reason of this many characters (trimmed)… */
export const TEACHER_BONUS_REASON_MIN = 3
/** …and at most this many. */
export const TEACHER_BONUS_REASON_MAX = 200
/** Recent bonuses listed on the student's progress page and the teacher's student page. */
export const TEACHER_BONUS_LIST_LIMIT = 10
