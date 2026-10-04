import { supabaseAdmin } from './supabaseAdmin.js'
import { classView, leagueFor, leagueView } from './socialRules.js'
import { LEADERBOARD_TOP } from '../../src/lib/gamification/constants.js'
import type {
  AdminGamificationSettings,
  ClassRankingView,
  LeaderboardView,
  TeacherClassSettings,
} from '../../src/lib/gamification/types.js'

// Class comparison and the public leaderboard (docs/gamification-design.md §8). Both sit
// behind admin switches (gamification_settings) that ship switched off; every read checks
// them, so turning one off hides it at once.

type SettingKey = 'public_leaderboard' | 'class_comparison'

export async function loadSwitches(): Promise<Record<SettingKey, boolean>> {
  const { data, error } = await supabaseAdmin.from('gamification_settings').select('key, enabled')
  if (error) throw error
  const rows = (data ?? []) as { key: SettingKey; enabled: boolean }[]
  return {
    public_leaderboard: rows.some((r) => r.key === 'public_leaderboard' && r.enabled),
    class_comparison: rows.some((r) => r.key === 'class_comparison' && r.enabled),
  }
}

export async function setSwitch(key: SettingKey, enabled: boolean, adminId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('gamification_settings')
    .update({ enabled, updated_at: new Date().toISOString(), updated_by: adminId })
    .eq('key', key)
  if (error) throw error
}

async function activeTeacherIds(studentId: string): Promise<string[]> {
  const { data, error } = await supabaseAdmin
    .from('teacher_student_links')
    .select('teacher_id')
    .eq('student_id', studentId)
    .eq('status', 'active')
  if (error) throw error
  return ((data ?? []) as { teacher_id: string }[]).map((l) => l.teacher_id)
}

/** True when any of the learner's teachers has turned the public leaderboard off for their class. */
export async function isLeaderboardBlocked(studentId: string): Promise<boolean> {
  const teacherIds = await activeTeacherIds(studentId)
  if (teacherIds.length === 0) return false
  const { data, error } = await supabaseAdmin
    .from('teacher_gamification_settings')
    .select('teacher_id')
    .in('teacher_id', teacherIds)
    .eq('leaderboard_allowed', false)
  if (error) throw error
  return (data ?? []).length > 0
}

async function latestCefr(userId: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .from('cefr_history')
    .select('cefr_level')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
  if (error) throw error
  return ((data ?? []) as { cefr_level: string }[])[0]?.cefr_level ?? null
}

const EMPTY_LEADERBOARD: LeaderboardView = {
  enabled: false,
  blockedByTeacher: false,
  optedIn: false,
  nickname: null,
  league: 'alap',
  entries: [],
  me: null,
  participants: 0,
}

/** The learner's view of the public leaderboard: their league this week. */
export async function loadLeaderboard(userId: string): Promise<LeaderboardView> {
  const switches = await loadSwitches()
  if (!switches.public_leaderboard) return EMPTY_LEADERBOARD

  const [blocked, own, rowsResult, cefr] = await Promise.all([
    isLeaderboardBlocked(userId),
    supabaseAdmin.from('learner_gamification').select('leaderboard_opt_in, nickname').eq('user_id', userId).maybeSingle(),
    supabaseAdmin.rpc('public_leaderboard_week'),
    latestCefr(userId),
  ])
  if (own.error) throw own.error
  if (rowsResult.error) throw rowsResult.error

  const league = leagueFor(cefr)
  const rows = ((rowsResult.data ?? []) as { user_id: string; nickname: string; level: number; xp: number; cefr_level: string | null }[])
    .filter((r) => leagueFor(r.cefr_level) === league)
    .map((r) => ({ userId: r.user_id, nickname: r.nickname, level: r.level, xp: r.xp }))
  const view = leagueView(rows, userId, LEADERBOARD_TOP)

  return {
    enabled: true,
    blockedByTeacher: blocked,
    optedIn: Boolean(own.data?.leaderboard_opt_in),
    nickname: (own.data?.nickname as string | null | undefined) ?? null,
    league,
    ...view,
  }
}

/** Joins the public leaderboard (the caller has checked the switch, the teachers and the nickname). */
export async function joinLeaderboard(userId: string, nickname: string): Promise<'ok' | 'taken'> {
  const now = new Date().toISOString()
  const { error } = await supabaseAdmin.from('learner_gamification').upsert(
    { user_id: userId, leaderboard_opt_in: true, nickname, opt_in_at: now, age_16_confirmed_at: now },
    { onConflict: 'user_id' },
  )
  if (error) {
    if (error.code === '23505') return 'taken'
    throw error
  }
  return 'ok'
}

