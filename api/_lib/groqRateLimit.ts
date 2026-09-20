import { supabaseAdmin } from './supabaseAdmin.js'

/** Minimum gap between snapshot writes per server instance, so busy traffic doesn't hammer the DB. */
const RATE_LIMIT_SNAPSHOT_MIN_INTERVAL_MS = 10_000

let lastWriteAt = 0

function headerInt(headers: Headers, name: string): number | null {
  const raw = headers.get(name)
  if (raw === null) return null
  const n = Number.parseInt(raw, 10)
  return Number.isFinite(n) ? n : null
}

/**
 * Stores Groq's rate-limit headers. Groq's *-requests headers always refer to requests per
 * DAY and its *-tokens headers to tokens per MINUTE, both per organisation. Never throws: a
 * failure here must not reach the learner.
 */
export async function recordGroqRateLimits(headers: Headers): Promise<void> {
  try {
    const now = Date.now()
    if (now - lastWriteAt < RATE_LIMIT_SNAPSHOT_MIN_INTERVAL_MS) return

    const row = {
      provider: 'groq',
      limit_requests: headerInt(headers, 'x-ratelimit-limit-requests'),
      remaining_requests: headerInt(headers, 'x-ratelimit-remaining-requests'),
      limit_tokens: headerInt(headers, 'x-ratelimit-limit-tokens'),
      remaining_tokens: headerInt(headers, 'x-ratelimit-remaining-tokens'),
      seen_at: new Date(now).toISOString(),
    }
    if (row.limit_requests === null && row.limit_tokens === null) return // no headers on this response

    lastWriteAt = now
    const { error } = await supabaseAdmin.from('provider_rate_limit_snapshot').upsert(row)
    if (error) throw error
  } catch (err) {
    console.error('Failed to record Groq rate-limit snapshot', err)
  }
}
