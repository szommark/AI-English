import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Camera, ChevronDown, TriangleAlert } from 'lucide-react'
import {
  FEEDBACK_COUNT_CHANGED_EVENT,
  FEEDBACK_KINDS,
  FEEDBACK_LIMITS,
  FEEDBACK_STATUSES,
  type AdminFeedbackReport,
  type FeedbackKind,
  type FeedbackLogEntry,
  type FeedbackStatus,
} from '../lib/feedback'
import { fetchFeedbackReports, updateFeedbackReport } from '../lib/feedbackApi'

const KIND_LABEL: Record<FeedbackKind, string> = {
  bug: "Doesn't work",
  display: 'Looks wrong',
  content: 'Wrong content',
  idea: 'Idea',
}

const KIND_STYLE: Record<FeedbackKind, string> = {
  bug: 'bg-red-50 text-red-700 border-red-200',
  display: 'bg-amber-50 text-amber-700 border-amber-200',
  content: 'bg-violet-50 text-violet-700 border-violet-200',
  idea: 'bg-sky-50 text-sky-700 border-sky-200',
}

const STATUS_LABEL: Record<FeedbackStatus, string> = {
  new: 'New',
  seen: 'Seen',
  in_progress: 'In progress',
  fixed: 'Fixed',
  wont_fix: "Won't fix",
}

const STATUS_STYLE: Record<FeedbackStatus, string> = {
  new: 'bg-red-600 text-white border-red-600',
  seen: 'bg-slate-100 text-slate-600 border-slate-200',
  in_progress: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  fixed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  wont_fix: 'bg-slate-50 text-slate-400 border-slate-200',
}

type StatusFilter = 'open' | 'all' | FeedbackStatus
const OPEN: FeedbackStatus[] = ['new', 'seen', 'in_progress']

function matchesStatus(r: AdminFeedbackReport, filter: StatusFilter): boolean {
  if (filter === 'all') return true
  if (filter === 'open') return OPEN.includes(r.status)
  return r.status === filter
}

function LogList({ title, entries }: { title: string; entries: FeedbackLogEntry[] | undefined }) {
  if (!entries?.length) return null
  return (
    <div>
      <h4 className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {title} ({entries.length})
      </h4>
      <ul className="mt-1 max-h-48 space-y-1 overflow-y-auto rounded-lg bg-slate-50 p-2 font-mono text-xs text-slate-700">
        {entries.map((e, i) => (
          <li key={i} className="break-words">
            <span className="text-slate-400">{e.at ? new Date(e.at).toLocaleTimeString() : ''}</span> {e.message}
          </li>
        ))}
      </ul>
    </div>
  )
}

