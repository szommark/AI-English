import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getUserFromRequest, supabaseAdmin } from '../_lib/supabaseAdmin.js'
import { getUserRole } from '../_lib/roles.js'
import { buildUsageSnapshot } from '../_lib/usageSnapshot.js'
import { isManualMeterId } from '../../src/lib/usageLimits.js'

// Multiplexed by ?resource= (default: connections overview) to stay under Vercel Hobby's
// 12-serverless-function cap — do not add new files directly under api/.

async function resolveEmail(userId: string): Promise<string> {
  const { data } = await supabaseAdmin.auth.admin.getUserById(userId)
  return data.user?.email ?? 'unknown'
}

async function handleUsage(res: VercelResponse) {
  try {
    res.status(200).json(await buildUsageSnapshot())
  } catch (err) {
    console.error('Failed to build usage snapshot', err)
    res.status(500).json({ error: 'Failed to load usage' })
  }
}

async function handleUsageManual(req: VercelRequest, res: VercelResponse, userId: string) {
  const { meterId, value } = (req.body ?? {}) as { meterId?: unknown; value?: unknown }
  if (!isManualMeterId(meterId)) {
    res.status(400).json({ error: 'Unknown meter' })
    return
  }
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    res.status(400).json({ error: 'Value must be a non-negative number' })
    return
  }
  const { error } = await supabaseAdmin
    .from('usage_manual_entries')
    .upsert({ meter_id: meterId, value, updated_at: new Date().toISOString(), updated_by: userId })
  if (error) {
    console.error('Failed to save manual meter', error)
    res.status(500).json({ error: 'Failed to save value' })
    return
  }
  res.status(200).json({ ok: true })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const resource = req.query.resource
  const expectedMethod = resource === 'usage-manual' ? 'PUT' : 'GET'
  if (req.method !== expectedMethod) {
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

  if (resource === 'usage') return handleUsage(res)
  if (resource === 'usage-manual') return handleUsageManual(req, res, user.id)

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
