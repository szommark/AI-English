import { supabaseAdmin } from './supabaseAdmin.js'
import { MISTAKE_TAXONOMY, getMistakeSubtype } from '../../src/data/mistakeTaxonomy.js'
import { GRAMMAR_LEVELS, getGrammarItem, type CefrLevel } from '../../src/data/grammarCurriculum.js'
import { getSoundItem } from '../../src/data/pronunciationCurriculum.js'
import { getPhonemeByCurriculumId } from '../../src/data/phonemes.js'
import type {
  AreaOverview,
  CefrHistoryPoint,
  MistakeExample,
  NextStep,
  PronunciationProgressItem,
  SubtypeOverview,
  VocabularyCounts,
} from '../../src/lib/progressTypes.js'

// Shared by /api/connect's my-progress (the learner's own page) and student-detail (teacher).

/** How many of the learner's latest sessions the mistake frequency looks at. */
export const TREND_WINDOW_SESSIONS = 5
/** A subtype becomes the "next step" once it shows up in this many of those sessions. */
export const NEXT_STEP_MIN_SESSIONS = 2
/** Upper bound on events read per learner (all-time totals and latest examples come from these). */
const MAX_EVENTS_READ = 2000

export interface MistakeEventRow {
  area: string
  subtype: string
  session_id: string | null
  source: string
  legacy_occurrences: number | null
  example_original: string | null
  example_corrected: string | null
  note: string | null
  created_at: string
}

interface Tally {
  recent: Set<string>
  previous: Set<string>
  totalCount: number
  hasHistory: boolean
  hasSessionData: boolean
  lastSeenAt: string | null
  latestExample: MistakeExample | null
}

function emptyTally(): Tally {
  return {
    recent: new Set(),
    previous: new Set(),
    totalCount: 0,
    hasHistory: false,
    hasSessionData: false,
    lastSeenAt: null,
    latestExample: null,
  }
}

/**
 * Pure aggregation. `sessionIds` are the learner's latest sessions, newest first (at least
 * 2 × TREND_WINDOW_SESSIONS of them when available); `events` are newest first.
 * Frequency = in how many sessions of the window a mistake came up, so a session with three
 * article slips counts once. Legacy events have no session: they only feed totals, examples
 * and `hasHistory`.
 */
export function aggregateMistakes(sessionIds: string[], events: MistakeEventRow[]): AreaOverview[] {
  const recentWindow = sessionIds.slice(0, TREND_WINDOW_SESSIONS)
  const previousWindow = sessionIds.slice(TREND_WINDOW_SESSIONS, TREND_WINDOW_SESSIONS * 2)
  const previousFull = previousWindow.length === TREND_WINDOW_SESSIONS
  const recentSet = new Set(recentWindow)
  const previousSet = new Set(previousWindow)

  const areaTallies = new Map<string, Tally>()
  const subtypeTallies = new Map<string, Tally>()
  const tallyFor = (map: Map<string, Tally>, key: string) => {
    let t = map.get(key)
    if (!t) map.set(key, (t = emptyTally()))
    return t
  }

  for (const e of events) {
    const legacy = e.source === 'legacy'
    for (const t of [tallyFor(areaTallies, e.area), tallyFor(subtypeTallies, e.subtype)]) {
      t.totalCount += legacy ? (e.legacy_occurrences ?? 1) : 1
      if (legacy) t.hasHistory = true
      else t.hasSessionData = true
      if (!t.lastSeenAt || e.created_at > t.lastSeenAt) t.lastSeenAt = e.created_at
      if (!t.latestExample && e.example_original) {
        t.latestExample = {
          original: e.example_original,
          corrected: e.example_corrected,
          note: e.note,
          createdAt: e.created_at,
        }
      }
      if (e.session_id && recentSet.has(e.session_id)) t.recent.add(e.session_id)
      if (e.session_id && previousSet.has(e.session_id)) t.previous.add(e.session_id)
    }
  }

  return MISTAKE_TAXONOMY.map((area) => {
    const a = areaTallies.get(area.id) ?? emptyTally()
    const subtypes: SubtypeOverview[] = area.subtypes
      .filter((s) => subtypeTallies.has(s.id))
      .map((s) => {
        const t = subtypeTallies.get(s.id)!
        return {
          subtype: s.id,
          sessionsWithSubtype: t.recent.size,
          previousSessionsWithSubtype: previousFull ? t.previous.size : null,
          latestExample: t.latestExample,
          lastSeenAt: t.lastSeenAt,
          totalCount: t.totalCount,
          hasHistory: t.hasHistory,
          hasSessionData: t.hasSessionData,
        }
      })
    return {
      area: area.id,
      sessionsWithArea: a.recent.size,
      windowSize: recentWindow.length,
      previousSessionsWithArea: previousFull ? a.previous.size : null,
      hasHistory: a.hasHistory,
      hasSessionData: a.hasSessionData,
      totalCount: a.totalCount,
      lastSeenAt: a.lastSeenAt,
      subtypes,
    }
  })
}

