import { supabase } from './supabase'
import { TeacherToolsError } from './teacherToolsApi'
import type { AwardResult } from './gamification/types'
import type {
  Course,
  CourseCreateInput,
  CourseEnrollment,
  CourseSummary,
  CourseUnit,
  ExplainLang,
  ModuleAnswers,
  ModuleAttempt,
  ModuleCompletion,
  ModuleContent,
  MyCourse,
  MyCourseSummary,
  PublishStatus,
  UnitInput,
} from './courses'

// Client for the mini courses (api/_lib/courses.ts): the teacher's actions on
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
const json = (method: string, body: unknown): RequestInit => ({ method, body: JSON.stringify(body) })

// --- Teacher -------------------------------------------------------------------------------

export async function fetchCourses(): Promise<CourseSummary[]> {
  return (await request<{ courses: CourseSummary[] }>(`${BASE}courses`)).courses
}

export async function fetchCourse(id: string): Promise<Course> {
  return (await request<{ course: Course }>(withId('courses', id))).course
}

export async function createCourse(input: CourseCreateInput): Promise<Course> {
  return (await request<{ course: Course }>(`${BASE}courses`, json('POST', input))).course
}

export async function saveCourseFields(id: string, fields: { title: string; topic: string; explainLang: ExplainLang }): Promise<Course> {
  return (await request<{ course: Course }>(withId('courses', id), json('PUT', fields))).course
}

export async function deleteCourse(id: string): Promise<void> {
  await request(withId('courses', id), { method: 'DELETE' })
}

export async function setCourseStatus(id: string, status: PublishStatus): Promise<Course> {
  return (await request<{ course: Course }>(withId('course-publish', id), json('POST', { status }))).course
}

export async function addUnit(courseId: string, input: UnitInput): Promise<Course> {
  return (await request<{ course: Course }>(withId('course-units', courseId), json('POST', input))).course
}

export async function updateUnit(
  unitId: string,
  patch: Partial<Pick<CourseUnit, 'title' | 'topic' | 'canDos' | 'status'>> & { move?: 'up' | 'down' },
): Promise<Course> {
  return (await request<{ course: Course }>(withId('course-units', unitId), json('PUT', patch))).course
}

export async function deleteUnit(unitId: string): Promise<Course> {
  return (await request<{ course: Course }>(withId('course-units', unitId), { method: 'DELETE' })).course
}

export async function saveModule(moduleId: string, patch: { title?: string; content?: ModuleContent }): Promise<Course> {
  return (await request<{ course: Course }>(withId('course-modules', moduleId), json('PUT', patch))).course
}

export async function generateUnitOutline(unitId: string): Promise<{ course: Course; remaining: number }> {
  return request(withId('course-blueprint', unitId), { method: 'POST' })
}

export async function generateModuleContent(moduleId: string): Promise<{ course: Course; remaining: number }> {
  return request(withId('course-module-generate', moduleId), { method: 'POST' })
}

export async function fetchEnrollments(courseId: string): Promise<CourseEnrollment[]> {
  return (await request<{ enrollments: CourseEnrollment[] }>(withId('course-assign', courseId))).enrollments
}

export async function assignCourse(courseId: string, studentIds: string[]): Promise<CourseEnrollment[]> {
  return (await request<{ enrollments: CourseEnrollment[] }>(withId('course-assign', courseId), json('POST', { studentIds }))).enrollments
}

export async function withdrawEnrollment(courseId: string, enrollmentId: string): Promise<CourseEnrollment[]> {
  return (
    await request<{ enrollments: CourseEnrollment[] }>(`${withId('course-assign', courseId)}&enrollmentId=${encodeURIComponent(enrollmentId)}`, {
      method: 'DELETE',
    })
  ).enrollments
}

// --- Student -------------------------------------------------------------------------------

export async function fetchMyCourses(): Promise<MyCourseSummary[]> {
  return (await request<{ courses: MyCourseSummary[] }>(`${STUDENT}my-courses`)).courses
}

export async function fetchMyCourse(enrollmentId: string): Promise<MyCourse> {
  return (await request<{ course: MyCourse }>(`${STUDENT}my-course&id=${encodeURIComponent(enrollmentId)}`)).course
}

export async function startModule(enrollmentId: string, moduleId: string, restart = false): Promise<ModuleAttempt> {
  return (await request<{ attempt: ModuleAttempt }>(`${STUDENT}my-course-module&id=${encodeURIComponent(enrollmentId)}`, json('POST', { moduleId, restart }))).attempt
}

/** Autosave; failures are ignored (the next step saves again). */
export async function saveModuleProgress(attemptId: string, stepIndex: number, answers: ModuleAnswers): Promise<void> {
  await request(`${STUDENT}my-course-progress&id=${encodeURIComponent(attemptId)}`, json('POST', { stepIndex, answers })).catch(() => undefined)
}

export async function completeModule(attemptId: string, answers: ModuleAnswers): Promise<{ completion: ModuleCompletion; xp: AwardResult[] }> {
  return request(`${STUDENT}my-course-complete&id=${encodeURIComponent(attemptId)}`, json('POST', { answers }))
}
