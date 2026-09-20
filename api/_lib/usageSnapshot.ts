import { readFileSync } from 'node:fs'
import { supabaseAdmin } from './supabaseAdmin.js'
import { DEFAULT_MODEL_BY_FEATURE, MODEL_REGISTRY, getModelEntry, isModelId } from '../../src/lib/models.js'
import { DEEP_CHECK_MAX_SECONDS, MONTHLY_AZURE_SECONDS_CAP } from '../../src/lib/pronunciationConfig.js'
import {
  AZURE_F0_STT_SECONDS_PER_MONTH,
  GEMINI_FREE_LIMITS,
  GROQ_FREE_REQUESTS_PER_DAY,
  GROQ_FREE_TOKENS_PER_DAY,
  GROQ_FREE_TOKENS_PER_MINUTE,
  RATE_LIMIT_MINUTE_STALE_MS,
  SUPABASE_FREE_ACTIVE_PROJECTS,
  SUPABASE_FREE_DB_BYTES,
  SUPABASE_FREE_EGRESS_BYTES,
  SUPABASE_FREE_MAU,
  SUPABASE_FREE_STORAGE_BYTES,
  VERCEL_HOBBY_ACTIVE_CPU_HOURS,
  VERCEL_HOBBY_FUNCTIONS_PER_DEPLOYMENT,
  VERCEL_HOBBY_INVOCATIONS,
  VERCEL_HOBBY_TRANSFER_BYTES,
  type AdminUsageSnapshot,
  type ManualMeterId,
  type UsageMeter,
} from '../../src/lib/usageLimits.js'

const MINUTE_MS = 60_000
const DAY_MS = 24 * 60 * MINUTE_MS
/** Upper bound on pronunciation_checks rows read for the monthly stats. */
const PRONUNCIATION_CHECKS_ROW_LIMIT = 10_000
const EPOCH_ISO = new Date(0).toISOString()

interface LlmUsageRow {
  provider: string | null
  model_id: string | null
  call_type: string
  calls: number
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
}

interface DbSnapshot {
  db_bytes: number
  storage_bytes: number
  active_users_30d: number
}

const MANUAL_METERS: Record<ManualMeterId, Omit<UsageMeter, 'used' | 'asOf' | 'source'>> = {
  'supabase.egress_bytes': {
    id: 'supabase.egress_bytes', vendor: 'supabase', label: 'Egress', limit: SUPABASE_FREE_EGRESS_BYTES,
    unit: 'bytes', period: 'cycle', note: 'No public API — copy from the Supabase org Usage page.',
  },
  'supabase.projects': {
    id: 'supabase.projects', vendor: 'supabase', label: 'Active projects', limit: SUPABASE_FREE_ACTIVE_PROJECTS,
    unit: 'count', period: 'total',
  },
  'vercel.transfer_bytes': {
    id: 'vercel.transfer_bytes', vendor: 'vercel', label: 'Fast data transfer', limit: VERCEL_HOBBY_TRANSFER_BYTES,
    unit: 'bytes', period: 'month',
  },
  'vercel.invocations': {
    id: 'vercel.invocations', vendor: 'vercel', label: 'Function invocations', limit: VERCEL_HOBBY_INVOCATIONS,
    unit: 'count', period: 'month',
  },
  'vercel.active_cpu_hours': {
    id: 'vercel.active_cpu_hours', vendor: 'vercel', label: 'Active CPU', limit: VERCEL_HOBBY_ACTIVE_CPU_HOURS,
    unit: 'hours', period: 'month',
  },
}

function readFunctionCount(): number | null {
  try {
    const raw = readFileSync(new URL('./generated/apiFunctionCount.json', import.meta.url), 'utf8')
    const count = (JSON.parse(raw) as { count?: unknown }).count
    return typeof count === 'number' ? count : null
  } catch {
    return null
  }
}

async function llmUsageSince(since: Date): Promise<LlmUsageRow[]> {
  const { data, error } = await supabaseAdmin.rpc('admin_llm_usage', { p_since: since.toISOString() })
  if (error) throw error
  return ((data ?? []) as LlmUsageRow[]).map((r) => ({
    ...r,
    calls: Number(r.calls),
    prompt_tokens: Number(r.prompt_tokens),
    completion_tokens: Number(r.completion_tokens),
    total_tokens: Number(r.total_tokens),
  }))
}

function sum(rows: LlmUsageRow[], field: 'calls' | 'prompt_tokens' | 'total_tokens', match: (r: LlmUsageRow) => boolean) {
  return rows.filter(match).reduce((acc, r) => acc + r[field], 0)
}

/** Gemini models currently selected for any feature (admin setting, else the feature default). */
async function selectedGeminiModelIds(): Promise<string[]> {
  const { data } = await supabaseAdmin.from('model_settings').select('feature, model_id')
  const byFeature = new Map((data ?? []).map((row) => [row.feature as string, row.model_id as string]))
  const ids = new Set<string>()
  for (const [feature, fallback] of Object.entries(DEFAULT_MODEL_BY_FEATURE)) {
    const chosen = byFeature.get(feature)
    const modelId = chosen && isModelId(chosen) ? chosen : fallback
    const entry = getModelEntry(modelId)
    if (entry.provider === 'gemini') ids.add(entry.providerModelId)
  }
  return [...ids]
}

