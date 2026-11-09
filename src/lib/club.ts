import { useCallback, useEffect, useState } from 'react'
import { CLUB } from '../data/clubCopy'
import { visitorId } from './qrTracking'
import { supabase } from './supabase'

/**
 * The club's participant count: the base number plus sign-ups recorded through
 * club_signup() (supabase/migrations/20261110120000_club_signups.sql). Works signed out.
 */

const SIGNED_UP_KEY = 'aiEnglish:clubSignedUp'

function readSignedUp(): boolean {
  try {
    return window.localStorage.getItem(SIGNED_UP_KEY) === CLUB.edition
  } catch {
    return false
  }
}

export function useClubSignups() {
  /** Sign-ups so far; null until loaded (or if the count can't be read). */
  const [signups, setSignups] = useState<number | null>(null)
  const [signedUp, setSignedUp] = useState(readSignedUp)

  useEffect(() => {
    let cancelled = false
    void supabase.rpc('club_signup_count', { p_key: CLUB.edition }).then(({ data, error }) => {
      if (cancelled) return
      if (error) console.warn('Club count not loaded', error.message)
      else if (typeof data === 'number') setSignups(data)
    })
    return () => {
      cancelled = true
    }
  }, [])

  /** Records this browser's sign-up (counted once) and updates the count. */
  const signUp = useCallback(() => {
    setSignedUp(true)
    try {
      window.localStorage.setItem(SIGNED_UP_KEY, CLUB.edition)
    } catch {
      // Private mode: the sign-up still counts on the server.
    }
    void supabase.rpc('club_signup', { p_key: CLUB.edition, p_visitor: visitorId() }).then(({ data, error }) => {
      if (error) console.warn('Club sign-up not recorded', error.message)
      else if (typeof data === 'number') setSignups(data)
    })
  }, [])

  return { participants: CLUB.baseParticipants + (signups ?? 0), signedUp, signUp }
}
