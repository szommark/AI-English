// Free-tier quotas for every vendor the app depends on, plus the shared types for the
// admin "API usage" page. Imported by both the client and the /api routes (same
// cross-boundary pattern as models.ts). Free tiers only: no prices or budgets.
// Limits as of 2026-09-20 — re-check the vendor consoles if a number looks off.

export type UsageVendor = 'azure' | 'groq' | 'gemini' | 'supabase' | 'vercel'
export type MeterSource = 'measured' | 'vendor_api' | 'manual' | 'build_time'
export type MeterStatus = 'ok' | 'watch' | 'critical'
export type MeterUnit = 'seconds' | 'tokens' | 'requests' | 'bytes' | 'count' | 'hours'
export type MeterPeriod = 'month' | 'day' | 'minute' | 'cycle' | 'total' | 'deployment'

/** Fraction of the limit at which a meter turns "Watch" / "Critical". */
export const USAGE_WATCH_AT = 0.6
export const USAGE_CRITICAL_AT = 0.9
/** A header-based per-minute reading older than this has since reset; the UI shows it as "last seen". */
export const RATE_LIMIT_MINUTE_STALE_MS = 2 * 60 * 1000
/** Manual values older than this are flagged stale. */
export const MANUAL_STALE_DAYS = 5

// Decimal units (1 MB = 10^6 bytes). Supabase's own MB definition (decimal vs binary) is
// unverified; decimal is used consistently here.
const MB = 1_000_000
const GB = 1_000_000_000

// Azure Speech F0: 5 h/month of speech-to-text audio, shared Standard/Custom, no batch.
export const AZURE_F0_STT_SECONDS_PER_MONTH = 18_000

// Groq free tier, openai/gpt-oss-120b. Limits are per ORGANISATION, not per app.
export const GROQ_FREE_REQUESTS_PER_DAY = 1_000
export const GROQ_FREE_TOKENS_PER_DAY = 200_000
export const GROQ_FREE_TOKENS_PER_MINUTE = 8_000

/**
 * Gemini free-tier limits per model, keyed by the provider model id (Gemini limits apply
 * per Google Cloud project AND per model). null = not set yet.
 * - gemini-3.1-flash-lite: 500 RPD, from a third-party tracker of Google AI Studio figures
 *   (Sept 2026). Google's docs don't publish it — verify on AI Studio's Rate limit page.
 * - gemini-3.7-flash: 20 RPD, observed via a live 429 (see the comment in models.ts).
 * RPM / input-TPM stay null until copied from AI Studio.
 */
export const GEMINI_FREE_LIMITS: Record<string, { rpd: number | null; rpm: number | null; inputTpm: number | null }> = {
  'gemini-3.1-flash-lite': { rpd: 500, rpm: null, inputTpm: null },
  'gemini-3.7-flash': { rpd: 20, rpm: null, inputTpm: null },
}
/** Gemini's requests-per-day quota resets at midnight in this zone (not UTC). */
export const GEMINI_QUOTA_TIME_ZONE = 'America/Los_Angeles'

// Supabase Free.
export const SUPABASE_FREE_DB_BYTES = 500 * MB
export const SUPABASE_FREE_STORAGE_BYTES = 1 * GB
export const SUPABASE_FREE_EGRESS_BYTES = 5 * GB
export const SUPABASE_FREE_MAU = 50_000
export const SUPABASE_FREE_ACTIVE_PROJECTS = 2

// Vercel Hobby.
export const VERCEL_HOBBY_TRANSFER_BYTES = 100 * GB
export const VERCEL_HOBBY_INVOCATIONS = 1_000_000
export const VERCEL_HOBBY_ACTIVE_CPU_HOURS = 4
export const VERCEL_HOBBY_FUNCTIONS_PER_DEPLOYMENT = 12

/** Whitelist for the manual-entry endpoint. */
export const MANUAL_METER_IDS = [
  'supabase.egress_bytes',
  'supabase.projects',
  'vercel.transfer_bytes',
  'vercel.invocations',
  'vercel.active_cpu_hours',
] as const
export type ManualMeterId = (typeof MANUAL_METER_IDS)[number]

export function isManualMeterId(value: unknown): value is ManualMeterId {
  return typeof value === 'string' && (MANUAL_METER_IDS as readonly string[]).includes(value)
}

export interface UsageMeter {
  id: string // e.g. 'azure.stt_seconds'
  vendor: UsageVendor
  label: string
  used: number
  limit: number | null // null = limit not set: shown as "Limit not set", excluded from status counts
  unit: MeterUnit
  period: MeterPeriod
  resetsAt?: string // ISO
  source: MeterSource
  asOf: string // ISO; manual meters older than MANUAL_STALE_DAYS are flagged stale
  markerAt?: number // same unit as `used`; Azure only (app safety cap)
  note?: string
}

export interface AdminUsageSnapshot {
  generatedAt: string
  meters: UsageMeter[]
  extras: {
    azureChecksThisMonth: number
    azureAvgClipSeconds: number
    llmToday: Array<{ provider: string; modelId: string | null; callType: string; calls: number; totalTokens: number }>
  }
}

/** null when no limit is set. */
export function meterStatus(m: Pick<UsageMeter, 'used' | 'limit'>): MeterStatus | null {
  if (m.limit === null || m.limit <= 0) return null
  const fraction = m.used / m.limit
  if (fraction >= USAGE_CRITICAL_AT) return 'critical'
  if (fraction >= USAGE_WATCH_AT) return 'watch'
  return 'ok'
}
