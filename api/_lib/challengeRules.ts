import {
  CHALLENGE_DESCRIPTION_MAX,
  CHALLENGE_MAX_REWARD_XP,
  CHALLENGE_MAX_TARGET,
  CHALLENGE_MAX_WEEKS,
  CHALLENGE_MIN_WEEKS,
  CHALLENGE_TITLE_MAX,
  CHALLENGE_TITLE_MIN,
} from '../../src/lib/gamification/constants.js'
import { addDays, budapestDate, nextMonday } from '../../src/lib/gamification/dates.js'
import type {
  ChallengeActivity,
  ChallengeKind,
  ChallengeStatus,
  ChallengeTargetType,
} from '../../src/lib/gamification/types.js'

// Class challenge rules as pure functions (no database access): status, completion and
// validating a new challenge. api/_lib/challenges.ts does the loading.

export { addDays, budapestDate, nextMonday }

export function challengeStatus(
  c: { starts_on: string; ends_on: string; cancelled_at: string | null },
  today: string,
): ChallengeStatus {
  if (c.cancelled_at) return 'cancelled'
  if (today < c.starts_on) return 'upcoming'
  if (today > c.ends_on) return 'ended'
  return 'active'
}

/**
 * Individual: the student reached the target. Collective: the class total reached it and
 * the student contributed (someone who did nothing gets no reward).
 */
export function isChallengeCompleted(kind: ChallengeKind, target: number, myValue: number, classTotal: number): boolean {
  if (kind === 'individual') return myValue >= target
  return classTotal >= target && myValue > 0
}

export const CHALLENGE_KINDS: ChallengeKind[] = ['collective', 'individual']
export const CHALLENGE_TARGET_TYPES: ChallengeTargetType[] = ['active_days', 'activities', 'xp', 'word_list']
export const CHALLENGE_ACTIVITIES: ChallengeActivity[] = [
  'any',
  'conversational-english',
  'tutor-bot',
  'grammar-coach',
  'pronunciation-session',
  'exam-prep',
  'vocabulary.fast_practice',
  'vocabulary.game',
  'vocabulary.own_list',
]
/** Vocabulary activities, offered for individual challenges only. */
export const INDIVIDUAL_ONLY_ACTIVITIES: ChallengeActivity[] = ['vocabulary.fast_practice', 'vocabulary.game', 'vocabulary.own_list']

/** A validated challenge, ready to insert. */
export interface ChallengeRow {
  title: string
  description: string | null
  kind: ChallengeKind
  audience: 'class' | 'selected'
  recipientIds: string[]
  target_type: ChallengeTargetType
  target_activity: ChallengeActivity | null
  target_list_id: string | null
  target_value: number
  starts_on: string
  ends_on: string
  reward_xp: number
}

const isInt = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v)

/**
 * Checks a new challenge from a teacher. `classStudentIds` are the teacher's active
 * connections and `teacherListIds` their (non-archived) word lists.
 */
