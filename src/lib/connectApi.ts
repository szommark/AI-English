import { supabase } from './supabase'

async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export interface RedeemInviteCodeError extends Error {
  code: string
}

export async function redeemInviteCode(code: string): Promise<{ teacherId: string; teacherEmail: string }> {
  const headers = await authHeader()
  const res = await fetch('/api/connect?action=redeem', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify({ code }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const err = new Error(body.message ?? 'Failed to redeem invite code') as RedeemInviteCodeError
    err.code = body.error ?? 'unknown'
    throw err
  }

  return res.json()
}

export interface ConnectedTeacher {
  teacherId: string
  email: string
  connectedAt: string
}

export async function fetchConnectedTeachers(): Promise<ConnectedTeacher[]> {
  const headers = await authHeader()
  const res = await fetch('/api/connect?action=teachers', { headers })
  if (!res.ok) throw new Error('Failed to load connected teachers')
  const body = await res.json()
  return body.teachers
}

export async function disconnectLink(otherUserId: string): Promise<void> {
  const headers = await authHeader()
  const res = await fetch('/api/connect?action=disconnect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify({ otherUserId }),
  })

  if (!res.ok) throw new Error('Failed to disconnect')
}
