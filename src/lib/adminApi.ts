import { supabase } from './supabase'
import type { ModelFeature, ModelId } from './models'

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

export async function fetchAdminPersonas(): Promise<AdminPersona[]> {
  const headers = await authHeader()
  const res = await fetch('/api/admin/personas', { headers })
  if (!res.ok) throw new Error('Failed to load personas')
  const body = await res.json()
  return body.personas ?? []
}

export async function createAdminPersona(input: CreatePersonaInput): Promise<AdminPersona> {
  const headers = await authHeader()
  const res = await fetch('/api/admin/personas', {
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
  const res = await fetch(`/api/admin/personas/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error('Failed to update persona')
  const body = await res.json()
  return body.persona
}

export type ModelSettings = Record<ModelFeature, ModelId>

export async function fetchModelSettings(): Promise<ModelSettings> {
  const headers = await authHeader()
  const res = await fetch('/api/admin/model-settings', { headers })
  if (!res.ok) throw new Error('Failed to load model settings')
  const body = await res.json()
  return body.settings
}

export async function updateModelSettings(settings: Partial<ModelSettings>): Promise<void> {
  const headers = await authHeader()
  const res = await fetch('/api/admin/model-settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(settings),
  })
  if (!res.ok) throw new Error('Failed to save model settings')
}
