import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createHash } from 'node:crypto'
import { supabaseAdmin } from './supabaseAdmin.js'
import { synthesizeSsml } from './azure.js'
import { HttpError } from './examTasks.js'
import { emailsFor } from './vocabListProgress.js'
import { isActiveStudent } from './tenseExplorerSettings.js'
import { compGenerationsToday, generateCompTest } from './compTestGenerate.js'
import {
  COMP_GENERATIONS_PER_DAY,
  COMP_WPM,
  CompValidationError,
  isTypedItem,
  itemCount,
  sanitizeAnswers,
  sanitizeGenerateInput,
  sanitizeTestInput,
  scoreComp,
  stripKeys,
  type CompAssignment,
  type CompAssignmentDetail,
  type CompLevel,
  type CompResult,
  type CompSkill,
  type CompTest,
  type CompTestContent,
  type CompTestSummary,
  type MyCompTest,
  type MyCompTestSummary,
} from '../../src/lib/compTests.js'
import type { ExamAnswers } from '../../src/lib/examScoring.js'

// Comprehension tests (src/lib/compTests.ts; tables in supabase/migrations/20261028120000_comp_tests.sql).
//
// Teacher (api/teacher-tools.ts, teacher role only):
//   GET    comp-tests                    the caller's tests, newest edit first (summaries)
//   GET    comp-tests&id=                one test
//   POST   comp-tests                    create { skill, level, title, topic, maxPlays, content } → { test }
//   PUT    comp-tests&id=                replace (same body) → { test }
//   DELETE comp-tests&id=                delete (its assignments and recording go too)
//   POST   comp-test-generate            CompGenerateInput → { test, remaining }; the new test is saved
//                                        at once. At most COMP_GENERATIONS_PER_DAY per UTC day (429).
//   GET    comp-test-audio&id=           { url, uploaded } (url null: no recording for this script)
//   POST   comp-test-audio&id=           { mode: 'tts' } render · { mode: 'upload-url' } → signed upload ·
//                                        { mode: 'uploaded', path } use the uploaded MP3
//   DELETE comp-test-audio&id=           remove the recording
//   GET    comp-test-assign&id=          { assignments }
//   POST   comp-test-assign&id=          { studentIds, dueAt? } → { assignments } (connected students only)
//   DELETE comp-test-assign&id=&assignmentId=   withdraw one assignment (and its answers)
//   GET    comp-test-result&assignmentId=        { assignment } with answers and result
//   POST   comp-test-result              { assignmentId, key, correct: true|false|null } re-marks a typed
//                                        answer (null: back to the automatic mark) → { assignment }
//
// Student (api/gamification.ts, any signed-in user, only their own assignments):
//   GET    my-tests                      { tests } (MyCompTestSummary[])
//   GET    my-test&id=                   { test } (MyCompTest) — no answers before submission
//   POST   my-test-submit&id=            { answers } → { test } scored; once only (409 already_submitted)
//
// A test or assignment that doesn't exist and one that belongs to someone else both return 404.

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const AUDIO_BUCKET = 'comp-test-audio'
const SIGNED_URL_TTL_SEC = 3 * 3600
const TEST_COLUMNS = 'id, teacher_id, skill, level, title, topic, max_plays, content, audio_path, audio_key, created_at, updated_at'
const ASSIGNMENT_COLUMNS = 'id, test_id, student_id, assigned_at, due_at, submitted_at, answers, content_snapshot, overrides, result, score, max_score'
const MAX_ASSIGN_AT_ONCE = 100

interface TestRow {
  id: string
  teacher_id: string
  skill: CompSkill
  level: CompLevel
  title: string
  topic: string
  max_plays: number
  content: CompTestContent
  audio_path: string | null
  audio_key: string | null
  created_at: string
  updated_at: string
}

