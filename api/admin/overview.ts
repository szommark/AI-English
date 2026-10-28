import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getUserFromRequest, supabaseAdmin } from '../_lib/supabaseAdmin.js'
import { getUserRole } from '../_lib/roles.js'
import { buildUsageSnapshot } from '../_lib/usageSnapshot.js'
import { isManualMeterId } from '../../src/lib/usageLimits.js'
import { randomBytes } from 'node:crypto'
import { FeedbackError, countNewFeedback, listFeedback, updateFeedback } from '../_lib/feedback.js'
import { listClientErrors, updateClientError } from '../_lib/clientErrors.js'

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

interface QrStatsRow {
  id: string
  slug: string
  label: string
  created_at: string
  scans: number
  unique_visitors: number
  scans_7d: number
  last_scan_at: string | null
  signups: number
  confirmed_signups: number
}

async function handleQr(res: VercelResponse) {
  const [{ data: stats, error }, { data: signups }] = await Promise.all([
    supabaseAdmin.rpc('admin_qr_stats'),
    supabaseAdmin
      .from('qr_signups')
      .select('user_id, qr_code_id, created_at')
      .order('created_at', { ascending: false })
      .limit(50),
  ])
  if (error) {
    console.error('Failed to load QR stats', error)
    res.status(500).json({ error: 'Failed to load QR codes' })
    return
  }

  const codes = ((stats ?? []) as QrStatsRow[]).map((row) => ({
    id: row.id,
    slug: row.slug,
    label: row.label,
    createdAt: row.created_at,
    scans: Number(row.scans),
    uniqueVisitors: Number(row.unique_visitors),
    scans7d: Number(row.scans_7d),
    lastScanAt: row.last_scan_at,
    signups: Number(row.signups),
    confirmedSignups: Number(row.confirmed_signups),
  }))

  const recentSignups = await Promise.all(
    (signups ?? []).map(async (s) => ({
      email: await resolveEmail(s.user_id),
      codeId: s.qr_code_id,
      createdAt: s.created_at,
    })),
  )

  res.status(200).json({ codes, recentSignups })
}

// Short, unambiguous slugs (no 0/o/1/l) keep the QR code small and the link easy to type.
const SLUG_ALPHABET = 'abcdefghijkmnpqrstuvwxyz23456789'

function randomSlug(): string {
  const bytes = randomBytes(6)
  return Array.from(bytes, (b) => SLUG_ALPHABET[b % SLUG_ALPHABET.length]).join('')
}

async function handleQrCreate(req: VercelRequest, res: VercelResponse, userId: string) {
  const { label } = (req.body ?? {}) as { label?: unknown }
  const trimmed = typeof label === 'string' ? label.trim() : ''
  if (!trimmed || trimmed.length > 80) {
    res.status(400).json({ error: 'Label must be 1–80 characters' })
    return
  }
  for (let attempt = 0; attempt < 3; attempt++) {
    const { error } = await supabaseAdmin
      .from('qr_codes')
      .insert({ slug: randomSlug(), label: trimmed, created_by: userId })
    if (!error) return handleQr(res)
    if (error.code !== '23505') {
      console.error('Failed to create QR code', error)
      break
    }
  }
  res.status(500).json({ error: 'Failed to create QR code' })
}

async function handleFeedback(res: VercelResponse, run: () => Promise<unknown>, failure: string) {
  try {
    res.status(200).json(await run())
  } catch (err) {
    if (err instanceof FeedbackError) {
      res.status(err.status).json({ error: err.message })
      return
    }
    console.error(failure, err)
    res.status(500).json({ error: failure })
  }
}

const METHODS: Record<string, string> = { 'usage-manual': 'PUT', 'qr-create': 'POST', 'feedback-update': 'PATCH', 'client-error-update': 'PATCH' }

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const resource = req.query.resource
  const expectedMethod = (typeof resource === 'string' && METHODS[resource]) || 'GET'
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
  if (resource === 'qr') return handleQr(res)
  if (resource === 'qr-create') return handleQrCreate(req, res, user.id)
  if (resource === 'feedback') {
    return handleFeedback(res, async () => ({ reports: await listFeedback() }), 'Failed to load reports')
  }
  if (resource === 'feedback-count') {
    return handleFeedback(res, async () => ({ new: await countNewFeedback() }), 'Failed to count reports')
  }
  if (resource === 'feedback-update') {
    return handleFeedback(res, async () => ({ report: await updateFeedback(req.body) }), 'Failed to update report')
  }
  if (resource === 'client-errors') {
    return handleFeedback(res, async () => ({ errors: await listClientErrors() }), 'Failed to load errors')
  }
  if (resource === 'client-error-update') {
    return handleFeedback(res, async () => ({ clientError: await updateClientError(req.body) }), 'Failed to update error')
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
