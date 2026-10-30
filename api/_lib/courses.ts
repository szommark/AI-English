import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createHash } from 'node:crypto'
import { supabaseAdmin } from './supabaseAdmin.js'
import { synthesizeSsml } from './azure.js'
import { audioKeyFor as compAudioKeyFor, compScriptSsml } from './compTests.js'
import { HttpError } from './examTasks.js'
import { emailsFor } from './vocabListProgress.js'
import { isActiveStudent } from './tenseExplorerSettings.js'
import { getUserRole } from './roles.js'
import { awardXp } from './gamification.js'
import {
  FEEDBACK_CALL_TYPE,
  ROLEPLAY_CALL_TYPE,
  courseGenerationsToday,
  evaluateOpenAnswer,
  generateBlueprint,
  generateModule,
  pickRecording,
  reviewFlag,
  roleplayReply,
  type RecordingCandidate,
} from './courseGenerate.js'
import { utcDayStart } from './vocabPractice.js'
import {
  COURSE_GENERATIONS_PER_DAY,
  COURSE_TITLE_MAX,
  COURSE_TOPIC_MAX,
  CourseValidationError,
  EST_MINUTES,
  MAX_UNITS_PER_COURSE,
  OPEN_ANSWER_MAX,
  OPEN_TYPES,
  FLAGGABLE_TYPES,
  FLAG_REASONS,
  ROLEPLAY_LINE_MAX,
  isOpenAnswer,
  plainScript,
  sameStep,
  defaultModuleTitle,
  planVariants,
  sanitizeAnswers,
  sanitizeAuthorName,
  sanitizeCourseFields,
  sanitizeCreateInput,
  sanitizeModuleContent,
  sanitizeUnitInput,
  scoreModule,
  unitReady,
  type Course,
  type CourseBlueprint,
  type CourseEnrollment,
  type CourseItemFix,
  type FlagReason,
  type RoleplayLine,
  type CourseLevel,
  type CourseStep,
  type CourseModule,
  type CourseSummary,
  type CourseUnit,
  type CourseVisibility,
  type AdminCourse,
  type LibraryCourse,
  type ShelfCourse,
  type ExplainLang,
  type ModuleAnswers,
  type ModuleAttempt,
  type ModuleCompletion,
  type ModuleContent,
  type ModuleKind,
  type ModulePassage,
  type OpenAnswer,
  type ModuleVariant,
  type MyCourse,
  type MyCourseModule,
  type MyCourseNext,
  type MyCourseSummary,
  type MyCourseUnit,
  type PublishStatus,
  type ReusedAudio,
  type UnitInput,
  type UnitTemplate,
} from '../../src/lib/courses.js'
import type { AwardResult } from '../../src/lib/gamification/types.js'
import type { CompLevel, CompTestContent } from '../../src/lib/compTests.js'

// Mini courses (src/lib/courses.ts; tables in supabase/migrations/20261029120000_courses.sql).
//
// Teacher (api/teacher-tools.ts, teacher role only):
//   GET    courses                       the caller's courses, newest edit first (summaries)
//   GET    courses&id=                   one course with its units and modules
//   POST   courses                       CourseCreateInput → { course } (unit 1 and its empty modules)
//   PUT    courses&id=                   { title, topic, explainLang } → { course }
//   DELETE courses&id=                   delete (units, modules, enrollments and attempts go too)
//   POST   course-publish&id=            { status: 'published' | 'draft' } → { course }; publishing needs
//                                        every unit ready and publishes them all
//   POST   course-units&id=<courseId>    UnitInput → { course } (a new draft unit at the end; at most 4)
//   PUT    course-units&id=<unitId>      { title?, topic?, canDos?, status?, move?: 'up'|'down' } → { course }
//   DELETE course-units&id=<unitId>      → { course } (not the last unit)
//   PUT    course-modules&id=<moduleId>  { title?, content } → { course } (listening: a changed script is recorded again)
//   POST   course-module-audio&id=<moduleId>  → { course } (records a listening module's script with Azure TTS)
//   POST   course-feedback               { moduleId, stepId, text } → { feedback } (preview: AI feedback, nothing saved)
//   POST   course-roleplay               { moduleId, stepId, history } → { reply, done } (preview role-play)
//   GET    course-fixes&id=              { fixes }: flags the AI checked (marks them seen)
//   POST   course-fixes&id=              { fixId } → { fixes, course }: undo an AI fix
//   POST   course-blueprint&id=<unitId>  → { course, remaining } (AI outline of the unit)
//   POST   course-module-generate&id=<moduleId>  → { course, remaining } (AI content of one module)
//   GET    course-assign&id=             { enrollments } with each student's progress
//   POST   course-assign&id=             { studentIds } → { enrollments } (connected students; the caller's
//                                        published course or a library course)
//   DELETE course-assign&id=&enrollmentId=  withdraw (the student's progress goes too)
//   GET    course-assign lists and withdraws only the caller's own assignments.
//   POST   course-visibility&id=         { visibility: 'public'|'private', authorName } → { course }
//   GET    course-library[&id=]          the library: public, published, not hidden courses (LibraryCourse[]),
//                                        or one of them to read and preview ({ course, mine, listed })
//   course-feedback / course-roleplay also preview modules of courses in the library.
//
// Admin (api/teacher-tools.ts, admin role only):
//   GET    course-admin                  { courses } every public course (AdminCourse[])
//   PUT    course-admin&id=              { hidden?, selfEnroll? } → { courses }
// AI calls are counted together: at most COURSE_GENERATIONS_PER_DAY per UTC day (429).
//
// Student (api/gamification.ts, any signed-in user, only their own enrollments):
//   GET    my-courses                    { courses } (MyCourseSummary[])
//   GET    my-course&id=<enrollmentId>   { course } (MyCourse)
//   POST   my-course-module&id=<enrollmentId>  { moduleId, restart? } → { attempt } (resumes the open one)
//   POST   my-course-progress&id=<attemptId>   { stepIndex, answers } → { ok } (autosave)
//   POST   my-course-feedback&id=<attemptId>   { stepId, text } → { answer } AI feedback on a write/speak step,
//                                        once per step, stored on the attempt (FEEDBACK_PER_DAY per UTC day, 429)
//   POST   my-course-roleplay&id=<attemptId>   { stepId, history } → { reply, done } the Tutor Bot's next line
//   POST   my-course-flag&id=<attemptId>       { stepId, reason, note?, answer? } → { result } the AI checks the
//                                        exercise and fixes it in the course when it is wrong (FLAGS_PER_DAY)
//   POST   my-course-complete&id=<attemptId>   { answers } → { completion, xp } scored on the server
//   GET    course-shelf                  { courses } (ShelfCourse[]) public courses an admin opened for self-enroll
//   POST   course-enroll&id=<courseId>   → { enrollmentId } start one (or the enrollment already there)
//
// A course, unit, module, enrollment or attempt that doesn't exist and one that belongs to
// someone else both return 404.

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const COURSE_COLUMNS = 'id, teacher_id, title, topic, level, explain_lang, status, visibility, author_name, admin_hidden, self_enroll, access_tier, created_at, updated_at'
const UNIT_COLUMNS = 'id, course_id, position, title, topic, template, grammar_ids, can_dos, blueprint, status'
const MODULE_COLUMNS = 'id, unit_id, position, kind, variant, title, est_minutes, content, version'
const ENROLLMENT_COLUMNS = 'id, course_id, student_id, source, assigned_by, started_at, completed_at'
const ATTEMPT_COLUMNS = 'id, enrollment_id, module_id, module_version, content_snapshot, step_index, answers, score, max_score, started_at, completed_at'
const MAX_ASSIGN_AT_ONCE = 100
const AUDIO_BUCKET = 'course-audio'
const SIGNED_URL_TTL_SEC = 3 * 3600
/** AI feedback calls (written/spoken answers) a learner or teacher may make per UTC day. */
const FEEDBACK_PER_DAY = 40
/** Flags a learner may send per UTC day (each is one AI check). */
const FLAGS_PER_DAY = 20
/** Role-play lines the Tutor Bot may say to one user per UTC day. */
const ROLEPLAY_PER_DAY = 300

interface CourseRow {
  id: string
  teacher_id: string
  title: string
  topic: string
  level: CourseLevel
  explain_lang: ExplainLang
  status: PublishStatus
  visibility: CourseVisibility
  author_name: string
  admin_hidden: boolean
  self_enroll: boolean
  access_tier: string
  created_at: string
  updated_at: string
}

interface UnitRow {
  id: string
  course_id: string
  position: number
  title: string
  topic: string
  template: UnitTemplate
  grammar_ids: string[]
  can_dos: string[]
  blueprint: CourseBlueprint | null
  status: PublishStatus
}

interface ModuleRow {
  id: string
  unit_id: string
  position: number
  kind: ModuleKind
  variant: ModuleVariant | null
  title: string
  est_minutes: number
  content: ModuleContent | null
  version: number
}

interface EnrollmentRow {
  id: string
  course_id: string
  student_id: string
  source: 'assigned' | 'self'
  assigned_by: string | null
  started_at: string
  completed_at: string | null
}

interface AttemptRow {
  id: string
  enrollment_id: string
  module_id: string
  module_version: number
  content_snapshot: ModuleContent
  step_index: number
  answers: ModuleAnswers
  score: number | null
  max_score: number | null
  started_at: string
  completed_at: string | null
}

interface Tree {
  course: CourseRow
  units: UnitRow[]
  /** By unit id, in position order. */
  modules: Map<string, ModuleRow[]>
}

function uuid(v: unknown): string {
  if (typeof v !== 'string' || !UUID_RE.test(v)) throw new HttpError(404, { error: 'Not found' })
  return v
}

function badRequest(err: unknown): never {
  if (err instanceof CourseValidationError) throw new HttpError(400, { error: err.message })
  throw err
}

function validated<T>(fn: () => T): T {
  try {
    return fn()
  } catch (err) {
    badRequest(err)
  }
}

const body = (req: VercelRequest) => (req.body && typeof req.body === 'object' ? (req.body as Record<string, unknown>) : {})

// --- Loading -------------------------------------------------------------------------------

async function loadTree(course: CourseRow): Promise<Tree> {
  const { data: unitData, error: unitError } = await supabaseAdmin.from('course_units').select(UNIT_COLUMNS).eq('course_id', course.id).order('position')
  if (unitError) throw unitError
  const units = (unitData ?? []) as UnitRow[]
  const modules = new Map<string, ModuleRow[]>(units.map((u) => [u.id, []]))
  if (units.length) {
    const { data, error } = await supabaseAdmin
      .from('course_modules')
      .select(MODULE_COLUMNS)
      .in(
        'unit_id',
        units.map((u) => u.id),
      )
      .order('position')
    if (error) throw error
    for (const m of (data ?? []) as ModuleRow[]) modules.get(m.unit_id)?.push(m)
  }
  return { course, units, modules }
}

