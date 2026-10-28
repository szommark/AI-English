// "Report a problem": shared between the browser (ReportProblemDialog, AdminFeedbackPage)
// and the API (api/_lib/feedback.ts), so keep it free of browser-only code.

export const FEEDBACK_KINDS = ['bug', 'display', 'content', 'idea'] as const
export type FeedbackKind = (typeof FEEDBACK_KINDS)[number]

export const FEEDBACK_STATUSES = ['new', 'seen', 'in_progress', 'fixed', 'wont_fix'] as const
export type FeedbackStatus = (typeof FEEDBACK_STATUSES)[number]

export const FEEDBACK_LIMITS = {
  description: 4000,
  expected: 2000,
  adminNote: 4000,
  /** Decoded screenshot bytes; the browser downscales to ~1600 px JPEG well below this. */
  screenshotBytes: 3 * 1024 * 1024,
  /** Reports per user per rolling hour. */
  perHour: 10,
  /** Kept per log list (errors, requests). */
  logEntries: 20,
}

export const SCREENSHOT_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
export type ScreenshotType = (typeof SCREENSHOT_TYPES)[number]

export interface FeedbackLogEntry {
  /** ISO timestamp. */
  at: string
  message: string
}

/** Collected automatically when the dialog opens; shown to the user under "What gets sent". */
export interface FeedbackContext {
  userAgent: string
  browser: string
  os: string
  viewport: { width: number; height: number; dpr: number }
  uiLang: string
  appVersion: string
  micPermission: 'granted' | 'denied' | 'prompt' | 'unknown'
  online: boolean
  /** console.error, uncaught errors and unhandled promise rejections, oldest first. */
  errors: FeedbackLogEntry[]
  /** API / Supabase requests that failed or returned 4xx/5xx, oldest first. */
  requests: FeedbackLogEntry[]
}

export interface FeedbackSubmitInput {
  kind: FeedbackKind
  description: string
  expected?: string
  pagePath: string
  context: FeedbackContext
  screenshot?: { contentType: ScreenshotType; dataBase64: string }
}

export interface AdminFeedbackReport {
  id: string
  email: string
  role: string
  kind: FeedbackKind
  description: string
  expected: string | null
  pagePath: string
  context: Partial<FeedbackContext>
  screenshotUrl: string | null
  status: FeedbackStatus
  adminNote: string | null
  statusChangedAt: string | null
  createdAt: string
}

export interface FeedbackUpdateInput {
  id: string
  status?: FeedbackStatus
  adminNote?: string
}

export function isFeedbackKind(v: unknown): v is FeedbackKind {
  return typeof v === 'string' && (FEEDBACK_KINDS as readonly string[]).includes(v)
}

export function isFeedbackStatus(v: unknown): v is FeedbackStatus {
  return typeof v === 'string' && (FEEDBACK_STATUSES as readonly string[]).includes(v)
}

/** Fired by the admin inbox after a status change so the header badge refreshes at once. */
export const FEEDBACK_COUNT_CHANGED_EVENT = 'avalon:feedback-count-changed'
