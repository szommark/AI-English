import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabaseAdmin } from './supabaseAdmin.js'
import { HttpError } from './examTasks.js'
import { emailsFor } from './vocabListProgress.js'
import { isActiveStudent } from './tenseExplorerSettings.js'
import { awardXp } from './gamification.js'
import { courseGenerationsToday, generateBlueprint, generateModule } from './courseGenerate.js'
import {
  COURSE_GENERATIONS_PER_DAY,
  COURSE_TITLE_MAX,
  COURSE_TOPIC_MAX,
  CourseValidationError,
  EST_MINUTES,
  MAX_UNITS_PER_COURSE,
  defaultModuleTitle,
  planVariants,
  sanitizeAnswers,
  sanitizeCourseFields,
  sanitizeCreateInput,
  sanitizeModuleContent,
  sanitizeUnitInput,
  scoreModule,
  unitReady,
  type Course,
  type CourseBlueprint,
  type CourseEnrollment,
  type CourseLevel,
  type CourseModule,
  type CourseSummary,
  type CourseUnit,
  type ExplainLang,
  type ModuleAnswers,
  type ModuleAttempt,
  type ModuleCompletion,
  type ModuleContent,
  type ModuleKind,
  type ModuleVariant,
  type MyCourse,
  type MyCourseModule,
  type MyCourseNext,
  type MyCourseSummary,
  type MyCourseUnit,
  type PublishStatus,
  type UnitInput,
  type UnitTemplate,
} from '../../src/lib/courses.js'
import type { AwardResult } from '../../src/lib/gamification/types.js'

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
//   PUT    course-modules&id=<moduleId>  { title?, content } → { course }
//   POST   course-blueprint&id=<unitId>  → { course, remaining } (AI outline of the unit)
//   POST   course-module-generate&id=<moduleId>  → { course, remaining } (AI content of one module)
//   GET    course-assign&id=             { enrollments } with each student's progress
//   POST   course-assign&id=             { studentIds } → { enrollments } (connected students, published course)
//   DELETE course-assign&id=&enrollmentId=  withdraw (the student's progress goes too)
// AI calls are counted together: at most COURSE_GENERATIONS_PER_DAY per UTC day (429).
//
// Student (api/gamification.ts, any signed-in user, only their own enrollments):
//   GET    my-courses                    { courses } (MyCourseSummary[])
//   GET    my-course&id=<enrollmentId>   { course } (MyCourse)
//   POST   my-course-module&id=<enrollmentId>  { moduleId, restart? } → { attempt } (resumes the open one)
//   POST   my-course-progress&id=<attemptId>   { stepIndex, answers } → { ok } (autosave)
//   POST   my-course-complete&id=<attemptId>   { answers } → { completion, xp } scored on the server
//
// A course, unit, module, enrollment or attempt that doesn't exist and one that belongs to
// someone else both return 404.

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const COURSE_COLUMNS = 'id, teacher_id, title, topic, level, explain_lang, status, visibility, admin_hidden, self_enroll, access_tier, created_at, updated_at'
const UNIT_COLUMNS = 'id, course_id, position, title, topic, template, grammar_ids, can_dos, blueprint, status'
const MODULE_COLUMNS = 'id, unit_id, position, kind, variant, title, est_minutes, content, version'
const ENROLLMENT_COLUMNS = 'id, course_id, student_id, source, assigned_by, started_at, completed_at'
const ATTEMPT_COLUMNS = 'id, enrollment_id, module_id, module_version, content_snapshot, step_index, answers, score, max_score, started_at, completed_at'
const MAX_ASSIGN_AT_ONCE = 100

interface CourseRow {
  id: string
  teacher_id: string
  title: string
  topic: string
  level: CourseLevel
  explain_lang: ExplainLang
  status: PublishStatus
  visibility: 'private' | 'public'
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

function toModule(m: ModuleRow): CourseModule {
  return { id: m.id, position: m.position, kind: m.kind, variant: m.variant, title: m.title, estMinutes: m.est_minutes, content: m.content, version: m.version }
}

function toCourse(tree: Tree): Course {
  const { course } = tree
  return {
    id: course.id,
    title: course.title,
    topic: course.topic,
    level: course.level,
    explainLang: course.explain_lang,
    status: course.status,
    visibility: course.visibility,
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
        modules: (tree.modules.get(u.id) ?? []).map(toModule),
      }),
    ),
    createdAt: course.created_at,
    updatedAt: course.updated_at,
  }
}

