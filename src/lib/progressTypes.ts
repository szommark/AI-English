// Response shapes shared by api/connect.ts (my-progress, student-detail) and the pages that
// render them. Types only, so api/ can import this file without pulling in browser code.

/** Where a mistake event came from: a Conversational English scenario, a Tutor Bot conversation, or pre-session data. */
export type MistakeSource = 'scenario' | 'tutor' | 'legacy'

export interface MistakeExample {
  source: MistakeSource
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

/**
 * What the mistake frequency is based on: the sessions of the recent window by kind. Only
 * conversations feed mistake areas — grammar, vocabulary and pronunciation practice don't.
 */
export interface MistakeSessionMix {
  /** Tutor Bot conversations. */
  tutor: number
  /** Conversational English scenarios (rehearsal or test mode). */
  scenario: number
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

/** A word list as the progress pages name it; `title` is null for a list that was deleted. */
export interface ProgressListRef {
  kind: 'custom' | 'teacher' | 'conversations'
  id: string | null
  title: string | null
  /** The list's size now; null when the list is gone. */
  wordCount: number | null
}

export interface FastPracticeRunItem {
  /** Null for old runs over mixed words (before runs were tied to a list). */
  list: ProgressListRef | null
  wordCount: number
  /** Fewer words than the whole list were picked. */
  reduced: boolean
  startedAt: string
  finished: boolean
  /** Share of right answers, 0–100; null with no answers. */
  accuracy: number | null
}

export interface VocabTestItem {
  list: ProgressListRef | null
  wordCount: number
  correct: number
  /** 0–100. */
  percent: number
  finishedAt: string
}

export interface OwnWordlistItem {
  id: string
  title: string
  wordCount: number
  createdAt: string
  practiceCount: number
  /** Last and best test score (0–100); null before the first test. */
  lastTest: number | null
  bestTest: number | null
}

/** Vocabulary beyond spaced repetition: Fast practice runs, tests and the learner's own lists. */
export interface VocabActivity {
  /** Most recent first. */
  fastPractice: FastPracticeRunItem[]
  /** Finished tests, most recent first. */
  tests: VocabTestItem[]
  /** Newest first. */
  ownLists: OwnWordlistItem[]
}

export interface CourseProgressItem {
  enrollmentId: string
  title: string
  level: string
  source: 'assigned' | 'self'
  modulesDone: number
  modulesTotal: number
  completedAt: string | null
}

export interface MyProgress {
  cefr: { current: string | null; history: CefrHistoryPoint[] }
  sessions: { last30Days: number; total: number }
  /** Every taxonomy area, taxonomy order, zeros included — the page shows those with data. */
  areas: AreaOverview[]
  nextStep: NextStep
  pronunciation: PronunciationProgressItem[]
  vocabulary: VocabularyCounts
  mistakeMix: MistakeSessionMix
  vocabActivity: VocabActivity
  courses: CourseProgressItem[]
  /** The learner has at least one active teacher connection. */
  hasTeacher: boolean
}
