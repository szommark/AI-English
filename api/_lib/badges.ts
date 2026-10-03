import { supabaseAdmin } from './supabaseAdmin.js'
import { getUserRole } from './roles.js'
import {
  expandBadges,
  hasCefrLevelUp,
  isBadgeEarned,
  type Badge,
  type BadgeDefinitionRow,
  type BadgeFacts,
  type Persona,
} from './badgeRules.js'
import { SOUND_MASTERY_THRESHOLD } from '../../src/lib/gamification/constants.js'
import { getSoundItem } from '../../src/data/pronunciationCurriculum.js'
import type { BadgeWallItem, EarnedBadge, Wisdom } from '../../src/lib/gamification/types.js'

// Declarative badge engine (docs/gamification-design.md §6.2). Badges are rows in
// badge_definitions; this module loads the facts the rules need, grants every badge the
// learner now qualifies for and builds the badge wall. It runs after each XP award and
// when the learner opens "Az én fejlődésem" — the latter also grants badges based on
// current state (words mastered, sounds mastered…) on the first visit (design §9.1).
//
// Never throws to callers that are on a learning path: evaluateBadges() logs and returns []
// on any error. Concurrent evaluations can't grant a badge twice (primary key + ignore
// duplicates), and only the evaluation that actually inserted a badge reports it.

const DAY_MS = 24 * 60 * 60 * 1000

interface WisdomRow {
  id: string
  text: string
  text_language: 'en' | 'de'
  hungarian_equivalent: string
}

async function loadDefinitions(): Promise<BadgeDefinitionRow[]> {
  const { data, error } = await supabaseAdmin
    .from('badge_definitions')
    .select('key, section, category, criteria_type, params, name_hu, name_en, criteria_hu, criteria_en, icon, hidden, wisdom_id, sort_order')
    .eq('enabled', true)
  if (error) throw error
  return (data ?? []) as BadgeDefinitionRow[]
}

async function loadEarned(userId: string): Promise<Map<string, string>> {
  const { data, error } = await supabaseAdmin.from('user_badges').select('badge_key, earned_at').eq('user_id', userId)
  if (error) throw error
  return new Map((data ?? []).map((row) => [row.badge_key as string, row.earned_at as string]))
}

/** Every persona (for names), and the ones enabled for this learner's role (as the persona picker shows them). */
async function loadPersonas(userId: string): Promise<{ all: Persona[]; enabled: Persona[] }> {
  const [role, { data, error }] = await Promise.all([
    getUserRole(userId),
    supabaseAdmin.from('tutor_personas').select('id, display_name, enabled_for_students, enabled_for_teachers'),
  ])
  if (error) throw error
  const rows = data ?? []
  const toPersona = (r: { id: string; display_name: string }): Persona => ({ id: r.id, displayName: r.display_name })
  const enabled = rows.filter((r) =>
    role === 'student' ? r.enabled_for_students : role === 'teacher' ? r.enabled_for_teachers : r.enabled_for_students || r.enabled_for_teachers,
  )
  return { all: rows.map(toPersona), enabled: enabled.map(toPersona) }
}

async function count(query: PromiseLike<{ count: number | null; error: unknown }>): Promise<number> {
  const { count: n, error } = await query
  if (error) throw error
  return n ?? 0
}