async function courseResponse(courseId: string): Promise<Course> {
  const row = await loadCourseRow(courseId)
  if (!row) throw new HttpError(404, { error: 'Not found' })
  return toCourse(await loadTree(row))
}

async function touch(courseId: string) {
  const { error } = await supabaseAdmin.from('courses').update({ updated_at: new Date().toISOString() }).eq('id', courseId)
  if (error) throw error
}

// --- Access (the one place a paywall will plug in) -----------------------------------------

/**
 * Whether the student may open the course: today, a published course they are enrolled in.
 * Phase 3 adds self-enroll (public, admin-picked, not hidden); the paywall later checks
 * course.access_tier here too.
 */
export function canAccessCourse(course: Pick<CourseRow, 'status'>, enrollment: EnrollmentRow | null): boolean {
  return !!enrollment && course.status === 'published'
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
      blueprint: input.notes ? { notes: input.notes } : null,
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
      .select('id, title, topic, level, status, updated_at')
      .eq('teacher_id', teacherId)
      .order('updated_at', { ascending: false })
    if (error) throw error
    const rows = (data ?? []) as Pick<CourseRow, 'id' | 'title' | 'topic' | 'level' | 'status' | 'updated_at'>[]
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
    res.status(200).json({ course: toCourse(await loadTree(row)) })
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
    patch.content = validated(() => sanitizeModuleContent(b.content))
    patch.version = module.version + 1
  }
  const { error } = await supabaseAdmin.from('course_modules').update(patch).eq('id', module.id)
  if (error) throw error
  await touch(course.id)
  res.status(200).json({ course: await courseResponse(course.id) })
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

export async function handleCourseBlueprint(req: VercelRequest, res: VercelResponse, teacherId: string) {
  if (req.method !== 'POST') throw new HttpError(405, { error: 'Method not allowed' })
  const { unit, course } = await loadOwnUnit(uuid(req.query.id), teacherId)
  const tree = await loadTree(course)
  const used = await checkGenerationLimit(teacherId)
  const notes = unit.blueprint && typeof (unit.blueprint as unknown as { notes?: unknown }).notes === 'string' ? (unit.blueprint as unknown as { notes: string }).notes : ''
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
      blueprint: { ...generated.blueprint, ...(notes ? { notes } : {}) },
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
  const firstReading = siblings.find((m) => m.kind === 'reading' && m.variant !== 'second')
  const passage = firstReading?.content?.passage ?? null
  if ((module.kind === 'grammar' || module.kind === 'unit_check' || module.variant === 'second') && firstReading && !passage) {
    throw new HttpError(409, { error: 'reading_first' })
  }
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
        passage: module.id === firstReading?.id ? null : passage,
        previousWords: earlierUnits(tree, unit.position).flatMap((u) => u.words),
      },
      teacherId,
    )
  } catch (err) {
    if (err instanceof CourseValidationError) badRequest(err)
    console.error('Course module generation failed', err)
    throw new HttpError(502, { error: 'generation_failed' })
  }
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
    unitCount: units.length,
    modulesDone: done,
    modulesTotal: total,
    completedAt: total > 0 && done === total ? enrollment.completed_at : null,
    next,
    units,
  }
}

// --- Teacher: assigning --------------------------------------------------------------------

