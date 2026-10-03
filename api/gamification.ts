import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getUserFromRequest, supabaseAdmin } from './_lib/supabaseAdmin.js'
import {
  awardXp,
  getActivityType,
  giveTeacherBonus,
  loadTeacherBonuses,
  teacherBonusRemaining,
} from './_lib/gamification.js'
import { getUserRole } from './_lib/roles.js'
import {
  CLIENT_AWARD_RATE_LIMIT_PER_MINUTE,
  TEACHER_BONUS_LIST_LIMIT,
  TEACHER_BONUS_REASON_MAX,
  TEACHER_BONUS_REASON_MIN,
  TEACHER_BONUS_WEEKLY_CAP,
  WEEK_HISTORY_WEEKS,
  WEEKLY_GOAL_MAX_DAYS,
  WEEKLY_GOAL_MIN_DAYS,
} from '../src/lib/gamification/constants.js'
import { progressInLevel } from '../src/lib/gamification/levels.js'
import { loadBadgeWall } from './_lib/badges.js'
import type {
  ClassGamification,
  ClassStudentGamification,
  GamificationMe,
  GamificationOverview,
  StudentGamification,
  TeacherBonusResult,
  WeekHistoryItem,
  XpLanguage,
} from '../src/lib/gamification/types.js'

// Single Vercel function for the whole /api/gamification surface, multiplexed by ?action= to
// stay under Vercel Hobby's 12-serverless-function cap — do not add new files directly
// under api/.
//   learner: award (browser-completed activities), me (level/week/streaks + unseen teacher
//            bonuses), bonus-seen, goal (weekly goal), overview ("Az én fejlődésem" panel)
//   teacher: class (connected students), student (one student), bonus (give bonus XP)

const ALLOWED_AWARD_FIELDS = new Set(['activityType', 'itemRef', 'language', 'performanceScore'])
const MAX_ITEM_REF_LENGTH = 200

interface AwardRequestBody {
  activityType: string
  itemRef?: string | null
  language?: XpLanguage
  performanceScore?: number | null
}

function parseAwardBody(raw: unknown): AwardRequestBody | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const body = raw as Record<string, unknown>
  // Anything else — above all an XP amount — is refused outright, not ignored.
  if (Object.keys(body).some((key) => !ALLOWED_AWARD_FIELDS.has(key))) return null
  if (typeof body.activityType !== 'string' || !body.activityType) return null
  if (body.itemRef != null && (typeof body.itemRef !== 'string' || body.itemRef.length > MAX_ITEM_REF_LENGTH)) return null
  if (body.language != null && body.language !== 'en' && body.language !== 'de') return null
  if (body.performanceScore != null && (typeof body.performanceScore !== 'number' || !Number.isFinite(body.performanceScore))) {
    return null
  }
  return body as unknown as AwardRequestBody
}

// For activities that finish in the browser (drills, swipe cards, lessons). The performance
// score sent here is trusted only within the bonus limit (at most +50% of base XP) and the
// activity type's caps — an accepted, bounded risk. Server-completed activities award XP in
// their own routes and are refused here (client_awardable = false).
async function handleAward(req: VercelRequest, res: VercelResponse, userId: string) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const body = parseAwardBody(req.body)
  if (!body) {
    res.status(400).json({ error: 'Invalid request' })
    return
  }

  let type
  try {
    type = await getActivityType(body.activityType)
  } catch (err) {
    console.error('Failed to load activity type', err)
    res.status(502).json({ error: 'Lookup failed' })
    return
  }
  if (!type || !type.enabled || !type.client_awardable) {
    res.status(403).json({ error: 'Activity type not awardable' })
    return
  }

  const since = new Date(Date.now() - 60_000).toISOString()
  const { count, error: countError } = await supabaseAdmin
    .from('xp_events')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', since)
  if (countError) {
    console.error('Failed to check the XP award rate limit', countError)
    res.status(502).json({ error: 'Rate limit check failed' })
    return
  }
  if ((count ?? 0) >= CLIENT_AWARD_RATE_LIMIT_PER_MINUTE) {
    res.status(429).json({ error: 'Too many requests' })
    return
  }

  const xp = await awardXp({
    userId,
    activityType: type.key,
    itemRef: body.itemRef ?? null,
    language: body.language ?? 'en',
    performanceScore: body.performanceScore ?? null,
  })
  res.status(200).json({ xp })
}