async function loadFacts(userId: string, enabledPersonas: Persona[]): Promise<BadgeFacts> {
  const [eventRows, learner, wordsMastered, listsCompleted, pronunciation, tutorSessions, cefr, latestEvents] = await Promise.all([
    supabaseAdmin.rpc('gamification_event_counts', { p_user_id: userId }),
    supabaseAdmin.from('learner_gamification').select('level, best_week_streak').eq('user_id', userId).maybeSingle(),
    count(
      supabaseAdmin
        .from('vocabulary_mastery')
        .select('user_id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'mastered'),
    ),
    count(
      supabaseAdmin
        .from('vocab_list_assignments')
        .select('student_id', { count: 'exact', head: true })
        .eq('student_id', userId)
        .not('completed_at', 'is', null),
    ),
    supabaseAdmin
      .from('pronunciation_progress')
      .select('sound_item_id')
      .eq('user_id', userId)
      .gte('perception_score', SOUND_MASTERY_THRESHOLD)
      .gte('production_score', SOUND_MASTERY_THRESHOLD),
    supabaseAdmin.from('tutor_sessions').select('persona_id').eq('user_id', userId).eq('xp_awarded', true),
    supabaseAdmin.from('cefr_history').select('cefr_level').eq('user_id', userId).order('created_at', { ascending: true }),
    supabaseAdmin
      .from('xp_events')
      .select('created_at')
      .eq('user_id', userId)
      .is('awarded_by', null)
      .order('created_at', { ascending: false })
      .limit(2),
  ])
  for (const result of [eventRows, learner, pronunciation, tutorSessions, cefr, latestEvents]) {
    if (result.error) throw result.error
  }

  const eventCounts: Record<string, number> = {}
  for (const row of (eventRows.data ?? []) as { activity_type: string; events: number }[]) eventCounts[row.activity_type] = row.events

  const personaSessions: Record<string, number> = {}
  for (const row of (tutorSessions.data ?? []) as { persona_id: string | null }[]) {
    if (row.persona_id) personaSessions[row.persona_id] = (personaSessions[row.persona_id] ?? 0) + 1
  }

  // Sound Bank sounds only: Stress Patterns / Connected Speech units share pronunciation_progress.
  const soundsMastered = ((pronunciation.data ?? []) as { sound_item_id: string }[]).filter((r) =>
    getSoundItem(r.sound_item_id),
  ).length

  const latest = (latestEvents.data ?? []) as { created_at: string }[]
  const daysSincePreviousActivity =
    latest.length === 2 ? Math.floor((Date.parse(latest[0].created_at) - Date.parse(latest[1].created_at)) / DAY_MS) : null

  return {
    eventCounts,
    metrics: {
      level: (learner.data?.level as number | undefined) ?? 1,
      best_week_streak: (learner.data?.best_week_streak as number | undefined) ?? 0,
      words_mastered: wordsMastered,
      teacher_lists_completed: listsCompleted,
      sounds_mastered: soundsMastered,
    },
    personaSessions,
    enabledPersonas,
    cefrLevelUp: hasCefrLevelUp(((cefr.data ?? []) as { cefr_level: string }[]).map((r) => r.cefr_level)),
    daysSincePreviousActivity,
  }
}

async function loadWisdoms(ids: string[]): Promise<Map<string, Wisdom>> {
  if (ids.length === 0) return new Map()
  const { data, error } = await supabaseAdmin
    .from('wisdoms')
    .select('id, text, text_language, hungarian_equivalent')
    .in('id', ids)
    .eq('reviewed', true)
    .eq('enabled', true)
  if (error) throw error
  return new Map(
    ((data ?? []) as WisdomRow[]).map((w) => [w.id, { text: w.text, language: w.text_language, hungarian: w.hungarian_equivalent }]),
  )
}

/**
 * The learner's badges, with a persona badge kept for a persona that has since been
 * disabled (an earned badge is never taken back).
 */
function badgesFor(definitions: BadgeDefinitionRow[], personas: { all: Persona[]; enabled: Persona[] }, earned: Map<string, string>): Badge[] {
  const enabledIds = new Set(personas.enabled.map((p) => p.id))
  const earnedDisabledPersonas = personas.all.filter(
    (p) => !enabledIds.has(p.id) && [...earned.keys()].some((key) => key.endsWith(`:${p.id}`)),
  )
  return expandBadges(definitions, [...personas.enabled, ...earnedDisabledPersonas])
}

async function grantEarned(userId: string, definitions: BadgeDefinitionRow[], personas: { all: Persona[]; enabled: Persona[] }, earned: Map<string, string>) {
  const candidates = badgesFor(definitions, personas, earned).filter((b) => !earned.has(b.key))
  if (candidates.length === 0) return []

  const facts = await loadFacts(userId, personas.enabled)
  const qualifying = candidates.filter((b) => isBadgeEarned(b, facts))
  if (qualifying.length === 0) return []

  const { data, error } = await supabaseAdmin
    .from('user_badges')
    .upsert(
      qualifying.map((b) => ({ user_id: userId, badge_key: b.key })),
      { onConflict: 'user_id,badge_key', ignoreDuplicates: true },
    )
    .select('badge_key, earned_at')
  if (error) throw error
  const inserted = new Map(((data ?? []) as { badge_key: string; earned_at: string }[]).map((r) => [r.badge_key, r.earned_at]))
  for (const [key, at] of inserted) earned.set(key, at)
  return qualifying.filter((b) => inserted.has(b.key))
}

/** Grants every badge the learner now qualifies for and returns the ones newly earned. Never throws. */
export async function evaluateBadges(userId: string): Promise<EarnedBadge[]> {
  try {
    const [definitions, earned, personas] = await Promise.all([loadDefinitions(), loadEarned(userId), loadPersonas(userId)])
    const granted = await grantEarned(userId, definitions, personas, earned)
    if (granted.length === 0) return []
    const wisdoms = await loadWisdoms(granted.flatMap((b) => (b.definition.wisdom_id ? [b.definition.wisdom_id] : [])))
    return granted.map((b) => ({
      key: b.key,
      nameHu: b.nameHu,
      nameEn: b.nameEn,
      icon: b.definition.icon,
      wisdom: (b.definition.wisdom_id && wisdoms.get(b.definition.wisdom_id)) || null,
    }))
  } catch (err) {
    console.error('Failed to evaluate badges', err)
    return []
  }
}

/**
 * The whole badge wall, after granting anything newly earned. Throws on failure (the
 * caller is the progress page, which shows its own error state).
 */
export async function loadBadgeWall(userId: string): Promise<BadgeWallItem[]> {
  const [definitions, earned, personas] = await Promise.all([loadDefinitions(), loadEarned(userId), loadPersonas(userId)])
  try {
    await grantEarned(userId, definitions, personas, earned)
  } catch (err) {
    console.error('Failed to evaluate badges for the badge wall', err)
  }

  const badges = badgesFor(definitions, personas, earned)
  const wisdoms = await loadWisdoms(
    badges.flatMap((b) => (earned.has(b.key) && b.definition.wisdom_id ? [b.definition.wisdom_id] : [])),
  )

  return badges.map((b): BadgeWallItem => {
    const isEarned = earned.has(b.key)
    const secret = b.definition.hidden && !isEarned
    return {
      key: secret ? `hidden:${b.definition.sort_order}` : b.key,
      category: b.definition.category,
      section: secret ? null : b.definition.section,
      hidden: b.definition.hidden,
      earned: isEarned,
      earnedAt: earned.get(b.key) ?? null,
      icon: secret ? null : b.definition.icon,
      nameHu: secret ? null : b.nameHu,
      nameEn: secret ? null : b.nameEn,
      criteriaHu: secret ? null : b.criteriaHu,
      criteriaEn: secret ? null : b.criteriaEn,
      wisdom: isEarned && b.definition.wisdom_id ? (wisdoms.get(b.definition.wisdom_id) ?? null) : null,
    }
  })
}
