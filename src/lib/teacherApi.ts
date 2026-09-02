import { supabase } from './supabase'
import type { FeedbackResult } from './types'

async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export interface RosterEntry {
  studentId: string
  email: string
  connectedAt: string
  sessionCount: number
  lastSessionAt: string | null
}

export async function fetchTeacherRoster(): Promise<RosterEntry[]> {
  const headers = await authHeader()
  const res = await fetch('/api/teacher?action=roster', { headers })
  if (!res.ok) throw new Error('Failed to load roster')
  const body = await res.json()
  return body.students
}

export interface InviteCode {
  code: string
}

export async function fetchInviteCode(): Promise<string> {
  const headers = await authHeader()
  const res = await fetch('/api/teacher?action=invite-code', { headers })
  if (!res.ok) throw new Error('Failed to load invite code')
  const body = await res.json()
  return body.code
}

export async function regenerateInviteCode(): Promise<string> {
  const headers = await authHeader()
  const res = await fetch('/api/teacher?action=invite-code', { method: 'POST', headers })
  if (!res.ok) throw new Error('Failed to regenerate invite code')
  const body = await res.json()
  return body.code
}

export interface StudentSession {
  id: string
  scenarioId: string | null
  mode: string
  feedback: FeedbackResult
  createdAt: string
}

export interface StudentMistake {
  category: string
  occurrences: number
  lastSeenAt: string
}

export interface StudentVocabularyCounts {
  new: number
  practicing: number
  mastered: number
}

export interface StudentCefrHistoryEntry {
  cefrLevel: string
  rationale: string | null
  createdAt: string
}

export interface StudentDetail {
  sessions: StudentSession[]
  mistakes: StudentMistake[]
  vocabulary: StudentVocabularyCounts
  cefrHistory: StudentCefrHistoryEntry[]
}

export class StudentDetailAccessError extends Error {}

export async function fetchStudentDetail(studentId: string): Promise<StudentDetail> {
  const headers = await authHeader()
  const res = await fetch(`/api/teacher?action=student-detail&studentId=${encodeURIComponent(studentId)}`, { headers })
  if (res.status === 403 || res.status === 404) {
    throw new StudentDetailAccessError("You don't have access to this student's data")
  }
  if (!res.ok) throw new Error('Failed to load student data')
  return res.json()
}