interface AssignmentRow {
  id: string
  test_id: string
  student_id: string
  assigned_at: string
  due_at: string | null
  submitted_at: string | null
  answers: ExamAnswers | null
  content_snapshot: CompTestContent | null
  overrides: Record<string, boolean>
  result: CompResult | null
  score: number | null
  max_score: number | null
}

function uuid(v: unknown): string {
  if (typeof v !== 'string' || !UUID_RE.test(v)) throw new HttpError(404, { error: 'Not found' })
  return v
}

function badRequest(err: unknown): never {
  if (err instanceof CompValidationError) throw new HttpError(400, { error: err.message })
  throw err
}

// --- Audio ---------------------------------------------------------------------------------

const VOICES = ['en-GB-SoniaNeural', 'en-GB-RyanNeural', 'en-GB-LibbyNeural', 'en-GB-ThomasNeural']
const SPEAKER_RE = /^((?:[A-Z][\w.'’-]*\s?){1,3}):\s+/

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/** What a TTS render depends on: a change of any of these needs a new recording. */
export function audioKeyFor(row: Pick<TestRow, 'level' | 'content'>): string {
  return createHash('sha1').update(`${row.level}|${row.content.style ?? ''}|${row.content.text}`).digest('hex')
}

function audioIsCurrent(row: TestRow): boolean {
  return !!row.audio_path && (row.audio_key === 'upload' || row.audio_key === audioKeyFor(row))
}

/**
 * SSML for the script at the level's speed (COMP_WPM). Effective speed at Azure's default rate,
 * pauses included (measured for the exam task maker): one voice about 170 wpm, a dialogue about
 * 155 wpm. Each speaker label gets its own voice.
 */
export function compScriptSsml(content: CompTestContent, level: CompLevel): string {
  const dialogue = content.style === 'dialogue'
  const rate = Math.round((COMP_WPM[level] / (dialogue ? 155 : 170) - 1) * 100)
  const voiceFor = new Map<string, string>()
  const parts: string[] = []
  let current = VOICES[0]
  for (const para of content.text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)) {
    for (const raw of para.split('\n')) {
      const label = dialogue ? raw.trim().match(SPEAKER_RE)?.[1]?.trim() : undefined
      if (label) {
        if (!voiceFor.has(label)) voiceFor.set(label, VOICES[voiceFor.size % VOICES.length])
        current = voiceFor.get(label) as string
      }
      const text = (label ? raw.trim().replace(SPEAKER_RE, '') : raw).trim()
      if (!text) continue
      parts.push(`<voice name="${current}"><prosody rate="${rate}%">${escapeXml(text)}</prosody><break time="${label ? 500 : 250}ms"/></voice>`)
    }
    parts.push(`<voice name="${current}"><break time="700ms"/></voice>`)
  }
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-GB">${parts.join('')}</speak>`
}

async function signedAudioUrl(path: string): Promise<string> {
  const { data, error } = await supabaseAdmin.storage.from(AUDIO_BUCKET).createSignedUrl(path, SIGNED_URL_TTL_SEC)
  if (error || !data) throw error ?? new Error('Could not sign audio URL')
  return data.signedUrl
}

/** The recording for the current script, rendered with Azure TTS when there is none. */
async function ensureAudio(row: TestRow): Promise<string> {
  if (audioIsCurrent(row)) return signedAudioUrl(row.audio_path as string)
  let audio: Buffer
  try {
    audio = await synthesizeSsml(compScriptSsml(row.content, row.level))
  } catch (err) {
    console.error('Comprehension test TTS failed', err)
    throw new HttpError(502, { error: 'tts_failed' })
  }
  const key = audioKeyFor(row)
  const path = `${row.id}/${key.slice(0, 12)}.mp3`
  const { error: upError } = await supabaseAdmin.storage.from(AUDIO_BUCKET).upload(path, audio, { contentType: 'audio/mpeg', upsert: true })
  if (upError) throw upError
  const old = row.audio_path && row.audio_path !== path ? row.audio_path : null
  const { error } = await supabaseAdmin.from('comp_tests').update({ audio_path: path, audio_key: key }).eq('id', row.id)
  if (error) throw error
  if (old) await supabaseAdmin.storage.from(AUDIO_BUCKET).remove([old])
  row.audio_path = path
  row.audio_key = key
  return signedAudioUrl(path)
}

// --- Teacher -------------------------------------------------------------------------------

function toTest(row: TestRow): CompTest {
  return {
    id: row.id,
    skill: row.skill,
    level: row.level,
    title: row.title,
    topic: row.topic,
    maxPlays: row.max_plays,
    content: row.content,
    hasAudio: audioIsCurrent(row),
    audioUploaded: !!row.audio_path && row.audio_key === 'upload',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

async function loadOwnTest(id: string, teacherId: string): Promise<TestRow> {
  const { data, error } = await supabaseAdmin.from('comp_tests').select(TEST_COLUMNS).eq('id', id).eq('teacher_id', teacherId).maybeSingle()
  if (error) throw error
  if (!data) throw new HttpError(404, { error: 'Not found' })
  return data as TestRow
}

export async function handleCompTests(req: VercelRequest, res: VercelResponse, teacherId: string) {
  if (req.method === 'GET' && req.query.id === undefined) {
    const { data, error } = await supabaseAdmin
      .from('comp_tests')
      .select('id, skill, level, title, topic, content, updated_at')
      .eq('teacher_id', teacherId)
      .order('updated_at', { ascending: false })
    if (error) throw error
    const rows = (data ?? []) as Pick<TestRow, 'id' | 'skill' | 'level' | 'title' | 'topic' | 'content' | 'updated_at'>[]
    const counts = new Map<string, { assigned: number; submitted: number }>()
    if (rows.length) {
      const { data: links, error: linkError } = await supabaseAdmin
        .from('comp_test_assignments')
        .select('test_id, submitted_at')
        .in('test_id', rows.map((r) => r.id))
      if (linkError) throw linkError
      for (const l of links ?? []) {
        const c = counts.get(l.test_id as string) ?? { assigned: 0, submitted: 0 }
        c.assigned++
        if (l.submitted_at) c.submitted++
        counts.set(l.test_id as string, c)
      }
    }
    const tests: CompTestSummary[] = rows.map((r) => ({
      id: r.id,
      skill: r.skill,
      level: r.level,
      title: r.title,
      topic: r.topic,
      itemCount: itemCount(r.content),
      assignedCount: counts.get(r.id)?.assigned ?? 0,
      submittedCount: counts.get(r.id)?.submitted ?? 0,
      updatedAt: r.updated_at,
    }))
    res.status(200).json({ tests })
    return
  }

  if (req.method === 'GET') {
    res.status(200).json({ test: toTest(await loadOwnTest(uuid(req.query.id), teacherId)) })
    return
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    let input
    try {
      input = sanitizeTestInput(req.body)
    } catch (err) {
      badRequest(err)
    }
    const fields = { skill: input.skill, level: input.level, title: input.title, topic: input.topic, max_plays: input.maxPlays, content: input.content }
    if (req.method === 'POST') {
      const { data, error } = await supabaseAdmin.from('comp_tests').insert({ teacher_id: teacherId, ...fields }).select(TEST_COLUMNS).single()
      if (error) throw error
      res.status(201).json({ test: toTest(data as TestRow) })
      return
    }
    const id = uuid(req.query.id)
    const { data, error } = await supabaseAdmin
      .from('comp_tests')
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('teacher_id', teacherId)
      .select(TEST_COLUMNS)
      .maybeSingle()
    if (error) throw error
    if (!data) throw new HttpError(404, { error: 'Not found' })
    const row = data as TestRow
    if (row.skill === 'listening' && row.audio_path && !audioIsCurrent(row)) {
      // An edited script while students still have to take the test: re-render now, here,
      // rather than in a student's request.
      const { count, error: countError } = await supabaseAdmin
        .from('comp_test_assignments')
        .select('id', { count: 'exact', head: true })
        .eq('test_id', row.id)
        .is('submitted_at', null)
      if (countError) throw countError
      if (count) await ensureAudio(row).catch((err) => console.warn('Re-render after edit failed', err))
    }
    res.status(200).json({ test: toTest(row) })
    return
  }

  if (req.method === 'DELETE') {
    const row = await loadOwnTest(uuid(req.query.id), teacherId)
    const { error } = await supabaseAdmin.from('comp_tests').delete().eq('id', row.id).eq('teacher_id', teacherId)
    if (error) throw error
    if (row.audio_path) await supabaseAdmin.storage.from(AUDIO_BUCKET).remove([row.audio_path])
    res.status(200).json({ ok: true })
    return
  }

  throw new HttpError(405, { error: 'Method not allowed' })
}

export async function handleCompGenerate(req: VercelRequest, res: VercelResponse, teacherId: string) {
  if (req.method !== 'POST') throw new HttpError(405, { error: 'Method not allowed' })
  let input
  try {
    input = sanitizeGenerateInput(req.body)
  } catch (err) {
    badRequest(err)
  }
  const used = await compGenerationsToday(teacherId)
  if (used >= COMP_GENERATIONS_PER_DAY) throw new HttpError(429, { error: 'daily_limit', limit: COMP_GENERATIONS_PER_DAY })
  let generated
  try {
    generated = await generateCompTest(input, teacherId)
  } catch (err) {
    console.error('Comprehension test generation failed', err)
    throw new HttpError(502, { error: 'generation_failed' })
  }
  const { data, error } = await supabaseAdmin
    .from('comp_tests')
    .insert({
      teacher_id: teacherId,
      skill: input.skill,
      level: input.level,
      title: generated.title,
      topic: input.topic,
      max_plays: 2,
      content: generated.content,
    })
    .select(TEST_COLUMNS)
    .single()
  if (error) throw error
  res.status(201).json({ test: toTest(data as TestRow), remaining: Math.max(0, COMP_GENERATIONS_PER_DAY - used - 1) })
}

export async function handleCompAudio(req: VercelRequest, res: VercelResponse, teacherId: string) {
  const row = await loadOwnTest(uuid(req.query.id), teacherId)

  if (req.method === 'GET') {
    res.status(200).json({ url: audioIsCurrent(row) ? await signedAudioUrl(row.audio_path as string) : null, uploaded: row.audio_key === 'upload' && !!row.audio_path })
    return
  }

  if (req.method === 'DELETE') {
    if (row.audio_path) await supabaseAdmin.storage.from(AUDIO_BUCKET).remove([row.audio_path])
    const { error } = await supabaseAdmin.from('comp_tests').update({ audio_path: null, audio_key: null }).eq('id', row.id)
    if (error) throw error
    res.status(200).json({ ok: true })
    return
  }

  if (req.method !== 'POST') throw new HttpError(405, { error: 'Method not allowed' })
  if (row.skill !== 'listening') throw new HttpError(400, { error: 'Not a listening test' })
  const mode = (req.body ?? {}).mode

  if (mode === 'tts') {
    if (row.audio_key === 'upload') {
      // The teacher asked for a TTS render instead of their upload.
      row.audio_key = null
    }
    res.status(200).json({ url: await ensureAudio(row) })
    return
  }

  if (mode === 'upload-url') {
    const path = `${row.id}/upload-${Date.now()}.mp3`
    const { data, error } = await supabaseAdmin.storage.from(AUDIO_BUCKET).createSignedUploadUrl(path)
    if (error || !data) throw error ?? new Error('Could not create upload URL')
    res.status(200).json({ path, token: data.token, signedUrl: data.signedUrl })
    return
  }

  if (mode === 'uploaded') {
    const path = (req.body ?? {}).path
    if (typeof path !== 'string' || !path.startsWith(`${row.id}/upload-`) || !/^[\w/-]+\.mp3$/.test(path)) throw new HttpError(400, { error: 'Invalid path' })
    const old = row.audio_path && row.audio_path !== path ? row.audio_path : null
    const { error } = await supabaseAdmin.from('comp_tests').update({ audio_path: path, audio_key: 'upload' }).eq('id', row.id)
    if (error) throw error
    if (old) await supabaseAdmin.storage.from(AUDIO_BUCKET).remove([old])
    res.status(200).json({ url: await signedAudioUrl(path) })
    return
  }

  throw new HttpError(400, { error: 'Invalid mode' })
}

function toAssignment(row: AssignmentRow, emails: Map<string, string>): CompAssignment {
  return {
    id: row.id,
    studentId: row.student_id,
    studentEmail: emails.get(row.student_id) ?? '',
    assignedAt: row.assigned_at,
    dueAt: row.due_at,
    submittedAt: row.submitted_at,
    score: row.score,
    max: row.max_score,
  }
}

async function listAssignments(testId: string): Promise<CompAssignment[]> {
  const { data, error } = await supabaseAdmin
    .from('comp_test_assignments')
    .select(ASSIGNMENT_COLUMNS)
    .eq('test_id', testId)
    .order('assigned_at', { ascending: true })
  if (error) throw error
  const rows = (data ?? []) as AssignmentRow[]
  const emails = await emailsFor([...new Set(rows.map((r) => r.student_id))])
  return rows.map((r) => toAssignment(r, emails)).sort((a, b) => a.studentEmail.localeCompare(b.studentEmail))
}

export async function handleCompAssign(req: VercelRequest, res: VercelResponse, teacherId: string) {
  const test = await loadOwnTest(uuid(req.query.id), teacherId)

  if (req.method === 'GET') {
    res.status(200).json({ assignments: await listAssignments(test.id) })
    return
  }

  if (req.method === 'POST') {
    const body = (req.body ?? {}) as Record<string, unknown>
    const ids = Array.isArray(body.studentIds) ? [...new Set(body.studentIds.filter((x): x is string => typeof x === 'string' && UUID_RE.test(x)))] : []
    if (ids.length === 0 || ids.length > MAX_ASSIGN_AT_ONCE) throw new HttpError(400, { error: 'studentIds is required' })
    let dueAt: string | null = null
    if (typeof body.dueAt === 'string' && body.dueAt) {
      const d = new Date(body.dueAt)
      if (Number.isNaN(d.getTime())) throw new HttpError(400, { error: 'dueAt is not a date' })
      dueAt = d.toISOString()
    }
    for (const id of ids) if (!(await isActiveStudent(teacherId, id))) throw new HttpError(404, { error: 'Not found' })
    // Render the recording now (this function may run 60 s): the student's request on
    // api/gamification.ts only renders as a fallback, e.g. after the script was edited.
    if (test.skill === 'listening') await ensureAudio(test)
    const { error } = await supabaseAdmin
      .from('comp_test_assignments')
      .upsert(
        ids.map((studentId) => ({ test_id: test.id, student_id: studentId, assigned_by: teacherId, due_at: dueAt })),
        { onConflict: 'test_id,student_id', ignoreDuplicates: true },
      )
    if (error) throw error
    res.status(200).json({ assignments: await listAssignments(test.id) })
    return
  }

  if (req.method === 'DELETE') {
    const assignmentId = uuid(req.query.assignmentId)
    const { data, error } = await supabaseAdmin.from('comp_test_assignments').delete().eq('id', assignmentId).eq('test_id', test.id).select('id')
    if (error) throw error
    if (!data || data.length === 0) throw new HttpError(404, { error: 'Not found' })
    res.status(200).json({ assignments: await listAssignments(test.id) })
    return
  }

  throw new HttpError(405, { error: 'Method not allowed' })
}

async function loadTeacherAssignment(assignmentId: string, teacherId: string): Promise<AssignmentRow> {
  const { data, error } = await supabaseAdmin.from('comp_test_assignments').select(ASSIGNMENT_COLUMNS).eq('id', assignmentId).maybeSingle()
  if (error) throw error
  if (!data) throw new HttpError(404, { error: 'Not found' })
  const row = data as AssignmentRow
  await loadOwnTest(row.test_id, teacherId)
  return row
}

async function toDetail(row: AssignmentRow): Promise<CompAssignmentDetail> {
  const emails = await emailsFor([row.student_id])
  return { ...toAssignment(row, emails), content: row.content_snapshot, answers: row.answers ?? {}, result: row.result }
}

export async function handleCompResult(req: VercelRequest, res: VercelResponse, teacherId: string) {
  if (req.method === 'GET') {
    res.status(200).json({ assignment: await toDetail(await loadTeacherAssignment(uuid(req.query.assignmentId), teacherId)) })
    return
  }
  if (req.method !== 'POST') throw new HttpError(405, { error: 'Method not allowed' })
  const body = (req.body ?? {}) as Record<string, unknown>
  const row = await loadTeacherAssignment(uuid(body.assignmentId), teacherId)
  if (!row.submitted_at || !row.content_snapshot) throw new HttpError(409, { error: 'not_submitted' })
  const key = typeof body.key === 'string' ? body.key : ''
  if (!isTypedItem(row.content_snapshot, key)) throw new HttpError(400, { error: 'Only typed answers can be re-marked' })
  const overrides = { ...(row.overrides ?? {}) }
  if (body.correct === true || body.correct === false) overrides[key] = body.correct
  else if (body.correct === null) delete overrides[key]
  else throw new HttpError(400, { error: 'correct must be true, false or null' })
  const result = scoreComp(row.content_snapshot, row.answers ?? {}, overrides)
  const { data, error } = await supabaseAdmin
    .from('comp_test_assignments')
    .update({ overrides, result, score: result.score, max_score: result.max })
    .eq('id', row.id)
    .select(ASSIGNMENT_COLUMNS)
    .single()
  if (error) throw error
  res.status(200).json({ assignment: await toDetail(data as AssignmentRow) })
}

// --- Student -------------------------------------------------------------------------------

async function loadTests(ids: string[]): Promise<Map<string, TestRow>> {
  if (ids.length === 0) return new Map()
  const { data, error } = await supabaseAdmin.from('comp_tests').select(TEST_COLUMNS).in('id', ids)
  if (error) throw error
  return new Map(((data ?? []) as TestRow[]).map((t) => [t.id, t]))
}

function toMySummary(row: AssignmentRow, test: TestRow, emails: Map<string, string>): MyCompTestSummary {
  return {
    assignmentId: row.id,
    title: test.title,
    skill: test.skill,
    level: test.level,
    teacherEmail: emails.get(test.teacher_id) ?? '',
    assignedAt: row.assigned_at,
    dueAt: row.due_at,
    submittedAt: row.submitted_at,
    score: row.score,
    max: row.max_score,
  }
}

async function loadMyAssignment(id: string, studentId: string): Promise<{ row: AssignmentRow; test: TestRow }> {
  const { data, error } = await supabaseAdmin
    .from('comp_test_assignments')
    .select(ASSIGNMENT_COLUMNS)
    .eq('id', id)
    .eq('student_id', studentId)
    .maybeSingle()
  if (error) throw error
  if (!data) throw new HttpError(404, { error: 'Not found' })
  const row = data as AssignmentRow
  const test = (await loadTests([row.test_id])).get(row.test_id)
  if (!test) throw new HttpError(404, { error: 'Not found' })
  return { row, test }
}

async function toMyTest(row: AssignmentRow, test: TestRow): Promise<MyCompTest> {
  const emails = await emailsFor([test.teacher_id])
  const submitted = !!row.submitted_at && !!row.content_snapshot
  let audioUrl: string | null = null
  if (test.skill === 'listening' && !submitted) audioUrl = await ensureAudio(test)
  if (test.skill === 'listening' && submitted && audioIsCurrent(test)) audioUrl = await signedAudioUrl(test.audio_path as string)
  return {
    ...toMySummary(row, test, emails),
    maxPlays: test.skill === 'listening' ? test.max_plays : 0,
    content: submitted ? (row.content_snapshot as CompTestContent) : stripKeys(test.content, test.skill),
    audioUrl,
    answers: submitted ? row.answers : null,
    result: submitted ? row.result : null,
  }
}

async function handleMyTests(req: VercelRequest, res: VercelResponse, userId: string) {
  if (req.method !== 'GET') throw new HttpError(405, { error: 'Method not allowed' })
  const { data, error } = await supabaseAdmin
    .from('comp_test_assignments')
    .select(ASSIGNMENT_COLUMNS)
    .eq('student_id', userId)
    .order('assigned_at', { ascending: false })
  if (error) throw error
  const rows = (data ?? []) as AssignmentRow[]
  const tests = await loadTests([...new Set(rows.map((r) => r.test_id))])
  const emails = await emailsFor([...new Set([...tests.values()].map((t) => t.teacher_id))])
  res.status(200).json({
    tests: rows.filter((r) => tests.has(r.test_id)).map((r) => toMySummary(r, tests.get(r.test_id) as TestRow, emails)),
  })
}

async function handleMyTest(req: VercelRequest, res: VercelResponse, userId: string) {
  if (req.method !== 'GET') throw new HttpError(405, { error: 'Method not allowed' })
  const { row, test } = await loadMyAssignment(uuid(req.query.id), userId)
  res.status(200).json({ test: await toMyTest(row, test) })
}

async function handleMyTestSubmit(req: VercelRequest, res: VercelResponse, userId: string) {
  if (req.method !== 'POST') throw new HttpError(405, { error: 'Method not allowed' })
  const { row, test } = await loadMyAssignment(uuid(req.query.id), userId)
  if (row.submitted_at) throw new HttpError(409, { error: 'already_submitted' })
  const answers = sanitizeAnswers(test.content, (req.body ?? {}).answers)
  const result = scoreComp(test.content, answers)
  const { data, error } = await supabaseAdmin
    .from('comp_test_assignments')
    .update({
      submitted_at: new Date().toISOString(),
      answers,
      content_snapshot: test.content,
      overrides: {},
      result,
      score: result.score,
      max_score: result.max,
    })
    .eq('id', row.id)
    .is('submitted_at', null)
    .select(ASSIGNMENT_COLUMNS)
    .maybeSingle()
  if (error) throw error
  if (!data) throw new HttpError(409, { error: 'already_submitted' })
  res.status(200).json({ test: await toMyTest(data as AssignmentRow, test) })
}

const STUDENT_HANDLERS: Record<string, (req: VercelRequest, res: VercelResponse, userId: string) => Promise<void>> = {
  'my-tests': handleMyTests,
  'my-test': handleMyTest,
  'my-test-submit': handleMyTestSubmit,
}

export const COMP_STUDENT_ACTIONS = new Set(Object.keys(STUDENT_HANDLERS))

export async function handleCompStudentAction(action: string, req: VercelRequest, res: VercelResponse, userId: string) {
  try {
    await STUDENT_HANDLERS[action](req, res, userId)
  } catch (err) {
    if (err instanceof HttpError) {
      res.status(err.status).json(err.body)
      return
    }
    console.error(`Comprehension tests: ${action} failed`, err)
    if (!res.headersSent) res.status(500).json({ error: 'Something went wrong' })
  }
}
