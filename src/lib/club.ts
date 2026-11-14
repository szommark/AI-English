import { useCallback, useEffect, useState } from 'react'
import type { ClubResult } from '../data/clubCopy'
import { supabase } from './supabase'

/**
 * Club sign-up through the RPCs in supabase/migrations/20261115120000_club_registrations.sql.
 * Dates travel as 'YYYY-MM-DD' strings (Postgres date), never through Date, so no time zone
 * can shift them.
 */

export interface ClubSession {
  date: string
  semesterStart: string
  full: boolean
  /** A holiday or a Wednesday the admin closed: no club, no sign-up. */
  closed: boolean
  /** The signed-in user's booking for this Wednesday, if any. */
  mine: 'session' | 'semester' | null
}

export interface ClubSemester {
  start: string
  end: string
  sessionsLeft: number
  anyFull: boolean
  mine: boolean
}

export type ClubKind = 'session' | 'semester'

const SESSION_COUNT = 6

/** 1 for the September–January semester, 2 for February–June. */
export function semesterNumber(start: string): 1 | 2 {
  return start.slice(5, 7) === '09' ? 1 : 2
}

/** A 'YYYY-MM-DD' date as a calendar day, formatted for the UI language. */
export function formatClubDate(date: string, locale: string, options: Intl.DateTimeFormatOptions): string {
  const [y, m, d] = date.split('-').map(Number)
  return new Intl.DateTimeFormat(locale, { ...options, timeZone: 'UTC' }).format(new Date(Date.UTC(y, m - 1, d)))
}

export function useClubRegistration(userId: string | null) {
  const [sessions, setSessions] = useState<ClubSession[] | null>(null)
  const [semesters, setSemesters] = useState<ClubSemester[] | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    const [s, m] = await Promise.all([
      supabase.rpc('club_sessions', { p_count: SESSION_COUNT }),
      supabase.rpc('club_semesters'),
    ])
    if (s.error) console.warn('Club sessions not loaded', s.error.message)
    else
      setSessions(
        (s.data as { session_date: string; semester_start: string; is_full: boolean; is_closed: boolean; mine: ClubSession['mine'] }[]).map((r) => ({
          date: r.session_date,
          semesterStart: r.semester_start,
          full: r.is_full,
          closed: r.is_closed,
          mine: r.mine,
        })),
      )
    if (m.error) console.warn('Club semesters not loaded', m.error.message)
    else
      setSemesters(
        (m.data as { semester_start: string; semester_end: string; sessions_left: number; any_full: boolean; mine: boolean }[]).map((r) => ({
          start: r.semester_start,
          end: r.semester_end,
          sessionsLeft: r.sessions_left,
          anyFull: r.any_full,
          mine: r.mine,
        })),
      )
  }, [])

  // Reload when the user signs in or out: "mine" depends on who is asking.
  useEffect(() => {
    void load()
  }, [load, userId])

  const register = useCallback(
    async (kind: ClubKind, date: string): Promise<ClubResult> => {
      setBusy(true)
      try {
        const { data, error } = await supabase.rpc('club_register', { p_kind: kind, p_date: date })
        if (error) return 'error'
        await load()
        return (data as ClubResult) ?? 'error'
      } finally {
        setBusy(false)
      }
    },
    [load],
  )

  const cancel = useCallback(
    async (kind: ClubKind, date: string): Promise<boolean> => {
      setBusy(true)
      try {
        const { error } = await supabase.rpc('club_cancel', { p_kind: kind, p_date: date })
        await load()
        return !error
      } finally {
        setBusy(false)
      }
    },
    [load],
  )

  return { sessions, semesters, busy, register, cancel }
}