async function loadCourseRow(id: string): Promise<CourseRow | null> {
  const { data, error } = await supabaseAdmin.from('courses').select(COURSE_COLUMNS).eq('id', id).maybeSingle()
  if (error) throw error
  return (data as CourseRow | null) ?? null
}

async function loadOwnCourse(id: string, teacherId: string): Promise<CourseRow> {
  const row = await loadCourseRow(id)
  if (!row || row.teacher_id !== teacherId) throw new HttpError(404, { error: 'Not found' })
  return row
}

async function loadOwnUnit(unitId: string, teacherId: string): Promise<{ unit: UnitRow; course: CourseRow }> {
  const { data, error } = await supabaseAdmin.from('course_units').select(UNIT_COLUMNS).eq('id', unitId).maybeSingle()
  if (error) throw error
  if (!data) throw new HttpError(404, { error: 'Not found' })
  const unit = data as UnitRow
  return { unit, course: await loadOwnCourse(unit.course_id, teacherId) }
}

async function loadOwnModule(moduleId: string, teacherId: string): Promise<{ module: ModuleRow; unit: UnitRow; course: CourseRow }> {
  const { data, error } = await supabaseAdmin.from('course_modules').select(MODULE_COLUMNS).eq('id', moduleId).maybeSingle()
  if (error) throw error
  if (!data) throw new HttpError(404, { error: 'Not found' })
  const module = data as ModuleRow
  return { module, ...(await loadOwnUnit(module.unit_id, teacherId)) }
}

/**
 * Whether a teacher may look at (and preview) the course: their own, one in the library, or —
 * for an admin — any public course, hidden ones too.
 */
async function canView(course: CourseRow, userId: string): Promise<boolean> {
  if (course.teacher_id === userId || inLibrary(course)) return true
  return course.visibility === 'public' && (await getUserRole(userId)) === 'admin'
}

/** A module the teacher may preview: in their own course, or in a published unit of a course they may view. */
async function loadPreviewModule(moduleId: string, userId: string): Promise<{ module: ModuleRow; unit: UnitRow; course: CourseRow }> {
  const { data, error } = await supabaseAdmin.from('course_modules').select(MODULE_COLUMNS).eq('id', moduleId).maybeSingle()
  if (error) throw error
  if (!data) throw new HttpError(404, { error: 'Not found' })
  const module = data as ModuleRow
  const { data: unitData, error: unitError } = await supabaseAdmin.from('course_units').select(UNIT_COLUMNS).eq('id', module.unit_id).maybeSingle()
  if (unitError) throw unitError
  const unit = unitData as UnitRow | null
  const course = unit ? await loadCourseRow(unit.course_id) : null
  if (!unit || !course) throw new HttpError(404, { error: 'Not found' })
  if (course.teacher_id !== userId && (unit.status !== 'published' || !(await canView(course, userId)))) throw new HttpError(404, { error: 'Not found' })
  return { module, unit, course }
}

// --- Recordings (listening modules) -------------------------------------------------------

/**
 * What a recording depends on: a change of any of these needs a new one. The script is hashed as
 * it is read aloud (plainScript), so recordings made before Markdown was stripped count as stale
 * and are made again.
 */
export function audioKeyFor(level: CourseLevel, passage: Pick<ModulePassage, 'text' | 'style'>): string {
  return createHash('sha1').update(`${level}|${passage.style ?? ''}|${plainScript(passage.text)}`).digest('hex')
}

function audioCurrent(level: CourseLevel, m: Pick<ModuleRow, 'kind' | 'content'>): boolean {
  if (m.kind !== 'listening') return true
  const c = m.content
  return !!c?.audio && !!c.passage && c.audio.key === audioKeyFor(level, c.passage)
}

async function signedAudio(path: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin.storage.from(AUDIO_BUCKET).createSignedUrl(path, SIGNED_URL_TTL_SEC)
  if (error || !data) {
    console.warn('Could not sign course audio', path, error)
    return null
  }
  return data.signedUrl
}

/**
 * Records the script with Azure TTS at the level's speed (the comprehension tests' voices) and
 * returns the content with its audio. Old recordings stay: running attempts may still play them.
 */
async function recordModule(moduleId: string, level: CourseLevel, content: ModuleContent): Promise<ModuleContent> {
  if (!content.passage) throw new Error('no script to record')
  const key = audioKeyFor(level, content.passage)
  const path = `${moduleId}/${key.slice(0, 12)}.mp3`
  const script = { text: plainScript(content.passage.text), style: content.passage.style, sections: [] } as CompTestContent
  const audio = await synthesizeSsml(compScriptSsml(script, level as CompLevel))
  const { error } = await supabaseAdmin.storage.from(AUDIO_BUCKET).upload(path, audio, { contentType: 'audio/mpeg', upsert: true })
  if (error) throw error
  return { ...content, audio: { path, key } }
}

/** A listening module's content with a current recording, when it can be made (otherwise unchanged). */
async function withRecording(moduleId: string, level: CourseLevel, kind: ModuleKind, content: ModuleContent): Promise<ModuleContent> {
  if (kind !== 'listening' || audioCurrent(level, { kind, content })) return content
  try {
    return await recordModule(moduleId, level, content)
  } catch (err) {
    console.error('Course module TTS failed', err)
    const { audio: _stale, ...rest } = content
    return rest
  }
}

function toModule(m: ModuleRow, level: CourseLevel, urls: Map<string, string | null>): CourseModule {
  return {
    id: m.id,
    position: m.position,
    kind: m.kind,
    variant: m.variant,
    title: m.title,
    estMinutes: m.est_minutes,
    content: m.content,
    version: m.version,
    audioReady: audioCurrent(level, m),
    audioUrl: urls.get(m.id) ?? null,
  }
}

/** The teacher's view; urls (listening modules' signed recordings) only for responses. */
function toCourse(tree: Tree, urls: Map<string, string | null> = new Map()): Course {
  const { course } = tree
  return {
    id: course.id,
    title: course.title,
    topic: course.topic,
    level: course.level,
    explainLang: course.explain_lang,
    status: course.status,
    visibility: course.visibility,
    authorName: course.author_name,
    adminHidden: course.admin_hidden,
    selfEnroll: course.self_enroll,
    units: tree.units.map(
      (u): CourseUnit => ({
        id: u.id,
        position: u.position,
        title: u.title,
        topic: u.topic,
        template: u.template,
        grammarIds: u.grammar_ids ?? [],
        canDos: u.can_dos ?? [],
        // Before the outline is generated the column only holds the teacher's notes.
        blueprint: u.blueprint && Array.isArray(u.blueprint.words) ? u.blueprint : null,
        status: u.status,
        modules: (tree.modules.get(u.id) ?? []).map((m) => toModule(m, course.level, urls)),
      }),
    ),
    createdAt: course.created_at,
    updatedAt: course.updated_at,
  }
}

async function courseView(tree: Tree): Promise<Course> {
  const urls = new Map<string, string | null>()
  for (const m of [...tree.modules.values()].flat()) {
    if (m.kind === 'listening' && m.content?.audio && audioCurrent(tree.course.level, m)) urls.set(m.id, await signedAudio(m.content.audio.path))
  }
  return toCourse(tree, urls)
}

async function courseResponse(courseId: string): Promise<Course> {
  const row = await loadCourseRow(courseId)
  if (!row) throw new HttpError(404, { error: 'Not found' })
  return courseView(await loadTree(row))
}

async function touch(courseId: string) {
  const { error } = await supabaseAdmin.from('courses').update({ updated_at: new Date().toISOString() }).eq('id', courseId)
  if (error) throw error
}

// --- Access (the one place a paywall will plug in) -----------------------------------------

/**
 * Whether the student may open the course: a published course they are enrolled in (assigned,
 * or started from the shelf). Hiding a course or closing self-enroll later doesn't take it away
 * from students who started it. The paywall later checks course.access_tier here too.
 */
export function canAccessCourse(course: Pick<CourseRow, 'status'>, enrollment: EnrollmentRow | null): boolean {
  return !!enrollment && course.status === 'published'
}

/** Whether a student may start the course themselves: public, published, not hidden, admin-picked. */
export function canSelfEnroll(course: Pick<CourseRow, 'status' | 'visibility' | 'admin_hidden' | 'self_enroll'>): boolean {
  return inLibrary(course) && course.self_enroll
}

/** Whether the course is in the teachers' library: public, published and not hidden by an admin. */
export function inLibrary(course: Pick<CourseRow, 'status' | 'visibility' | 'admin_hidden'>): boolean {
  return course.visibility === 'public' && course.status === 'published' && !course.admin_hidden
}

// --- Teacher: courses ----------------------------------------------------------------------

async function insertUnit(courseId: string, position: number, input: UnitInput & { kinds: ModuleKind[] }): Promise<void> {
  const { data, error } = await supabaseAdmin
    .from('course_units')
    .insert({
      course_id: courseId,
      position,
      title: input.topic.slice(0, 160),
      topic: input.topic,
      template: input.template,
      grammar_ids: input.grammarIds,
      // The teacher's notes travel with the outline until it is generated.
      blueprint: input.notes || input.sourceText ? { ...(input.notes ? { notes: input.notes } : {}), ...(input.sourceText ? { sourceText: input.sourceText } : {}) } : null,
    })
    .select('id')
    .single()
  if (error) throw error
  const variants = planVariants(input.kinds)
  const { error: modError } = await supabaseAdmin.from('course_modules').insert(
    input.kinds.map((kind, i) => ({
      unit_id: data.id,
      position: i + 1,
      kind,
      variant: variants[i],
      title: defaultModuleTitle(kind, variants[i]),
      est_minutes: EST_MINUTES[kind],
    })),
  )
  if (modError) throw modError
}

