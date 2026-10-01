import { stressPatterns } from './stressPatterns.js'
import { connectedSpeech } from './connectedSpeech.js'
import type { LessonSession, LessonSessionId, LessonUnit } from './types.js'

export type { LessonBody, LessonSession, LessonSessionId, LessonUnit, Step, TheoryBlock, TheoryExample } from './types.js'

export const lessonSessions: LessonSession[] = [stressPatterns, connectedSpeech]

export function getLessonSession(id: string): LessonSession | undefined {
  return lessonSessions.find((s) => s.id === id)
}

/** Route of a session's unit list. */
export function lessonSessionRoute(id: LessonSessionId): string {
  return `/pronunciation/${id}`
}

export function lessonUnitRoute(sessionId: LessonSessionId, unitId: string): string {
  return `/pronunciation/${sessionId}/${unitId}`
}

/** A unit's own id, whether it is a steps unit or a funnel unit (those are looked up by `getLessonUnit` too). */
export function getLessonUnit(unitId: string): { session: LessonSession; unit: LessonUnit } | undefined {
  for (const session of lessonSessions) {
    const unit = session.units.find((u) => u.id === unitId)
    if (unit) return { session, unit }
  }
  return undefined
}

/**
 * The id progress is stored under: a steps unit stores under its own id; a funnel unit under the
 * curriculum item it runs (`word-stress`, `weak-forms`), because DrillFunnel records that itself.
 */
export function progressIdOf(unit: LessonUnit): string {
  return unit.body.kind === 'funnel' ? unit.body.soundItemId : unit.id
}

/** Every id the session pages can write progress or request an Azure check under. */
export function isLessonProgressId(id: string): boolean {
  return lessonSessions.some((s) => s.units.some((u) => progressIdOf(u) === id))
}

/** The unit a stored progress id belongs to, for linking back to it from My Progress. */
export function findUnitByProgressId(id: string): { session: LessonSession; unit: LessonUnit } | undefined {
  for (const session of lessonSessions) {
    const unit = session.units.find((u) => progressIdOf(u) === id)
    if (unit) return { session, unit }
  }
  return undefined
}
