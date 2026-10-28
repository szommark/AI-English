import { createHash } from 'node:crypto'
import { supabaseAdmin } from './supabaseAdmin.js'
import { FeedbackError } from './feedback.js'
import {
  CLIENT_ERROR_LIMITS,
  isClientErrorKind,
  isClientErrorStatus,
  type AdminClientError,
  type ClientErrorKind,
  type ClientErrorStatus,
} from '../../src/lib/feedback.js'

// Automatic crash capture: the browser's batches (api/connect.ts ?action=client-errors, signed-out
// visitors included) and the admin Errors tab (api/admin/overview.ts ?resource=client-errors /
// client-error-update). Rows are written only through record_client_error().

/** Ids, URLs and numbers vary per occurrence; strip them so one bug stays one fingerprint. */
export function normalizeMessage(message: string): string {
  return message
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '<id>')
    .replace(/https?:\/\/\S+/g, '<url>')
    .replace(/\d+/g, 'N')
    .replace(/\s+/g, ' ')
    .trim()
}

/** File of the first stack frame, without path, query or Vite's content hash
 *  ("index-B4x9kQ2a.js" → "index.js"), so the fingerprint survives redeploys. Function names
 *  are left out because minified names change with every build. */
export function topFrameFile(stack: string | undefined): string {
  for (const line of (stack ?? '').split('\n')) {
    const m =
      line.match(/^\s*at (?:.+? \()?(.+?)(?::\d+){1,2}\)?\s*$/) ?? line.match(/^[^@\s]*@(.+?)(?::\d+){1,2}\s*$/)
    if (!m) continue
    const file = m[1].split(/[?#]/)[0].split('/').pop() ?? ''
    if (file) return file.replace(/-[A-Za-z0-9_-]{8}(?=\.m?js$)/, '')
  }
  return ''
}

export function fingerprint(kind: ClientErrorKind, message: string, stack: string | undefined): string {
  return createHash('sha1').update(`${kind}|${normalizeMessage(message)}|${topFrameFile(stack)}`).digest('hex')
}

interface ValidError {
  fingerprint: string
  kind: ClientErrorKind
  message: string
  stack: string | null
  pagePath: string
  count: number
}

export function validateBatch(body: unknown): { appVersion: string; browser: string; errors: ValidError[] } {
  const b = (body ?? {}) as Record<string, unknown>
  if (!Array.isArray(b.errors) || b.errors.length === 0) throw new FeedbackError(400, 'No errors')
  if (b.errors.length > CLIENT_ERROR_LIMITS.batch) throw new FeedbackError(413, 'Too many errors in one batch')

  const errors = b.errors.map((raw): ValidError => {
    const e = (raw ?? {}) as Record<string, unknown>
    if (!isClientErrorKind(e.kind)) throw new FeedbackError(400, 'Unknown error kind')
    const message = typeof e.message === 'string' ? e.message.trim().slice(0, CLIENT_ERROR_LIMITS.message) : ''
    if (!message) throw new FeedbackError(400, 'Empty error message')
    const stack = typeof e.stack === 'string' && e.stack.trim() ? e.stack.slice(0, CLIENT_ERROR_LIMITS.stack) : null
    const pagePath =
      typeof e.pagePath === 'string' && e.pagePath.startsWith('/') ? e.pagePath.split(/[?#]/)[0].slice(0, 500) : '/'
    const count = typeof e.count === 'number' && Number.isFinite(e.count) ? Math.max(1, Math.min(1000, Math.round(e.count))) : 1
    return { fingerprint: fingerprint(e.kind, message, stack ?? undefined), kind: e.kind, message, stack, pagePath, count }
  })

  return {
    appVersion: typeof b.appVersion === 'string' ? b.appVersion.slice(0, 40) : '',
    browser: typeof b.browser === 'string' ? b.browser.slice(0, 120) : '',
    errors,
  }
}

export async function recordClientErrors(userId: string | null, body: unknown): Promise<{ recorded: number }> {
  const batch = validateBatch(body)
  const results = await Promise.all(
    batch.errors.map(async (e) => {
      const { data, error } = await supabaseAdmin.rpc('record_client_error', {
        p_fingerprint: e.fingerprint,
        p_kind: e.kind,
        p_message: e.message,
        p_stack: e.stack,
        p_page_path: e.pagePath,
        p_app_version: batch.appVersion || null,
        p_browser: batch.browser || null,
        p_user_id: userId,
        p_count: e.count,
      })
      if (error) throw error
      return data === true
    }),
  )
  return { recorded: results.filter(Boolean).length }
}

interface StatsRow {
  fingerprint: string
  kind: ClientErrorKind
  message: string
  stack: string | null
  last_page_path: string | null
  last_app_version: string | null
  last_browser: string | null
  occurrences: number | string
  occurrences_7d: number | string
  users: number | string
  users_7d: number | string
  status: ClientErrorStatus
  status_changed_at: string | null
  first_seen_at: string
  last_seen_at: string
}

export async function listClientErrors(): Promise<AdminClientError[]> {
  const { data, error } = await supabaseAdmin.rpc('admin_client_error_stats', { p_limit: 200 })
  if (error) throw error
  return ((data ?? []) as StatsRow[]).map((r) => ({
    fingerprint: r.fingerprint,
    kind: r.kind,
    message: r.message,
    stack: r.stack,
    lastPagePath: r.last_page_path,
    lastAppVersion: r.last_app_version,
    lastBrowser: r.last_browser,
    occurrences: Number(r.occurrences),
    occurrences7d: Number(r.occurrences_7d),
    users: Number(r.users),
    users7d: Number(r.users_7d),
    status: r.status,
    statusChangedAt: r.status_changed_at,
    firstSeenAt: r.first_seen_at,
    lastSeenAt: r.last_seen_at,
  }))
}

export async function updateClientError(
  body: unknown,
): Promise<{ fingerprint: string; status: ClientErrorStatus; statusChangedAt: string }> {
  const b = (body ?? {}) as Record<string, unknown>
  if (typeof b.fingerprint !== 'string' || !/^[0-9a-f]{40}$/.test(b.fingerprint)) {
    throw new FeedbackError(400, 'Missing fingerprint')
  }
  if (!isClientErrorStatus(b.status)) throw new FeedbackError(400, 'Unknown status')

  const now = new Date().toISOString()
  const { data, error } = await supabaseAdmin
    .from('client_errors')
    .update({ status: b.status, status_changed_at: now })
    .eq('fingerprint', b.fingerprint)
    .select('fingerprint')
    .maybeSingle()
  if (error) throw error
  if (!data) throw new FeedbackError(404, 'Error not found')
  return { fingerprint: b.fingerprint, status: b.status, statusChangedAt: now }
}