export async function handleCourses(req: VercelRequest, res: VercelResponse, teacherId: string) {
  if (req.method === 'GET' && req.query.id === undefined) {
    const { data, error } = await supabaseAdmin
      .from('courses')
      .select('id, title, topic, level, status, visibility, updated_at')
      .eq('teacher_id', teacherId)
      .order('updated_at', { ascending: false })
    if (error) throw error
    const rows = (data ?? []) as Pick<CourseRow, 'id' | 'title' | 'topic' | 'level' | 'status' | 'visibility' | 'updated_at'>[]
    const ids = rows.map((r) => r.id)
    const units = new Map<string, string[]>()
    const moduleCount = new Map<string, number>()
    const enrolled = new Map<string, number>()
    if (ids.length) {
      const { data: unitData, error: unitError } = await supabaseAdmin.from('course_units').select('id, course_id').in('course_id', ids)
      if (unitError) throw unitError
      for (const u of unitData ?? []) units.set(u.course_id as string, [...(units.get(u.course_id as string) ?? []), u.id as string])
      const unitIds = (unitData ?? []).map((u) => u.id as string)
      if (unitIds.length) {
        const { data: modData, error: modError } = await supabaseAdmin.from('course_modules').select('unit_id').in('unit_id', unitIds)
        if (modError) throw modError
        const courseOf = new Map((unitData ?? []).map((u) => [u.id as string, u.course_id as string]))
        for (const m of modData ?? []) {
          const c = courseOf.get(m.unit_id as string) as string
          moduleCount.set(c, (moduleCount.get(c) ?? 0) + 1)
        }
      }
      const { data: enrData, error: enrError } = await supabaseAdmin.from('course_enrollments').select('course_id').in('course_id', ids)
      if (enrError) throw enrError
      for (const e of enrData ?? []) enrolled.set(e.course_id as string, (enrolled.get(e.course_id as string) ?? 0) + 1)
    }
    const courses: CourseSummary[] = rows.map((r) => ({
      id: r.id,
      title: r.title,
      topic: r.topic,
      level: r.level,
      status: r.status,
      visibility: r.visibility,
      unitCount: units.get(r.id)?.length ?? 0,
      moduleCount: moduleCount.get(r.id) ?? 0,
      enrolledCount: enrolled.get(r.id) ?? 0,
      updatedAt: r.updated_at,
    }))
    res.status(200).json({ courses })
    return
  }

  if (req.method === 'GET') {
    const row = await loadOwnCourse(uuid(req.query.id), teacherId)
    res.status(200).json({ course: await courseView(await loadTree(row)) })
    return
  }

  if (req.method === 'POST') {
    const input = validated(() => sanitizeCreateInput(req.body))
    const { data, error } = await supabaseAdmin
      .from('courses')
      .insert({ teacher_id: teacherId, title: input.title, topic: input.topic, level: input.level, explain_lang: input.explainLang })
      .select('id')
      .single()
    if (error) throw error
    try {
      await insertUnit(data.id as string, 1, input.unit)
    } catch (err) {
      await supabaseAdmin.from('courses').delete().eq('id', data.id)
      throw err
    }
    res.status(201).json({ course: await courseResponse(data.id as string) })
    return
  }

  if (req.method === 'PUT') {
    const row = await loadOwnCourse(uuid(req.query.id), teacherId)
    const fields = validated(() => sanitizeCourseFields(req.body))
    const { error } = await supabaseAdmin
      .from('courses')
      .update({ title: fields.title, topic: fields.topic, explain_lang: fields.explainLang, updated_at: new Date().toISOString() })
      .eq('id', row.id)
    if (error) throw error
    res.status(200).json({ course: await courseResponse(row.id) })
    return
  }

  if (req.method === 'DELETE') {
    const row = await loadOwnCourse(uuid(req.query.id), teacherId)
    const { error } = await supabaseAdmin.from('courses').delete().eq('id', row.id)
    if (error) throw error
    res.status(200).json({ ok: true })
    return
  }

  throw new HttpError(405, { error: 'Method not allowed' })
}

export async function handleCoursePublish(req: VercelRequest, res: VercelResponse, teacherId: string) {
  if (req.method !== 'POST') throw new HttpError(405, { error: 'Method not allowed' })
  const row = await loadOwnCourse(uuid(req.query.id), teacherId)
  const status = body(req).status
  if (status !== 'published' && status !== 'draft') throw new HttpError(400, { error: 'status must be published or draft' })
  if (status === 'published') {
    const course = toCourse(await loadTree(row))
    if (course.units.length === 0 || !course.units.every(unitReady)) throw new HttpError(409, { error: 'not_ready' })
    const { error } = await supabaseAdmin.from('course_units').update({ status: 'published' }).eq('course_id', row.id)
    if (error) throw error
  }
  const { error } = await supabaseAdmin.from('courses').update({ status, updated_at: new Date().toISOString() }).eq('id', row.id)
  if (error) throw error
  res.status(200).json({ course: await courseResponse(row.id) })
}

/** Private (own students only) or public (the library, credited by authorName). */
export async function handleCourseVisibility(req: VercelRequest, res: VercelResponse, teacherId: string) {
  if (req.method !== 'POST') throw new HttpError(405, { error: 'Method not allowed' })
  const row = await loadOwnCourse(uuid(req.query.id), teacherId)
  const b = body(req)
  if (b.visibility !== 'public' && b.visibility !== 'private') throw new HttpError(400, { error: 'visibility must be public or private' })
  const patch: Record<string, unknown> = { visibility: b.visibility, updated_at: new Date().toISOString() }
  if (b.visibility === 'public') patch.author_name = validated(() => sanitizeAuthorName(b.authorName))
  const { error } = await supabaseAdmin.from('courses').update(patch).eq('id', row.id)
  if (error) throw error
  res.status(200).json({ course: await courseResponse(row.id) })
}

// --- Teacher: units and modules ------------------------------------------------------------

/** Positions back to 1..n after a delete or move. */
async function renumberUnits(courseId: string, orderedIds: string[]) {
  for (const [i, id] of orderedIds.entries()) {
    const { error } = await supabaseAdmin.from('course_units').update({ position: i + 1 }).eq('id', id).eq('course_id', courseId)
    if (error) throw error
  }
}

export async function handleCourseUnits(req: VercelRequest, res: VercelResponse, teacherId: string) {
  if (req.method === 'POST') {
    const course = await loadOwnCourse(uuid(req.query.id), teacherId)
    const tree = await loadTree(course)
    if (tree.units.length >= MAX_UNITS_PER_COURSE) throw new HttpError(409, { error: 'max_units', limit: MAX_UNITS_PER_COURSE })
    const input = validated(() => sanitizeUnitInput(req.body, course.level))
    await insertUnit(course.id, tree.units.length + 1, input)
    await touch(course.id)
    res.status(201).json({ course: await courseResponse(course.id) })
    return
  }

  const { unit, course } = await loadOwnUnit(uuid(req.query.id), teacherId)
  const tree = await loadTree(course)

  if (req.method === 'PUT') {
    const b = body(req)
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (b.title !== undefined) {
      const title = typeof b.title === 'string' ? b.title.trim() : ''
      if (!title || title.length > COURSE_TITLE_MAX) throw new HttpError(400, { error: 'title is required' })
      patch.title = title
    }
    if (b.topic !== undefined) {
      if (typeof b.topic !== 'string' || b.topic.trim().length > COURSE_TOPIC_MAX) throw new HttpError(400, { error: 'invalid topic' })
      patch.topic = b.topic.trim()
    }
    if (b.canDos !== undefined) {
      if (!Array.isArray(b.canDos)) throw new HttpError(400, { error: 'canDos must be a list' })
      patch.can_dos = b.canDos
        .filter((x): x is string => typeof x === 'string')
        .map((x) => x.trim().slice(0, 200))
        .filter(Boolean)
        .slice(0, 3)
    }
    if (b.status !== undefined) {
      if (b.status !== 'published' && b.status !== 'draft') throw new HttpError(400, { error: 'status must be published or draft' })
      const full = toCourse(tree).units.find((u) => u.id === unit.id) as CourseUnit
      if (b.status === 'published' && !unitReady(full)) throw new HttpError(409, { error: 'not_ready' })
      if (b.status === 'draft' && course.status === 'published' && !tree.units.some((u) => u.id !== unit.id && u.status === 'published')) {
        throw new HttpError(409, { error: 'last_published_unit' })
      }
      patch.status = b.status
    }
    const { error } = await supabaseAdmin.from('course_units').update(patch).eq('id', unit.id)
    if (error) throw error
    if (b.move === 'up' || b.move === 'down') {
      const ids = tree.units.map((u) => u.id)
      const at = ids.indexOf(unit.id)
      const to = b.move === 'up' ? at - 1 : at + 1
      if (to >= 0 && to < ids.length) {
        ;[ids[at], ids[to]] = [ids[to], ids[at]]
        await renumberUnits(course.id, ids)
      }
    }
    await touch(course.id)
    res.status(200).json({ course: await courseResponse(course.id) })
    return
  }

  if (req.method === 'DELETE') {
    if (tree.units.length <= 1) throw new HttpError(409, { error: 'last_unit' })
    if (course.status === 'published' && unit.status === 'published' && !tree.units.some((u) => u.id !== unit.id && u.status === 'published')) {
      throw new HttpError(409, { error: 'last_published_unit' })
    }
    const { error } = await supabaseAdmin.from('course_units').delete().eq('id', unit.id)
    if (error) throw error
    await renumberUnits(
      course.id,
      tree.units.filter((u) => u.id !== unit.id).map((u) => u.id),
    )
    await touch(course.id)
    res.status(200).json({ course: await courseResponse(course.id) })
    return
  }

  throw new HttpError(405, { error: 'Method not allowed' })
}

export async function handleCourseModules(req: VercelRequest, res: VercelResponse, teacherId: string) {
  if (req.method !== 'PUT') throw new HttpError(405, { error: 'Method not allowed' })
  const { module, course } = await loadOwnModule(uuid(req.query.id), teacherId)
  const b = body(req)
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (b.title !== undefined) {
    const title = typeof b.title === 'string' ? b.title.trim() : ''
    if (!title || title.length > 160) throw new HttpError(400, { error: 'title is required' })
    patch.title = title
  }
  if (b.content !== undefined) {
    const { audio: _fromBrowser, ...content } = validated(() => sanitizeModuleContent(b.content))
    // An unchanged script keeps its recording; a changed one is recorded again.
    const kept = module.content?.audio && audioCurrent(course.level, { kind: module.kind, content: { ...content, audio: module.content.audio } }) ? { ...content, audio: module.content.audio } : content
    patch.content = await withRecording(module.id, course.level, module.kind, kept)
    patch.version = module.version + 1
  }
  const { error } = await supabaseAdmin.from('course_modules').update(patch).eq('id', module.id)
  if (error) throw error
  await touch(course.id)
  res.status(200).json({ course: await courseResponse(course.id) })
}

export async function handleCourseModuleAudio(req: VercelRequest, res: VercelResponse, teacherId: string) {
  if (req.method !== 'POST') throw new HttpError(405, { error: 'Method not allowed' })
  const { module, course } = await loadOwnModule(uuid(req.query.id), teacherId)
  if (module.kind !== 'listening' || !module.content?.passage) throw new HttpError(400, { error: 'Not a listening module with a script' })
  let content: ModuleContent
  try {
    content = await recordModule(module.id, course.level, module.content)
  } catch (err) {
    console.error('Course module TTS failed', err)
    throw new HttpError(502, { error: 'tts_failed' })
  }
  const { error } = await supabaseAdmin.from('course_modules').update({ content, updated_at: new Date().toISOString() }).eq('id', module.id)
  if (error) throw error
  res.status(200).json({ course: await courseResponse(course.id) })
}