interface GamificationStateRow {
  total_xp: number
  weekly_goal_days: number
  week_goal_days: number
  week_active_days: number
  week_streak: number
  best_week_streak: number
  daily_streak: number
  freezes: number
  active_today: boolean
  streak_restarted_today: boolean
}

/** Level, week and streaks. gamification_state() closes finished weeks first. */
async function loadState(userId: string): Promise<Omit<GamificationMe, 'unseenTeacherBonuses'>> {
  const { data, error } = await supabaseAdmin.rpc('gamification_state', { p_user_id: userId })
  if (error) throw error
  const row = (data as GamificationStateRow[])[0]
  if (!row) throw new Error('gamification_state returned no row')

  const thisWeekMet = row.week_active_days >= row.week_goal_days
  return {
    totalXp: row.total_xp,
    ...progressInLevel(row.total_xp),
    weeklyGoalDays: row.weekly_goal_days,
    week: { goalDays: row.week_goal_days, activeDays: row.week_active_days },
    // week_streak counts closed weeks only; a week whose goal is already met counts too.
    weekStreak: row.week_streak + (thisWeekMet ? 1 : 0),
    bestWeekStreak: Math.max(row.best_week_streak, row.week_streak + (thisWeekMet ? 1 : 0)),
    dailyStreak: row.daily_streak,
    freezes: row.freezes,
    activeToday: row.active_today,
    streakRestartedToday: row.streak_restarted_today,
  }
}

/** The learner's own state, plus teacher bonuses they haven't seen yet. */
async function loadMe(userId: string): Promise<GamificationMe> {
  const [state, seen] = await Promise.all([
    loadState(userId),
    supabaseAdmin.from('learner_gamification').select('bonus_seen_at').eq('user_id', userId).maybeSingle(),
  ])
  if (seen.error) throw seen.error
  const unseenTeacherBonuses = await loadTeacherBonuses(userId, {
    since: (seen.data?.bonus_seen_at as string | null | undefined) ?? null,
    limit: TEACHER_BONUS_LIST_LIMIT,
  })
  return { ...state, unseenTeacherBonuses }
}

async function loadXpBySection(userId: string): Promise<{ section: string; xp: number }[]> {
  const { data, error } = await supabaseAdmin.rpc('gamification_xp_by_section', { p_user_id: userId })
  if (error) throw error
  return ((data ?? []) as { section: string; xp: number }[]).map((r) => ({ section: r.section, xp: r.xp }))
}

/** Call after loadState/loadMe, which close finished weeks. */
async function loadWeeks(userId: string): Promise<WeekHistoryItem[]> {
  const { data, error } = await supabaseAdmin
    .from('weekly_progress')
    .select('week_start, active_days, goal_days, goal_met, xp')
    .eq('user_id', userId)
    .order('week_start', { ascending: false })
    .limit(WEEK_HISTORY_WEEKS)
  if (error) throw error
  return ((data ?? []) as { week_start: string; active_days: number; goal_days: number; goal_met: boolean | null; xp: number }[]).map(
    (w) => ({ weekStart: w.week_start, activeDays: w.active_days, goalDays: w.goal_days, goalMet: w.goal_met, xp: w.xp }),
  )
}

async function handleMe(req: VercelRequest, res: VercelResponse, userId: string) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    res.status(200).json(await loadMe(userId))
  } catch (err) {
    console.error('Failed to load gamification state', err)
    res.status(502).json({ error: 'Failed to load' })
  }
}

// The learner has seen their teacher bonuses (the one-time toast); later ones show again.
async function handleBonusSeen(req: VercelRequest, res: VercelResponse, userId: string) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { error } = await supabaseAdmin
    .from('learner_gamification')
    .update({ bonus_seen_at: new Date().toISOString() })
    .eq('user_id', userId)
  if (error) {
    console.error('Failed to mark teacher bonuses as seen', error)
    res.status(502).json({ error: 'Failed to save' })
    return
  }
  res.status(200).json({ ok: true })
}