export async function buildUsageSnapshot(): Promise<AdminUsageSnapshot> {
  const now = new Date()
  const nowIso = now.toISOString()
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  const nextMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1))
  const utcMonth = nowIso.slice(0, 7)
  const utcDayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const minuteAgo = new Date(now.getTime() - MINUTE_MS)

  const pacificRes = await supabaseAdmin.rpc('pacific_day_start')
  if (pacificRes.error) throw pacificRes.error
  const pacificStart = new Date(pacificRes.data as string)

  const [azureRes, checksRes, dbRes, manualRes, groqLimitRes, dayRows, pacificRows, minuteRows, geminiModels] = await Promise.all([
    supabaseAdmin.from('azure_usage_monthly').select('total_seconds').eq('utc_month', utcMonth).maybeSingle(),
    supabaseAdmin
      .from('pronunciation_checks')
      .select('audio_seconds')
      .gte('created_at', monthStart.toISOString())
      .limit(PRONUNCIATION_CHECKS_ROW_LIMIT),
    supabaseAdmin.rpc('admin_usage_snapshot'),
    supabaseAdmin.from('usage_manual_entries').select('meter_id, value, updated_at'),
    // Missing table/row (migration not applied yet, or no Groq call seen) just means "keep measured".
    supabaseAdmin.from('provider_rate_limit_snapshot').select('*').eq('provider', 'groq').maybeSingle(),
    llmUsageSince(utcDayStart),
    llmUsageSince(pacificStart),
    llmUsageSince(minuteAgo),
    selectedGeminiModelIds(),
  ])
  if (dbRes.error) throw dbRes.error
  const db = dbRes.data as DbSnapshot

  // Legacy Gemini rows have no model_id (the selector shipped after they were written):
  // attribute them to the default Gemini model.
  const defaultGeminiModel = MODEL_REGISTRY.find((m) => m.provider === 'gemini')?.providerModelId ?? null
  const isGeminiModel = (modelId: string) => (r: LlmUsageRow) =>
    r.provider === 'gemini' && (r.model_id ?? defaultGeminiModel) === modelId
  const isGroq = (r: LlmUsageRow) => r.provider === 'groq'

  const meters: UsageMeter[] = []

  // Azure
  const azureSeconds = azureRes.data?.total_seconds ?? 0
  meters.push({
    id: 'azure.stt_seconds', vendor: 'azure', label: 'Speech-to-text audio', used: azureSeconds,
    limit: AZURE_F0_STT_SECONDS_PER_MONTH, unit: 'seconds', period: 'month', resetsAt: nextMonthStart.toISOString(),
    source: 'measured', asOf: nowIso, markerAt: MONTHLY_AZURE_SECONDS_CAP,
    note: `The app's own safety cap is ${MONTHLY_AZURE_SECONDS_CAP} s. Each deep check reserves ${DEEP_CHECK_MAX_SECONDS} s until it is logged, so this can read slightly high.`,
  })

  // Groq (this app's usage only; the vendor limits are per organisation)
  const groqNote = "This app's usage only; Groq limits are per organisation. 'Today' is the UTC day (approximate)."
  const utcReset = new Date(utcDayStart.getTime() + DAY_MS).toISOString()
  meters.push(
    {
      id: 'groq.tokens_day', vendor: 'groq', label: 'Tokens today', used: sum(dayRows, 'total_tokens', isGroq),
      limit: GROQ_FREE_TOKENS_PER_DAY, unit: 'tokens', period: 'day', resetsAt: utcReset,
      source: 'measured', asOf: nowIso, note: groqNote,
    },
    {
      id: 'groq.requests_day', vendor: 'groq', label: 'Requests today', used: sum(dayRows, 'calls', isGroq),
      limit: GROQ_FREE_REQUESTS_PER_DAY, unit: 'requests', period: 'day', resetsAt: utcReset,
      source: 'measured', asOf: nowIso, note: groqNote,
    },
    {
      id: 'groq.tokens_minute', vendor: 'groq', label: 'Tokens per minute (rolling)', used: sum(minuteRows, 'total_tokens', isGroq),
      limit: GROQ_FREE_TOKENS_PER_MINUTE, unit: 'tokens', period: 'minute', source: 'measured', asOf: nowIso,
      note: "This app's usage in the last 60 s.",
    },
  )

  // Groq live allowance from response headers (org-wide). Overrides the measured
  // requests/day and tokens/minute meters when a snapshot exists.
  const groqSnap = groqLimitRes.data as {
    limit_requests: number | null
    remaining_requests: number | null
    limit_tokens: number | null
    remaining_tokens: number | null
    seen_at: string
  } | null
  if (groqSnap) {
    const seenAt = new Date(groqSnap.seen_at).toISOString()
    const replace = (id: string, patch: Partial<UsageMeter>) => {
      const i = meters.findIndex((m) => m.id === id)
      if (i >= 0) meters[i] = { ...meters[i], ...patch, source: 'vendor_api', asOf: seenAt }
    }
    if (groqSnap.limit_requests !== null && groqSnap.remaining_requests !== null) {
      replace('groq.requests_day', {
        used: groqSnap.limit_requests - groqSnap.remaining_requests,
        note: 'Live from Groq response headers, for the whole organisation (includes any other app on the same Groq account).',
      })
    }
    if (groqSnap.limit_tokens !== null && groqSnap.remaining_tokens !== null) {
      const stale = now.getTime() - new Date(groqSnap.seen_at).getTime() > RATE_LIMIT_MINUTE_STALE_MS
      replace('groq.tokens_minute', {
        used: groqSnap.limit_tokens - groqSnap.remaining_tokens,
        note: stale
          ? 'Last reading is more than 2 minutes old, so the minute window has since reset.'
          : 'Live from Groq response headers, for the whole organisation.',
      })
    }
  }

  // Gemini: three rows per selected model. The day boundary is Pacific midnight, not UTC.
  // resetsAt adds a flat 24 h, which is an hour off on the two DST-change days a year.
  const pacificReset = new Date(pacificStart.getTime() + DAY_MS).toISOString()
  for (const modelId of geminiModels) {
    const limits = GEMINI_FREE_LIMITS[modelId] ?? { rpd: null, rpm: null, inputTpm: null }
    const match = isGeminiModel(modelId)
    meters.push(
      {
        id: `gemini.requests_day.${modelId}`, vendor: 'gemini', label: `${modelId} — requests today`,
        used: sum(pacificRows, 'calls', match), limit: limits.rpd, unit: 'requests', period: 'day',
        resetsAt: pacificReset, source: 'measured', asOf: nowIso,
      },
      {
        id: `gemini.requests_minute.${modelId}`, vendor: 'gemini', label: `${modelId} — requests per minute`,
        used: sum(minuteRows, 'calls', match), limit: limits.rpm, unit: 'requests', period: 'minute',
        source: 'measured', asOf: nowIso,
      },
      {
        id: `gemini.input_tokens_minute.${modelId}`, vendor: 'gemini', label: `${modelId} — input tokens per minute`,
        used: sum(minuteRows, 'prompt_tokens', match), limit: limits.inputTpm, unit: 'tokens', period: 'minute',
        source: 'measured', asOf: nowIso,
      },
    )
  }

  // Supabase (measured)
  meters.push(
    { id: 'supabase.db_bytes', vendor: 'supabase', label: 'Database size', used: Number(db.db_bytes), limit: SUPABASE_FREE_DB_BYTES, unit: 'bytes', period: 'total', source: 'measured', asOf: nowIso },
    { id: 'supabase.storage_bytes', vendor: 'supabase', label: 'File storage', used: Number(db.storage_bytes), limit: SUPABASE_FREE_STORAGE_BYTES, unit: 'bytes', period: 'total', source: 'measured', asOf: nowIso },
    {
      id: 'supabase.mau', vendor: 'supabase', label: 'Monthly active users', used: Number(db.active_users_30d), limit: SUPABASE_FREE_MAU,
      unit: 'count', period: 'month', source: 'measured', asOf: nowIso,
      note: 'Activity proxy (users with a session in the last 30 days). The Supabase org Usage page is authoritative.',
    },
  )

  // Manual meters; a meter with no row yet reads 0 with an epoch asOf ("not set").
  const manual = new Map((manualRes.data ?? []).map((r) => [r.meter_id as string, r]))
  for (const def of Object.values(MANUAL_METERS)) {
    const row = manual.get(def.id)
    meters.push({
      ...def,
      used: row ? Number(row.value) : 0,
      source: 'manual',
      asOf: row ? new Date(row.updated_at as string).toISOString() : EPOCH_ISO,
    })
  }

  // Build-time function count
  const functionCount = readFunctionCount()
  if (functionCount !== null) {
    meters.push({
      id: 'vercel.functions_deployment', vendor: 'vercel', label: 'Serverless functions', used: functionCount,
      limit: VERCEL_HOBBY_FUNCTIONS_PER_DEPLOYMENT, unit: 'count', period: 'deployment', source: 'build_time', asOf: nowIso,
    })
  }

  const checks = (checksRes.data ?? []) as { audio_seconds: number | string | null }[]
  const clipSeconds = checks.map((c) => Number(c.audio_seconds ?? 0))
  const azureChecksThisMonth = clipSeconds.length
  const azureAvgClipSeconds = azureChecksThisMonth ? clipSeconds.reduce((a, b) => a + b, 0) / azureChecksThisMonth : 0

  return {
    generatedAt: nowIso,
    meters,
    extras: {
      azureChecksThisMonth,
      azureAvgClipSeconds,
      llmToday: dayRows.map((r) => ({
        provider: r.provider ?? 'unknown',
        modelId: r.model_id,
        callType: r.call_type,
        calls: r.calls,
        totalTokens: r.total_tokens,
      })),
    },
  }
}