async function listEnrollments(tree: Tree): Promise<CourseEnrollment[]> {
  const { data, error } = await supabaseAdmin.from('course_enrollments').select(ENROLLMENT_COLUMNS).eq('course_id', tree.course.id)
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

export async function handleCourseAssign(req: VercelRequest, res: VercelResponse, teacherId: string) {
  const course = await loadOwnCourse(uuid(req.query.id), teacherId)
  const tree = await loadTree(course)

  if (req.method === 'GET') {
    res.status(200).json({ enrollments: await listEnrollments(tree) })
    return
  }

  if (req.method === 'POST') {
    if (course.status !== 'published') throw new HttpError(409, { error: 'not_published' })
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
    res.status(200).json({ enrollments: await listEnrollments(tree) })
    return
  }

  if (req.method === 'DELETE') {
    const enrollmentId = uuid(req.query.enrollmentId)
    const { data, error } = await supabaseAdmin.from('course_enrollments').delete().eq('id', enrollmentId).eq('course_id', course.id).select('id')
    if (error) throw error
    if (!data || data.length === 0) throw new HttpError(404, { error: 'Not found' })
    res.status(200).json({ enrollments: await listEnrollments(tree) })
    return
  }

  throw new HttpError(405, { error: 'Method not allowed' })
}

// --- Student -------------------------------------------------------------------------------

async function loadMyEnrollment(enrollmentId: string, studentId: string): Promise<{ enrollment: EnrollmentRow; tree: Tree }> {
  const { data, error } = await supabaseAdmin.from('course_enrollments').select(ENROLLMENT_COLUMNS).eq('id', enrollmentId).eq('student_id', studentId).maybeSingle()
  if (error) throw error
  const enrollment = (data as EnrollmentRow | null) ?? null
  if (!enrollment) throw new HttpError(404, { error: 'Not found' })
  const course = await loadCourseRow(enrollment.course_id)
  if (!course || !canAccessCourse(course, enrollment)) throw new HttpError(404, { error: 'Not found' })
  return { enrollment, tree: await loadTree(course) }
}

async function teacherEmail(tree: Tree): Promise<string> {
  return (await emailsFor([tree.course.teacher_id])).get(tree.course.teacher_id) ?? ''
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
    if (!emails.has(course.teacher_id)) emails.set(course.teacher_id, await teacherEmail(tree))
    courses.push(
      summaryOf(
        buildMyCourse(
          tree,
          e,
          attempts.filter((a) => a.enrollment_id === e.id),
          emails.get(course.teacher_id) ?? '',
        ),
      ),
    )
  }
  res.status(200).json({ courses })
}

async function handleMyCourse(req: VercelRequest, res: VercelResponse, userId: string) {
  if (req.method !== 'GET') throw new HttpError(405, { error: 'Method not allowed' })
  const { enrollment, tree } = await loadMyEnrollment(uuid(req.query.id), userId)
  const course = buildMyCourse(tree, enrollment, await attemptsFor([enrollment.id]), await teacherEmail(tree))
  res.status(200).json({ course })
}

function toAttempt(row: AttemptRow): ModuleAttempt {
  return {
    id: row.id,
    moduleId: row.module_id,
    stepIndex: row.step_index,
    answers: row.answers ?? {},
    content: row.content_snapshot,
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
    res.status(200).json({ attempt: toAttempt(open as AttemptRow) })
    return
  }
  if (open) await supabaseAdmin.from('course_module_attempts').delete().eq('id', (open as AttemptRow).id)

  const module = [...tree.modules.values()].flat().find((m) => m.id === moduleId) as ModuleRow
  const { data, error } = await supabaseAdmin
    .from('course_module_attempts')
    .insert({ enrollment_id: enrollment.id, module_id: moduleId, module_version: module.version, content_snapshot: module.content })
    .select(ATTEMPT_COLUMNS)
    .single()
  if (error) throw error
  res.status(200).json({ attempt: toAttempt(data as AttemptRow) })
}

async function loadMyAttempt(attemptId: string, userId: string): Promise<{ attempt: AttemptRow; enrollment: EnrollmentRow; tree: Tree }> {
  const { data, error } = await supabaseAdmin.from('course_module_attempts').select(ATTEMPT_COLUMNS).eq('id', attemptId).maybeSingle()
  if (error) throw error
  if (!data) throw new HttpError(404, { error: 'Not found' })
  const attempt = data as AttemptRow
  return { attempt, ...(await loadMyEnrollment(attempt.enrollment_id, userId)) }
}

async function handleMyCourseProgress(req: VercelRequest, res: VercelResponse, userId: string) {
  if (req.method !== 'POST') throw new HttpError(405, { error: 'Method not allowed' })
  const { attempt } = await loadMyAttempt(uuid(req.query.id), userId)
  if (attempt.completed_at) throw new HttpError(409, { error: 'already_completed' })
  const b = body(req)
  const stepIndex = typeof b.stepIndex === 'number' && Number.isInteger(b.stepIndex) ? Math.max(0, Math.min(b.stepIndex, attempt.content_snapshot.steps.length)) : attempt.step_index
  const answers = sanitizeAnswers(attempt.content_snapshot, b.answers)
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
  const answers = sanitizeAnswers(attempt.content_snapshot, body(req).answers)
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
  'my-course-complete': handleMyCourseComplete,
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