/** Text of an open answer: trimmed, not empty, not too long. */
function openText(v: unknown): string {
  const text = typeof v === 'string' ? v.trim() : ''
  if (!text) throw new HttpError(400, { error: 'text is required' })
  if (text.length > OPEN_ANSWER_MAX) throw new HttpError(400, { error: `text is longer than ${OPEN_ANSWER_MAX} characters` })
  return text
}

async function checkFeedbackLimit(userId: string) {
  if ((await courseGenerationsToday(userId, new Date(), FEEDBACK_CALL_TYPE)) >= FEEDBACK_PER_DAY) throw new HttpError(429, { error: 'daily_limit', limit: FEEDBACK_PER_DAY })
}

async function feedbackFor(step: CourseStep, text: string, course: CourseRow, unit: Pick<UnitRow, 'grammar_ids'>, userId: string) {
  if (step.type !== 'write' && step.type !== 'speak' && step.type !== 'roleplay') throw new HttpError(400, { error: 'Not a writing or speaking step' })
  try {
    return await evaluateOpenAnswer(
      {
        mode: step.type,
        level: course.level,
        explainLang: course.explain_lang,
        prompt: step.type === 'roleplay' ? step.situation : step.prompt,
        targets: step.targets ?? [],
        grammarIds: unit.grammar_ids,
        text,
        ...(step.type === 'write' ? { minWords: step.minWords, maxWords: step.maxWords } : step.type === 'speak' ? { seconds: step.seconds } : { goals: step.goals }),
      },
      userId,
    )
  } catch (err) {
    console.error('Course feedback failed', err)
    throw new HttpError(502, { error: 'feedback_failed' })
  }
}

// --- Role-play turns -----------------------------------------------------------------------

/** A role-play history from the browser: alternating lines, short, at most the step's turns. */
function roleplayHistory(step: Extract<CourseStep, { type: 'roleplay' }>, raw: unknown): RoleplayLine[] {
  const lines = Array.isArray(raw) ? raw : []
  if (lines.length === 0 || lines.length > step.turns * 2 + 1) throw new HttpError(400, { error: 'invalid history' })
  const history = lines.map((l) => {
    const o = (l && typeof l === 'object' ? l : {}) as Record<string, unknown>
    const role: RoleplayLine['role'] | null = o.role === 'bot' || o.role === 'learner' ? o.role : null
    const text = typeof o.text === 'string' ? o.text.trim() : ''
    if (!role || !text || text.length > ROLEPLAY_LINE_MAX) throw new HttpError(400, { error: 'invalid history' })
    return { role, text }
  })
  if (history[history.length - 1].role !== 'learner') throw new HttpError(400, { error: 'invalid history' })
  if (history.filter((l) => l.role === 'learner').length > step.turns) throw new HttpError(409, { error: 'turns_used' })
  return history
}

async function roleplayTurn(step: CourseStep | undefined, rawHistory: unknown, level: CourseLevel, userId: string) {
  if (!step || step.type !== 'roleplay') throw new HttpError(400, { error: 'Not a role-play step' })
  const history = roleplayHistory(step, rawHistory)
  if ((await courseGenerationsToday(userId, new Date(), ROLEPLAY_CALL_TYPE)) >= ROLEPLAY_PER_DAY) throw new HttpError(429, { error: 'daily_limit', limit: ROLEPLAY_PER_DAY })
  try {
    return await roleplayReply({ level, step, history }, userId)
  } catch (err) {
    console.error('Course role-play failed', err)
    throw new HttpError(502, { error: 'roleplay_failed' })
  }
}

/** Teacher preview: the Tutor Bot's next role-play line, nothing saved. */
export async function handleCourseRoleplay(req: VercelRequest, res: VercelResponse, teacherId: string) {
  if (req.method !== 'POST') throw new HttpError(405, { error: 'Method not allowed' })
  const b = body(req)
  const { module, course } = await loadPreviewModule(uuid(b.moduleId), teacherId)
  res.status(200).json(await roleplayTurn(module.content?.steps.find((s) => s.id === b.stepId), b.history, course.level, teacherId))
}

// --- AI fixes of flagged exercises -----------------------------------------------------------

interface FixRow {
  id: string
  course_id: string
  module_id: string
  attempt_id: string | null
  step_id: string
  reason: FlagReason
  note: string
  step_before: CourseStep
  step_after: CourseStep | null
  verdict: string
  status: 'fixed' | 'kept' | 'undone'
  teacher_seen_at: string | null
  created_at: string
}

const FIX_COLUMNS = 'id, course_id, module_id, attempt_id, step_id, reason, note, step_before, step_after, verdict, status, teacher_seen_at, created_at'

async function listFixes(tree: Tree): Promise<CourseItemFix[]> {
  const { data, error } = await supabaseAdmin.from('course_item_fixes').select(FIX_COLUMNS).eq('course_id', tree.course.id).order('created_at', { ascending: false }).limit(100)
  if (error) throw error
  const where = new Map<string, { title: string; position: number }>()
  for (const u of tree.units) for (const m of tree.modules.get(u.id) ?? []) where.set(m.id, { title: m.title, position: u.position })
  return ((data ?? []) as FixRow[]).map((f) => ({
    id: f.id,
    moduleId: f.module_id,
    moduleTitle: where.get(f.module_id)?.title ?? '',
    unitPosition: where.get(f.module_id)?.position ?? 0,
    reason: f.reason,
    note: f.note,
    stepBefore: f.step_before,
    stepAfter: f.step_after,
    verdict: f.verdict,
    status: f.status,
    seen: !!f.teacher_seen_at,
    createdAt: f.created_at,
  }))
}

/** Replaces the step with the same content as `from` by `to` in a module (ids kept); false when not found. */
async function replaceStep(module: ModuleRow, from: CourseStep, to: CourseStep): Promise<boolean> {
  const steps = module.content?.steps ?? []
  const at = steps.findIndex((s) => sameStep(s, from))
  if (at < 0 || !module.content) return false
  const content = { ...module.content, steps: steps.map((s, i) => (i === at ? { ...to, id: s.id } : s)) }
  const { error } = await supabaseAdmin
    .from('course_modules')
    .update({ content, version: module.version + 1, updated_at: new Date().toISOString() })
    .eq('id', module.id)
  if (error) throw error
  module.content = content
  module.version += 1
  return true
}

/**
 * The teacher's list of flags the AI checked (opening it marks them seen); POST { fixId } puts a
 * fixed exercise back the way it was.
 */
export async function handleCourseFixes(req: VercelRequest, res: VercelResponse, teacherId: string) {
  const course = await loadOwnCourse(uuid(req.query.id), teacherId)
  const tree = await loadTree(course)
  if (req.method === 'GET') {
    const fixes = await listFixes(tree)
    if (fixes.some((f) => !f.seen)) {
      const { error } = await supabaseAdmin.from('course_item_fixes').update({ teacher_seen_at: new Date().toISOString() }).eq('course_id', course.id).is('teacher_seen_at', null)
      if (error) throw error
    }
    res.status(200).json({ fixes })
    return
  }
  if (req.method !== 'POST') throw new HttpError(405, { error: 'Method not allowed' })
  const fixId = uuid(body(req).fixId)
  const { data, error } = await supabaseAdmin.from('course_item_fixes').select(FIX_COLUMNS).eq('id', fixId).eq('course_id', course.id).maybeSingle()
  if (error) throw error
  const fix = data as FixRow | null
  if (!fix) throw new HttpError(404, { error: 'Not found' })
  if (fix.status !== 'fixed' || !fix.step_after) throw new HttpError(409, { error: 'not_fixed' })
  const module = [...tree.modules.values()].flat().find((m) => m.id === fix.module_id)
  if (!module || !(await replaceStep(module, fix.step_after, fix.step_before))) throw new HttpError(409, { error: 'changed_since' })
  const { error: upError } = await supabaseAdmin.from('course_item_fixes').update({ status: 'undone' }).eq('id', fix.id)
  if (upError) throw upError
  await touch(course.id)
  res.status(200).json({ fixes: await listFixes(await loadTree(course)), course: await courseResponse(course.id) })
}

/** Teacher preview: the AI's feedback on a written/spoken answer, nothing saved. */
export async function handleCourseFeedback(req: VercelRequest, res: VercelResponse, teacherId: string) {
  if (req.method !== 'POST') throw new HttpError(405, { error: 'Method not allowed' })
  const b = body(req)
  const { module, unit, course } = await loadPreviewModule(uuid(b.moduleId), teacherId)
  const step = module.content?.steps.find((s) => s.id === b.stepId)
  if (!step || !OPEN_TYPES.has(step.type)) throw new HttpError(400, { error: 'Not a writing or speaking step' })
  const text = openText(b.text)
  await checkFeedbackLimit(teacherId)
  res.status(200).json({ feedback: await feedbackFor(step, text, course, unit, teacherId) })
}

async function checkGenerationLimit(teacherId: string): Promise<number> {
  const used = await courseGenerationsToday(teacherId)
  if (used >= COURSE_GENERATIONS_PER_DAY) throw new HttpError(429, { error: 'daily_limit', limit: COURSE_GENERATIONS_PER_DAY })
  return used
}

/** Earlier units' words and grammar (for recycling), by position. */
function earlierUnits(tree: Tree, beforePosition: number): { topic: string; words: string[]; grammar: string[] }[] {
  return tree.units
    .filter((u) => u.position < beforePosition && u.blueprint && Array.isArray(u.blueprint.words))
    .map((u) => ({ topic: u.topic, words: (u.blueprint as CourseBlueprint).words.map((w) => w.term), grammar: u.grammar_ids }))
}

const COMP_AUDIO_BUCKET = 'comp-test-audio'

/**
 * The teacher's own recordings at the course level that still match their script: listening
 * modules of their courses (other units) and their listening comprehension tests.
 */
