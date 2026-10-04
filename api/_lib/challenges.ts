import { supabaseAdmin } from './supabaseAdmin.js'
import { addDays, budapestDate, challengeStatus, isChallengeCompleted, type ChallengeRow } from './challengeRules.js'
import {
  CHALLENGE_COMPLETION_GRACE_DAYS,
  CHALLENGE_HISTORY_DAYS,
} from '../../src/lib/gamification/constants.js'
import type {
  ChallengeActivity,
  ChallengeAnnouncement,
  ChallengeKind,
  ChallengeTarget,
  ChallengeTargetType,
  CompletedChallenge,
  StudentChallenge,
  TeacherChallenge,
} from '../../src/lib/gamification/types.js'

// Class challenges (docs/gamification-design.md §7.3). A learner's challenges are those of
// the teachers they are actively connected to (for a 'selected' challenge: only if they are
// a recipient). Progress comes from challenge_progress() in SQL. Completion is checked after
// every XP award and whenever the learner's state loads, and is recorded once per learner in
// challenge_completions, paying the reward as a challenge.complete event given by the teacher.

const CHALLENGE_COLUMNS =
  'id, teacher_id, title, description, kind, audience, target_type, target_activity, target_list_id, target_value, starts_on, ends_on, reward_xp, cancelled_at, created_at'

interface ChallengeDbRow {
  id: string
  teacher_id: string
  title: string
  description: string | null
  kind: ChallengeKind
  audience: 'class' | 'selected'
  target_type: ChallengeTargetType
  target_activity: ChallengeActivity | null
  target_list_id: string | null
  target_value: number
  starts_on: string
  ends_on: string
  reward_xp: number
  cancelled_at: string | null
  created_at: string
}

/** Each participant's count on a challenge. */
async function loadProgress(challengeId: string): Promise<Map<string, number>> {
  const { data, error } = await supabaseAdmin.rpc('challenge_progress', { p_challenge_id: challengeId })
  if (error) throw error
  return new Map(((data ?? []) as { student_id: string; value: number }[]).map((r) => [r.student_id, r.value]))
}

const sum = (values: Iterable<number>) => [...values].reduce((a, b) => a + b, 0)

async function loadListTitles(rows: ChallengeDbRow[]): Promise<Map<string, string>> {
  const ids = [...new Set(rows.flatMap((r) => (r.target_list_id ? [r.target_list_id] : [])))]
  if (ids.length === 0) return new Map()
  const { data, error } = await supabaseAdmin.from('vocab_lists').select('id, title').in('id', ids)
  if (error) throw error
  return new Map(((data ?? []) as { id: string; title: string }[]).map((l) => [l.id, l.title]))
}

function targetOf(row: ChallengeDbRow, listTitles: Map<string, string>): ChallengeTarget {
  return {
    type: row.target_type,
    activity: row.target_activity,
    listId: row.target_list_id,
    listTitle: row.target_list_id ? (listTitles.get(row.target_list_id) ?? null) : null,
    value: row.target_value,
  }
}

/** Challenges the learner takes part in that ended on or after `endedSince`. */
async function participantChallenges(userId: string, endedSince: string): Promise<ChallengeDbRow[]> {
  const { data: links, error: linkError } = await supabaseAdmin
    .from('teacher_student_links')
    .select('teacher_id')
    .eq('student_id', userId)
    .eq('status', 'active')
  if (linkError) throw linkError
  const teacherIds = ((links ?? []) as { teacher_id: string }[]).map((l) => l.teacher_id)
  if (teacherIds.length === 0) return []

  const { data, error } = await supabaseAdmin
    .from('class_challenges')
    .select(CHALLENGE_COLUMNS)
    .in('teacher_id', teacherIds)
    .gte('ends_on', endedSince)
  if (error) throw error
  const rows = (data ?? []) as ChallengeDbRow[]

  const selectedIds = rows.filter((r) => r.audience === 'selected').map((r) => r.id)
  let mine = new Set<string>()
  if (selectedIds.length > 0) {
    const { data: recipients, error: recipientError } = await supabaseAdmin
      .from('class_challenge_recipients')
      .select('challenge_id')
      .eq('student_id', userId)
      .in('challenge_id', selectedIds)
    if (recipientError) throw recipientError
    mine = new Set(((recipients ?? []) as { challenge_id: string }[]).map((r) => r.challenge_id))
  }
  return rows.filter((r) => r.audience === 'class' || mine.has(r.id))
}

async function loadCompletions(userId: string, challengeIds: string[]): Promise<Map<string, string>> {
  if (challengeIds.length === 0) return new Map()
  const { data, error } = await supabaseAdmin
    .from('challenge_completions')
    .select('challenge_id, completed_at')
    .eq('user_id', userId)
    .in('challenge_id', challengeIds)
  if (error) throw error
  return new Map(((data ?? []) as { challenge_id: string; completed_at: string }[]).map((r) => [r.challenge_id, r.completed_at]))
}

