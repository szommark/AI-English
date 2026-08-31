import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getUserFromRequest, supabaseAdmin } from '../_lib/supabaseAdmin.js'

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const user = await getUserFromRequest(req)
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' })
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
    p_student_id: user.id,
  })

  if (error) {
    const reason = REASON_BY_ERROR_MESSAGE[error.message] ?? 'not_found'
    await logFailedAttempt(user.id, normalizedCode, reason)
    res.status(400).json({ error: reason, message: FRIENDLY_MESSAGE[reason] })
    return
  }

  const teacherId = data as string
  const { data: teacherUser } = await supabaseAdmin.auth.admin.getUserById(teacherId)

  res.status(200).json({ teacherId, teacherEmail: teacherUser.user?.email ?? 'unknown' })
}
