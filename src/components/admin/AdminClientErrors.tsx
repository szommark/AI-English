import { useEffect, useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import {
  CLIENT_ERROR_STATUSES,
  type AdminClientError,
  type ClientErrorKind,
  type ClientErrorStatus,
} from '../../lib/feedback'
import { fetchClientErrors, updateClientErrorStatus } from '../../lib/feedbackApi'

const KIND_LABEL: Record<ClientErrorKind, string> = {
  error: 'Uncaught error',
  rejection: 'Unhandled rejection',
  render: 'Page crash',
}

const STATUS_LABEL: Record<ClientErrorStatus, string> = {
  open: 'Open',
  resolved: 'Resolved',
  ignored: 'Ignored',
}

const STATUS_STYLE: Record<ClientErrorStatus, string> = {
  open: 'bg-red-50 text-red-700 border-red-200',
  resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  ignored: 'bg-slate-50 text-slate-400 border-slate-200',
}

type Filter = ClientErrorStatus | 'all'

function ago(iso: string): string {
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min} min ago`
  const h = Math.round(min / 60)
  if (h < 48) return `${h} h ago`
  return `${Math.round(h / 24)} days ago`
}

function ErrorCard({
  item,
  expanded,
  onToggle,
  onStatus,
}: {
  item: AdminClientError
  expanded: boolean
  onToggle: () => void
  onStatus: (status: ClientErrorStatus) => void
}) {
  return (
    <li className="rounded-xl border border-slate-200 bg-white">
      <button type="button" onClick={onToggle} aria-expanded={expanded} className="flex w-full items-start gap-3 px-4 py-3 text-left">
        <div className="w-16 shrink-0 text-right">
          <p className="text-lg font-semibold leading-tight text-slate-800">{item.occurrences7d}</p>
          <p className="text-xs text-slate-400">7 days</p>
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[item.status]}`}>
              {STATUS_LABEL[item.status]}
            </span>
            <span className="rounded-full border border-slate-200 px-2 py-0.5 text-xs text-slate-600">{KIND_LABEL[item.kind]}</span>
          </div>
          <p className={`font-mono text-sm text-slate-800 ${expanded ? 'break-words' : 'truncate'}`}>{item.message}</p>
          <p className="text-xs text-slate-500">
            {item.users7d} {item.users7d === 1 ? 'user' : 'users'} this week · {item.occurrences} total · last {ago(item.lastSeenAt)}
            {item.lastPagePath && (
              <>
                {' '}
                · <span className="font-mono">{item.lastPagePath}</span>
              </>
            )}
          </p>
        </div>
        <ChevronDown className={`mt-1 h-4 w-4 shrink-0 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {expanded && (
        <div className="space-y-4 border-t border-slate-100 px-4 py-4">
          <dl className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-1 text-sm">
            <dt className="text-slate-500">First seen</dt>
            <dd className="text-slate-700">{new Date(item.firstSeenAt).toLocaleString()}</dd>
            <dt className="text-slate-500">Last seen</dt>
            <dd className="text-slate-700">{new Date(item.lastSeenAt).toLocaleString()}</dd>
            <dt className="text-slate-500">Users affected</dt>
            <dd className="text-slate-700">
              {item.users} signed-in ({item.users7d} this week); signed-out visitors only add to the count
            </dd>
            <dt className="text-slate-500">Last browser</dt>
            <dd className="text-slate-700">{item.lastBrowser ?? '?'}</dd>
            <dt className="text-slate-500">Last app version</dt>
            <dd className="font-mono text-slate-700">{item.lastAppVersion ?? '?'}</dd>
          </dl>

          {item.stack && (
            <div>
              <h4 className="text-xs font-medium uppercase tracking-wide text-slate-400">Stack</h4>
              <pre className="mt-1 max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-slate-50 p-2 text-xs text-slate-700">
                {item.stack}
              </pre>
            </div>
          )}

          <div className="flex flex-wrap items-end gap-4 border-t border-slate-100 pt-4">
            <label className="text-sm">
              <span className="mb-1 block text-slate-500">Status</span>
              <select
                value={item.status}
                onChange={(e) => onStatus(e.target.value as ClientErrorStatus)}
                className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm"
              >
                {CLIENT_ERROR_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </label>
            <p className="pb-2 text-xs text-slate-400">A resolved error that happens again reopens itself.</p>
          </div>
        </div>
      )}
    </li>
  )
}

/** Admin Errors tab: crashes recorded automatically by src/lib/clientErrors.ts, busiest first. */
export default function AdminClientErrors() {
  const [items, setItems] = useState<AdminClientError[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>('open')
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    fetchClientErrors()
      .then(setItems)
      .catch(() => setError('Failed to load the errors. Please try again.'))
      .finally(() => setLoading(false))
  }, [])

  async function setStatus(fingerprint: string, status: ClientErrorStatus) {
    setError(null)
    try {
      const updated = await updateClientErrorStatus(fingerprint, status)
      setItems((list) => list.map((e) => (e.fingerprint === fingerprint ? { ...e, ...updated } : e)))
    } catch {
      setError('Failed to save the change. Please try again.')
    }
  }

  const counts = useMemo(() => {
    const c = { open: 0, resolved: 0, ignored: 0, all: items.length }
    for (const e of items) c[e.status]++
    return c
  }, [items])

  const visible = items.filter((e) => filter === 'all' || e.status === filter)
  const filters: Filter[] = ['open', 'resolved', 'ignored', 'all']

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        Uncaught errors, unhandled promise rejections and page crashes, recorded automatically from every visitor. The
        same error is counted, not repeated.
      </p>

      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter errors by status">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
            className={`rounded-lg border px-3 py-1 text-sm ${
              filter === f ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {f === 'all' ? 'All' : STATUS_LABEL[f]} <span className="opacity-70">{counts[f]}</span>
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : visible.length === 0 ? (
        <p className="text-sm text-slate-500">{items.length === 0 ? 'No errors recorded yet.' : 'No errors with this status.'}</p>
      ) : (
        <ul className="space-y-2">
          {visible.map((e) => (
            <ErrorCard
              key={e.fingerprint}
              item={e}
              expanded={expanded === e.fingerprint}
              onToggle={() => setExpanded(expanded === e.fingerprint ? null : e.fingerprint)}
              onStatus={(s) => setStatus(e.fingerprint, s)}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
