// Response shapes shared by api/connect.ts (my-progress, student-detail) and the pages that
// render them. Types only, so api/ can import this file without pulling in browser code.

export interface MistakeExample {
  original: string | null
  corrected: string | null
  note: string | null
  createdAt: string
}

/** Frequency over the learner's last `windowSize` sessions, via mistake_events.session_id. */
export interface SubtypeOverview {
  subtype: string
  /** In how many of the recent sessions this subtype came up. */
  sessionsWithSubtype: number
  /** The same count over the sessions before those; null until that window is full. */
  previousSessionsWithSubtype: number | null
  /** Latest example from any source, legacy included. */
  latestExample: MistakeExample | null
  lastSeenAt: string | null
  /** All-time corrections, a legacy row counting as its old occurrences. */
  totalCount: number
  /** Re-labelled legacy rows exist (they have no session, so never count toward the frequency). */
  hasHistory: boolean
  /** At least one event came from a real session (any time), not only legacy data. */
  hasSessionData: boolean
}

export interface AreaOverview {
  area: string
  sessionsWithArea: number
  /** How many sessions the recent window actually holds (a new learner may have fewer). */
  windowSize: number
  previousSessionsWithArea: number | null
  hasHistory: boolean
  hasSessionData: boolean
  totalCount: number
  lastSeenAt: string | null
  /** Taxonomy order; only subtypes with any data. */
  subtypes: SubtypeOverview[]
}

export type NextStep =
  | {
      kind: 'lesson'
      subtype: string
      sessionsWithSubtype: number
      windowSize: number
      lessonId: string
    }
  | { kind: 'tutor' }

export interface CefrHistoryPoint {
  cefrLevel: string
  rationale: string | null
  createdAt: string
}

export interface VocabularyCounts {
  new: number
  practicing: number
  mastered: number
}

export interface PronunciationProgressItem {
  soundItemId: string
  /** The sound's IPA label from the curriculum, e.g. "θ / ð"; for a Stress Patterns / Connected Speech unit, the session name. */
  symbol: string
  title: string
  titleHu: string
  perceptionScore: number | null
  productionScore: number | null
  attempts: number
  updatedAt: string
  /** /pronunciation/sounds/:phonemeId, or a lesson session's unit page; null when neither exists. */
  route: string | null
}

export interface MyProgress {
  cefr: { current: string | null; history: CefrHistoryPoint[] }
  sessions: { last30Days: number; total: number }
  /** Every taxonomy area, taxonomy order, zeros included — the page shows those with data. */
  areas: AreaOverview[]
  nextStep: NextStep
  pronunciation: PronunciationProgressItem[]
  vocabulary: VocabularyCounts
  /** The learner has at least one active teacher connection. */
  hasTeacher: boolean
}