// Everything the "Az én fejlődésem" panel shows. Loading the badge wall also grants badges
// based on current state (design §9.1), so a learner's first visit after launch credits what
// they have already achieved (no XP for it).
async function handleOverview(req: VercelRequest, res: VercelResponse, userId: string) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    // loadMe closes finished weeks first, so the history below is up to date.
    const me = await loadMe(userId)
    const [xpBySection, weeks, badges, teacherBonuses] = await Promise.all([
      loadXpBySection(userId),
      loadWeeks(userId),
      loadBadgeWall(userId),
      loadTeacherBonuses(userId, { limit: TEACHER_BONUS_LIST_LIMIT }),
    ])
    const body: GamificationOverview = { me, xpBySection, weeks, badges, teacherBonuses }
    res.status(200).json(body)
  } catch (err) {
    console.error('Failed to load the gamification overview', err)
    res.status(502).json({ error: 'Failed to load' })
  }
}

// The weekly goal applies from next week (the current week keeps its goal; see set_weekly_goal()).
async function handleGoal(req: VercelRequest, res: VercelResponse, userId: string) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const days = (req.body as { days?: unknown } | undefined)?.days
  if (typeof days !== 'number' || !Number.isInteger(days) || days < WEEKLY_GOAL_MIN_DAYS || days > WEEKLY_GOAL_MAX_DAYS) {
    res.status(400).json({ error: 'Invalid goal' })
    return
  }

  try {
    const { error } = await supabaseAdmin.rpc('set_weekly_goal', { p_user_id: userId, p_days: days })
    if (error) throw error
    res.status(200).json(await loadMe(userId))
  } catch (err) {
    console.error('Failed to set weekly goal', err)
    res.status(502).json({ error: 'Failed to save' })
  }
}

// --- Teacher side (design §7) ------------------------------------------------------------

/** Responds 403 and returns false unless the user is a teacher. */
async function requireTeacher(res: VercelResponse, userId: string): Promise<boolean> {
  if ((await getUserRole(userId)) === 'teacher') return true
  res.status(403).json({ error: 'Forbidden' })
  return false
}

/**
 * Responds 404 and returns false unless the teacher is actively connected to the student —
 * the same 404 whether the student doesn't exist or isn't theirs (as api/connect.ts does).
 */
async function requireConnection(res: VercelResponse, teacherId: string, studentId: unknown): Promise<boolean> {
  if (typeof studentId !== 'string' || !studentId) {
    res.status(400).json({ error: 'Missing studentId' })
    return false
  }
  const { data, error } = await supabaseAdmin
    .from('teacher_student_links')
    .select('id')
    .eq('teacher_id', teacherId)
    .eq('student_id', studentId)
    .eq('status', 'active')
    .maybeSingle()
  if (error || !data) {
    res.status(404).json({ error: 'Not found' })
    return false
  }
  return true
}

interface ClassRow {
  student_id: string
  total_xp: number
  level: number
  week_goal_days: number
  week_active_days: number
  week_xp: number
  week_streak: number
  best_week_streak: number
  daily_streak: number
  last_active_date: string | null
  last_week_goal_met: boolean | null
}

