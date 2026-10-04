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
  CHALLENGE_DESCRIPTION_MAX,
  CHALLENGE_MAX_ACTIVE,
  CHALLENGE_TITLE_MAX,
  CHALLENGE_TITLE_MIN,
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
import { evaluateBadges, loadBadgeWall } from './_lib/badges.js'
import {
  budapestDate,
  challengeStatus,
  countOpenChallenges,
  createChallenge,
  deleteChallenge,
  endChallenge,
  evaluateChallenges,
  loadChallengeAnnouncements,
  loadChallengeContext,
  loadOwnChallenge,
  loadStudentChallenges,
  loadTeacherChallenges,
  updateChallengeText,
} from './_lib/challenges.js'
import { validateNewChallenge } from './_lib/challengeRules.js'
import type {
  ClassGamification,
  ClassStudentGamification,
  GamificationMe,
  GamificationOverview,
  GamificationState,
  StudentGamification,
  TeacherBonusResult,
  WeekHistoryItem,
  XpLanguage,
} from '../src/lib/gamification/types.js'

// Single Vercel function for the whole /api/gamification surface, multiplexed by ?action= to
// stay under Vercel Hobby's 12-serverless-function cap — do not add new files directly
// under api/.
//   learner: award (browser-completed activities), me (level/week/streaks + one-time notices:
//            teacher bonuses, new and completed challenges), seen, goal (weekly goal),
//            overview ("Az én fejlődésem" panel)
//   teacher: class (connected students), student (one student), bonus (give bonus XP),
//            challenge(s) (list / create / edit text), challenge-end, challenge-delete

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
async function loadState(userId: string): Promise<GamificationState> {
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

/**
 * The learner's own state, plus their one-time notices: teacher bonuses and new challenges
 * they haven't seen, and challenges completed just now — e.g. their class reached a
 * collective target while they were away (with any badge that brings).
 */
async function loadMe(userId: string): Promise<GamificationMe> {
  // Completions first, so the state below already includes any reward XP.
  const completedChallenges = await evaluateChallenges(userId)
  const newBadges = completedChallenges.length > 0 ? await evaluateBadges(userId) : []

  const [state, seen] = await Promise.all([
    loadState(userId),
    supabaseAdmin.from('learner_gamification').select('bonus_seen_at, challenges_seen_at').eq('user_id', userId).maybeSingle(),
  ])
  if (seen.error) throw seen.error
  const [unseenTeacherBonuses, newChallenges] = await Promise.all([
    loadTeacherBonuses(userId, {
      since: (seen.data?.bonus_seen_at as string | null | undefined) ?? null,
      limit: TEACHER_BONUS_LIST_LIMIT,
    }),
    loadChallengeAnnouncements(userId, (seen.data?.challenges_seen_at as string | null | undefined) ?? null),
  ])
  return { ...state, unseenTeacherBonuses, newChallenges, completedChallenges, newBadges }
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

// The learner has seen their teacher bonuses and new challenges (the one-time toasts);
// later ones show again. ('bonus-seen' is the Phase 4a name, kept for open tabs.)
async function handleSeen(req: VercelRequest, res: VercelResponse, userId: string) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  // Upsert: a learner who hasn't practised yet has no row, but can already have been told
  // about a challenge.
  const now = new Date().toISOString()
  const { error } = await supabaseAdmin
    .from('learner_gamification')
    .upsert({ user_id: userId, bonus_seen_at: now, challenges_seen_at: now }, { onConflict: 'user_id' })
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
    const [xpBySection, weeks, badges, teacherBonuses, challenges] = await Promise.all([
      loadXpBySection(userId),
      loadWeeks(userId),
      loadBadgeWall(userId),
      loadTeacherBonuses(userId, { limit: TEACHER_BONUS_LIST_LIMIT }),
      loadStudentChallenges(userId),
    ])
    const body: GamificationOverview = { me, xpBySection, weeks, badges, teacherBonuses, challenges }
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

// --- Class challenges (design §7.3) ------------------------------------------------------

// GET: the teacher's challenges with progress. POST: create one. PATCH { id, title,
// description }: edit the text (any time). A new challenge is refused (409) when the
// teacher already has CHALLENGE_MAX_ACTIVE running or scheduled.
async function handleChallenge(req: VercelRequest, res: VercelResponse, userId: string) {
  if (!(await requireTeacher(res, userId))) return

  try {
    if (req.method === 'GET') {
      const [challenges, open] = await Promise.all([loadTeacherChallenges(userId), countOpenChallenges(userId)])
      res.status(200).json({ challenges, openCount: open, maxOpen: CHALLENGE_MAX_ACTIVE })
      return
    }

    if (req.method === 'POST') {
      if ((await countOpenChallenges(userId)) >= CHALLENGE_MAX_ACTIVE) {
        res.status(409).json({ error: `You can have at most ${CHALLENGE_MAX_ACTIVE} running or scheduled challenges.` })
        return
      }
      const context = await loadChallengeContext(userId)
      const checked = validateNewChallenge(req.body, { today: budapestDate(), ...context })
      if (!checked.ok) {
        res.status(400).json({ error: checked.error })
        return
      }
      const id = await createChallenge(userId, checked.row)
      res.status(201).json({ id })
      return
    }

    if (req.method === 'PATCH') {
      const body = (req.body ?? {}) as { id?: unknown; title?: unknown; description?: unknown }
      const challenge = await loadOwnChallenge(userId, body.id)
      if (!challenge) {
        res.status(404).json({ error: 'Not found' })
        return
      }
      const title = typeof body.title === 'string' ? body.title.trim() : ''
      const description = typeof body.description === 'string' && body.description.trim() ? body.description.trim() : null
      if (title.length < CHALLENGE_TITLE_MIN || title.length > CHALLENGE_TITLE_MAX || (description?.length ?? 0) > CHALLENGE_DESCRIPTION_MAX) {
        res.status(400).json({ error: 'Invalid title or description' })
        return
      }
      await updateChallengeText(challenge.id, title, description)
      res.status(200).json({ ok: true })
      return
    }

    res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('Challenge request failed', err)
    res.status(502).json({ error: 'Failed' })
  }
}

// POST { id }: end a running or scheduled challenge early (no completions after this).
async function handleChallengeEnd(req: VercelRequest, res: VercelResponse, userId: string) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
  if (!(await requireTeacher(res, userId))) return
  try {
    const challenge = await loadOwnChallenge(userId, (req.body ?? {}).id)
    if (!challenge) {
      res.status(404).json({ error: 'Not found' })
      return
    }
    const status = challengeStatus(challenge, budapestDate())
    if (status !== 'active' && status !== 'upcoming') {
      res.status(409).json({ error: 'This challenge has already ended.' })
      return
    }
    await endChallenge(challenge.id)
    res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Failed to end challenge', err)
    res.status(502).json({ error: 'Failed' })
  }
}

// POST { id }: delete a challenge that hasn't started yet.
async function handleChallengeDelete(req: VercelRequest, res: VercelResponse, userId: string) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
  if (!(await requireTeacher(res, userId))) return
  try {
    const challenge = await loadOwnChallenge(userId, (req.body ?? {}).id)
    if (!challenge) {
      res.status(404).json({ error: 'Not found' })
      return
    }
    if (challengeStatus(challenge, budapestDate()) !== 'upcoming') {
      res.status(409).json({ error: 'Only a challenge that hasn’t started can be deleted. End it instead.' })
      return
    }
    await deleteChallenge(challenge.id)
    res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Failed to delete challenge', err)
    res.status(502).json({ error: 'Failed' })
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
    case 'seen':
    case 'bonus-seen':
      await handleSeen(req, res, user.id)
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
    case 'challenges':
    case 'challenge':
      await handleChallenge(req, res, user.id)
      return
    case 'challenge-end':
      await handleChallengeEnd(req, res, user.id)
      return
    case 'challenge-delete':
      await handleChallengeDelete(req, res, user.id)
      return
    default:
      res.status(404).json({ error: 'Not found' })
  }
}