async function ownRecordings(teacherId: string, level: CourseLevel, exceptUnitId: string): Promise<(RecordingCandidate & { reuse: ReusedAudio })[]> {
  const out: (RecordingCandidate & { reuse: ReusedAudio })[] = []
  const { data: courses, error } = await supabaseAdmin.from('courses').select('id, level').eq('teacher_id', teacherId).eq('level', level)
  if (error) throw error
  const courseIds = (courses ?? []).map((c) => c.id as string)
  if (courseIds.length) {
    const { data: units, error: unitError } = await supabaseAdmin.from('course_units').select('id, title, topic').in('course_id', courseIds)
    if (unitError) throw unitError
    const unitById = new Map((units ?? []).filter((u) => u.id !== exceptUnitId).map((u) => [u.id as string, u]))
    if (unitById.size) {
      const { data: mods, error: modError } = await supabaseAdmin
        .from('course_modules')
        .select(MODULE_COLUMNS)
        .in('unit_id', [...unitById.keys()])
        .eq('kind', 'listening')
      if (modError) throw modError
      for (const m of (mods ?? []) as ModuleRow[]) {
        const c = m.content
        if (!c?.passage || !c.audio || !audioCurrent(level, m)) continue
        const u = unitById.get(m.unit_id) as { title: string; topic: string }
        out.push({
          id: `course:${m.id}`,
          title: c.passage.title || u.title,
          topic: u.topic,
          text: c.passage.text,
          reuse: { from: 'course', path: c.audio.path, title: c.passage.title || u.title, text: c.passage.text, ...(c.passage.style ? { style: c.passage.style } : {}) },
        })
      }
    }
  }
  const { data: tests, error: testError } = await supabaseAdmin
    .from('comp_tests')
    .select('id, title, topic, level, content, audio_path, audio_key')
    .eq('teacher_id', teacherId)
    .eq('skill', 'listening')
    .eq('level', level)
  if (testError) throw testError
  for (const t of tests ?? []) {
    const content = t.content as { text?: string; style?: 'monologue' | 'dialogue' }
    if (!t.audio_path || !content?.text) continue
    // Only a recording that still matches the script (the comprehension tests' own check).
    if (t.audio_key !== 'upload' && t.audio_key !== compAudioKeyFor({ level: t.level, content } as Parameters<typeof compAudioKeyFor>[0])) continue
    out.push({
      id: `test:${t.id}`,
      title: t.title as string,
      topic: t.topic as string,
      text: content.text,
      reuse: { from: 'comp-test', path: t.audio_path as string, title: t.title as string, text: content.text, ...(content.style ? { style: content.style } : {}) },
    })
  }
  return out
}

/** Puts a reused recording in place for the module: copied into course-audio under the module. */
async function attachReusedAudio(moduleId: string, level: CourseLevel, content: ModuleContent, reuse: ReusedAudio): Promise<ModuleContent> {
  if (!content.passage) return content
  const key = audioKeyFor(level, content.passage)
  const path = `${moduleId}/${key.slice(0, 12)}.mp3`
  try {
    if (reuse.from === 'course') {
      if (reuse.path !== path) {
        const { error } = await supabaseAdmin.storage.from(AUDIO_BUCKET).copy(reuse.path, path)
        if (error) throw error
      }
    } else {
      const { data, error } = await supabaseAdmin.storage.from(COMP_AUDIO_BUCKET).download(reuse.path)
      if (error || !data) throw error ?? new Error('no audio')
      const { error: upError } = await supabaseAdmin.storage.from(AUDIO_BUCKET).upload(path, Buffer.from(await data.arrayBuffer()), { contentType: 'audio/mpeg', upsert: true })
      if (upError) throw upError
    }
    return { ...content, audio: { path, key } }
  } catch (err) {
    console.warn('Reusing a recording failed; recording it again', err)
    return withRecording(moduleId, level, 'listening', content)
  }
}

export async function handleCourseBlueprint(req: VercelRequest, res: VercelResponse, teacherId: string) {
  if (req.method !== 'POST') throw new HttpError(405, { error: 'Method not allowed' })
  const { unit, course } = await loadOwnUnit(uuid(req.query.id), teacherId)
  const tree = await loadTree(course)
  const used = await checkGenerationLimit(teacherId)
  const pre = (unit.blueprint ?? {}) as { notes?: unknown; sourceText?: unknown }
  const notes = typeof pre.notes === 'string' ? pre.notes : ''
  const sourceText = typeof pre.sourceText === 'string' ? pre.sourceText : ''
  // A unit that starts with Listening and has no text of the teacher's may reuse one of their
  // earlier recordings on a close topic.
  const kinds = (tree.modules.get(unit.id) ?? []).map((m) => m.kind)
  const firstText = kinds.find((k) => k === 'reading' || k === 'listening')
  let reusedAudio: ReusedAudio | undefined
  if (!sourceText && firstText === 'listening') {
    try {
      const candidates = await ownRecordings(teacherId, course.level, unit.id)
      const pick = await pickRecording({ courseTopic: course.topic, unitTopic: unit.topic, level: course.level }, candidates, teacherId)
      reusedAudio = candidates.find((c) => c.id === pick)?.reuse
    } catch (err) {
      console.warn('Looking for a recording to reuse failed', err)
    }
  }
  let generated
  try {
    generated = await generateBlueprint(
      {
        level: course.level,
        courseTopic: course.topic,
        unitTopic: unit.topic,
        grammarIds: unit.grammar_ids,
        kinds: (tree.modules.get(unit.id) ?? []).map((m) => m.kind),
        notes,
        previous: earlierUnits(tree, unit.position),
        ...(sourceText || reusedAudio ? { sourceText: sourceText || reusedAudio?.text } : {}),
      },
      teacherId,
    )
  } catch (err) {
    console.error('Course outline generation failed', err)
    throw new HttpError(502, { error: 'generation_failed' })
  }
  const { error } = await supabaseAdmin
    .from('course_units')
    .update({
      title: generated.title || unit.title,
      can_dos: generated.blueprint.canDos,
      blueprint: { ...generated.blueprint, ...(notes ? { notes } : {}), ...(sourceText ? { sourceText } : {}), ...(reusedAudio ? { reusedAudio } : {}) },
      updated_at: new Date().toISOString(),
    })
    .eq('id', unit.id)
  if (error) throw error
  await touch(course.id)
  res.status(200).json({ course: await courseResponse(course.id), remaining: Math.max(0, COURSE_GENERATIONS_PER_DAY - used - 1) })
}

export async function handleCourseModuleGenerate(req: VercelRequest, res: VercelResponse, teacherId: string) {
  if (req.method !== 'POST') throw new HttpError(405, { error: 'Method not allowed' })
  const { module, unit, course } = await loadOwnModule(uuid(req.query.id), teacherId)
  if (!unit.blueprint || !Array.isArray(unit.blueprint.words)) throw new HttpError(409, { error: 'no_blueprint' })
  const tree = await loadTree(course)
  const siblings = tree.modules.get(unit.id) ?? []
  const firstText = siblings.find((m) => (m.kind === 'reading' || m.kind === 'listening') && m.variant !== 'second')
  const passage = firstText?.content?.passage ?? null
  if (module.id !== firstText?.id && module.kind !== 'vocabulary' && firstText && !passage) throw new HttpError(409, { error: 'reading_first' })
  const reuse = module.id === firstText?.id && module.kind === 'listening' ? unit.blueprint.reusedAudio : undefined
  const ownText = typeof unit.blueprint.sourceText === 'string' && unit.blueprint.sourceText ? unit.blueprint.sourceText : undefined
  const sourceText = module.id === firstText?.id ? (ownText ?? reuse?.text) : undefined
  const used = await checkGenerationLimit(teacherId)
  let content: ModuleContent
  try {
    content = await generateModule(
      {
        kind: module.kind,
        variant: module.variant,
        level: course.level,
        explainLang: course.explain_lang,
        unitTopic: unit.topic,
        grammarIds: unit.grammar_ids,
        blueprint: unit.blueprint,
        passage: module.id === firstText?.id ? null : passage,
        previousWords: earlierUnits(tree, unit.position).flatMap((u) => u.words),
        ...(sourceText ? { sourceText } : {}),
      },
      teacherId,
    )
  } catch (err) {
    if (err instanceof CourseValidationError) badRequest(err)
    console.error('Course module generation failed', err)
    throw new HttpError(502, { error: 'generation_failed' })
  }
  if (reuse && content.passage) content = await attachReusedAudio(module.id, course.level, { ...content, passage: { ...content.passage, ...(reuse.style ? { style: reuse.style } : {}) } }, reuse)
  else content = await withRecording(module.id, course.level, module.kind, content)
  const { error } = await supabaseAdmin
    .from('course_modules')
    .update({ content, version: module.version + 1, updated_at: new Date().toISOString() })
    .eq('id', module.id)
  if (error) throw error
  await touch(course.id)
  res.status(200).json({ course: await courseResponse(course.id), remaining: Math.max(0, COURSE_GENERATIONS_PER_DAY - used - 1) })
}

// --- Progress ------------------------------------------------------------------------------

interface ModuleProgress {
  done: boolean
  inProgress: boolean
  /** The best finished attempt. */
  score: number | null
  max: number | null
}

function progressByModule(attempts: AttemptRow[]): Map<string, ModuleProgress> {
  const out = new Map<string, ModuleProgress>()
  for (const a of attempts) {
    const p = out.get(a.module_id) ?? { done: false, inProgress: false, score: null, max: null }
    if (a.completed_at) {
      p.done = true
      const pct = a.max_score ? (a.score ?? 0) / a.max_score : 0
      const best = p.max ? (p.score ?? 0) / p.max : -1
      if (pct > best) {
        p.score = a.score
        p.max = a.max_score
      }
    } else {
      p.inProgress = true
    }
    out.set(a.module_id, p)
  }
  return out
}

/** The published units and their modules, in course order. */
function studentUnits(tree: Tree): { unit: UnitRow; modules: ModuleRow[] }[] {
  return tree.units.filter((u) => u.status === 'published').map((unit) => ({ unit, modules: (tree.modules.get(unit.id) ?? []).filter((m) => m.content) }))
}

async function attemptsFor(enrollmentIds: string[]): Promise<AttemptRow[]> {
  if (enrollmentIds.length === 0) return []
  const { data, error } = await supabaseAdmin
    .from('course_module_attempts')
    .select('id, enrollment_id, module_id, module_version, step_index, score, max_score, started_at, completed_at')
    .in('enrollment_id', enrollmentIds)
  if (error) throw error
  return (data ?? []) as AttemptRow[]
}

/** The student's view of the course: each module locked, open or done (linear unlocking). */
function buildMyCourse(tree: Tree, enrollment: EnrollmentRow, attempts: AttemptRow[], teacherEmail: string): MyCourse {
  const progress = progressByModule(attempts)
  let blocked = false
  let next: MyCourseNext | null = null
  let done = 0
  let total = 0
  const units: MyCourseUnit[] = studentUnits(tree).map(({ unit, modules }) => ({
    id: unit.id,
    position: unit.position,
    title: unit.title,
    topic: unit.topic,
    canDos: unit.can_dos ?? [],
    modules: modules.map((m): MyCourseModule => {
      const p = progress.get(m.id)
      total++
      let state: MyCourseModule['state'] = 'locked'
      if (p?.done) {
        state = 'done'
        done++
      } else if (!blocked) {
        state = 'open'
        blocked = true
        next = { moduleId: m.id, title: m.title, kind: m.kind, estMinutes: m.est_minutes, unitTitle: unit.title }
      }
      return { id: m.id, kind: m.kind, variant: m.variant, title: m.title, estMinutes: m.est_minutes, state, inProgress: !!p?.inProgress, score: p?.score ?? null, max: p?.max ?? null }
    }),
  }))
  return {
    enrollmentId: enrollment.id,
    title: tree.course.title,
    topic: tree.course.topic,
    level: tree.course.level,
    teacherEmail,
    authorName: tree.course.visibility === 'public' ? tree.course.author_name : '',
    source: enrollment.source,
    unitCount: units.length,
    modulesDone: done,
    modulesTotal: total,
    completedAt: total > 0 && done === total ? enrollment.completed_at : null,
    next,
    units,
  }
}

