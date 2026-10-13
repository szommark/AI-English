// Teacher control of the Grammar Coach Tense Explorer: which tenses a student sees and whether
// they may change that set. Pure logic shared by the teacher UI, the explorer and the API
// (api/teacher-tools.ts, api/grammar-lesson.ts), so imports here use .js specifiers.

import { TENSE_IDS, type TenseId } from './tenseEngine/types.js'

/** One saved setting: a teacher's class default or a per-student override. */
export interface TenseExplorerSetting {
  tenses: TenseId[]
  /** true: the tenses are the student's starting view; false: exactly these, no changes. */
  allowCustomize: boolean
  updatedAt: string
}

/** What the explorer applies for a student: their teachers' settings combined. */
export type TenseExplorerPolicy = TenseExplorerSetting

/** Validates a teacher's request body; throws with a short message when it is invalid. */
export function sanitizeTenseSettingInput(body: unknown): { tenses: TenseId[]; allowCustomize: boolean } {
  const data = (body ?? {}) as Record<string, unknown>
  if (!Array.isArray(data.tenses)) throw new Error('tenses must be a list')
  const tenses = TENSE_IDS.filter((t) => (data.tenses as unknown[]).includes(t))
  if (tenses.length !== new Set(data.tenses).size) throw new Error('unknown tense in tenses')
  if (tenses.length === 0) throw new Error('choose at least one tense')
  if (typeof data.allowCustomize !== 'boolean') throw new Error('allowCustomize must be true or false')
  return { tenses, allowCustomize: data.allowCustomize }
}

/**
 * Combines the settings that apply to one student (one per connected teacher: that teacher's
 * override for the student, else their class setting). Tenses are the union in grid order;
 * the set is locked if any teacher locks it. null when no teacher has a setting.
 */
export function combineTenseSettings(settings: TenseExplorerSetting[]): TenseExplorerPolicy | null {
  if (settings.length === 0) return null
  const chosen = new Set(settings.flatMap((s) => s.tenses))
  return {
    tenses: TENSE_IDS.filter((t) => chosen.has(t)),
    allowCustomize: settings.every((s) => s.allowCustomize),
    // The newest change; the explorer resets a student's own view when this moves.
    updatedAt: settings.reduce((latest, s) => (s.updatedAt > latest ? s.updatedAt : latest), ''),
  }
}
