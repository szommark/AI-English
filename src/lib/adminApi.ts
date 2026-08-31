import { supabase } from './supabase'

async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export interface AdminConnection {
  teacherEmail: string
  studentEmail: string
  status: string
  createdAt: string
  revokedAt: string | null
}

export interface AdminFailedAttempt {
  attemptedByEmail: string
  attemptedCode: string
  reason: string
  createdAt: string
}

export interface AdminOverview {
  connections: AdminConnection[]
  failedAttempts: AdminFailedAttempt[]
}

export async function fetchAdminOverview(): Promise<AdminOverview> {
  const headers = await authHeader()
  const res = await fetch('/api/admin/overview', { headers })
  if (!res.ok) throw new Error('Failed to load admin overview')
  return res.json()
}
