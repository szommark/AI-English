import { supabase } from './supabase'
import { TeacherToolsError } from './teacherToolsApi'
import type {
  ExamField,
  ExamTask,
  ExamTaskInput,
  ExamTaskReview,
  ExamTaskSummary,
  ItemReview,
  ListeningFormat,
  ListeningTaskContent,
  ReviewerStatus,
  ScriptStyle,
  TaskLevel,
  TaskRecommendation,
  TeacherPool,
  TeacherRef,
} from './examTasks'

// Client for the exam task maker actions of api/teacher-tools.ts (api/_lib/examTasks.ts).

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

export async function fetchExamTasks(): Promise<{ owned: ExamTaskSummary[]; assigned: ExamTaskSummary[] }> {
  return request(`${BASE}exam-tasks`)
}

export interface ExamTaskDetail {
  task: ExamTask
  myReview: ExamTaskReview | null
  reviewers?: ReviewerStatus[]
  reviews?: ExamTaskReview[]
}

export async function fetchExamTask(id: string): Promise<ExamTaskDetail> {
  return request(withId('exam-tasks', id))
}

export async function saveExamTask(input: ExamTaskInput, id?: string): Promise<ExamTask> {
  const body = await request<{ task: ExamTask }>(id ? withId('exam-tasks', id) : `${BASE}exam-tasks`, {
    method: id ? 'PUT' : 'POST',
    body: JSON.stringify(input),
  })
  return body.task
}

/** Publishes the current revision for review (owner); only then can it be sent to testers. */
export async function publishExamTask(id: string): Promise<ExamTask> {
  const body = await request<{ task: ExamTask }>(withId('exam-task-publish', id), { method: 'POST' })
  return body.task
}

export async function deleteExamTask(id: string): Promise<void> {
  await request(withId('exam-tasks', id), { method: 'DELETE' })
}

export interface TaskDraft {
  title: string
  content: ListeningTaskContent
  sourceRef?: string
}

export async function generateExamTask(input: {
  level: TaskLevel
  format: ListeningFormat
  field: ExamField
  style: ScriptStyle | 'infer'
  sourceText?: string
  sourceUrl?: string
  avoid?: string
  ignoreEnvironment?: boolean
}): Promise<{ draft: TaskDraft; remaining: number }> {
  return request(`${BASE}exam-task-generate`, { method: 'POST', body: JSON.stringify(input) })
}

export async function reviseExamTask(input: {
  level: TaskLevel
  content: ListeningTaskContent
  problems: string[]
  keepScript: boolean
  teacherNote?: string
}): Promise<{ draft: TaskDraft; remaining: number }> {
  return request(`${BASE}exam-task-revise`, { method: 'POST', body: JSON.stringify(input) })
}

export async function fetchTaskAudio(id: string): Promise<{ url: string | null; uploaded: boolean }> {
  return request(withId('exam-task-audio', id))
}

export async function renderTaskAudio(id: string): Promise<string> {
  const body = await request<{ url: string }>(withId('exam-task-audio', id), { method: 'POST', body: JSON.stringify({ mode: 'tts' }) })
  return body.url
}

/** Uploads a teacher's own MP3 straight to Storage (signed upload URL), then attaches it. */
export async function uploadTaskAudio(id: string, file: File): Promise<string> {
  const { path, token } = await request<{ path: string; token: string }>(withId('exam-task-audio', id), {
    method: 'POST',
    body: JSON.stringify({ mode: 'upload-url' }),
  })
  const { error } = await supabase.storage.from('exam-task-audio').uploadToSignedUrl(path, token, file, { contentType: 'audio/mpeg' })
  if (error) throw new TeacherToolsError(502, 'upload_failed')
  const body = await request<{ url: string }>(withId('exam-task-audio', id), { method: 'POST', body: JSON.stringify({ mode: 'uploaded', path }) })
  return body.url
}

export async function deleteTaskAudio(id: string): Promise<void> {
  await request(withId('exam-task-audio', id), { method: 'DELETE' })
}

export async function shareExamTask(id: string, reviewerIds: string[]): Promise<string[]> {
  const body = await request<{ reviewerIds: string[] }>(withId('exam-task-share', id), { method: 'PUT', body: JSON.stringify({ reviewerIds }) })
  return body.reviewerIds
}

export async function saveTaskReview(
  id: string,
  input: {
    answers: Record<string, boolean | string>
    verdicts: Record<string, ItemReview>
    recommendation: TaskRecommendation | null
    overallNote: string
    submit: boolean
  },
): Promise<ExamTaskReview> {
  const body = await request<{ review: ExamTaskReview }>(withId('exam-task-review', id), { method: 'PUT', body: JSON.stringify(input) })
  return body.review
}

export async function fetchTeachers(): Promise<TeacherRef[]> {
  const body = await request<{ teachers: TeacherRef[] }>(`${BASE}teachers`)
  return body.teachers
}

export async function fetchPools(): Promise<TeacherPool[]> {
  const body = await request<{ pools: TeacherPool[] }>(`${BASE}teacher-pools`)
  return body.pools
}

export async function savePool(input: { name: string; memberIds: string[] }, id?: string): Promise<TeacherPool> {
  const body = await request<{ pool: TeacherPool }>(id ? withId('teacher-pools', id) : `${BASE}teacher-pools`, {
    method: id ? 'PUT' : 'POST',
    body: JSON.stringify(input),
  })
  return body.pool
}

export async function deletePool(id: string): Promise<void> {
  await request(withId('teacher-pools', id), { method: 'DELETE' })
}
