import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import PageHeading from '../components/PageHeading'
import { fetchAdminUsage, saveManualMeter } from '../lib/adminApi'
import {
  MANUAL_STALE_DAYS,
  RATE_LIMIT_MINUTE_STALE_MS,
  USAGE_CRITICAL_AT,
  USAGE_WATCH_AT,
  isManualMeterId,
  meterStatus,
  type AdminUsageSnapshot,
  type MeterStatus,
  type MeterUnit,
  type UsageMeter,
  type UsageVendor,
} from '../lib/usageLimits'

const DISPLAY_TIME_ZONE = 'Europe/Budapest'
const DAY_MS = 24 * 60 * 60 * 1000
const GB = 1_000_000_000

// Bar fills and chip text/background pairs per status (chip pairs keep >= 4.5:1 contrast).
const STATUS_STYLE: Record<MeterStatus, { label: string; fill: string; chipBg: string; chipText: string }> = {
  ok: { label: 'OK', fill: 'oklch(0.64 0.14 195)', chipBg: 'oklch(0.95 0.035 195)', chipText: 'oklch(0.36 0.08 195)' },
  watch: { label: 'Watch', fill: 'oklch(0.76 0.15 75)', chipBg: 'oklch(0.95 0.06 85)', chipText: 'oklch(0.42 0.11 65)' },
  critical: { label: 'Critical', fill: 'oklch(0.58 0.2 25)', chipBg: 'oklch(0.95 0.035 25)', chipText: 'oklch(0.42 0.17 25)' },
}
const STATUS_RANK: Record<MeterStatus, number> = { ok: 0, watch: 1, critical: 2 }

interface VendorCardConfig {
  vendor: UsageVendor
  title: string
  subtitle: string
  plan: string
  linkLabel: string
  linkHref: string
  footnote?: string
}

const VENDOR_CARDS: VendorCardConfig[] = [
  {
    vendor: 'azure', title: 'Azure AI Speech', subtitle: 'Pronunciation deep check · speech-to-text', plan: 'Free F0',
    linkLabel: 'Open Azure portal', linkHref: 'https://portal.azure.com/',
    footnote: "The ledger holds 12 s per check until the clip is logged, so it can read slightly high. Azure's own billed seconds are the source of truth.",
  },
  {
    vendor: 'gemini', title: 'Google Gemini', subtitle: 'Tutor Bot and other selected features · limits apply per Google Cloud project and model', plan: 'Free tier',
    linkLabel: 'Open Google AI Studio', linkHref: 'https://aistudio.google.com/',
    footnote: "Google's terms require Paid Services for apps serving users in the EEA, Switzerland or the UK. Requests-per-day limits differ by model (about 500 for 3.1 Flash-Lite, about 20 for the 3.5–3.8 Flash models) and reset at midnight Pacific time.",
  },
  {
    vendor: 'groq', title: 'Groq', subtitle: 'Rehearsal and Grammar Coach · limits apply per organisation', plan: 'Free',
    linkLabel: 'Open Groq limits', linkHref: 'https://console.groq.com/settings/limits',
  },
  {
    vendor: 'vercel', title: 'Vercel', subtitle: 'Hosting and serverless functions', plan: 'Hobby',
    linkLabel: 'Open Vercel dashboard', linkHref: 'https://vercel.com/dashboard',
    footnote: 'Hobby plan: non-commercial use only.',
  },
  {
    vendor: 'supabase', title: 'Supabase', subtitle: 'AI-English project · database, storage, auth', plan: 'Free',
    linkLabel: 'Open Supabase dashboard', linkHref: 'https://supabase.com/dashboard',
  },
]

const PLANNED_INTEGRATIONS = ['ElevenLabs', 'Simli', 'Azure neural TTS']

function formatNumber(n: number, maxFractionDigits = 0): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: maxFractionDigits })
}

function formatBytes(bytes: number): string {
  if (bytes >= GB) return `${formatNumber(bytes / GB, 2)} GB`
  return `${formatNumber(bytes / 1_000_000, 1)} MB`
}

function formatValue(value: number, unit: MeterUnit): string {
  switch (unit) {
    case 'seconds':
      return value >= 3600 ? `${formatNumber(value / 3600, 1)} h` : `${formatNumber(value)} s`
    case 'hours':
      return `${formatNumber(value, 2)} h`
    case 'bytes':
      return formatBytes(value)
    case 'tokens':
      return `${formatNumber(value)} tokens`
    case 'requests':
      return `${formatNumber(value)} requests`
    case 'count':
      return formatNumber(value)
  }
}