export function validateNewChallenge(
  raw: unknown,
  ctx: { today: string; classStudentIds: Set<string>; teacherListIds: Set<string> },
): { ok: true; row: ChallengeRow } | { ok: false; error: string } {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { ok: false, error: 'Invalid request' }
  const b = raw as Record<string, unknown>

  const title = typeof b.title === 'string' ? b.title.trim() : ''
  if (title.length < CHALLENGE_TITLE_MIN || title.length > CHALLENGE_TITLE_MAX) {
    return { ok: false, error: `The title must be ${CHALLENGE_TITLE_MIN}–${CHALLENGE_TITLE_MAX} characters.` }
  }
  const description = typeof b.description === 'string' && b.description.trim() ? b.description.trim() : null
  if (b.description != null && typeof b.description !== 'string') return { ok: false, error: 'Invalid description' }
  if (description && description.length > CHALLENGE_DESCRIPTION_MAX) {
    return { ok: false, error: `The description can be at most ${CHALLENGE_DESCRIPTION_MAX} characters.` }
  }

  const kind = b.kind as ChallengeKind
  if (!CHALLENGE_KINDS.includes(kind)) return { ok: false, error: 'Invalid challenge type' }

  let recipientIds: string[] = []
  if (b.studentIds != null) {
    if (!Array.isArray(b.studentIds) || b.studentIds.some((id) => typeof id !== 'string')) {
      return { ok: false, error: 'Invalid students' }
    }
    recipientIds = [...new Set(b.studentIds as string[])]
  }
  if (recipientIds.length > 0 && kind !== 'individual') {
    return { ok: false, error: 'A collective challenge is always for the whole class.' }
  }
  if (recipientIds.some((id) => !ctx.classStudentIds.has(id))) {
    return { ok: false, error: 'You can only choose students connected to you.' }
  }
  if (ctx.classStudentIds.size === 0) return { ok: false, error: 'You have no connected students yet.' }

  const targetType = b.targetType as ChallengeTargetType
  if (!CHALLENGE_TARGET_TYPES.includes(targetType)) return { ok: false, error: 'Invalid target' }

  let targetActivity: ChallengeActivity | null = null
  if (targetType === 'activities') {
    targetActivity = b.targetActivity as ChallengeActivity
    if (!CHALLENGE_ACTIVITIES.includes(targetActivity)) return { ok: false, error: 'Choose which activities count.' }
    if (kind === 'collective' && INDIVIDUAL_ONLY_ACTIVITIES.includes(targetActivity)) {
      return { ok: false, error: 'Vocabulary activities can only be individual challenges.' }
    }
  }

  let targetListId: string | null = null
  if (targetType === 'word_list') {
    if (typeof b.targetListId !== 'string' || !ctx.teacherListIds.has(b.targetListId)) {
      return { ok: false, error: 'Choose one of your word lists.' }
    }
    targetListId = b.targetListId
  }

  const weeks = b.weeks
  if (!isInt(weeks) || weeks < CHALLENGE_MIN_WEEKS || weeks > CHALLENGE_MAX_WEEKS) {
    return { ok: false, error: `A challenge lasts ${CHALLENGE_MIN_WEEKS}–${CHALLENGE_MAX_WEEKS} weeks.` }
  }
  if (b.start !== 'today' && b.start !== 'next-monday') return { ok: false, error: 'Invalid start' }
  const startsOn = b.start === 'today' ? ctx.today : nextMonday(ctx.today)
  const endsOn = addDays(startsOn, weeks * 7 - 1)

  // An individual word-list challenge is simply "complete the list".
  const targetValue: unknown = targetType === 'word_list' && kind === 'individual' ? 1 : b.targetValue
  if (!isInt(targetValue) || targetValue < 1 || targetValue > CHALLENGE_MAX_TARGET) {
    return { ok: false, error: 'Enter a target of at least 1.' }
  }
  if (targetType === 'active_days' && kind === 'individual' && targetValue > weeks * 7) {
    return { ok: false, error: `At most ${weeks * 7} days fit in ${weeks} week${weeks === 1 ? '' : 's'}.` }
  }
  if (targetType === 'word_list' && kind === 'collective' && targetValue > ctx.classStudentIds.size) {
    return { ok: false, error: `You have ${ctx.classStudentIds.size} connected students.` }
  }

  const reward = b.rewardXp
  if (!isInt(reward) || reward < 0 || reward > CHALLENGE_MAX_REWARD_XP) {
    return { ok: false, error: `The reward is 0–${CHALLENGE_MAX_REWARD_XP} XP.` }
  }

  return {
    ok: true,
    row: {
      title,
      description,
      kind,
      audience: recipientIds.length > 0 ? 'selected' : 'class',
      recipientIds,
      target_type: targetType,
      target_activity: targetActivity,
      target_list_id: targetListId,
      target_value: targetValue,
      starts_on: startsOn,
      ends_on: endsOn,
      reward_xp: reward,
    },
  }
}