async function handleClass(req: VercelRequest, res: VercelResponse, userId: string) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
  if (!(await requireTeacher(res, userId))) return

  const { data, error } = await supabaseAdmin.rpc('teacher_class_gamification', { p_teacher_id: userId })
  if (error) {
    console.error('Failed to load class gamification', error)
    res.status(502).json({ error: 'Failed to load' })
    return
  }

  const students: ClassStudentGamification[] = ((data ?? []) as ClassRow[]).map((r) => {
    const thisWeekMet = r.week_active_days >= r.week_goal_days
    return {
      studentId: r.student_id,
      totalXp: r.total_xp,
      level: r.level,
      week: { goalDays: r.week_goal_days, activeDays: r.week_active_days, xp: r.week_xp },
      weekStreak: r.week_streak + (thisWeekMet ? 1 : 0),
      bestWeekStreak: Math.max(r.best_week_streak, r.week_streak + (thisWeekMet ? 1 : 0)),
      dailyStreak: r.daily_streak,
      lastActiveDate: r.last_active_date,
      lastWeekGoalMet: r.last_week_goal_met,
    }
  })
  const body: ClassGamification = {
    students,
    summary: {
      students: students.length,
      activeThisWeek: students.filter((s) => s.week.activeDays > 0).length,
      goalMetThisWeek: students.filter((s) => s.week.activeDays >= s.week.goalDays).length,
      xpThisWeek: students.reduce((sum, s) => sum + s.week.xp, 0),
      goalMetLastWeek: students.filter((s) => s.lastWeekGoalMet === true).length,
      lastWeekOnRecord: students.filter((s) => s.lastWeekGoalMet !== null).length,
    },
  }
  res.status(200).json(body)
}

async function handleStudent(req: VercelRequest, res: VercelResponse, userId: string) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
  if (!(await requireTeacher(res, userId))) return
  if (!(await requireConnection(res, userId, req.query.studentId))) return
  const studentId = req.query.studentId as string

  try {
    const me = await loadState(studentId)
    const [xpBySection, weeks, wall, bonuses, bonusRemaining] = await Promise.all([
      loadXpBySection(studentId),
      loadWeeks(studentId),
      loadBadgeWall(studentId),
      loadTeacherBonuses(studentId, { limit: TEACHER_BONUS_LIST_LIMIT }),
      teacherBonusRemaining(studentId),
    ])
    const body: StudentGamification = {
      me,
      xpBySection,
      weeks,
      badges: wall.filter((b) => b.earned).sort((a, b) => (b.earnedAt ?? '').localeCompare(a.earnedAt ?? '')),
      bonuses,
      bonusRemaining,
    }
    res.status(200).json(body)
  } catch (err) {
    console.error("Failed to load a student's gamification", err)
    res.status(502).json({ error: 'Failed to load' })
  }
}

// Bonus XP for a connected student: 1..TEACHER_BONUS_WEEKLY_CAP, a reason is required, and
// it must fit this week's remaining allowance — otherwise nothing is given (given: false).
async function handleBonus(req: VercelRequest, res: VercelResponse, userId: string) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
  if (!(await requireTeacher(res, userId))) return

  const body = (req.body ?? {}) as { studentId?: unknown; amount?: unknown; reason?: unknown }
  const amount = body.amount
  const reason = typeof body.reason === 'string' ? body.reason.trim() : ''
  if (
    typeof amount !== 'number' ||
    !Number.isInteger(amount) ||
    amount < 1 ||
    amount > TEACHER_BONUS_WEEKLY_CAP ||
    reason.length < TEACHER_BONUS_REASON_MIN ||
    reason.length > TEACHER_BONUS_REASON_MAX
  ) {
    res.status(400).json({ error: 'Invalid bonus' })
    return
  }
  if (!(await requireConnection(res, userId, body.studentId))) return

  try {
    const result: TeacherBonusResult = await giveTeacherBonus({
      teacherId: userId,
      studentId: body.studentId as string,
      amount,
      reason,
    })
    res.status(result.given ? 200 : 409).json(result)
  } catch (err) {
    console.error('Failed to give teacher bonus', err)
    res.status(502).json({ error: 'Failed to save' })
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await getUserFromRequest(req)
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const action = req.query.action

  switch (action) {
    case 'award':
      await handleAward(req, res, user.id)
      return
    case 'me':
      await handleMe(req, res, user.id)
      return
    case 'bonus-seen':
      await handleBonusSeen(req, res, user.id)
      return
    case 'goal':
      await handleGoal(req, res, user.id)
      return
    case 'overview':
      await handleOverview(req, res, user.id)
      return
    case 'class':
      await handleClass(req, res, user.id)
      return
    case 'student':
      await handleStudent(req, res, user.id)
      return
    case 'bonus':
      await handleBonus(req, res, user.id)
      return
    default:
      res.status(404).json({ error: 'Not found' })
  }
}
