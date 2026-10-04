import type { AwardResult, ChallengeAnnouncement, CompletedChallenge, EarnedBadge, GamificationMe, TeacherBonus } from './types'

// Tiny in-memory pub/sub: API clients publish every XP award result they receive, and the
// header level chip and the XP toast (src/components/gamification/) listen. Keeps the
// learning components themselves unaware of how XP is shown.
//
// The learner's one-time notices (teacher bonuses, new and completed challenges, badges
// earned with them) come with their state from /api/gamification?action=me (or the progress
// overview) and travel the same way to the toast, each shown at most once per page load.

function channel<T>() {
  const listeners = new Set<(value: T) => void>()
  return {
    publish(value: T) {
      for (const listener of listeners) {
        try {
          listener(value)
        } catch (err) {
          console.error('Gamification listener failed', err)
        }
      }
    },
    subscribe(listener: (value: T) => void): () => void {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
  }
}

const xpResults = channel<AwardResult>()

export function publishXpResult(result: AwardResult | null | undefined): void {
  if (result) xpResults.publish(result)
}

export const subscribeXpResults = xpResults.subscribe

export interface LearnerNotices {
  teacherBonuses: TeacherBonus[]
  newChallenges: ChallengeAnnouncement[]
  completedChallenges: CompletedChallenge[]
  newBadges: EarnedBadge[]
}

const notices = channel<LearnerNotices>()
const shown = new Set<string>()

function fresh<T>(items: T[] | undefined, key: (item: T) => string): T[] {
  return (items ?? []).filter((item) => {
    const k = key(item)
    if (shown.has(k)) return false
    shown.add(k)
    return true
  })
}

/**
 * Publishes the notices in a learner state that haven't been shown yet. Returns true when
 * a teacher bonus or a new challenge was among them, i.e. the caller should acknowledge them
 * (POST ?action=seen) so they don't come back on the next load.
 */
export function publishMeNotices(me: Pick<GamificationMe, 'unseenTeacherBonuses' | 'newChallenges' | 'completedChallenges' | 'newBadges'>): boolean {
  const next: LearnerNotices = {
    teacherBonuses: fresh(me.unseenTeacherBonuses, (b) => `bonus:${b.createdAt}`),
    newChallenges: fresh(me.newChallenges, (c) => `new:${c.id}`),
    completedChallenges: fresh(me.completedChallenges, (c) => `done:${c.id}`),
    newBadges: fresh(me.newBadges, (b) => `badge:${b.key}`),
  }
  if (Object.values(next).some((list) => list.length > 0)) notices.publish(next)
  return next.teacherBonuses.length > 0 || next.newChallenges.length > 0
}

export const subscribeNotices = notices.subscribe
