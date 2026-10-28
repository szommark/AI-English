import { randomUUID } from 'node:crypto'
import { supabaseAdmin } from './supabaseAdmin.js'
import type { UserRole } from './roles.js'
import {
  FEEDBACK_LIMITS,
  SCREENSHOT_TYPES,
  isFeedbackKind,
  isFeedbackStatus,
  type AdminFeedbackReport,
  type FeedbackContext,
  type FeedbackKind,
  type FeedbackLogEntry,
  type FeedbackStatus,
  type ScreenshotType,
} from '../../src/lib/feedback.js'

// "Report a problem": user submissions (api/connect.ts ?action=feedback) and the admin inbox
// (api/admin/overview.ts ?resource=feedback / feedback-update / feedback-count).

const BUCKET = 'feedback-shots'
const SIGNED_URL_TTL_SEC = 60 * 60
const LIST_LIMIT = 300

export class FeedbackError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
  }
}

function str(v: unknown, max: number): string {
  return typeof v === 'string' ? v.slice(0, max) : ''
}

function num(v: unknown): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : 0
}

function logList(v: unknown): FeedbackLogEntry[] {
  if (!Array.isArray(v)) return []
  return v.slice(-FEEDBACK_LIMITS.logEntries).map((e) => ({
    at: str((e as FeedbackLogEntry)?.at, 40),
    message: str((e as FeedbackLogEntry)?.message, 300),
  }))
}

/** Rebuilds the context from known fields only, so the jsonb column never grows unbounded. */
export function sanitizeContext(raw: unknown): FeedbackContext {
  const c = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const viewport = (c.viewport && typeof c.viewport === 'object' ? c.viewport : {}) as Record<string, unknown>
  const mic = c.micPermission
  return {
    userAgent: str(c.userAgent, 400),
    browser: str(c.browser, 60),
    os: str(c.os, 60),
    viewport: { width: num(viewport.width), height: num(viewport.height), dpr: num(viewport.dpr) },
    uiLang: str(c.uiLang, 8),
    appVersion: str(c.appVersion, 40),
    micPermission: mic === 'granted' || mic === 'denied' || mic === 'prompt' ? mic : 'unknown',
    online: c.online !== false,
    errors: logList(c.errors),
    requests: logList(c.requests),
  }
}

interface ValidReport {
  kind: FeedbackKind
  description: string
  expected: string | null
  pagePath: string
  context: FeedbackContext
  screenshot: { contentType: ScreenshotType; bytes: Buffer } | null
}

