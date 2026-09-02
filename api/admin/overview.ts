import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getUserFromRequest, supabaseAdmin } from '../_lib/supabaseAdmin.js'
import { getUserRole } from '../_lib/roles.js'

async function resolveEmail(userId: string): Promise<string> {
  const { data } = await supabaseAdmin.auth.admin.getUserById(userId)
  return data.user?.email ?? 'unknown'
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const user = await getUserFromRequest(req)
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const role = await getUserRole(user.id)
  if (role !== 'admin') {
    res.status(403).json({ error: 'Forbidden' })
    return
  }

  const [{ data: links }, { data: attempts }] = await Promise.all([
    supabaseAdmin
      .from('teacher_student_links')
      .select('teacher_id, student_id, status, created_at, revoked_at')
      .order('created_at', { ascending: false })
      .limit(200),
    supabaseAdmin
      .from('connection_attempts')
      .select('attempted_by, attempted_code, reason, created_at')
      .order('created_at', { ascending: false })
      .limit(200),
  ])

  const connections = await Promise.all(
    (links ?? []).map(async (link) => ({
      teacherEmail: await resolveEmail(link.teacher_id),
      studentEmail: await resolveEmail(link.student_id),
      status: link.status,
      createdAt: link.created_at,
      revokedAt: link.revoked_at,
    })),
  )

  const failedAttempts = await Promise.all(
    (attempts ?? []).map(async (attempt) => ({
      attemptedByEmail: await resolveEmail(attempt.attempted_by),
      attemptedCode: attempt.attempted_code,
      reason: attempt.reason,
      createdAt: attempt.created_at,
    })),
  )

  res.status(200).json({ connections, failedAttempts })
}