export async function changeNickname(userId: string, nickname: string): Promise<'ok' | 'taken' | 'not-joined'> {
  const { data, error } = await supabaseAdmin
    .from('learner_gamification')
    .update({ nickname })
    .eq('user_id', userId)
    .eq('leaderboard_opt_in', true)
    .select('user_id')
  if (error) {
    if (error.code === '23505') return 'taken'
    throw error
  }
  return (data ?? []).length > 0 ? 'ok' : 'not-joined'
}

/**
 * Leaves the public leaderboard at once. The nickname, the opt-in time and the age
 * confirmation are cleared too (data minimisation): joining again asks for them anew.
 */
export async function leaveLeaderboard(userId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('learner_gamification')
    .update({ leaderboard_opt_in: false, nickname: null, opt_in_at: null, age_16_confirmed_at: null })
    .eq('user_id', userId)
  if (error) throw error
}

async function emailOf(userId: string): Promise<string> {
  const { data } = await supabaseAdmin.auth.admin.getUserById(userId)
  return data.user?.email ?? 'unknown'
}

/** The class rankings a learner may see: one per teacher who turned class comparison on. */
export async function loadClassRankings(userId: string): Promise<ClassRankingView> {
  const switches = await loadSwitches()
  if (!switches.class_comparison) return { enabled: false, classes: [] }

  const teacherIds = await activeTeacherIds(userId)
  if (teacherIds.length === 0) return { enabled: true, classes: [] }
  const { data, error } = await supabaseAdmin
    .from('teacher_gamification_settings')
    .select('teacher_id')
    .in('teacher_id', teacherIds)
    .eq('class_comparison', true)
  if (error) throw error
  const comparing = ((data ?? []) as { teacher_id: string }[]).map((r) => r.teacher_id)

  const classes = await Promise.all(
    comparing.map(async (teacherId) => {
      const [ranking, teacherLabel] = await Promise.all([
        supabaseAdmin.rpc('class_ranking_week', { p_teacher_id: teacherId }),
        emailOf(teacherId),
      ])
      if (ranking.error) throw ranking.error
      const rows = ((ranking.data ?? []) as { student_id: string; nickname: string | null; xp: number }[]).map((r) => ({
        studentId: r.student_id,
        nickname: r.nickname,
        xp: r.xp,
      }))
      return { teacherLabel, entries: classView(rows, userId) }
    }),
  )
  return { enabled: true, classes }
}

export async function loadTeacherClassSettings(teacherId: string): Promise<TeacherClassSettings> {
  const [switches, own] = await Promise.all([
    loadSwitches(),
    supabaseAdmin.from('teacher_gamification_settings').select('class_comparison, leaderboard_allowed').eq('teacher_id', teacherId).maybeSingle(),
  ])
  if (own.error) throw own.error
  return {
    classComparison: Boolean(own.data?.class_comparison),
    leaderboardAllowed: own.data ? Boolean(own.data.leaderboard_allowed) : true,
    globalClassComparison: switches.class_comparison,
    globalLeaderboard: switches.public_leaderboard,
  }
}

export async function saveTeacherClassSettings(teacherId: string, settings: { classComparison: boolean; leaderboardAllowed: boolean }): Promise<void> {
  const { error } = await supabaseAdmin.from('teacher_gamification_settings').upsert(
    {
      teacher_id: teacherId,
      class_comparison: settings.classComparison,
      leaderboard_allowed: settings.leaderboardAllowed,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'teacher_id' },
  )
  if (error) throw error
}

export async function loadAdminGamification(): Promise<AdminGamificationSettings> {
  const [switches, members] = await Promise.all([
    loadSwitches(),
    supabaseAdmin.from('learner_gamification').select('user_id, nickname, opt_in_at').eq('leaderboard_opt_in', true).order('opt_in_at', { ascending: false }),
  ])
  if (members.error) throw members.error
  // Small at this app's scale, so a per-learner email lookup (as the teacher roster does) is fine.
  const participants = await Promise.all(
    ((members.data ?? []) as { user_id: string; nickname: string; opt_in_at: string | null }[]).map(async (m) => ({
      userId: m.user_id,
      nickname: m.nickname,
      email: await emailOf(m.user_id),
      optInAt: m.opt_in_at,
    })),
  )
  return { publicLeaderboard: switches.public_leaderboard, classComparison: switches.class_comparison, participants }
}
