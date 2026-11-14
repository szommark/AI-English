import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Coffee } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface Attendee {
  session_date: string
  email: string
  kind: 'session' | 'semester'
}

interface ClosedDate {
  closed_date: string
  note: string | null
}

/** Seats per Wednesday, counting the two hosts (see club_session_count in the migration). */
const CAPACITY = 16
const HOSTS = 2
const SESSIONS = 6

/**
 * Admin overview: who comes to the next club Wednesdays, and the Wednesdays without a club.
 * RPCs from supabase/migrations/20261115120000_club_registrations.sql and
 * 20261116120000_club_closed_dates.sql. Public holidays are skipped without being listed here.
 */
export default function AdminClubCard() {
  const [rows, setRows] = useState<Attendee[] | null>(null)
  const [closed, setClosed] = useState<ClosedDate[]>([])
  const [error, setError] = useState<string | null>(null)
  const [date, setDate] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  /** Single sign-ups removed by the last closing: the admin should let these people know. */
  const [removed, setRemoved] = useState<{ date: string; emails: string[] } | null>(null)

  const load = useCallback(async () => {
    const [a, c] = await Promise.all([
      supabase.rpc('admin_club_attendees', { p_count: SESSIONS }),
      supabase.rpc('admin_club_closed_dates'),
    ])
    if (a.error || c.error) setError("Couldn't load the club sign-ups.")
    else {
      setError(null)
      setRows(a.data as Attendee[])
      setClosed(c.data as ClosedDate[])
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function handleClose(e: FormEvent) {
    e.preventDefault()
    if (!date) return
    setBusy(true)
    setError(null)
    const { data, error: err } = await supabase.rpc('admin_club_close_date', { p_date: date, p_note: note })
    if (err) setError(err.message.includes('not a club Wednesday') ? 'That day is not a club Wednesday (September–June).' : "Couldn't close that day.")
    else {
      setRemoved({ date, emails: (data as { email: string }[]).map((r) => r.email) })
      setDate('')
      setNote('')
      await load()
    }
    setBusy(false)
  }

  async function handleReopen(day: string) {
    setBusy(true)
    const { error: err } = await supabase.rpc('admin_club_open_date', { p_date: day })
    if (err) setError("Couldn't reopen that day.")
    await load()
    setBusy(false)
  }

  // Only Wednesdays with someone signed up come back from the RPC.
  const byDate = new Map<string, Attendee[]>()
  for (const r of rows ?? []) byDate.set(r.session_date, [...(byDate.get(r.session_date) ?? []), r])

  return (
    <section className="space-y-3">
      <h2 className="flex items-center gap-2 font-medium text-slate-700">
        <Coffee className="h-4 w-4" aria-hidden="true" />
        English club sign-ups
      </h2>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {rows === null && !error ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : byDate.size === 0 ? (
        <p className="text-sm text-slate-500">No sign-ups for the next {SESSIONS} Wednesdays yet.</p>
      ) : (
        <div className="space-y-4">
          {[...byDate.entries()].map(([day, people]) => (
            <div key={day} className="rounded-lg border border-slate-200 p-3">
              <p className="text-sm font-semibold text-slate-800">
                {day} · {people.length + HOSTS} / {CAPACITY} (incl. {HOSTS} hosts)
              </p>
              <ul className="mt-2 space-y-1 text-sm text-slate-600">
                {people.map((p) => (
                  <li key={`${p.email}-${p.kind}`}>
                    {p.email}
                    {p.kind === 'semester' && <span className="ml-2 text-xs text-slate-400">semester</span>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-lg border border-slate-200 p-3">
        <h3 className="text-sm font-semibold text-slate-800">Wednesdays without a club</h3>
        <p className="mt-1 text-xs text-slate-500">
          Public holidays (1 Jan, 15 Mar, 1 May, 23 Oct, 1 Nov, 24–26 Dec) are skipped automatically. Close any other
          Wednesday here, e.g. the Christmas break; its single sign-ups are removed.
        </p>
        {closed.length > 0 && (
          <ul className="mt-3 space-y-1 text-sm text-slate-700">
            {closed.map((c) => (
              <li key={c.closed_date} className="flex items-center gap-3">
                <span>
                  {c.closed_date}
                  {c.note && <span className="ml-2 text-slate-500">{c.note}</span>}
                </span>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handleReopen(c.closed_date)}
                  className="text-xs text-indigo-600 hover:underline disabled:opacity-50"
                >
                  Reopen
                </button>
              </li>
            ))}
          </ul>
        )}
        <form onSubmit={handleClose} className="mt-3 flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1 text-sm"
            aria-label="Wednesday to close"
          />
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={80}
            placeholder="Note (optional)"
            className="rounded-md border border-slate-300 px-2 py-1 text-sm"
          />
          <button
            type="submit"
            disabled={busy || !date}
            className="rounded-md bg-slate-800 px-3 py-1 text-sm text-white hover:bg-slate-700 disabled:opacity-50"
          >
            Close this Wednesday
          </button>
        </form>
        {removed && (
          <p className="mt-2 text-sm text-slate-700">
            {removed.date} closed.{' '}
            {removed.emails.length === 0
              ? 'Nobody had signed up for that day alone.'
              : `Let these people know, their sign-up was removed: ${removed.emails.join(', ')}`}
          </p>
        )}
      </div>
    </section>
  )
}
