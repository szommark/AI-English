import type { AwardResult, TeacherBonus } from './types'

// Tiny in-memory pub/sub: API clients publish every XP award result they receive, and the
// header level chip and the XP toast (src/components/gamification/) listen. Keeps the
// learning components themselves unaware of how XP is shown. Teacher bonuses the learner
// hasn't seen yet travel the same way, from the chip (which loads them) to the toast.

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
const teacherBonuses = channel<TeacherBonus[]>()

export function publishXpResult(result: AwardResult | null | undefined): void {
  if (result) xpResults.publish(result)
}

export const subscribeXpResults = xpResults.subscribe

export function publishTeacherBonuses(bonuses: TeacherBonus[]): void {
  if (bonuses.length > 0) teacherBonuses.publish(bonuses)
}

export const subscribeTeacherBonuses = teacherBonuses.subscribe
