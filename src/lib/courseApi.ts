import { supabase } from './supabase'
import { TeacherToolsError } from './teacherToolsApi'
import type { AwardResult } from './gamification/types'
import type {
  AdminCourse,
  Course,
  CourseVisibility,
  LibraryCourse,
  ShelfCourse,
  CourseCreateInput,
  CourseEnrollment,
  CourseItemFix,
  FlagReason,
  FlagResult,
  RoleplayLine,
  StepAnswer,
  CourseSummary,
  CourseUnit,
  ExplainLang,
  ModuleAnswers,
  ModuleAttempt,
  ModuleCompletion,
  ModuleContent,
  MyCourse,
  MyCourseSummary,
  OpenAnswer,
  OpenFeedback,
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

/** Private (own students only) or public (the library, credited by authorName). */
export async function setCourseVisibility(id: string, visibility: CourseVisibility, authorName: string): Promise<Course> {
  return (await request<{ course: Course }>(withId('course-visibility', id), json('POST', { visibility, authorName }))).course
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

export async function recordModuleAudio(moduleId: string): Promise<Course> {
  return (await request<{ course: Course }>(withId('course-module-audio', moduleId), { method: 'POST' })).course
}

/** Teacher preview: the AI's feedback on a written/spoken answer (nothing saved). */
export async function previewFeedback(moduleId: string, stepId: string, text: string): Promise<OpenFeedback> {
  return (await request<{ feedback: OpenFeedback }>(`${BASE}course-feedback`, json('POST', { moduleId, stepId, text }))).feedback
}

/** Teacher preview: the Tutor Bot's next role-play line (nothing saved). */
export async function previewRoleplay(moduleId: string, stepId: string, history: RoleplayLine[]): Promise<{ reply: string; done: boolean }> {
  return request(`${BASE}course-roleplay`, json('POST', { moduleId, stepId, history }))
}

/** Flags the AI checked in this course (opening the list marks them seen). */
export async function fetchFixes(courseId: string): Promise<CourseItemFix[]> {
  return (await request<{ fixes: CourseItemFix[] }>(withId('course-fixes', courseId))).fixes
}

/** Puts an AI-fixed exercise back the way it was. */
export async function undoFix(courseId: string, fixId: string): Promise<{ fixes: CourseItemFix[]; course: Course }> {
  return request(withId('course-fixes', courseId), json('POST', { fixId }))
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

// --- Library and admin ---------------------------------------------------------------------

export async function fetchLibrary(): Promise<LibraryCourse[]> {
  return (await request<{ courses: LibraryCourse[] }>(`${BASE}course-library`)).courses
}

/** A library course to read and preview (published units only, unless it is the caller's). */
export async function fetchLibraryCourse(id: string): Promise<{ course: Course; mine: boolean; listed: boolean }> {
  return request(withId('course-library', id))
}

export async function fetchAdminCourses(): Promise<AdminCourse[]> {
  return (await request<{ courses: AdminCourse[] }>(`${BASE}course-admin`)).courses
}

export async function updateAdminCourse(id: string, patch: { hidden?: boolean; selfEnroll?: boolean }): Promise<AdminCourse[]> {
  return (await request<{ courses: AdminCourse[] }>(withId('course-admin', id), json('PUT', patch))).courses
}

// --- Student -------------------------------------------------------------------------------

/** Public courses an admin opened for students to start themselves. */
export async function fetchCourseShelf(): Promise<ShelfCourse[]> {
  return (await request<{ courses: ShelfCourse[] }>(`${STUDENT}course-shelf`)).courses
}

/** Starts a shelf course (or returns the enrollment already there). */
export async function enrollInCourse(courseId: string): Promise<string> {
  return (await request<{ enrollmentId: string }>(`${STUDENT}course-enroll&id=${encodeURIComponent(courseId)}`, { method: 'POST' })).enrollmentId
}


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

/** The AI's feedback on a written/spoken answer, stored on the attempt (once per step). */
export async function markOpenStep(attemptId: string, stepId: string, text: string): Promise<OpenAnswer> {
  return (await request<{ answer: OpenAnswer }>(`${STUDENT}my-course-feedback&id=${encodeURIComponent(attemptId)}`, json('POST', { stepId, text }))).answer
}

export async function roleplayTurn(attemptId: string, stepId: string, history: RoleplayLine[]): Promise<{ reply: string; done: boolean }> {
  return request(`${STUDENT}my-course-roleplay&id=${encodeURIComponent(attemptId)}`, json('POST', { stepId, history }))
}

/** Flags an exercise; the AI checks it and fixes it when it is wrong. */
export async function flagStep(attemptId: string, stepId: string, reason: FlagReason, note: string, answer: StepAnswer | undefined): Promise<FlagResult> {
  return (await request<{ result: FlagResult }>(`${STUDENT}my-course-flag&id=${encodeURIComponent(attemptId)}`, json('POST', { stepId, reason, note, answer }))).result
}

export async function completeModule(attemptId: string, answers: ModuleAnswers): Promise<{ completion: ModuleCompletion; xp: AwardResult[] }> {
  return request(`${STUDENT}my-course-complete&id=${encodeURIComponent(attemptId)}`, json('POST', { answers }))
}