function levelIndex(level: string | null | undefined): number {
  return GRAMMAR_LEVELS.indexOf((level ?? '') as CefrLevel)
}

/**
 * The subtype to work on next: seen in at least NEXT_STEP_MIN_SESSIONS of the recent
 * sessions and linked to a Grammar Coach lesson; most sessions wins, ties go to the most
 * recent. Its lesson is the first one at or below the learner's level, else the first.
 * No candidate → suggest a Tutor Bot conversation instead.
 */
export function pickNextStep(areas: AreaOverview[], cefrLevel: string | null): NextStep {
  const windowSize = areas[0]?.windowSize ?? 0
  const candidates = areas
    .flatMap((a) => a.subtypes)
    .filter((s) => s.sessionsWithSubtype >= NEXT_STEP_MIN_SESSIONS && (getMistakeSubtype(s.subtype)?.lessonIds.length ?? 0) > 0)
    .sort(
      (a, b) =>
        b.sessionsWithSubtype - a.sessionsWithSubtype || (b.lastSeenAt ?? '').localeCompare(a.lastSeenAt ?? ''),
    )
  const pick = candidates[0]
  if (!pick) return { kind: 'tutor' }

  const lessonIds = getMistakeSubtype(pick.subtype)!.lessonIds
  const learnerLevel = levelIndex(cefrLevel)
  const atOrBelow =
    learnerLevel < 0 ? undefined : lessonIds.find((id) => levelIndex(getGrammarItem(id)?.level) <= learnerLevel)
  return {
    kind: 'lesson',
    subtype: pick.subtype,
    sessionsWithSubtype: pick.sessionsWithSubtype,
    windowSize,
    lessonId: atOrBelow ?? lessonIds[0],
  }
}

/** Reads the learner's recent sessions and mistake events and aggregates them. */
export async function loadMistakeOverview(userId: string): Promise<AreaOverview[]> {
  const [{ data: sessions }, { data: events }] = await Promise.all([
    supabaseAdmin
      .from('sessions')
      .select('id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(TREND_WINDOW_SESSIONS * 2),
    supabaseAdmin
      .from('mistake_events')
      .select('area, subtype, session_id, source, legacy_occurrences, example_original, example_corrected, note, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(MAX_EVENTS_READ),
  ])
  return aggregateMistakes(
    (sessions ?? []).map((s) => s.id as string),
    (events ?? []) as MistakeEventRow[],
  )
}

export async function loadVocabularyCounts(userId: string): Promise<VocabularyCounts> {
  const { data } = await supabaseAdmin.from('vocabulary_mastery').select('status').eq('user_id', userId)
  const counts: VocabularyCounts = { new: 0, practicing: 0, mastered: 0 }
  for (const row of data ?? []) {
    const status = row.status as keyof VocabularyCounts
    if (status in counts) counts[status] += 1
  }
  return counts
}

export async function loadCefrHistory(userId: string): Promise<CefrHistoryPoint[]> {
  const { data } = await supabaseAdmin
    .from('cefr_history')
    .select('cefr_level, rationale, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
  return (data ?? []).map((c) => ({ cefrLevel: c.cefr_level, rationale: c.rationale, createdAt: c.created_at }))
}

/**
 * pronunciation_progress.sound_item_id is a pronunciationCurriculum.ts item id (e.g.
 * "th-sounds"); its chart tile is the first phoneme whose curriculumId points at it (θ for
 * th-sounds, w for w-vs-v). Items with no tile (word stress, weak forms) get no route.
 */
export async function loadPronunciationProgress(userId: string): Promise<PronunciationProgressItem[]> {
  const { data } = await supabaseAdmin
    .from('pronunciation_progress')
    .select('sound_item_id, perception_score, production_score, attempts, updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  return (data ?? []).flatMap((row) => {
    const item = getSoundItem(row.sound_item_id)
    if (!item) return []
    const phoneme = getPhonemeByCurriculumId(item.id)
    return [
      {
        soundItemId: item.id,
        symbol: item.ipa,
        title: item.title,
        titleHu: item.titleHu,
        perceptionScore: row.perception_score,
        productionScore: row.production_score,
        attempts: row.attempts,
        updatedAt: row.updated_at,
        route: phoneme ? `/pronunciation/sounds/${phoneme.id}` : null,
      },
    ]
  })
}