// --- Teacher: assigning --------------------------------------------------------------------

/** The teacher's own students on the course (a library course is assigned by many teachers). */
async function listEnrollments(tree: Tree, teacherId: string): Promise<CourseEnrollment[]> {
  const { data, error } = await supabaseAdmin.from('course_enrollments').select(ENROLLMENT_COLUMNS).eq('course_id', tree.course.id).eq('assigned_by', teacherId)
  if (error) throw error
  const rows = (data ?? []) as EnrollmentRow[]
  const attempts = await attemptsFor(rows.map((r) => r.id))
  const emails = await emailsFor([...new Set(rows.map((r) => r.student_id))])
  return rows
    .map((r) => {
      const mine = buildMyCourse(
        tree,
        r,
        attempts.filter((a) => a.enrollment_id === r.id),
        '',
      )
      const finished = mine.units.flatMap((u) => u.modules).filter((m) => m.state === 'done' && m.max)
      const pct = finished.length ? Math.round((finished.reduce((s, m) => s + (m.score ?? 0) / (m.max as number), 0) / finished.length) * 100) : null
      return {
        id: r.id,
        studentId: r.student_id,
        studentEmail: emails.get(r.student_id) ?? '',
        startedAt: r.started_at,
        completedAt: mine.completedAt,
        modulesDone: mine.modulesDone,
        modulesTotal: mine.modulesTotal,
        scorePct: pct,
      }
    })
    .sort((a, b) => a.studentEmail.localeCompare(b.studentEmail))
}

/** Whether the teacher has assigned the course to anyone (they keep following them after it leaves the library). */
async function hasAssigned(courseId: string, teacherId: string): Promise<boolean> {
  const { count, error } = await supabaseAdmin.from('course_enrollments').select('id', { count: 'exact', head: true }).eq('course_id', courseId).eq('assigned_by', teacherId)
  if (error) throw error
  return (count ?? 0) > 0
}

/**
 * The teacher's own course, or a library course (assign from the library). A course that has left
 * the library can still be followed and withdrawn by teachers who assigned it, not assigned again.
 */
export async function handleCourseAssign(req: VercelRequest, res: VercelResponse, teacherId: string) {
  const course = await loadCourseRow(uuid(req.query.id))
  if (!course) throw new HttpError(404, { error: 'Not found' })
  const assignable = course.teacher_id === teacherId || inLibrary(course)
  if (!assignable && !(await hasAssigned(course.id, teacherId))) throw new HttpError(404, { error: 'Not found' })
  const tree = await loadTree(course)

  if (req.method === 'GET') {
    res.status(200).json({ enrollments: await listEnrollments(tree, teacherId) })
    return
  }

  if (req.method === 'POST') {
    if (course.status !== 'published') throw new HttpError(409, { error: 'not_published' })
    if (!assignable) throw new HttpError(409, { error: 'not_in_library' })
    const b = body(req)
    const ids = Array.isArray(b.studentIds) ? [...new Set(b.studentIds.filter((x): x is string => typeof x === 'string' && UUID_RE.test(x)))] : []
    if (ids.length === 0 || ids.length > MAX_ASSIGN_AT_ONCE) throw new HttpError(400, { error: 'studentIds is required' })
    for (const id of ids) if (!(await isActiveStudent(teacherId, id))) throw new HttpError(404, { error: 'Not found' })
    const { error } = await supabaseAdmin
      .from('course_enrollments')
      .upsert(
        ids.map((studentId) => ({ course_id: course.id, student_id: studentId, source: 'assigned', assigned_by: teacherId })),
        { onConflict: 'course_id,student_id', ignoreDuplicates: true },
      )
    if (error) throw error
    // A student who had started it on their own is now this teacher's to follow.
    const { error: claimError } = await supabaseAdmin
      .from('course_enrollments')
      .update({ source: 'assigned', assigned_by: teacherId })
      .eq('course_id', course.id)
      .in('student_id', ids)
      .is('assigned_by', null)
    if (claimError) throw claimError
    res.status(200).json({ enrollments: await listEnrollments(tree, teacherId) })
    return
  }

  if (req.method === 'DELETE') {
    const enrollmentId = uuid(req.query.enrollmentId)
    const { data, error } = await supabaseAdmin.from('course_enrollments').delete().eq('id', enrollmentId).eq('course_id', course.id).eq('assigned_by', teacherId).select('id')
    if (error) throw error
    if (!data || data.length === 0) throw new HttpError(404, { error: 'Not found' })
    res.status(200).json({ enrollments: await listEnrollments(tree, teacherId) })
    return
  }

  throw new HttpError(405, { error: 'Method not allowed' })
}

// --- Library -------------------------------------------------------------------------------

type CourseOutline = LibraryCourse['units']

/** The published units of the courses and their modules (no content), by course id. */
async function outlines(courseIds: string[]): Promise<Map<string, CourseOutline>> {
  const out = new Map<string, CourseOutline>(courseIds.map((id) => [id, []]))
  if (courseIds.length === 0) return out
  const { data: unitData, error } = await supabaseAdmin.from('course_units').select('id, course_id, position, title, topic').in('course_id', courseIds).eq('status', 'published').order('position')
  if (error) throw error
  const units = (unitData ?? []) as Pick<UnitRow, 'id' | 'course_id' | 'position' | 'title' | 'topic'>[]
  const modules = new Map<string, LibraryCourse['units'][number]['modules']>(units.map((u) => [u.id, []]))
  if (units.length) {
    const { data, error: modError } = await supabaseAdmin
      .from('course_modules')
      .select('unit_id, position, kind, title, est_minutes')
      .in(
        'unit_id',
        units.map((u) => u.id),
      )
      .order('position')
    if (modError) throw modError
    for (const m of (data ?? []) as Pick<ModuleRow, 'unit_id' | 'kind' | 'title' | 'est_minutes'>[]) modules.get(m.unit_id)?.push({ kind: m.kind, title: m.title, estMinutes: m.est_minutes })
  }
  for (const u of units) out.get(u.course_id)?.push({ title: u.title, topic: u.topic, modules: modules.get(u.id) ?? [] })
  return out
}

const minutesOf = (units: CourseOutline) => units.reduce((s, u) => s + u.modules.reduce((t, m) => t + m.estMinutes, 0), 0)

/** At most this many courses in one library listing (newest first). */
const LIBRARY_MAX = 300

/**
 * GET course-library: the library (public, published, not hidden) plus courses that left it but
 * that the teacher still has students on. GET course-library&id=: one of them to read and
 * preview — published units only, without the author's outline notes, unless it is the caller's.
 */
export async function handleCourseLibrary(req: VercelRequest, res: VercelResponse, teacherId: string) {
  if (req.method !== 'GET') throw new HttpError(405, { error: 'Method not allowed' })

  if (req.query.id !== undefined) {
    const row = await loadCourseRow(uuid(req.query.id))
    if (!row || !((await canView(row, teacherId)) || (await hasAssigned(row.id, teacherId)))) throw new HttpError(404, { error: 'Not found' })
    const tree = await loadTree(row)
    const mine = row.teacher_id === teacherId
    const shown: Tree = mine ? tree : { ...tree, units: tree.units.filter((u) => u.status === 'published').map((u) => ({ ...u, blueprint: null })) }
    res.status(200).json({ course: await courseView(shown), mine, listed: inLibrary(row) })
    return
  }

  const { data, error } = await supabaseAdmin
    .from('courses')
    .select(COURSE_COLUMNS)
    .eq('visibility', 'public')
    .eq('status', 'published')
    .eq('admin_hidden', false)
    .order('updated_at', { ascending: false })
    .limit(LIBRARY_MAX)
  if (error) throw error
  const rows = (data ?? []) as CourseRow[]
  const { data: mineData, error: mineError } = await supabaseAdmin.from('course_enrollments').select('course_id').eq('assigned_by', teacherId)
  if (mineError) throw mineError
  const assigned = new Map<string, number>()
  for (const e of mineData ?? []) assigned.set(e.course_id as string, (assigned.get(e.course_id as string) ?? 0) + 1)
  // Other teachers' courses the caller has students on that are no longer in the library.
  const missing = [...assigned.keys()].filter((id) => !rows.some((r) => r.id === id))
  if (missing.length) {
    const { data: extra, error: extraError } = await supabaseAdmin.from('courses').select(COURSE_COLUMNS).in('id', missing).neq('teacher_id', teacherId).eq('status', 'published')
    if (extraError) throw extraError
    rows.push(...((extra ?? []) as CourseRow[]))
  }
  const units = await outlines(rows.map((r) => r.id))
  const courses: LibraryCourse[] = rows.map((r) => ({
    id: r.id,
    title: r.title,
    topic: r.topic,
    level: r.level,
    authorName: r.author_name,
    mine: r.teacher_id === teacherId,
    listed: inLibrary(r),
    units: units.get(r.id) ?? [],
    estMinutes: minutesOf(units.get(r.id) ?? []),
    assignedByMe: assigned.get(r.id) ?? 0,
    updatedAt: r.updated_at,
  }))
  res.status(200).json({ courses })
}

// --- Admin ---------------------------------------------------------------------------------

async function listAdminCourses(): Promise<AdminCourse[]> {
  const { data, error } = await supabaseAdmin.from('courses').select(COURSE_COLUMNS).eq('visibility', 'public').order('updated_at', { ascending: false })
  if (error) throw error
  const rows = (data ?? []) as CourseRow[]
  const assigned = new Map<string, number>()
  const self = new Map<string, number>()
  if (rows.length) {
    const { data: enr, error: enrError } = await supabaseAdmin
      .from('course_enrollments')
      .select('course_id, source')
      .in(
        'course_id',
        rows.map((r) => r.id),
      )
    if (enrError) throw enrError
    for (const e of enr ?? []) {
      const counts = e.source === 'self' ? self : assigned
      counts.set(e.course_id as string, (counts.get(e.course_id as string) ?? 0) + 1)
    }
  }
  const emails = await emailsFor([...new Set(rows.map((r) => r.teacher_id))])
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    level: r.level,
    authorName: r.author_name,
    teacherEmail: emails.get(r.teacher_id) ?? '',
    status: r.status,
    hidden: r.admin_hidden,
    selfEnroll: r.self_enroll,
    assignedCount: assigned.get(r.id) ?? 0,
    selfCount: self.get(r.id) ?? 0,
    updatedAt: r.updated_at,
  }))
}

