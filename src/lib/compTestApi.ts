import { supabase } from './supabase'
import { TeacherToolsError } from './teacherToolsApi'
import type { ExamAnswers } from './examScoring'
import type {
  CompAssignment,
  CompAssignmentDetail,
  CompGenerateInput,
  CompTest,
  CompTestInput,
  CompTestSummary,
  MyCompTest,
  MyCompTestSummary,
} from './compTests'

// Client for the comprehension tests (api/_lib/compTests.ts): the teacher's actions on
// api/teacher-tools.ts and the student's on api/gamification.ts.

async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request<T>(url: string, init: RequestInit = {}): Promise<T> {
  const headers = { ...(await authHeader()), ...(init.body ? { 'Content-Type': 'application/json' } : {}) }
  const res = await fetch(url, { ...init, headers })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new TeacherToolsError(res.status, typeof body.error === 'string' ? body.error : 'request_failed')
  }
  return res.json() as Promise<T>
}

const BASE = '/api/teacher-tools?action='
const withId = (action: string, id: string) => `${BASE}${action}&id=${encodeURIComponent(id)}`
const STUDENT = '/api/gamification?action='

// --- Teacher -------------------------------------------------------------------------------

export async function fetchCompTests(): Promise<CompTestSummary[]> {
  return (await request<{ tests: CompTestSummary[] }>(`${BASE}comp-tests`)).tests
}

export async function fetchCompTest(id: string): Promise<CompTest> {
  return (await request<{ test: CompTest }>(withId('comp-tests', id))).test
}

export async function saveCompTest(input: CompTestInput, id?: string): Promise<CompTest> {
  const body = await request<{ test: CompTest }>(id ? withId('comp-tests', id) : `${BASE}comp-tests`, {
    method: id ? 'PUT' : 'POST',
    body: JSON.stringify(input),
  })
  return body.test
}

export async function deleteCompTest(id: string): Promise<void> {
  await request(withId('comp-tests', id), { method: 'DELETE' })
}

export async function generateCompTest(input: CompGenerateInput): Promise<{ test: CompTest; remaining: number }> {
  return request(`${BASE}comp-test-generate`, { method: 'POST', body: JSON.stringify(input) })
}

export async function fetchCompAudio(id: string): Promise<{ url: string | null; uploaded: boolean }> {
  return request(withId('comp-test-audio', id))
}

export async function renderCompAudio(id: string): Promise<string> {
  return (await request<{ url: string }>(withId('comp-test-audio', id), { method: 'POST', body: JSON.stringify({ mode: 'tts' }) })).url
}

/** Uploads a teacher's own MP3 straight to Storage (signed upload URL), then attaches it. */
export async function uploadCompAudio(id: string, file: File): Promise<string> {
  const { path, token } = await request<{ path: string; token: string }>(withId('comp-test-audio', id), {
    method: 'POST',
    body: JSON.stringify({ mode: 'upload-url' }),
  })
  const { error } = await supabase.storage.from('comp-test-audio').uploadToSignedUrl(path, token, file, { contentType: 'audio/mpeg' })
  if (error) throw new TeacherToolsError(502, 'upload_failed')
  return (await request<{ url: string }>(withId('comp-test-audio', id), { method: 'POST', body: JSON.stringify({ mode: 'uploaded', path }) })).url
}

export async function deleteCompAudio(id: string): Promise<void> {
  await request(withId('comp-test-audio', id), { method: 'DELETE' })
}

export async function fetchAssignments(id: string): Promise<CompAssignment[]> {
  return (await request<{ assignments: CompAssignment[] }>(withId('comp-test-assign', id))).assignments
}

export async function assignCompTest(id: string, studentIds: string[], dueAt: string | null): Promise<CompAssignment[]> {
  const body = await request<{ assignments: CompAssignment[] }>(withId('comp-test-assign', id), {
    method: 'POST',
    body: JSON.stringify({ studentIds, dueAt }),
  })
  return body.assignments
}

export async function withdrawAssignment(id: string, assignmentId: string): Promise<CompAssignment[]> {
  const url = `${withId('comp-test-assign', id)}&assignmentId=${encodeURIComponent(assignmentId)}`
  return (await request<{ assignments: CompAssignment[] }>(url, { method: 'DELETE' })).assignments
}

export async function fetchAssignmentResult(assignmentId: string): Promise<CompAssignmentDetail> {
  const url = `${BASE}comp-test-result&assignmentId=${encodeURIComponent(assignmentId)}`
  return (await request<{ assignment: CompAssignmentDetail }>(url)).assignment
}

/** Re-marks a typed answer; null goes back to the automatic mark. */
export async function remarkAnswer(assignmentId: string, key: string, correct: boolean | null): Promise<CompAssignmentDetail> {
  const body = await request<{ assignment: CompAssignmentDetail }>(`${BASE}comp-test-result`, {
    method: 'POST',
    body: JSON.stringify({ assignmentId, key, correct }),
  })
  return body.assignment
}

// --- Student -------------------------------------------------------------------------------

export async function fetchMyTests(): Promise<MyCompTestSummary[]> {
  return (await request<{ tests: MyCompTestSummary[] }>(`${STUDENT}my-tests`)).tests
}

export async function fetchMyTest(assignmentId: string): Promise<MyCompTest> {
  return (await request<{ test: MyCompTest }>(`${STUDENT}my-test&id=${encodeURIComponent(assignmentId)}`)).test
}

export async function submitMyTest(assignmentId: string, answers: ExamAnswers): Promise<MyCompTest> {
  const body = await request<{ test: MyCompTest }>(`${STUDENT}my-test-submit&id=${encodeURIComponent(assignmentId)}`, {
    method: 'POST',
    body: JSON.stringify({ answers }),
  })
  return body.test
}
