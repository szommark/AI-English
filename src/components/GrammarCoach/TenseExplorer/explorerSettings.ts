// Presets and persisted settings for the Tense Explorer. Verbs and the subject shuffle seed
// are deliberately not persisted.
import type { MessageKey } from '../../../lib/i18n'
import { SUBJECTS, TENSE_IDS, type Subject, type TenseId } from '../../../lib/tenseEngine/index.ts'
import { TENSE_CONTENT, type TenseContent } from '../../../data/tenseExplorerContent.ts'

export type SubjectMode = 'vary' | Subject
export type ExplainLang = 'en' | 'hu'

export interface ExplorerSettings {
  visible: TenseId[]
  subjectMode: SubjectMode
  timeCue: boolean
  explainLang: ExplainLang
  /** updatedAt of the teacher setting the student's view last started from. */
  teacherVersion?: string
}

const STORAGE_KEY = 'ai-english:tense-explorer'

const byFrame = (frame: TenseContent['frame']) => TENSE_IDS.filter((t) => TENSE_CONTENT[t].frame === frame)
const byAspect = (aspect: TenseContent['aspect']) => TENSE_IDS.filter((t) => TENSE_CONTENT[t].aspect === aspect)

// Be going to counts as Future; it belongs to none of the aspect presets.
export const PRESETS: { id: string; label: MessageKey; tenses: TenseId[] }[] = [
  { id: 'all', label: 'tensePresetAll', tenses: TENSE_IDS },
  { id: 'present', label: 'tensePresetPresent', tenses: byFrame('present') },
  { id: 'past', label: 'tensePresetPast', tenses: byFrame('past') },
  { id: 'future', label: 'tensePresetFuture', tenses: byFrame('future') },
  { id: 'simple', label: 'tensePresetSimple', tenses: byAspect('simple') },
  { id: 'continuous', label: 'tensePresetContinuous', tenses: byAspect('continuous') },
  { id: 'perfect', label: 'tensePresetPerfect', tenses: byAspect('perfect') },
  { id: 'perfect-continuous', label: 'tensePresetPerfectContinuous', tenses: byAspect('perfect-continuous') },
]

export function loadSettings(): Partial<ExplorerSettings> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const data = JSON.parse(raw) as Record<string, unknown>
    const result: Partial<ExplorerSettings> = {}
    if (Array.isArray(data.visible)) {
      const visible = TENSE_IDS.filter((t) => (data.visible as unknown[]).includes(t))
      if (visible.length > 0) result.visible = visible
    }
    if (data.subjectMode === 'vary' || SUBJECTS.includes(data.subjectMode as Subject)) {
      result.subjectMode = data.subjectMode as SubjectMode
    }
    if (typeof data.timeCue === 'boolean') result.timeCue = data.timeCue
    if (data.explainLang === 'en' || data.explainLang === 'hu') result.explainLang = data.explainLang
    if (typeof data.teacherVersion === 'string') result.teacherVersion = data.teacherVersion
    return result
  } catch {
    // Storage unavailable or corrupt: start from the defaults.
    return {}
  }
}

export function saveSettings(settings: ExplorerSettings): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // Ignore — the settings simply won't persist.
  }
}