/**
 * Admins only. GET course-admin: every public course. PUT course-admin&id= { hidden?, selfEnroll? }:
 * hidden takes it out of the library and off the shelf (students who started it keep it);
 * selfEnroll puts it on the students' "Start a course" shelf.
 */
export async function handleCourseAdmin(req: VercelRequest, res: VercelResponse, userId: string) {
  if ((await getUserRole(userId)) !== 'admin') throw new HttpError(403, { error: 'Forbidden' })
  if (req.method === 'GET') {
    res.status(200).json({ courses: await listAdminCourses() })
    return
  }
  if (req.method !== 'PUT') throw new HttpError(405, { error: 'Method not allowed' })
  const row = await loadCourseRow(uuid(req.query.id))
  if (!row || row.visibility !== 'public') throw new HttpError(404, { error: 'Not found' })
  const b = body(req)
  const patch: Record<string, boolean> = {}
  if (typeof b.hidden === 'boolean') patch.admin_hidden = b.hidden
  if (typeof b.selfEnroll === 'boolean') patch.self_enroll = b.selfEnroll
  if (Object.keys(patch).length === 0) throw new HttpError(400, { error: 'hidden or selfEnroll is required' })
  // Not updated_at: that is the author's last edit.
  const { error } = await supabaseAdmin.from('courses').update(patch).eq('id', row.id)
  if (error) throw error
  res.status(200).json({ courses: await listAdminCourses() })
}

// --- Student -------------------------------------------------------------------------------

/** GET course-shelf: the courses a student may start themselves, with their enrollment when started. */
async function handleCourseShelf(req: VercelRequest, res: VercelResponse, userId: string) {
  if (req.method !== 'GET') throw new HttpError(405, { error: 'Method not allowed' })
  const { data, error } = await supabaseAdmin
    .from('courses')
    .select(COURSE_COLUMNS)
    .eq('visibility', 'public')
    .eq('status', 'published')
    .eq('admin_hidden', false)
    .eq('self_enroll', true)
    .order('level')
    .order('updated_at', { ascending: false })
  if (error) throw error
  const rows = ((data ?? []) as CourseRow[]).filter(canSelfEnroll)
  const units = await outlines(rows.map((r) => r.id))
  const enrolled = new Map<string, string>()
  if (rows.length) {
    const { data: enr, error: enrError } = await supabaseAdmin
      .from('course_enrollments')
      .select('id, course_id')
      .eq('student_id', userId)
      .in(
        'course_id',
        rows.map((r) => r.id),
      )
    if (enrError) throw enrError
    for (const e of enr ?? []) enrolled.set(e.course_id as string, e.id as string)
  }
  const courses: ShelfCourse[] = rows
    .map((r) => {
      const outline = units.get(r.id) ?? []
      const modules = outline.flatMap((u) => u.modules)
      return {
        id: r.id,
        title: r.title,
        topic: r.topic,
        level: r.level,
        authorName: r.author_name,
        unitCount: outline.length,
        modulesTotal: modules.length,
        estMinutes: minutesOf(outline),
        kinds: [...new Set(modules.map((m) => m.kind))],
        enrollmentId: enrolled.get(r.id) ?? null,
      }
    })
    .filter((c) => c.modulesTotal > 0)
  res.status(200).json({ courses })
}

/** POST course-enroll&id=<courseId>: start a shelf course → { enrollmentId } (the existing one when already started). */
async function handleCourseEnroll(req: VercelRequest, res: VercelResponse, userId: string) {
  if (req.method !== 'POST') throw new HttpError(405, { error: 'Method not allowed' })
  const row = await loadCourseRow(uuid(req.query.id))
  if (!row) throw new HttpError(404, { error: 'Not found' })
  const { data: existing, error: existingError } = await supabaseAdmin.from('course_enrollments').select('id').eq('course_id', row.id).eq('student_id', userId).maybeSingle()
  if (existingError) throw existingError
  if (existing && canAccessCourse(row, existing as EnrollmentRow)) {
    res.status(200).json({ enrollmentId: existing.id })
    return
  }
  if (!canSelfEnroll(row)) throw new HttpError(404, { error: 'Not found' })
  const { data, error } = await supabaseAdmin
    .from('course_enrollments')
    .upsert({ course_id: row.id, student_id: userId, source: 'self', assigned_by: null }, { onConflict: 'course_id,student_id', ignoreDuplicates: true })
    .select('id')
  if (error) throw error
  let enrollmentId = (data ?? [])[0]?.id as string | undefined
  if (!enrollmentId) {
    // Lost a race with a second tap: read the row the other request made.
    const { data: again, error: againError } = await supabaseAdmin.from('course_enrollments').select('id').eq('course_id', row.id).eq('student_id', userId).single()
    if (againError) throw againError
    enrollmentId = again.id as string
  }
  res.status(200).json({ enrollmentId })
}

async function loadMyEnrollment(enrollmentId: string, studentId: string): Promise<{ enrollment: EnrollmentRow; tree: Tree }> {
  const { data, error } = await supabaseAdmin.from('course_enrollments').select(ENROLLMENT_COLUMNS).eq('id', enrollmentId).eq('student_id', studentId).maybeSingle()
  if (error) throw error
  const enrollment = (data as EnrollmentRow | null) ?? null
  if (!enrollment) throw new HttpError(404, { error: 'Not found' })
  const course = await loadCourseRow(enrollment.course_id)
  if (!course || !canAccessCourse(course, enrollment)) throw new HttpError(404, { error: 'Not found' })
  return { enrollment, tree: await loadTree(course) }
}

/** Who the course is from for the student: the teacher who assigned it (none when they started it themselves). */
function assignerOf(enrollment: EnrollmentRow, tree: Tree): string | null {
  if (enrollment.source === 'self') return null
  return enrollment.assigned_by ?? tree.course.teacher_id
}

async function teacherEmail(enrollment: EnrollmentRow, tree: Tree): Promise<string> {
  const id = assignerOf(enrollment, tree)
  return id ? ((await emailsFor([id])).get(id) ?? '') : ''
}

function summaryOf(course: MyCourse): MyCourseSummary {
  const { units: _units, ...summary } = course
  return summary
}

async function handleMyCourses(req: VercelRequest, res: VercelResponse, userId: string) {
  if (req.method !== 'GET') throw new HttpError(405, { error: 'Method not allowed' })
  const { data, error } = await supabaseAdmin.from('course_enrollments').select(ENROLLMENT_COLUMNS).eq('student_id', userId).order('started_at', { ascending: false })
  if (error) throw error
  const enrollments = (data ?? []) as EnrollmentRow[]
  const attempts = await attemptsFor(enrollments.map((e) => e.id))
  const courses: MyCourseSummary[] = []
  const emails = new Map<string, string>()
  for (const e of enrollments) {
    const course = await loadCourseRow(e.course_id)
    if (!course || !canAccessCourse(course, e)) continue
    const tree = await loadTree(course)
    const from = assignerOf(e, tree)
    if (from && !emails.has(from)) emails.set(from, await teacherEmail(e, tree))
    courses.push(
      summaryOf(
        buildMyCourse(
          tree,
          e,
          attempts.filter((a) => a.enrollment_id === e.id),
          from ? (emails.get(from) ?? '') : '',
        ),
      ),
    )
  }
  res.status(200).json({ courses })
}

async function handleMyCourse(req: VercelRequest, res: VercelResponse, userId: string) {
  if (req.method !== 'GET') throw new HttpError(405, { error: 'Method not allowed' })
  const { enrollment, tree } = await loadMyEnrollment(uuid(req.query.id), userId)
  const course = buildMyCourse(tree, enrollment, await attemptsFor([enrollment.id]), await teacherEmail(enrollment, tree))
  res.status(200).json({ course })
}

async function toAttempt(row: AttemptRow): Promise<ModuleAttempt> {
  const audio = row.content_snapshot.audio
  return {
    id: row.id,
    moduleId: row.module_id,
    stepIndex: row.step_index,
    answers: row.answers ?? {},
    content: row.content_snapshot,
    audioUrl: audio ? await signedAudio(audio.path) : null,
    completedAt: row.completed_at,
    score: row.score,
    max: row.max_score,
  }
}

async function handleMyCourseModule(req: VercelRequest, res: VercelResponse, userId: string) {
  if (req.method !== 'POST') throw new HttpError(405, { error: 'Method not allowed' })
  const { enrollment, tree } = await loadMyEnrollment(uuid(req.query.id), userId)
  const b = body(req)
  const moduleId = uuid(b.moduleId)
  const view = buildMyCourse(tree, enrollment, await attemptsFor([enrollment.id]), '')
  const target = view.units.flatMap((u) => u.modules).find((m) => m.id === moduleId)
  if (!target) throw new HttpError(404, { error: 'Not found' })
  if (target.state === 'locked') throw new HttpError(409, { error: 'locked' })

  const { data: open, error: openError } = await supabaseAdmin
    .from('course_module_attempts')
    .select(ATTEMPT_COLUMNS)
    .eq('enrollment_id', enrollment.id)
    .eq('module_id', moduleId)
    .is('completed_at', null)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (openError) throw openError
  if (open && b.restart !== true) {
    res.status(200).json({ attempt: await toAttempt(open as AttemptRow) })
    return
  }
  if (open) await supabaseAdmin.from('course_module_attempts').delete().eq('id', (open as AttemptRow).id)

  const module = [...tree.modules.values()].flat().find((m) => m.id === moduleId) as ModuleRow
  // A listening module whose recording is out of date (e.g. made before Markdown was stripped)
  // is recorded again here, once, for everyone.
  if (module.kind === 'listening' && module.content && !audioCurrent(tree.course.level, module)) {
    const content = await withRecording(module.id, tree.course.level, module.kind, module.content)
    if (content.audio) {
      const { error: saveError } = await supabaseAdmin.from('course_modules').update({ content }).eq('id', module.id)
      if (saveError) throw saveError
      module.content = content
    }
  }
  const { data, error } = await supabaseAdmin
    .from('course_module_attempts')
    .insert({ enrollment_id: enrollment.id, module_id: moduleId, module_version: module.version, content_snapshot: module.content })
    .select(ATTEMPT_COLUMNS)
    .single()
  if (error) throw error
  res.status(200).json({ attempt: await toAttempt(data as AttemptRow) })
}

async function loadMyAttempt(attemptId: string, userId: string): Promise<{ attempt: AttemptRow; enrollment: EnrollmentRow; tree: Tree }> {
  const { data, error } = await supabaseAdmin.from('course_module_attempts').select(ATTEMPT_COLUMNS).eq('id', attemptId).maybeSingle()
  if (error) throw error
  if (!data) throw new HttpError(404, { error: 'Not found' })
  const attempt = data as AttemptRow
  return { attempt, ...(await loadMyEnrollment(attempt.enrollment_id, userId)) }
}

