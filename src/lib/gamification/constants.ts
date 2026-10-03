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

/** Calendar days and weeks for caps. SQL copy: xp_award_context(). */
export const GAMIFICATION_TIMEZONE = 'Europe/Budapest'