/**
 * Records every challenge the learner has now completed and pays its reward. Returns the
 * newly completed ones. Never throws: challenges must not break a learning flow.
 */
export async function evaluateChallenges(userId: string): Promise<CompletedChallenge[]> {
  try {
    const today = budapestDate()
    const rows = (await participantChallenges(userId, addDays(today, -CHALLENGE_COMPLETION_GRACE_DAYS))).filter((r) => {
      const status = challengeStatus(r, today)
      return status === 'active' || status === 'ended'
    })
    if (rows.length === 0) return []
    const done = await loadCompletions(userId, rows.map((r) => r.id))

    const completed: CompletedChallenge[] = []
    for (const row of rows.filter((r) => !done.has(r.id))) {
      const progress = await loadProgress(row.id)
      if (!progress.has(userId)) continue
      if (!isChallengeCompleted(row.kind, row.target_value, progress.get(userId) ?? 0, sum(progress.values()))) continue

      // Only the evaluation that actually inserts the completion pays the reward.
      const { data: inserted, error } = await supabaseAdmin
        .from('challenge_completions')
        .upsert(
          { challenge_id: row.id, user_id: userId, reward_xp: row.reward_xp },
          { onConflict: 'challenge_id,user_id', ignoreDuplicates: true },
        )
        .select('challenge_id')
      if (error) throw error
      if (!inserted || inserted.length === 0) continue

      if (row.reward_xp > 0) {
        const { error: rewardError } = await supabaseAdmin.rpc('record_xp_event', {
          p_user_id: userId,
          p_activity_type: 'challenge.complete',
          p_item_ref: row.id,
          p_language: 'en',
          p_base_xp: row.reward_xp,
          p_bonus_xp: 0,
          p_performance_score: null,
          p_capped: false,
          p_awarded_by: row.teacher_id,
          p_reason: row.title,
        })
        if (rewardError) throw rewardError
      }
      completed.push({ id: row.id, title: row.title, kind: row.kind, rewardXp: row.reward_xp })
    }
    return completed
  } catch (err) {
    console.error('Failed to evaluate challenges', err)
    return []
  }
}

/** Running and upcoming challenges created after `since` (all of them when null), to announce once. */
export async function loadChallengeAnnouncements(userId: string, since: string | null): Promise<ChallengeAnnouncement[]> {
  const today = budapestDate()
  const rows = await participantChallenges(userId, today)
  return rows
    .filter((r) => !r.cancelled_at && (!since || r.created_at > since))
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .map((r) => ({ id: r.id, title: r.title, kind: r.kind, endsOn: r.ends_on }))
}

const STATUS_ORDER: Record<string, number> = { active: 0, upcoming: 1, ended: 2, cancelled: 3 }

/** The learner's challenges for "Az én fejlődésem": running, upcoming and recently ended. */
export async function loadStudentChallenges(userId: string): Promise<StudentChallenge[]> {
  const today = budapestDate()
  const rows = await participantChallenges(userId, addDays(today, -CHALLENGE_HISTORY_DAYS))
  if (rows.length === 0) return []
  const [done, listTitles] = await Promise.all([loadCompletions(userId, rows.map((r) => r.id)), loadListTitles(rows)])

  const challenges = await Promise.all(
    rows.map(async (row): Promise<StudentChallenge> => {
      const status = challengeStatus(row, today)
      const progress = status === 'upcoming' ? new Map<string, number>() : await loadProgress(row.id)
      return {
        id: row.id,
        title: row.title,
        description: row.description,
        kind: row.kind,
        target: targetOf(row, listTitles),
        startsOn: row.starts_on,
        endsOn: row.ends_on,
        status,
        rewardXp: row.reward_xp,
        myValue: progress.get(userId) ?? 0,
        classTotal: row.kind === 'collective' ? sum(progress.values()) : null,
        completed: done.has(row.id),
        completedAt: done.get(row.id) ?? null,
      }
    }),
  )
  return challenges.sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || b.endsOn.localeCompare(a.endsOn))
}

// --- Teacher side ---------------------------------------------------------------------------

const TEACHER_CHALLENGE_LIMIT = 20