function formatUsage(m: UsageMeter): string {
  return m.limit === null ? formatValue(m.used, m.unit) : `${formatValue(m.used, m.unit)} of ${formatValue(m.limit, m.unit)}`
}

function formatPercent(used: number, limit: number): string {
  const pct = (used / limit) * 100
  if (pct > 0 && pct < 1) return '<1%'
  return `${Math.round(pct)}%`
}

function formatReset(iso: string, period: UsageMeter['period']): string {
  const opts: Intl.DateTimeFormatOptions =
    period === 'month'
      ? { day: 'numeric', month: 'short', timeZone: DISPLAY_TIME_ZONE }
      : { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: DISPLAY_TIME_ZONE }
  return `Resets ${new Date(iso).toLocaleString('en-GB', opts)}${period === 'month' ? '' : ' (Budapest)'}`
}

function formatAgo(iso: string, now: number): string {
  const seconds = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000))
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`
  return `${Math.floor(seconds / 3600)} h ago`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function isNeverSet(m: UsageMeter): boolean {
  return m.source === 'manual' && new Date(m.asOf).getTime() === 0
}

function isStaleManual(m: UsageMeter, now: number): boolean {
  return m.source === 'manual' && (isNeverSet(m) || now - new Date(m.asOf).getTime() > MANUAL_STALE_DAYS * DAY_MS)
}

/** Manual bytes values are typed in GB; everything else in the meter's own unit. */
function manualInputUnit(m: UsageMeter): { label: string; factor: number } {
  if (m.unit === 'bytes') return { label: 'GB', factor: GB }
  return { label: m.unit === 'hours' ? 'h' : '', factor: 1 }
}

function Chip({ bg, color, children }: { bg: string; color: string; children: ReactNode }) {
  return (
    <span
      className="rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums"
      style={{ background: bg, color }}
    >
      {children}
    </span>
  )
}

function SourcePill({ meter, now }: { meter: UsageMeter; now: number }) {
  const base = 'rounded-full border px-2 py-0.5 text-xs'
  if (meter.source === 'manual') {
    if (isNeverSet(meter)) {
      return <span className={`${base} border-dashed border-border text-muted-foreground`}>Manual · not set</span>
    }
    if (isStaleManual(meter, now)) {
      return (
        <span className={base} style={{ background: STATUS_STYLE.watch.chipBg, color: STATUS_STYLE.watch.chipText, borderColor: 'transparent' }}>
          Manual · updated {formatDate(meter.asOf)} · stale
        </span>
      )
    }
    return <span className={`${base} border-border text-muted-foreground`}>Manual · updated {formatDate(meter.asOf)}</span>
  }
  if (meter.source === 'vendor_api') {
    const seenAgo = formatAgo(meter.asOf, now)
    const old = meter.period === 'minute' && now - new Date(meter.asOf).getTime() > RATE_LIMIT_MINUTE_STALE_MS
    return (
      <span className={`${base} border-border text-muted-foreground`}>
        {old ? `Vendor API · last seen ${seenAgo}` : `Vendor API · seen ${seenAgo}`}
      </span>
    )
  }
  const text = { measured: 'Measured', vendor_api: 'Vendor API', build_time: 'Build time', manual: 'Manual' }[meter.source]
  return <span className={`${base} border-border text-muted-foreground`}>{text}</span>
}

function ManualEditor({ meter, onSaved }: { meter: UsageMeter; onSaved: () => void }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const input = manualInputUnit(meter)

  if (!isManualMeterId(meter.id)) return null
  const meterId = meter.id

  async function save() {
    const parsed = Number(text)
    if (text.trim() === '' || !Number.isFinite(parsed) || parsed < 0) {
      setError('Enter a number, 0 or more.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await saveManualMeter(meterId, parsed * input.factor)
      setOpen(false)
      setText('')
      onSaved()
    } catch {
      setError('Could not save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-foreground hover:bg-secondary"
      >
        Update value
      </button>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="sr-only" htmlFor={`manual-${meter.id}`}>
        New value for {meter.label}
      </label>
      <input
        id={`manual-${meter.id}`}
        type="number"
        min={0}
        step="any"
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-28 rounded-lg border border-border bg-background px-2 py-1 text-sm tabular-nums"
      />
      {input.label && <span className="text-xs text-muted-foreground">{input.label}</span>}
      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="rounded-lg px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-40"
        style={{ background: 'var(--teal-accent-strong)', color: 'oklch(0.18 0.04 250)' }}
      >
        {saving ? 'Saving…' : 'Save'}
      </button>
      <button type="button" onClick={() => setOpen(false)} className="text-xs text-muted-foreground underline">
        Cancel
      </button>
      {error && <span className="w-full text-xs" style={{ color: STATUS_STYLE.critical.chipText }}>{error}</span>}
    </div>
  )
}

function MeterRow({ meter, now, onSaved }: { meter: UsageMeter; now: number; onSaved: () => void }) {
  const status = meterStatus(meter)
  const style = status ? STATUS_STYLE[status] : null
  const fraction = meter.limit ? Math.min(1, meter.used / meter.limit) : 0
  const markerFraction = meter.markerAt && meter.limit ? Math.min(1, meter.markerAt / meter.limit) : null

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <span className="text-sm font-semibold text-foreground">{meter.label}</span>
        <span className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground tabular-nums">
            {isNeverSet(meter) ? 'Not set' : formatUsage(meter)}
          </span>
          {status && style && meter.limit ? (
            <Chip bg={style.chipBg} color={style.chipText}>
              {formatPercent(meter.used, meter.limit)} · {style.label}
            </Chip>
          ) : (
            <span className="rounded-full border border-dashed border-border px-2 py-0.5 text-xs text-muted-foreground">
              Limit not set
            </span>
          )}
        </span>
      </div>
      <div
        className="relative h-2.5 rounded-full bg-secondary"
        role="progressbar"
        aria-label={meter.label}
        aria-valuemin={0}
        aria-valuemax={meter.limit ?? undefined}
        aria-valuenow={meter.used}
      >
        <div
          className="h-2.5 rounded-full"
          style={{ width: `${fraction * 100}%`, background: style?.fill ?? 'transparent' }}
        />
        {markerFraction !== null && (
          <div
            className="absolute -top-1 h-[18px] w-0.5 rounded-sm bg-foreground"
            style={{ left: `${markerFraction * 100}%` }}
            title="App safety cap"
          />
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <SourcePill meter={meter} now={now} />
        {meter.resetsAt && <span className="text-xs text-muted-foreground">{formatReset(meter.resetsAt, meter.period)}</span>}
        {meter.source === 'manual' && <ManualEditor meter={meter} onSaved={onSaved} />}
      </div>
      {meter.note && <p className="text-xs leading-relaxed text-muted-foreground">{meter.note}</p>}
    </div>
  )
}

function VendorCard({
  config,
  meters,
  snapshot,
  now,
  onSaved,
}: {
  config: VendorCardConfig
  meters: UsageMeter[]
  snapshot: AdminUsageSnapshot
  now: number
  onSaved: () => void
}) {
  let worst: MeterStatus | null = null
  for (const m of meters) {
    const s = meterStatus(m)
    if (s && (worst === null || STATUS_RANK[s] > STATUS_RANK[worst])) worst = s
  }

  return (
    <section className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-foreground">{config.title}</h2>
          <p className="text-sm text-muted-foreground">{config.subtitle}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-foreground">{config.plan}</span>
          {worst && (
            <Chip bg={STATUS_STYLE[worst].chipBg} color={STATUS_STYLE[worst].chipText}>
              {STATUS_STYLE[worst].label}
            </Chip>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {meters.map((m) => (
          <MeterRow key={m.id} meter={m} now={now} onSaved={onSaved} />
        ))}
      </div>

      {config.vendor === 'azure' && (
        <div className="grid grid-cols-2 gap-3">
          <StatTile value={formatNumber(snapshot.extras.azureChecksThisMonth)} label="Deep checks this month" />
          <StatTile value={`${formatNumber(snapshot.extras.azureAvgClipSeconds, 1)} s`} label="Average clip" />
        </div>
      )}

      {config.footnote && (
        <p className="border-t border-border pt-1 text-xs leading-relaxed text-muted-foreground">{config.footnote}</p>
      )}
      <a
        href={config.linkHref}
        target="_blank"
        rel="noreferrer"
        className="text-sm font-semibold text-foreground underline"
      >
        {config.linkLabel} ↗
      </a>
    </section>
  )
}

function StatTile({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl bg-secondary px-3.5 py-3">
      <span className="text-lg font-semibold tabular-nums text-foreground">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}

function SummaryTile({ value, label, color }: { value: number; label: string; color?: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-2xl border border-border bg-card px-5 py-4">
      <span className="text-3xl font-semibold leading-tight tabular-nums" style={{ color }}>
        {value}
      </span>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  )
}

export default function AdminUsagePage() {
  const [snapshot, setSnapshot] = useState<AdminUsageSnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [now, setNow] = useState(() => Date.now())

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    fetchAdminUsage()
      .then((s) => {
        setSnapshot(s)
        setNow(Date.now())
      })
      .catch(() => setError('Failed to load usage. Please try again.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(load, [load])

  const meters = snapshot?.meters ?? []
  const statuses = meters.map(meterStatus)
  const criticalCount = statuses.filter((s) => s === 'critical').length
  const watchCount = statuses.filter((s) => s === 'watch').length
  const staleCount = meters.filter((m) => isStaleManual(m, now)).length

  return (
    <div className="max-w-5xl space-y-6">
      <PageHeading
        title="API usage and limits"
        subtitle="Where each vendor stands against its free-tier quota. Every meter shows when it resets."
        actions={
          <>
            {snapshot && <span className="text-sm text-muted-foreground">Updated {formatAgo(snapshot.generatedAt, now)}</span>}
            <button
              type="button"
              onClick={load}
              disabled={loading}
              className="min-h-10 rounded-xl px-4 text-sm font-semibold disabled:opacity-50"
              style={{ background: 'var(--teal-accent-strong)', color: 'oklch(0.18 0.04 250)' }}
            >
              {loading ? 'Refreshing…' : 'Refresh'}
            </button>
          </>
        }
      />

      <nav aria-label="Admin sections" className="flex flex-wrap gap-2">
        {[
          { to: '/admin', label: 'Overview', current: false },
          { to: '/admin/personas', label: 'Tutor Bot personas', current: false },
          { to: '/admin/usage', label: 'API usage', current: true },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            aria-current={item.current ? 'page' : undefined}
            className={
              item.current
                ? 'rounded-full bg-primary px-3.5 py-1.5 text-sm font-semibold text-primary-foreground'
                : 'rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-semibold text-foreground hover:bg-secondary'
            }
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {error && <p className="text-sm" style={{ color: STATUS_STYLE.critical.chipText }}>{error}</p>}
      {loading && !snapshot && <p className="text-sm text-muted-foreground">Loading...</p>}

      {snapshot && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <SummaryTile value={meters.length} label="Meters tracked" />
            <SummaryTile value={criticalCount} label={`Critical, ${USAGE_CRITICAL_AT * 100}% or more`} color={STATUS_STYLE.critical.chipText} />
            <SummaryTile value={watchCount} label={`Watch, ${USAGE_WATCH_AT * 100}% to ${USAGE_CRITICAL_AT * 100}%`} color={STATUS_STYLE.watch.chipText} />
            <SummaryTile value={staleCount} label="Manual values stale or not set" color={STATUS_STYLE.watch.chipText} />
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <span>OK under {USAGE_WATCH_AT * 100}%</span>
            <span>Watch {USAGE_WATCH_AT * 100} to {USAGE_CRITICAL_AT * 100}%</span>
            <span>Critical {USAGE_CRITICAL_AT * 100}% and above</span>
            <span>Limit not set = usage shown, limit still to be filled in</span>
            <span>Measured = read from your own database</span>
            <span>Manual = typed in, with a last-updated stamp</span>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {VENDOR_CARDS.map((config) => (
              <VendorCard
                key={config.vendor}
                config={config}
                meters={meters.filter((m) => m.vendor === config.vendor)}
                snapshot={snapshot}
                now={now}
                onSaved={load}
              />
            ))}

            <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Planned integrations</h2>
                <p className="text-sm text-muted-foreground">Not tracked yet.</p>
              </div>
              <ul className="flex flex-col gap-3">
                {PLANNED_INTEGRATIONS.map((name) => (
                  <li key={name} className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-semibold text-foreground">{name}</span>
                    <span className="rounded-full border border-dashed border-border px-2 py-0.5 text-xs text-muted-foreground">
                      Not connected yet
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </>
      )}
    </div>
  )
}