function ReportCard({
  report,
  expanded,
  onToggle,
  onUpdate,
}: {
  report: AdminFeedbackReport
  expanded: boolean
  onToggle: () => void
  onUpdate: (patch: { status?: FeedbackStatus; adminNote?: string }) => Promise<void>
}) {
  const [note, setNote] = useState(report.adminNote ?? '')
  const [saving, setSaving] = useState(false)
  const c = report.context
  const errorCount = c.errors?.length ?? 0
  const noteChanged = note.trim() !== (report.adminNote ?? '')

  async function saveNote() {
    setSaving(true)
    try {
      await onUpdate({ adminNote: note })
    } finally {
      setSaving(false)
    }
  }

  return (
    <li className="rounded-xl border border-slate-200 bg-white">
      <button type="button" onClick={onToggle} aria-expanded={expanded} className="flex w-full items-start gap-3 px-4 py-3 text-left">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[report.status]}`}>
              {STATUS_LABEL[report.status]}
            </span>
            <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${KIND_STYLE[report.kind]}`}>
              {KIND_LABEL[report.kind]}
            </span>
            {report.screenshotUrl && <Camera className="h-4 w-4 text-slate-400" aria-label="Has screenshot" />}
            {errorCount > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-amber-600" title="Console errors captured">
                <TriangleAlert className="h-3.5 w-3.5" aria-hidden="true" />
                {errorCount}
              </span>
            )}
          </div>
          <p className={`text-sm text-slate-800 ${expanded ? 'whitespace-pre-wrap' : 'truncate'}`}>{report.description}</p>
          <p className="text-xs text-slate-500">
            {report.email} · {report.role} · <span className="font-mono">{report.pagePath}</span> ·{' '}
            {new Date(report.createdAt).toLocaleString()}
          </p>
        </div>
        <ChevronDown className={`mt-1 h-4 w-4 shrink-0 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {expanded && (
        <div className="space-y-4 border-t border-slate-100 px-4 py-4">
          {report.expected && (
            <div>
              <h4 className="text-xs font-medium uppercase tracking-wide text-slate-400">
                {report.kind === 'content' ? 'Should be' : 'Expected'}
              </h4>
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{report.expected}</p>
            </div>
          )}

          {report.screenshotUrl && (
            <a href={report.screenshotUrl} target="_blank" rel="noreferrer" className="inline-block">
              <img src={report.screenshotUrl} alt="Screenshot attached to the report" className="max-h-72 rounded-lg border border-slate-200" />
            </a>
          )}

          <dl className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-1 text-sm">
            <dt className="text-slate-500">Page</dt>
            <dd className="font-mono text-slate-700">
              <a href={report.pagePath} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">
                {report.pagePath}
              </a>
            </dd>
            <dt className="text-slate-500">Browser</dt>
            <dd className="text-slate-700">
              {c.browser ?? '?'} · {c.os ?? '?'}
            </dd>
            <dt className="text-slate-500">Window</dt>
            <dd className="text-slate-700">
              {c.viewport ? `${c.viewport.width} × ${c.viewport.height} @${c.viewport.dpr}x` : '?'}
            </dd>
            <dt className="text-slate-500">UI language</dt>
            <dd className="text-slate-700">{c.uiLang ?? '?'}</dd>
            <dt className="text-slate-500">Microphone</dt>
            <dd className="text-slate-700">{c.micPermission ?? '?'}</dd>
            <dt className="text-slate-500">App version</dt>
            <dd className="font-mono text-slate-700">{c.appVersion ?? '?'}</dd>
            <dt className="text-slate-500">Online</dt>
            <dd className="text-slate-700">{c.online === false ? 'No (offline)' : 'Yes'}</dd>
            <dt className="text-slate-500">User agent</dt>
            <dd className="break-all text-xs text-slate-500">{c.userAgent ?? '?'}</dd>
          </dl>

          <LogList title="Console errors" entries={c.errors} />
          <LogList title="Failed requests" entries={c.requests} />

          <div className="flex flex-wrap items-end gap-4 border-t border-slate-100 pt-4">
            <label className="text-sm">
              <span className="mb-1 block text-slate-500">Status</span>
              <select
                value={report.status}
                onChange={(e) => onUpdate({ status: e.target.value as FeedbackStatus })}
                className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm"
              >
                {FEEDBACK_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </label>
            {report.statusChangedAt && (
              <p className="pb-2 text-xs text-slate-400">Status changed {new Date(report.statusChangedAt).toLocaleString()}</p>
            )}
          </div>

          <label className="block text-sm">
            <span className="mb-1 block text-slate-500">Admin note (only admins see this)</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={FEEDBACK_LIMITS.adminNote}
              rows={2}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          {noteChanged && (
            <button
              type="button"
              onClick={saveNote}
              disabled={saving}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save note'}
            </button>
          )}
        </div>
      )}
    </li>
  )
}

export default function AdminFeedbackPage() {
  const [reports, setReports] = useState<AdminFeedbackReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('open')
  const [kindFilter, setKindFilter] = useState<FeedbackKind | 'all'>('all')
  const [query, setQuery] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    fetchFeedbackReports()
      .then(setReports)
      .catch(() => setError('Failed to load the reports. Please try again.'))
      .finally(() => setLoading(false))
  }, [])

  async function update(id: string, patch: { status?: FeedbackStatus; adminNote?: string }) {
    setError(null)
    try {
      const updated = await updateFeedbackReport({ id, ...patch })
      setReports((list) => list.map((r) => (r.id === id ? updated : r)))
      if (patch.status) window.dispatchEvent(new Event(FEEDBACK_COUNT_CHANGED_EVENT))
    } catch {
      setError('Failed to save the change. Please try again.')
    }
  }

  function toggle(report: AdminFeedbackReport) {
    const opening = expandedId !== report.id
    setExpandedId(opening ? report.id : null)
    // Opening a new report marks it as seen.
    if (opening && report.status === 'new') update(report.id, { status: 'seen' })
  }

  const counts = useMemo(() => {
    const byStatus = Object.fromEntries(FEEDBACK_STATUSES.map((s) => [s, 0])) as Record<FeedbackStatus, number>
    for (const r of reports) byStatus[r.status]++
    return { ...byStatus, open: OPEN.reduce((n, s) => n + byStatus[s], 0), all: reports.length }
  }, [reports])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return reports.filter(
      (r) =>
        matchesStatus(r, statusFilter) &&
        (kindFilter === 'all' || r.kind === kindFilter) &&
        (!q || [r.description, r.expected ?? '', r.email, r.pagePath].some((s) => s.toLowerCase().includes(q))),
    )
  }, [reports, statusFilter, kindFilter, query])

  const filters: { value: StatusFilter; label: string }[] = [
    { value: 'open', label: 'Open' },
    ...FEEDBACK_STATUSES.map((s) => ({ value: s, label: STATUS_LABEL[s] })),
    { value: 'all', label: 'All' },
  ]

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-800">Problem reports</h1>
        <Link to="/admin" className="text-sm text-indigo-600 hover:underline">
          Admin overview
        </Link>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by status">
          {filters.map((f) => (
            <button
              key={f.value}
              type="button"
              aria-pressed={statusFilter === f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`rounded-lg border px-3 py-1 text-sm ${
                statusFilter === f.value
                  ? 'border-indigo-600 bg-indigo-600 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {f.label} <span className="opacity-70">{counts[f.value]}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={kindFilter}
            onChange={(e) => setKindFilter(e.target.value as FeedbackKind | 'all')}
            aria-label="Filter by type"
            className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm"
          >
            <option value="all">All types</option>
            {FEEDBACK_KINDS.map((k) => (
              <option key={k} value={k}>
                {KIND_LABEL[k]}
              </option>
            ))}
          </select>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search text, email or page"
            className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : visible.length === 0 ? (
        <p className="text-sm text-slate-500">{reports.length === 0 ? 'No reports yet.' : 'No reports match these filters.'}</p>
      ) : (
        <ul className="space-y-2">
          {visible.map((r) => (
            <ReportCard
              key={r.id}
              report={r}
              expanded={expandedId === r.id}
              onToggle={() => toggle(r)}
              onUpdate={(patch) => update(r.id, patch)}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