/** The teacher's most recent challenges with every current participant's progress. */
export async function loadTeacherChallenges(teacherId: string): Promise<TeacherChallenge[]> {
  const today = budapestDate()
  const { data, error } = await supabaseAdmin
    .from('class_challenges')
    .select(CHALLENGE_COLUMNS)
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false })
    .limit(TEACHER_CHALLENGE_LIMIT)
  if (error) throw error
  const rows = (data ?? []) as ChallengeDbRow[]
  if (rows.length === 0) return []
  const ids = rows.map((r) => r.id)

  const [recipients, completions, listTitles] = await Promise.all([
    supabaseAdmin.from('class_challenge_recipients').select('challenge_id, student_id').in('challenge_id', ids),
    supabaseAdmin.from('challenge_completions').select('challenge_id, user_id').in('challenge_id', ids),
    loadListTitles(rows),
  ])
  if (recipients.error) throw recipients.error
  if (completions.error) throw completions.error
  const recipientsBy = new Map<string, string[]>()
  for (const r of (recipients.data ?? []) as { challenge_id: string; student_id: string }[]) {
    recipientsBy.set(r.challenge_id, [...(recipientsBy.get(r.challenge_id) ?? []), r.student_id])
  }
  const completedBy = new Set(((completions.data ?? []) as { challenge_id: string; user_id: string }[]).map((c) => `${c.challenge_id}:${c.user_id}`))

  return Promise.all(
    rows.map(async (row): Promise<TeacherChallenge> => {
      const status = challengeStatus(row, today)
      const progress = await loadProgress(row.id)
      const participants = [...progress.entries()].map(([studentId, value]) => ({
        studentId,
        value: status === 'upcoming' ? 0 : value,
        completed: completedBy.has(`${row.id}:${studentId}`),
      }))
      return {
        id: row.id,
        title: row.title,
        description: row.description,
        kind: row.kind,
        audience: row.audience,
        recipientIds: recipientsBy.get(row.id) ?? [],
        target: targetOf(row, listTitles),
        startsOn: row.starts_on,
        endsOn: row.ends_on,
        status,
        rewardXp: row.reward_xp,
        createdAt: row.created_at,
        participants,
        total: sum(participants.map((p) => p.value)),
      }
    }),
  )
}

/** Running or scheduled challenges (not ended, not ended early). */
export async function countOpenChallenges(teacherId: string): Promise<number> {
  const { count, error } = await supabaseAdmin
    .from('class_challenges')
    .select('id', { count: 'exact', head: true })
    .eq('teacher_id', teacherId)
    .is('cancelled_at', null)
    .gte('ends_on', budapestDate())
  if (error) throw error
  return count ?? 0
}

/** The teacher's active connections and non-archived word lists, for validating a new challenge. */
export async function loadChallengeContext(teacherId: string): Promise<{ classStudentIds: Set<string>; teacherListIds: Set<string> }> {
  const [links, lists] = await Promise.all([
    supabaseAdmin.from('teacher_student_links').select('student_id').eq('teacher_id', teacherId).eq('status', 'active'),
    supabaseAdmin.from('vocab_lists').select('id').eq('teacher_id', teacherId).is('archived_at', null),
  ])
  if (links.error) throw links.error
  if (lists.error) throw lists.error
  return {
    classStudentIds: new Set(((links.data ?? []) as { student_id: string }[]).map((l) => l.student_id)),
    teacherListIds: new Set(((lists.data ?? []) as { id: string }[]).map((l) => l.id)),
  }
}

export async function createChallenge(teacherId: string, row: ChallengeRow): Promise<string> {
  const { recipientIds, ...columns } = row
  const { data, error } = await supabaseAdmin
    .from('class_challenges')
    .insert({ ...columns, teacher_id: teacherId })
    .select('id')
    .single()
  if (error) throw error
  const id = data.id as string
  if (recipientIds.length > 0) {
    const { error: recipientError } = await supabaseAdmin
      .from('class_challenge_recipients')
      .insert(recipientIds.map((studentId) => ({ challenge_id: id, student_id: studentId })))
    if (recipientError) {
      // Without its recipients the challenge would silently reach nobody; remove it.
      await supabaseAdmin.from('class_challenges').delete().eq('id', id)
      throw recipientError
    }
  }
  return id
}

/** The teacher's own challenge, or null. */
export async function loadOwnChallenge(teacherId: string, id: unknown): Promise<ChallengeDbRow | null> {
  if (typeof id !== 'string' || !/^[0-9a-f-]{36}$/i.test(id)) return null
  const { data, error } = await supabaseAdmin
    .from('class_challenges')
    .select(CHALLENGE_COLUMNS)
    .eq('id', id)
    .eq('teacher_id', teacherId)
    .maybeSingle()
  if (error) throw error
  return (data as ChallengeDbRow | null) ?? null
}

export async function updateChallengeText(id: string, title: string, description: string | null): Promise<void> {
  const { error } = await supabaseAdmin
    .from('class_challenges')
    .update({ title, description, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

/** Ends a running or scheduled challenge early: no completions after this. */
export async function endChallenge(id: string): Promise<void> {
  const now = new Date().toISOString()
  const { error } = await supabaseAdmin.from('class_challenges').update({ cancelled_at: now, updated_at: now }).eq('id', id)
  if (error) throw error
}

export async function deleteChallenge(id: string): Promise<void> {
  const { error } = await supabaseAdmin.from('class_challenges').delete().eq('id', id)
  if (error) throw error
}

export { challengeStatus, budapestDate }
