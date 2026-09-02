import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getUserFromRequest, supabaseAdmin } from './_lib/supabaseAdmin.js'
import { getUserRole } from './_lib/roles.js'

// Single Vercel function for the whole /api/connect surface (redeem, disconnect,
// teachers), dispatched by an `action` query param rather than by path segments —
// this project's vercel.json defines custom `rewrites`, which disables Vercel's
// automatic filesystem-based dynamic route matching ([param]/[...param]) for
// anything but a literal path, so a path-segment-based catch-all silently falls
// through to the SPA instead of reaching the function. Consolidated from three
// separate files to stay under the Hobby plan's 12-Serverless-Function limit.

interface RedeemRequestBody {
  code: string
}

type RedeemReason = 'not_found' | 'expired' | 'max_uses_reached' | 'self_connect'

const REASON_BY_ERROR_MESSAGE: Record<string, RedeemReason> = {
  code_not_found: 'not_found',
  code_expired: 'expired',
  code_max_uses: 'max_uses_reached',
  self_connect: 'self_connect',
}

const FRIENDLY_MESSAGE: Record<RedeemReason, string> = {
  not_found: "That code doesn't match any teacher. Double-check it and try again.",
  expired: 'That code has expired. Ask your teacher for a new one.',
  max_uses_reached: 'That code has reached its usage limit. Ask your teacher for a new one.',
  self_connect: "You can't connect to yourself with your own invite code.",
}

async function logFailedAttempt(userId: string, code: string, reason: RedeemReason) {
  try {
    const { error } = await supabaseAdmin.from('connection_attempts').insert({
      attempted_by: userId,
      attempted_code: code,
      reason,
    })
    if (error) throw error
  } catch (err) {
    console.error('Failed to log connection attempt', err)
  }
}

async function handleRedeem(req: VercelRequest, res: VercelResponse, userId: string) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const body = req.body as RedeemRequestBody
  const normalizedCode = (body.code ?? '').trim().toUpperCase()
  if (!normalizedCode) {
    res.status(400).json({ error: 'Missing code' })
    return
  }

  const { data, error } = await supabaseAdmin.rpc('redeem_invite_code', {
    p_code: normalizedCode,
    p_student_id: userId,
  })

  if (error) {
    const reason = REASON_BY_ERROR_MESSAGE[error.message] ?? 'not_found'
    await logFailedAttempt(userId, normalizedCode, reason)
    res.status(400).json({ error: reason, message: FRIENDLY_MESSAGE[reason] })
    return
  }

  const teacherId = data as string
  const { data: teacherUser } = await supabaseAdmin.auth.admin.getUserById(teacherId)

  res.status(200).json({ teacherId, teacherEmail: teacherUser.user?.email ?? 'unknown' })
}

interface DisconnectRequestBody {
  otherUserId: string
}

async function handleDisconnect(req: VercelRequest, res: VercelResponse, userId: string) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const body = req.body as DisconnectRequestBody
  const otherUserId = body.otherUserId
  if (!otherUserId) {
    res.status(400).json({ error: 'Missing otherUserId' })
    return
  }

  const role = await getUserRole(userId)
  const matchColumns =
    role === 'teacher' ? { teacher_id: userId, student_id: otherUserId } : { student_id: userId, teacher_id: otherUserId }

  const { data, error } = await supabaseAdmin
    .from('teacher_student_links')
    .update({ status: 'revoked', revoked_at: new Date().toISOString() })
    .match({ ...matchColumns, status: 'active' })
    .select('id')

  if (error) {
    res.status(500).json({ error: 'Failed to disconnect' })
    return
  }

  if (!data || data.length === 0) {
    res.status(404).json({ error: 'No active connection found' })
    return
  }

  res.status(200).json({ ok: true })
}

async function handleTeachers(req: VercelRequest, res: VercelResponse, userId: string) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { data: links, error } = await supabaseAdmin
    .from('teacher_student_links')
    .select('teacher_id, created_at')
    .eq('student_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) {
    res.status(500).json({ error: 'Failed to load connected teachers' })
    return
  }

  // A student's connected-teacher list is small at this app's scale, so a simple
  // per-link loop (rather than a batched auth.users lookup) is acceptable — same
  // tradeoff as api/teacher.ts's roster handler.
  const teachers = await Promise.all(
    (links ?? []).map(async (link) => {
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(link.teacher_id)
      return {
        teacherId: link.teacher_id,
        email: authUser.user?.email ?? 'unknown',
        connectedAt: link.created_at,
      }
    }),
  )

  res.status(200).json({ teachers })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await getUserFromRequest(req)
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const action = req.query.action

  switch (action) {
    case 'redeem':
      await handleRedeem(req, res, user.id)
      return
    case 'disconnect':
      await handleDisconnect(req, res, user.id)
      return
    case 'teachers':
      await handleTeachers(req, res, user.id)
      return
    default:
      res.status(404).json({ error: 'Not found' })
  }
}
