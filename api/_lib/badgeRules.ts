// The badge rules as pure functions (no database access), so they can be checked in
// isolation: expanding template rows into concrete badges, and deciding whether a badge is
// earned from a set of facts about the learner. api/_lib/badges.ts loads the facts.

export type BadgeCriteriaType =
  | 'event_count'
  | 'metric_threshold'
  | 'persona_sessions'
  | 'distinct_count'
  | 'cefr_level_up'
  | 'custom'

export interface BadgeDefinitionRow {
  key: string
  section: string | null
  category: string
  criteria_type: BadgeCriteriaType
  params: Record<string, unknown>
  name_hu: string
  name_en: string
  criteria_hu: string
  criteria_en: string
  icon: string
  hidden: boolean
  wisdom_id: string | null
  sort_order: number
}

/** A concrete badge: a definition row, or one persona's copy of a persona_sessions template. */
export interface Badge {
  key: string
  definition: BadgeDefinitionRow
  personaId: string | null
  nameHu: string
  nameEn: string
  criteriaHu: string
  criteriaEn: string
}

export interface Persona {
  id: string
  displayName: string
}

export type BadgeMetric =
  | 'level'
  | 'best_week_streak'
  | 'words_mastered'
  | 'teacher_lists_completed'
  | 'sounds_mastered'
  | 'challenges_completed'
  | 'words_practised'
  | 'srs_review_days'
  | 'exam_papers_de'
  | 'exam_best_paper_percent'
  | 'exam_personal_bests'

/** Everything the rules need to know about one learner. */
export interface BadgeFacts {
  /** The learner's own finished activities per activity type. */
  eventCounts: Record<string, number>
  metrics: Record<BadgeMetric, number>
  /** Tutor Bot conversations that reached the XP turn count, per persona id. */
  personaSessions: Record<string, number>
  /** Personas enabled for the learner's role right now. */
  enabledPersonas: Persona[]
  /** A CEFR estimate above the learner's first one exists. */
  cefrLevelUp: boolean
  /** Days between the learner's latest activity and the one before it; null with fewer than two. */
  daysSincePreviousActivity: number | null
}

/** Template rows (persona_sessions) become one badge per enabled persona; other rows stay as they are. */
export function expandBadges(definitions: BadgeDefinitionRow[], personas: Persona[]): Badge[] {
  const badges: Badge[] = []
  for (const definition of definitions) {
    if (definition.criteria_type === 'persona_sessions') {
      for (const persona of personas) {
        const fill = (s: string) => s.split('{persona}').join(persona.displayName)
        badges.push({
          key: `${definition.key}:${persona.id}`,
          definition,
          personaId: persona.id,
          nameHu: fill(definition.name_hu),
          nameEn: fill(definition.name_en),
          criteriaHu: fill(definition.criteria_hu),
          criteriaEn: fill(definition.criteria_en),
        })
      }
      continue
    }
    badges.push({
      key: definition.key,
      definition,
      personaId: null,
      nameHu: definition.name_hu,
      nameEn: definition.name_en,
      criteriaHu: definition.criteria_hu,
      criteriaEn: definition.criteria_en,
    })
  }
  return badges.sort((a, b) => a.definition.sort_order - b.definition.sort_order || a.key.localeCompare(b.key))
}

function num(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

/** Unknown criteria or params never award a badge. */
export function isBadgeEarned(badge: Badge, facts: BadgeFacts): boolean {
  const params = badge.definition.params ?? {}
  switch (badge.definition.criteria_type) {
    case 'event_count': {
      const types = Array.isArray(params.activity_types) ? (params.activity_types as string[]) : null
      const count = types
        ? types.reduce((sum, t) => sum + (facts.eventCounts[t] ?? 0), 0)
        : Object.values(facts.eventCounts).reduce((sum, n) => sum + n, 0)
      return count >= num(params.count, Infinity)
    }
    case 'metric_threshold': {
      const metric = params.metric as BadgeMetric
      if (!(metric in facts.metrics)) return false
      return facts.metrics[metric] >= num(params.min, Infinity)
    }
    case 'persona_sessions':
      return badge.personaId !== null && (facts.personaSessions[badge.personaId] ?? 0) >= num(params.count, Infinity)
    case 'distinct_count':
      // Only "every persona enabled right now" exists so far. With none enabled it can't be earned.
      if (params.source !== 'personas' || params.target !== 'all_enabled') return false
      return facts.enabledPersonas.length > 0 && facts.enabledPersonas.every((p) => (facts.personaSessions[p.id] ?? 0) > 0)
    case 'cefr_level_up':
      return facts.cefrLevelUp
    case 'custom':
      if (params.handler === 'welcome_back') {
        return facts.daysSincePreviousActivity !== null && facts.daysSincePreviousActivity >= num(params.days, Infinity)
      }
      return false
    default:
      return false
  }
}

/** A finished mock paper (an exam-prep.*_paper_complete event). */
export interface PaperEvent {
  /** The paper id, e.g. `erettsegi-en-kozep-2025-majus`. */
  paperId: string
  language: string
  /** Raw score share of the paper's scored sections, 0–1. */
  score: number | null
}

/** The exam a paper belongs to: type, language and level (the first three parts of its id). */
export function paperExam(paperId: string): string {
  return paperId.split('-').slice(0, 3).join('-')
}

/**
 * Exam badge metrics from the learner's finished papers, oldest first: German papers, the
 * best score as a whole percent, and how many times a paper beat every earlier score in the
 * same exam (the first paper of an exam sets the bar and is not a personal best).
 */
export function examPaperMetrics(papersOldestFirst: PaperEvent[]): {
  exam_papers_de: number
  exam_best_paper_percent: number
  exam_personal_bests: number
} {
  const bestByExam = new Map<string, number>()
  let best = 0
  let personalBests = 0
  for (const p of papersOldestFirst) {
    if (p.score === null) continue
    const exam = paperExam(p.paperId)
    const previous = bestByExam.get(exam)
    if (previous !== undefined && p.score > previous) personalBests++
    bestByExam.set(exam, Math.max(previous ?? 0, p.score))
    best = Math.max(best, p.score)
  }
  return {
    exam_papers_de: papersOldestFirst.filter((p) => p.language === 'de').length,
    // Floored, so 59.6% doesn't pass a 60% threshold.
    exam_best_paper_percent: Math.floor(best * 100 + 1e-9),
    exam_personal_bests: personalBests,
  }
}

const CEFR_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

/** True when any estimate after the first is a higher CEFR level than the first one. */
export function hasCefrLevelUp(levelsOldestFirst: string[]): boolean {
  const ranks = levelsOldestFirst.map((l) => CEFR_ORDER.indexOf(l.trim().toUpperCase().slice(0, 2))).filter((r) => r >= 0)
  if (ranks.length < 2) return false
  return ranks.slice(1).some((r) => r > ranks[0])
}
