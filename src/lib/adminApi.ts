import { supabase } from './supabase'
import type { ModelFeature, ModelId } from './models'
import type { AdminUsageSnapshot, ManualMeterId } from './usageLimits'

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

export interface AdminPersona {
  id: string
  display_name: string
  description: string
  prompt_text: string
  enabled_for_students: boolean
  enabled_for_teachers: boolean
  is_builtin: boolean
  created_at: string
}

export interface CreatePersonaInput {
  displayName: string
  description?: string
  promptText: string
  enabledForStudents?: boolean
  enabledForTeachers?: boolean
}

export interface UpdatePersonaInput {
  displayName?: string
  description?: string
  promptText?: string
  enabledForStudents?: boolean
  enabledForTeachers?: boolean
}

// Personas and model settings are both served from /api/personas — see the comment
// at the top of api/personas.ts for why they're multiplexed onto one route.

export async function fetchAdminPersonas(): Promise<AdminPersona[]> {
  const headers = await authHeader()
  const res = await fetch('/api/personas?admin=1', { headers })
  if (!res.ok) throw new Error('Failed to load personas')
  const body = await res.json()
  return body.personas ?? []
}

export async function createAdminPersona(input: CreatePersonaInput): Promise<AdminPersona> {
  const headers = await authHeader()
  const res = await fetch('/api/personas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error('Failed to create persona')
  const body = await res.json()
  return body.persona
}

export async function updateAdminPersona(id: string, input: UpdatePersonaInput): Promise<AdminPersona> {
  const headers = await authHeader()
  const res = await fetch('/api/personas', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify({ id, ...input }),
  })
  if (!res.ok) throw new Error('Failed to update persona')
  const body = await res.json()
  return body.persona
}

export type ModelSettings = Record<ModelFeature, ModelId>

export async function fetchModelSettings(): Promise<ModelSettings> {
  const headers = await authHeader()
  const res = await fetch('/api/personas?resource=models', { headers })
  if (!res.ok) throw new Error('Failed to load model settings')
  const body = await res.json()
  return body.settings
}

export async function updateModelSettings(settings: Partial<ModelSettings>): Promise<void> {
  const headers = await authHeader()
  const res = await fetch('/api/personas?resource=models', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(settings),
  })
  if (!res.ok) throw new Error('Failed to save model settings')
}

// Usage snapshot and manual meter values are served from /api/admin/overview?resource=…
// (multiplexed there to stay under Vercel Hobby's function cap).

export async function fetchAdminUsage(): Promise<AdminUsageSnapshot> {
  const headers = await authHeader()
  const res = await fetch('/api/admin/overview?resource=usage', { headers })
  if (!res.ok) throw new Error('Failed to load usage')
  return res.json()
}

export async function saveManualMeter(meterId: ManualMeterId, value: number): Promise<void> {
  const headers = await authHeader()
  const res = await fetch('/api/admin/overview?resource=usage-manual', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify({ meterId, value }),
  })
  if (!res.ok) throw new Error('Failed to save value')
}
