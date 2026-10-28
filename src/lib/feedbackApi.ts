import { supabase } from './supabase'
import type {
  AdminClientError,
  AdminFeedbackReport,
  ClientErrorStatus,
  FeedbackSubmitInput,
  FeedbackUpdateInput,
  MyFeedbackReport,
} from './feedback'

async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export class FeedbackRateLimitError extends Error {}

export async function submitFeedbackReport(input: FeedbackSubmitInput): Promise<void> {
  const res = await fetch('/api/connect?action=feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await authHeader()) },
    body: JSON.stringify(input),
  })
  if (res.status === 429) throw new FeedbackRateLimitError('Too many reports')
  if (!res.ok) throw new Error('Failed to send the report')
}

async function fetchMyReports(action: 'my-feedback' | 'my-feedback-updates'): Promise<MyFeedbackReport[]> {
  const res = await fetch(`/api/connect?action=${action}`, { headers: await authHeader() })
  if (!res.ok) throw new Error('Failed to load your reports')
  return ((await res.json()) as { reports: MyFeedbackReport[] }).reports
}

/** The signed-in user's own reports, newest first (/my-reports). */
export const fetchMyFeedback = () => fetchMyReports('my-feedback')

/** Own reports fixed, closed or replied to since the user last looked. */
export const fetchMyFeedbackUpdates = () => fetchMyReports('my-feedback-updates')

/** Marks the given own reports (or all of them) as seen, ending their notice. */
export async function markMyFeedbackSeen(ids?: string[]): Promise<void> {
  const res = await fetch('/api/connect?action=my-feedback-seen', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await authHeader()) },
    body: JSON.stringify(ids ? { ids } : {}),
  })
  if (!res.ok) throw new Error('Failed to update your reports')
}

export async function fetchFeedbackReports(): Promise<AdminFeedbackReport[]> {
  const res = await fetch('/api/admin/overview?resource=feedback', { headers: await authHeader() })
  if (!res.ok) throw new Error('Failed to load reports')
  return ((await res.json()) as { reports: AdminFeedbackReport[] }).reports
}

export async function fetchNewFeedbackCount(): Promise<number> {
  const res = await fetch('/api/admin/overview?resource=feedback-count', { headers: await authHeader() })
  if (!res.ok) throw new Error('Failed to count reports')
  return ((await res.json()) as { new: number }).new
}

export async function updateFeedbackReport(input: FeedbackUpdateInput): Promise<AdminFeedbackReport> {
  const res = await fetch('/api/admin/overview?resource=feedback-update', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...(await authHeader()) },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error('Failed to update report')
  return ((await res.json()) as { report: AdminFeedbackReport }).report
}

export async function fetchClientErrors(): Promise<AdminClientError[]> {
  const res = await fetch('/api/admin/overview?resource=client-errors', { headers: await authHeader() })
  if (!res.ok) throw new Error('Failed to load errors')
  return ((await res.json()) as { errors: AdminClientError[] }).errors
}

export async function updateClientErrorStatus(
  fingerprint: string,
  status: ClientErrorStatus,
): Promise<{ status: ClientErrorStatus; statusChangedAt: string }> {
  const res = await fetch('/api/admin/overview?resource=client-error-update', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...(await authHeader()) },
    body: JSON.stringify({ fingerprint, status }),
  })
  if (!res.ok) throw new Error('Failed to update error')
  return ((await res.json()) as { clientError: { status: ClientErrorStatus; statusChangedAt: string } }).clientError
}

const SHOT_MAX_SIDE = 1600

export interface PreparedScreenshot {
  contentType: 'image/jpeg'
  dataBase64: string
  previewUrl: string
}

/** Downscales a pasted or chosen image to a ≤1600 px JPEG so the request stays small. */
export async function prepareScreenshot(file: Blob): Promise<PreparedScreenshot> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, SHOT_MAX_SIDE / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas unavailable')
  // JPEG has no transparency; keep transparent PNG areas white rather than black.
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  const previewUrl = canvas.toDataURL('image/jpeg', 0.82)
  return { contentType: 'image/jpeg', dataBase64: previewUrl.slice(previewUrl.indexOf(',') + 1), previewUrl }
}