/** The AI-marked answers already stored on the attempt (the browser can't send or change them). */
function storedOpenAnswers(attempt: AttemptRow): ModuleAnswers {
  const out: ModuleAnswers = {}
  for (const step of attempt.content_snapshot.steps) {
    const a = attempt.answers?.[step.id]
    if (OPEN_TYPES.has(step.type) && isOpenAnswer(a)) out[step.id] = a
  }
  return out
}

async function handleMyCourseFeedback(req: VercelRequest, res: VercelResponse, userId: string) {
  if (req.method !== 'POST') throw new HttpError(405, { error: 'Method not allowed' })
  const { attempt, tree } = await loadMyAttempt(uuid(req.query.id), userId)
  if (attempt.completed_at) throw new HttpError(409, { error: 'already_completed' })
  const b = body(req)
  const step = attempt.content_snapshot.steps.find((s) => s.id === b.stepId)
  if (!step || !OPEN_TYPES.has(step.type)) throw new HttpError(400, { error: 'Not a writing or speaking step' })
  if (isOpenAnswer(attempt.answers?.[step.id])) throw new HttpError(409, { error: 'already_marked' })
  const text = openText(b.text)
  await checkFeedbackLimit(userId)
  const unit = tree.units.find((u) => (tree.modules.get(u.id) ?? []).some((m) => m.id === attempt.module_id)) ?? { grammar_ids: [] }
  const answer: OpenAnswer = { text, ...(await feedbackFor(step, text, tree.course, unit, userId)) }
  const { error } = await supabaseAdmin
    .from('course_module_attempts')
    .update({ answers: { ...(attempt.answers ?? {}), [step.id]: answer }, updated_at: new Date().toISOString() })
    .eq('id', attempt.id)
    .is('completed_at', null)
  if (error) throw error
  res.status(200).json({ answer })
}

async function handleMyCourseRoleplay(req: VercelRequest, res: VercelResponse, userId: string) {
  if (req.method !== 'POST') throw new HttpError(405, { error: 'Method not allowed' })
  const { attempt, tree } = await loadMyAttempt(uuid(req.query.id), userId)
  if (attempt.completed_at) throw new HttpError(409, { error: 'already_completed' })
  const b = body(req)
  const step = attempt.content_snapshot.steps.find((s) => s.id === b.stepId)
  if (step && isOpenAnswer(attempt.answers?.[step.id])) throw new HttpError(409, { error: 'already_marked' })
  res.status(200).json(await roleplayTurn(step, b.history, tree.course.level, userId))
}

/**
 * A student flags an exercise: the AI checks it at once. When it is really wrong it is corrected
 * in the course (the same exercise, wherever it still is unchanged) and in the student's attempt,
 * and logged for the teacher; otherwise the student gets the explanation.
 */
async function handleMyCourseFlag(req: VercelRequest, res: VercelResponse, userId: string) {
  if (req.method !== 'POST') throw new HttpError(405, { error: 'Method not allowed' })
  const { attempt, tree } = await loadMyAttempt(uuid(req.query.id), userId)
  const b = body(req)
  const reason = FLAG_REASONS.find((r) => r === b.reason)
  if (!reason) throw new HttpError(400, { error: 'reason is required' })
  const note = typeof b.note === 'string' ? b.note.trim().slice(0, 500) : ''
  const snapshot = attempt.content_snapshot
  const step = snapshot.steps.find((s) => s.id === b.stepId)
  if (!step || !FLAGGABLE_TYPES.has(step.type)) throw new HttpError(400, { error: 'This step cannot be flagged' })
  const { data: dup, error: dupError } = await supabaseAdmin.from('course_item_fixes').select('id').eq('attempt_id', attempt.id).eq('step_id', step.id).maybeSingle()
  if (dupError) throw dupError
  if (dup) throw new HttpError(409, { error: 'already_flagged' })
  const { count, error: countError } = await supabaseAdmin
    .from('course_item_fixes')
    .select('id', { count: 'exact', head: true })
    .eq('flagged_by', userId)
    .gte('created_at', utcDayStart(new Date()).toISOString())
  if (countError) throw countError
  if ((count ?? 0) >= FLAGS_PER_DAY) throw new HttpError(429, { error: 'daily_limit', limit: FLAGS_PER_DAY })

  const learnerAnswer = sanitizeAnswers(snapshot, { [step.id]: b.answer })[step.id] ?? attempt.answers?.[step.id]
  let review
  try {
    review = await reviewFlag({ level: tree.course.level, explainLang: tree.course.explain_lang, step, reason, note, learnerAnswer, passage: snapshot.passage ?? null }, userId)
  } catch (err) {
    console.error('Course flag check failed', err)
    throw new HttpError(502, { error: 'check_failed' })
  }
  let fixed: CourseStep | null = null
  if (review.wrong && review.fixed) {
    try {
      const candidate = sanitizeModuleContent({ ...(snapshot.passage ? { passage: snapshot.passage } : {}), steps: [{ ...review.fixed, type: step.type }] }).steps[0]
      if (candidate.type === step.type && !sameStep(candidate, step)) fixed = { ...candidate, id: step.id }
    } catch {
      fixed = null
    }
  }
  if (fixed) {
    const module = [...tree.modules.values()].flat().find((m) => m.id === attempt.module_id)
    if (module) await replaceStep(module, step, fixed)
    if (!attempt.completed_at) {
      const { error } = await supabaseAdmin
        .from('course_module_attempts')
        .update({ content_snapshot: { ...snapshot, steps: snapshot.steps.map((s) => (s.id === step.id ? fixed : s)) }, updated_at: new Date().toISOString() })
        .eq('id', attempt.id)
      if (error) throw error
    }
  }
  const { error: logError } = await supabaseAdmin.from('course_item_fixes').insert({
    course_id: tree.course.id,
    module_id: attempt.module_id,
    attempt_id: attempt.id,
    step_id: step.id,
    flagged_by: userId,
    reason,
    note,
    step_before: step,
    step_after: fixed,
    verdict: review.explanation,
    status: fixed ? 'fixed' : 'kept',
  })
  if (logError) throw logError
  res.status(200).json({ result: { wrong: !!fixed, explanation: review.explanation, step: fixed } })
}

async function handleMyCourseProgress(req: VercelRequest, res: VercelResponse, userId: string) {
  if (req.method !== 'POST') throw new HttpError(405, { error: 'Method not allowed' })
  const { attempt } = await loadMyAttempt(uuid(req.query.id), userId)
  if (attempt.completed_at) throw new HttpError(409, { error: 'already_completed' })
  const b = body(req)
  const stepIndex = typeof b.stepIndex === 'number' && Number.isInteger(b.stepIndex) ? Math.max(0, Math.min(b.stepIndex, attempt.content_snapshot.steps.length)) : attempt.step_index
  const answers = { ...sanitizeAnswers(attempt.content_snapshot, b.answers), ...storedOpenAnswers(attempt) }
  const { error } = await supabaseAdmin
    .from('course_module_attempts')
    .update({ step_index: stepIndex, answers, updated_at: new Date().toISOString() })
    .eq('id', attempt.id)
    .is('completed_at', null)
  if (error) throw error
  res.status(200).json({ ok: true })
}

async function handleMyCourseComplete(req: VercelRequest, res: VercelResponse, userId: string) {
  if (req.method !== 'POST') throw new HttpError(405, { error: 'Method not allowed' })
  const { attempt, enrollment, tree } = await loadMyAttempt(uuid(req.query.id), userId)
  if (attempt.completed_at) throw new HttpError(409, { error: 'already_completed' })
  const answers = { ...sanitizeAnswers(attempt.content_snapshot, body(req).answers), ...storedOpenAnswers(attempt) }
  const { score, max } = scoreModule(attempt.content_snapshot, answers)

  const before = buildMyCourse(tree, enrollment, await attemptsFor([enrollment.id]), '')
  const now = new Date().toISOString()
  const { data, error } = await supabaseAdmin
    .from('course_module_attempts')
    .update({ answers, score, max_score: max, step_index: attempt.content_snapshot.steps.length, completed_at: now, updated_at: now })
    .eq('id', attempt.id)
    .is('completed_at', null)
    .select('id')
  if (error) throw error
  if (!data || data.length === 0) throw new HttpError(409, { error: 'already_completed' })

  const after = buildMyCourse(tree, enrollment, await attemptsFor([enrollment.id]), '')
  const unitOf = (view: MyCourse) => view.units.find((u) => u.modules.some((m) => m.id === attempt.module_id))
  const unitDone = (view: MyCourse) => !!unitOf(view)?.modules.every((m) => m.state === 'done')
  const unitCompleted = !unitDone(before) && unitDone(after)
  const courseCompleted = after.modulesTotal > 0 && after.modulesDone === after.modulesTotal
  if (courseCompleted !== !!enrollment.completed_at) {
    await supabaseAdmin
      .from('course_enrollments')
      .update({ completed_at: courseCompleted ? now : null })
      .eq('id', enrollment.id)
  }

  const xp: AwardResult[] = []
  const moduleXp = await awardXp({ userId, activityType: 'courses.module_complete', itemRef: attempt.module_id, performanceScore: max ? score / max : null })
  if (moduleXp) xp.push(moduleXp)
  if (unitCompleted) {
    const unitXp = await awardXp({ userId, activityType: 'courses.unit_complete', itemRef: `${enrollment.id}:${unitOf(after)?.id}` })
    if (unitXp) xp.push(unitXp)
  }

  const completion: ModuleCompletion = {
    score,
    max,
    xp: xp.reduce((s, a) => s + a.totalAwarded, 0),
    unitCompleted,
    courseCompleted,
    next: after.next,
  }
  res.status(200).json({ completion, xp })
}

const STUDENT_HANDLERS: Record<string, (req: VercelRequest, res: VercelResponse, userId: string) => Promise<void>> = {
  'my-courses': handleMyCourses,
  'my-course': handleMyCourse,
  'my-course-module': handleMyCourseModule,
  'my-course-progress': handleMyCourseProgress,
  'my-course-feedback': handleMyCourseFeedback,
  'my-course-roleplay': handleMyCourseRoleplay,
  'my-course-flag': handleMyCourseFlag,
  'my-course-complete': handleMyCourseComplete,
  'course-shelf': handleCourseShelf,
  'course-enroll': handleCourseEnroll,
}

export const COURSE_STUDENT_ACTIONS = new Set(Object.keys(STUDENT_HANDLERS))

export async function handleCourseStudentAction(action: string, req: VercelRequest, res: VercelResponse, userId: string) {
  try {
    await STUDENT_HANDLERS[action](req, res, userId)
  } catch (err) {
    if (err instanceof HttpError) {
      res.status(err.status).json(err.body)
      return
    }
    console.error(`Courses: ${action} failed`, err)
    if (!res.headersSent) res.status(500).json({ error: 'Something went wrong' })
  }
}
