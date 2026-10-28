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
  /** Reply the reporter sees on /my-reports. */
  adminReply: 2000,
  /** Decoded screenshot bytes; the browser downscales to ~1600 px JPEG well below this. */
  screenshotBytes: 3 * 1024 * 1024,
  /** Reports per user per rolling hour. */
  perHour: 10,
  /** Kept per log list (errors, requests). */
  logEntries: 20,
  /** A flagged panel's label and content snapshot. */
  flagPanel: 120,
  flagSnapshot: 2000,
}

/** Preset reasons for flagging one exercise panel ("This item is wrong"). */
export const CONTENT_FLAG_REASONS = ['answer_rejected', 'wrong_key', 'faulty_logic', 'unclear', 'typo', 'other'] as const
export type ContentFlagReason = (typeof CONTENT_FLAG_REASONS)[number]

/** What a panel's flag button hands the report dialog: which panel, and what was on it. */
export interface ContentFlagTarget {
  /** E.g. "Grammar Coach · b1-passive-simple (B1, hu) · Transform 2". */
  panel: string
  /** The panel as the learner saw it: question, cue, accepted answers, their answer, the result. */
  snapshot: string
}

/** The reasons as the admin inbox and "Copy for Claude" show them. */
export const CONTENT_FLAG_REASON_TEXT: Record<ContentFlagReason, string> = {
  answer_rejected: 'A correct answer was rejected',
  wrong_key: 'The given solution is wrong',
  faulty_logic: "Faulty exercise logic (the answer doesn't follow from the task)",
  unclear: 'The task or instruction is unclear',
  typo: 'Typo or display glitch (e.g. a word shown twice)',
  other: 'Something else',
}

export interface ContentFlag extends ContentFlagTarget {
  reason: ContentFlagReason
}

export function isContentFlagReason(v: unknown): v is ContentFlagReason {
  return typeof v === 'string' && (CONTENT_FLAG_REASONS as readonly string[]).includes(v)
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
  /** Set when the report came from a panel's flag button rather than the general dialog. */
  flag?: ContentFlag
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
  adminReply: string | null
  repliedAt: string | null
  statusChangedAt: string | null
  /** Last change the reporter is told about (fixed / won't fix / reply). */
  userUpdateAt: string | null
  /** When the reporter last opened My reports or dismissed the notice. */
  userSeenAt: string | null
  createdAt: string
}

export interface FeedbackUpdateInput {
  id: string
  status?: FeedbackStatus
  adminNote?: string
  adminReply?: string
}

/** Statuses that close a report and trigger the reporter's one-time notice. */
export const FEEDBACK_NOTIFY_STATUSES: readonly FeedbackStatus[] = ['fixed', 'wont_fix']

/** One of the signed-in user's own reports (/my-reports). */
export interface MyFeedbackReport {
  id: string
  kind: FeedbackKind
  description: string
  expected: string | null
  pagePath: string
  status: FeedbackStatus
  adminReply: string | null
  repliedAt: string | null
  statusChangedAt: string | null
  createdAt: string
  /** Fixed, closed or replied to since the user last looked. */
  unseen: boolean
}

export function isUnseenUpdate(userUpdateAt: string | null, userSeenAt: string | null): boolean {
  return !!userUpdateAt && (!userSeenAt || new Date(userUpdateAt) > new Date(userSeenAt))
}

export function isFeedbackKind(v: unknown): v is FeedbackKind {
  return typeof v === 'string' && (FEEDBACK_KINDS as readonly string[]).includes(v)
}

export function isFeedbackStatus(v: unknown): v is FeedbackStatus {
  return typeof v === 'string' && (FEEDBACK_STATUSES as readonly string[]).includes(v)
}

/** Fired by the admin inbox after a status change so the header badge refreshes at once. */
export const FEEDBACK_COUNT_CHANGED_EVENT = 'avalon:feedback-count-changed'

// --- Automatic crash capture (phase 2) ---------------------------------------------------

export const CLIENT_ERROR_KINDS = ['error', 'rejection', 'render'] as const
export type ClientErrorKind = (typeof CLIENT_ERROR_KINDS)[number]

export const CLIENT_ERROR_STATUSES = ['open', 'resolved', 'ignored'] as const
export type ClientErrorStatus = (typeof CLIENT_ERROR_STATUSES)[number]

export const CLIENT_ERROR_LIMITS = {
  /** Distinct errors per request. */
  batch: 10,
  message: 500,
  stack: 4000,
}

export interface ClientErrorItem {
  kind: ClientErrorKind
  message: string
  stack?: string
  pagePath: string
  /** Occurrences of this error in the page since the last send. */
  count: number
}

export interface ClientErrorBatch {
  appVersion: string
  browser: string
  errors: ClientErrorItem[]
}

export interface AdminClientError {
  fingerprint: string
  kind: ClientErrorKind
  message: string
  stack: string | null
  lastPagePath: string | null
  lastAppVersion: string | null
  lastBrowser: string | null
  occurrences: number
  occurrences7d: number
  users: number
  users7d: number
  status: ClientErrorStatus
  statusChangedAt: string | null
  firstSeenAt: string
  lastSeenAt: string
}

export function isClientErrorKind(v: unknown): v is ClientErrorKind {
  return typeof v === 'string' && (CLIENT_ERROR_KINDS as readonly string[]).includes(v)
}

export function isClientErrorStatus(v: unknown): v is ClientErrorStatus {
  return typeof v === 'string' && (CLIENT_ERROR_STATUSES as readonly string[]).includes(v)
}