export function validateSubmission(body: unknown): ValidReport {
  const b = (body ?? {}) as Record<string, unknown>
  if (!isFeedbackKind(b.kind)) throw new FeedbackError(400, 'Unknown report type')

  const description = typeof b.description === 'string' ? b.description.trim() : ''
  if (!description) throw new FeedbackError(400, 'Description is required')
  if (description.length > FEEDBACK_LIMITS.description) throw new FeedbackError(400, 'Description is too long')

  const expected = typeof b.expected === 'string' ? b.expected.trim() : ''
  if (expected.length > FEEDBACK_LIMITS.expected) throw new FeedbackError(400, 'Expected text is too long')

  // Path only: query strings and hashes can carry tokens (e.g. password-reset links).
  const pagePath =
    typeof b.pagePath === 'string' && b.pagePath.startsWith('/') ? b.pagePath.split(/[?#]/)[0].slice(0, 500) : '/'

  let screenshot: ValidReport['screenshot'] = null
  if (b.screenshot != null) {
    const s = b.screenshot as Record<string, unknown>
    const contentType = s.contentType
    if (typeof contentType !== 'string' || !(SCREENSHOT_TYPES as readonly string[]).includes(contentType)) {
      throw new FeedbackError(400, 'Unsupported screenshot type')
    }
    if (typeof s.dataBase64 !== 'string' || !s.dataBase64) throw new FeedbackError(400, 'Empty screenshot')
    const bytes = Buffer.from(s.dataBase64, 'base64')
    if (bytes.length === 0) throw new FeedbackError(400, 'Empty screenshot')
    if (bytes.length > FEEDBACK_LIMITS.screenshotBytes) throw new FeedbackError(413, 'Screenshot is too large')
    screenshot = { contentType: contentType as ScreenshotType, bytes }
  }

  return { kind: b.kind, description, expected: expected || null, pagePath, context: sanitizeContext(b.context), screenshot }
}

const EXTENSION: Record<ScreenshotType, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }

export async function submitFeedback(userId: string, role: UserRole, body: unknown): Promise<{ id: string }> {
  const report = validateSubmission(body)

  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { count, error: countError } = await supabaseAdmin
    .from('feedback_reports')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', since)
  if (countError) throw countError
  if ((count ?? 0) >= FEEDBACK_LIMITS.perHour) {
    throw new FeedbackError(429, 'Too many reports in the last hour')
  }

  const id = randomUUID()
  let screenshotPath: string | null = null
  if (report.screenshot) {
    screenshotPath = `${userId}/${id}.${EXTENSION[report.screenshot.contentType]}`
    const { error } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(screenshotPath, report.screenshot.bytes, { contentType: report.screenshot.contentType })
    if (error) throw error
  }

  const { error } = await supabaseAdmin.from('feedback_reports').insert({
    id,
    user_id: userId,
    user_role: role,
    kind: report.kind,
    description: report.description,
    expected: report.expected,
    page_path: report.pagePath,
    context: report.context,
    screenshot_path: screenshotPath,
  })
  if (error) {
    if (screenshotPath) await supabaseAdmin.storage.from(BUCKET).remove([screenshotPath])
    throw error
  }
  return { id }
}

interface FeedbackRow {
  id: string
  user_id: string
  user_role: string
  kind: FeedbackKind
  description: string
  expected: string | null
  page_path: string
  context: Partial<FeedbackContext> | null
  screenshot_path: string | null
  status: FeedbackStatus
  admin_note: string | null
  status_changed_at: string | null
  created_at: string
}

const COLUMNS =
  'id, user_id, user_role, kind, description, expected, page_path, context, screenshot_path, status, admin_note, status_changed_at, created_at'

async function toAdminReports(rows: FeedbackRow[]): Promise<AdminFeedbackReport[]> {
  const userIds = [...new Set(rows.map((r) => r.user_id))]
  const emails = new Map(
    await Promise.all(
      userIds.map(async (uid) => {
        const { data } = await supabaseAdmin.auth.admin.getUserById(uid)
        return [uid, data.user?.email ?? 'unknown'] as const
      }),
    ),
  )

  const paths = rows.map((r) => r.screenshot_path).filter((p): p is string => !!p)
  const urls = new Map<string, string>()
  if (paths.length) {
    const { data } = await supabaseAdmin.storage.from(BUCKET).createSignedUrls(paths, SIGNED_URL_TTL_SEC)
    for (const entry of data ?? []) if (entry.path && entry.signedUrl) urls.set(entry.path, entry.signedUrl)
  }

  return rows.map((r) => ({
    id: r.id,
    email: emails.get(r.user_id) ?? 'unknown',
    role: r.user_role,
    kind: r.kind,
    description: r.description,
    expected: r.expected,
    pagePath: r.page_path,
    context: r.context ?? {},
    screenshotUrl: r.screenshot_path ? (urls.get(r.screenshot_path) ?? null) : null,
    status: r.status,
    adminNote: r.admin_note,
    statusChangedAt: r.status_changed_at,
    createdAt: r.created_at,
  }))
}

export async function listFeedback(): Promise<AdminFeedbackReport[]> {
  const { data, error } = await supabaseAdmin
    .from('feedback_reports')
    .select(COLUMNS)
    .order('created_at', { ascending: false })
    .limit(LIST_LIMIT)
  if (error) throw error
  return toAdminReports((data ?? []) as FeedbackRow[])
}

export async function countNewFeedback(): Promise<number> {
  const { count, error } = await supabaseAdmin
    .from('feedback_reports')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'new')
  if (error) throw error
  return count ?? 0
}

export async function updateFeedback(body: unknown): Promise<AdminFeedbackReport> {
  const b = (body ?? {}) as Record<string, unknown>
  if (typeof b.id !== 'string' || !b.id) throw new FeedbackError(400, 'Missing report id')

  const now = new Date().toISOString()
  const patch: Record<string, unknown> = { updated_at: now }
  if (b.status !== undefined) {
    if (!isFeedbackStatus(b.status)) throw new FeedbackError(400, 'Unknown status')
    patch.status = b.status
    patch.status_changed_at = now
  }
  if (b.adminNote !== undefined) {
    if (typeof b.adminNote !== 'string') throw new FeedbackError(400, 'Note must be text')
    const note = b.adminNote.trim()
    if (note.length > FEEDBACK_LIMITS.adminNote) throw new FeedbackError(400, 'Note is too long')
    patch.admin_note = note || null
  }
  if (Object.keys(patch).length === 1) throw new FeedbackError(400, 'Nothing to update')

  const { data, error } = await supabaseAdmin
    .from('feedback_reports')
    .update(patch)
    .eq('id', b.id)
    .select(COLUMNS)
    .maybeSingle()
  if (error) throw error
  if (!data) throw new FeedbackError(404, 'Report not found')
  const [report] = await toAdminReports([data as FeedbackRow])
  return report
}
