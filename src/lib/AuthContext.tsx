import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { clearQrAttribution, qrSignupMetadata } from './qrTracking'

export type UserRole = 'student' | 'teacher' | 'admin'

/** Supabase's default minimum password length. */
export const MIN_PASSWORD = 6

/** Admins also have every teacher feature (same rule as api/_lib/roles.ts). */
export function hasTeacherAccess(role: UserRole | null): boolean {
  return role === 'teacher' || role === 'admin'
}

interface AuthContextValue {
  session: Session | null
  user: User | null
  loading: boolean
  role: UserRole | null
  signUp: (email: string, password: string) => Promise<{ error: string | null }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  requestPasswordReset: (email: string) => Promise<{ error: string | null }>
  updatePassword: (password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<UserRole | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const userId = session?.user.id
    if (!userId) {
      setRole(null)
      return
    }

    let cancelled = false
    supabase
      .from('profiles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setRole((data?.role as UserRole | undefined) ?? 'student')
      })

    return () => {
      cancelled = true
    }
  }, [session?.user.id])

  async function signUp(email: string, password: string) {
    const qr = qrSignupMetadata()
    const { error } = await supabase.auth.signUp({ email, password, options: qr ? { data: qr } : undefined })
    if (!error && qr) clearQrAttribution()
    return { error: error?.message ?? null }
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }

  /** Emails a link that signs the user in on /reset-password, where they choose a new password. */
  async function requestPasswordReset(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { error: error?.message ?? null }
  }

  async function updatePassword(password: string) {
    const { error } = await supabase.auth.updateUser({ password })
    return { error: error?.message ?? null }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        loading,
        role,
        signUp,
        signIn,
        requestPasswordReset,
        updatePassword,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
