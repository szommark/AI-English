import { useEffect, useState } from 'react'
import { Coffee } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface Attendee {
  session_date: string
  email: string
  kind: 'session' | 'semester'
}

/** Seats per Wednesday, counting the two hosts (see club_session_count in the migration). */
const CAPACITY = 16
const HOSTS = 2
const SESSIONS = 6

/**
 * Admin overview: who comes to the next club Wednesdays (single and semester sign-ups),
 * from admin_club_attendees() in supabase/migrations/20261115120000_club_registrations.sql.
 */
export default function AdminClubCard() {
  const [rows, setRows] = useState<Attendee[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase.rpc('admin_club_attendees', { p_count: SESSIONS }).then(({ data, error: err }) => {
      if (err) setError("Couldn't load the club sign-ups.")
      else setRows(data as Attendee[])
    })
  }, [])

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
          {[...byDate.entries()].map(([date, people]) => (
            <div key={date} className="rounded-lg border border-slate-200 p-3">
              <p className="text-sm font-semibold text-slate-800">
                {date} · {people.length + HOSTS} / {CAPACITY} (incl. {HOSTS} hosts)
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
    </section>
  )
}
