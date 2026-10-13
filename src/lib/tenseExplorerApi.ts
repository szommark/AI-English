import { supabase } from './supabase'
import type { TenseId } from './tenseEngine/index.ts'
import type { TenseExplorerPolicy, TenseExplorerSetting } from './tenseExplorerPolicy'

async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/** The caller's Tense Explorer policy from their teachers; null when none has set one. */
export async function fetchMyTensePolicy(): Promise<TenseExplorerPolicy | null> {
  const res = await fetch('/api/grammar-lesson?action=tense-explorer-policy', { headers: await authHeader() })
  if (!res.ok) throw new Error('Failed to load the Tense Explorer settings')
  const body = await res.json()
  return body.policy ?? null
}

export interface TeacherTenseSettings {
  classSetting: TenseExplorerSetting | null
  /** Only when asked for a student: their override, null when they use the class setting. */
  studentSetting?: TenseExplorerSetting | null
}

const studentQuery = (studentId?: string) => (studentId ? `&studentId=${encodeURIComponent(studentId)}` : '')

export async function fetchTeacherTenseSettings(studentId?: string): Promise<TeacherTenseSettings> {
  const res = await fetch(`/api/teacher-tools?action=tense-explorer${studentQuery(studentId)}`, { headers: await authHeader() })
  if (!res.ok) throw new Error('Failed to load the Tense Explorer settings')
  return res.json()
}

export async function saveTeacherTenseSetting(input: {
  tenses: TenseId[]
  allowCustomize: boolean
  studentId?: string
}): Promise<TenseExplorerSetting> {
  const res = await fetch('/api/teacher-tools?action=tense-explorer', {
    method: 'PUT',
    headers: { ...(await authHeader()), 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error('Failed to save the Tense Explorer settings')
  const body = await res.json()
  return body.setting
}

export async function deleteTeacherTenseSetting(studentId?: string): Promise<void> {
  const res = await fetch(`/api/teacher-tools?action=tense-explorer${studentQuery(studentId)}`, {
    method: 'DELETE',
    headers: await authHeader(),
  })
  if (!res.ok) throw new Error('Failed to remove the Tense Explorer settings')
}
