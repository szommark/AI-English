import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabaseAdmin } from './supabaseAdmin.js'
import { synthesizeSsml } from './azure.js'
import { emailsFor } from './vocabListProgress.js'
import {
  fetchSourceText,
  generateListeningTask,
  generationsToday,
  reviseListeningTask,
  type GenerateInput,
} from './examTaskGenerate.js'
import {
  EXAM_FIELDS,
  LISTENING_FORMATS,
  levelSpec,
  looksEnvironmental,
  OVERALL_NOTE_MAX,
  POOL_MAX_MEMBERS,
  POOL_NAME_MAX,
  SCRIPT_STYLES,
  sanitizeItemReview,
  sanitizeListeningContent,
  sanitizeTaskInput,
  TASK_GENERATIONS_PER_DAY,
  TASK_LEVELS,
  type ExamTask,
  type ExamTaskReview,
  type ExamTaskSummary,
  type ItemReview,
  type ListeningTaskContent,
  type ReviewerStatus,
  type TaskRecommendation,
  type TeacherPool,
} from '../../src/lib/examTasks.js'
import { validReasonIds } from '../../src/data/examTaskCriteria.js'
import { cleanScript } from '../../src/lib/listeningScript.js'

// Exam task maker (Teacher Toolkit) actions for api/teacher-tools.ts. Teacher role is checked
// by the caller. A task belongs to its creator (owner); the owner sends it to other teachers for
// testing (exam_task_reviewers). Owner and reviewers can open and test it; only the owner edits,
// shares or deletes it, and only the owner sees everyone's tests. Anything else is a 404.
//
//   GET    exam-tasks                 { owned, assigned } summaries
//   GET    exam-tasks&id=             { task, myReview, reviewers?, reviews? (owner) }
//   POST   exam-tasks                 create → { task }
//   PUT    exam-tasks&id=             update (owner); a content change bumps the revision
//   DELETE exam-tasks&id=             (owner)
//   POST   exam-task-generate         { level, format, field, style, sourceText | sourceUrl, avoid } → { draft, remaining }
//                                     409 environment_topic when a notes task is about the environment
//   POST   exam-task-revise           { level, content, problems, keepScript, teacherNote } → { draft, remaining }
//   GET    exam-task-audio&id=        { url | null } for the current revision
//   POST   exam-task-audio&id=        { mode: 'tts' } render | { mode: 'upload-url' } | { mode: 'uploaded', path }
//   DELETE exam-task-audio&id=        (owner) drop the recording
//   PUT    exam-task-share&id=        { reviewerIds } (owner) → { reviewers }
//   PUT    exam-task-review&id=       { answers, verdicts, recommendation, overallNote, submit } → { review }
//   GET    teachers                   every other teacher { id, email }
//   GET/POST/PUT/DELETE teacher-pools[&id=]

export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly body: Record<string, unknown>,
  ) {
    super(String(body.error))
  }
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const AUDIO_BUCKET = 'exam-task-audio'
const SIGNED_URL_TTL_SEC = 3 * 3600
const TASK_COLUMNS = 'id, owner_id, exam_part, level, format, field, title, origin, source_ref, content, revision, audio_path, audio_revision, created_at, updated_at'

interface TaskRow {
  id: string
  owner_id: string
  exam_part: ExamTask['examPart']
  level: ExamTask['level']
  format: string
  field: ExamTask['field']
  title: string
  origin: ExamTask['origin']
  source_ref: string
  content: ListeningTaskContent
  revision: number
  audio_path: string | null
  audio_revision: number | null
  created_at: string
  updated_at: string
}

function idFrom(req: VercelRequest): string {
  const id = req.query.id
  if (typeof id !== 'string' || !UUID_RE.test(id)) throw new HttpError(404, { error: 'Not found' })
  return id
}

function audioIsCurrent(row: TaskRow): boolean {
  return !!row.audio_path && (row.audio_revision === null || row.audio_revision === row.revision)
}

function toTask(row: TaskRow, userId: string, ownerEmail?: string): ExamTask {
  return {
    id: row.id,
    examPart: row.exam_part,
    level: row.level,
    format: row.format,
    field: row.field,
    title: row.title,
    origin: row.origin,
    revision: row.revision,
    updatedAt: row.updated_at,
    createdAt: row.created_at,
    isOwner: row.owner_id === userId,
    sourceRef: row.source_ref,
    content: row.content,
    hasAudio: audioIsCurrent(row),
    ...(ownerEmail ? { ownerEmail } : {}),
  }
}

/** The task with the caller's access to it, or 404. */
async function loadTask(id: string, userId: string): Promise<{ row: TaskRow; isOwner: boolean }> {
  const { data, error } = await supabaseAdmin.from('exam_tasks').select(TASK_COLUMNS).eq('id', id).maybeSingle()
  if (error) throw error
  if (!data) throw new HttpError(404, { error: 'Not found' })
  const row = data as TaskRow
  if (row.owner_id === userId) return { row, isOwner: true }
  const { data: link, error: linkError } = await supabaseAdmin
    .from('exam_task_reviewers')
    .select('task_id')
    .eq('task_id', id)
    .eq('reviewer_id', userId)
    .maybeSingle()
  if (linkError) throw linkError
  if (!link) throw new HttpError(404, { error: 'Not found' })
  return { row, isOwner: false }
}

function badRequest(err: unknown): never {
  throw new HttpError(400, { error: err instanceof Error ? err.message : 'Invalid input' })
}

interface ReviewRow {
  reviewer_id: string
  revision: number
  answers: Record<string, boolean | string>
  verdicts: Record<string, ItemReview>
  recommendation: TaskRecommendation | null
  overall_note: string
  submitted_at: string | null
}

function toReview(r: ReviewRow, email: string): ExamTaskReview {
  return {
    reviewerId: r.reviewer_id,
    reviewerEmail: email,
    revision: r.revision,
    answers: r.answers ?? {},
    verdicts: r.verdicts ?? {},
    recommendation: r.recommendation,
    overallNote: r.overall_note,
    submittedAt: r.submitted_at,
  }
}

// --- exam-tasks ------------------------------------------------------------------------------

export async function handleExamTasks(req: VercelRequest, res: VercelResponse, userId: string) {
  if (req.method === 'GET' && req.query.id === undefined) {
    const summaryColumns = 'id, owner_id, exam_part, level, format, field, title, origin, revision, updated_at'
    const [{ data: owned, error: e1 }, { data: links, error: e2 }] = await Promise.all([
      supabaseAdmin.from('exam_tasks').select(summaryColumns).eq('owner_id', userId).order('updated_at', { ascending: false }),
      supabaseAdmin.from('exam_task_reviewers').select('task_id').eq('reviewer_id', userId),
    ])
    if (e1) throw e1
    if (e2) throw e2
    const assignedIds = (links ?? []).map((l) => l.task_id as string)
    const { data: assigned, error: e3 } = assignedIds.length
      ? await supabaseAdmin.from('exam_tasks').select(summaryColumns).in('id', assignedIds).order('updated_at', { ascending: false })
      : { data: [], error: null }
    if (e3) throw e3

    const all = [...(owned ?? []), ...(assigned ?? [])] as (Omit<TaskRow, 'content' | 'source_ref' | 'audio_path' | 'audio_revision' | 'created_at'>)[]
    const ids = all.map((t) => t.id)
    const [{ data: reviewers, error: e4 }, { data: reviews, error: e5 }] = ids.length
      ? await Promise.all([
          supabaseAdmin.from('exam_task_reviewers').select('task_id').in('task_id', ids),
          supabaseAdmin.from('exam_task_reviews').select('task_id, reviewer_id, revision, submitted_at').in('task_id', ids).not('submitted_at', 'is', null),
        ])
      : [
          { data: [], error: null },
          { data: [], error: null },
        ]
    if (e4) throw e4
    if (e5) throw e5
    const ownerEmails = await emailsFor([...new Set((assigned ?? []).map((t) => t.owner_id as string))])

    const summarize = (t: (typeof all)[number]): ExamTaskSummary => {
      const current = (reviews ?? []).filter((r) => r.task_id === t.id && r.revision === t.revision)
      return {
        id: t.id,
        examPart: t.exam_part,
        level: t.level,
        format: t.format,
        field: t.field,
        title: t.title,
        origin: t.origin,
        revision: t.revision,
        updatedAt: t.updated_at,
        isOwner: t.owner_id === userId,
        reviewerCount: (reviewers ?? []).filter((r) => r.task_id === t.id).length,
        submittedCount: current.length,
        ...(t.owner_id !== userId
          ? { ownerEmail: ownerEmails.get(t.owner_id), myReviewSubmitted: current.some((r) => r.reviewer_id === userId) }
          : {}),
      }
    }
    res.status(200).json({ owned: (owned ?? []).map((t) => summarize(t as (typeof all)[number])), assigned: (assigned ?? []).map((t) => summarize(t as (typeof all)[number])) })
    return
  }

  if (req.method === 'GET') {
    const { row, isOwner } = await loadTask(idFrom(req), userId)
    const { data: mine, error } = await supabaseAdmin
      .from('exam_task_reviews')
      .select('reviewer_id, revision, answers, verdicts, recommendation, overall_note, submitted_at')
      .eq('task_id', row.id)
      .eq('reviewer_id', userId)
      .eq('revision', row.revision)
      .maybeSingle()
    if (error) throw error
    const ownerEmail = isOwner ? undefined : (await emailsFor([row.owner_id])).get(row.owner_id)
    const body: Record<string, unknown> = {
      task: toTask(row, userId, ownerEmail),
      myReview: mine ? toReview(mine as ReviewRow, '') : null,
    }
    if (isOwner) {
      const [{ data: links, error: le }, { data: all, error: re }] = await Promise.all([
        supabaseAdmin.from('exam_task_reviewers').select('reviewer_id, invited_at').eq('task_id', row.id).order('invited_at'),
        supabaseAdmin
          .from('exam_task_reviews')
          .select('reviewer_id, revision, answers, verdicts, recommendation, overall_note, submitted_at')
          .eq('task_id', row.id)
          .not('submitted_at', 'is', null)
          .order('revision', { ascending: false }),
      ])
      if (le) throw le
      if (re) throw re
      const emails = await emailsFor([...new Set([...(links ?? []).map((l) => l.reviewer_id as string), ...(all ?? []).map((r) => r.reviewer_id as string)])])
      const reviewers: ReviewerStatus[] = (links ?? []).map((l) => ({
        reviewerId: l.reviewer_id as string,
        email: emails.get(l.reviewer_id as string) ?? 'unknown',
        invitedAt: l.invited_at as string,
        submitted: (all ?? []).some((r) => r.reviewer_id === l.reviewer_id && r.revision === row.revision),
      }))
      body.reviewers = reviewers
      body.reviews = (all ?? []).map((r) => toReview(r as ReviewRow, r.reviewer_id === userId ? 'you' : (emails.get(r.reviewer_id as string) ?? 'unknown')))
    }
    res.status(200).json(body)
    return
  }

  if (req.method === 'POST') {
    let input
    try {
      input = sanitizeTaskInput(req.body)
    } catch (err) {
      badRequest(err)
    }
    const { data, error } = await supabaseAdmin
      .from('exam_tasks')
      .insert({
        owner_id: userId,
        exam_part: input.examPart,
        level: input.level,
        format: input.content.format,
        field: input.field,
        title: input.title,
        origin: input.origin,
        source_ref: input.sourceRef,
        content: input.content,
      })
      .select(TASK_COLUMNS)
      .single()
    if (error) throw error
    res.status(201).json({ task: toTask(data as TaskRow, userId) })
    return
  }

  if (req.method === 'PUT') {
    const { row, isOwner } = await loadTask(idFrom(req), userId)
    if (!isOwner) throw new HttpError(404, { error: 'Not found' })
    let input
    try {
      input = sanitizeTaskInput(req.body)
    } catch (err) {
      badRequest(err)
    }
    const contentChanged = JSON.stringify(input.content) !== JSON.stringify(row.content) || input.level !== row.level
    const { data, error } = await supabaseAdmin
      .from('exam_tasks')
      .update({
        level: input.level,
        format: input.content.format,
        field: input.field,
        title: input.title,
        source_ref: input.sourceRef,
        content: input.content,
        revision: contentChanged ? row.revision + 1 : row.revision,
        updated_at: new Date().toISOString(),
      })
      .eq('id', row.id)
      .eq('owner_id', userId)
      .select(TASK_COLUMNS)
      .single()
    if (error) throw error
    res.status(200).json({ task: toTask(data as TaskRow, userId) })
    return
  }

  if (req.method === 'DELETE') {
    const { row, isOwner } = await loadTask(idFrom(req), userId)
    if (!isOwner) throw new HttpError(404, { error: 'Not found' })
    const { data: files } = await supabaseAdmin.storage.from(AUDIO_BUCKET).list(row.id)
    if (files?.length) await supabaseAdmin.storage.from(AUDIO_BUCKET).remove(files.map((f) => `${row.id}/${f.name}`))
    const { error } = await supabaseAdmin.from('exam_tasks').delete().eq('id', row.id).eq('owner_id', userId)
    if (error) throw error
    res.status(200).json({ ok: true })
    return
  }

  throw new HttpError(405, { error: 'Method not allowed' })
}

// --- Generation ------------------------------------------------------------------------------

async function checkDailyLimit(userId: string): Promise<number> {
  const used = await generationsToday(userId)
  if (used >= TASK_GENERATIONS_PER_DAY) throw new HttpError(429, { error: 'daily_limit', limit: TASK_GENERATIONS_PER_DAY })
  return used
}

export async function handleGenerate(req: VercelRequest, res: VercelResponse, userId: string) {
  if (req.method !== 'POST') throw new HttpError(405, { error: 'Method not allowed' })
  const body = (req.body ?? {}) as Record<string, unknown>
  const level = TASK_LEVELS.find((l) => l === body.level)
  const format = LISTENING_FORMATS.find((f) => f === body.format)
  if (!level || !format) throw new HttpError(400, { error: 'level and format are required' })
  const field = EXAM_FIELDS.find((f) => f === body.field) ?? 'general'
  const style = body.style === 'infer' ? 'infer' : (SCRIPT_STYLES.find((s) => s === body.style) ?? 'infer')
  const avoid = typeof body.avoid === 'string' ? body.avoid.trim().slice(0, 500) : ''

  let source = typeof body.sourceText === 'string' ? body.sourceText.trim().slice(0, 30_000) : ''
  let sourceTitle = ''
  const sourceUrl = typeof body.sourceUrl === 'string' ? body.sourceUrl.trim() : ''
  if (!source && sourceUrl) {
    try {
      const fetched = await fetchSourceText(sourceUrl)
      source = fetched.text
      sourceTitle = fetched.title
    } catch (err) {
      throw new HttpError(422, { error: err instanceof Error && err.message === 'invalid_url' ? 'invalid_url' : 'source_fetch_failed' })
    }
  }
  if (source.split(/\s+/).filter(Boolean).length < 80) throw new HttpError(400, { error: 'source_too_short' })

  // The environment-topic rule (listening-task-intake skill): ask before generating anything.
  if (format === 'notes' && body.ignoreEnvironment !== true && looksEnvironmental(source)) {
    throw new HttpError(409, { error: 'environment_topic' })
  }

  const used = await checkDailyLimit(userId)
  const input: GenerateInput = { level, format, field, style, source, avoid }
  let generated
  try {
    generated = await generateListeningTask(input, userId)
  } catch (err) {
    console.error('Exam task generation failed', err)
    throw new HttpError(502, { error: 'generation_failed' })
  }
  if (format === 'notes' && generated.environmentTopic && body.ignoreEnvironment !== true) {
    throw new HttpError(409, { error: 'environment_topic', remaining: Math.max(0, TASK_GENERATIONS_PER_DAY - used - 1) })
  }
  res.status(200).json({
    draft: { title: generated.title, content: generated.content, sourceRef: sourceUrl || sourceTitle },
    remaining: Math.max(0, TASK_GENERATIONS_PER_DAY - used - 1),
  })
}

export async function handleRevise(req: VercelRequest, res: VercelResponse, userId: string) {
  if (req.method !== 'POST') throw new HttpError(405, { error: 'Method not allowed' })
  const body = (req.body ?? {}) as Record<string, unknown>
  const level = TASK_LEVELS.find((l) => l === body.level)
  if (!level) throw new HttpError(400, { error: 'level is required' })
  let content
  try {
    content = sanitizeListeningContent(body.content)
  } catch (err) {
    badRequest(err)
  }
  const problems = (Array.isArray(body.problems) ? body.problems : []).filter((p): p is string => typeof p === 'string').map((p) => p.slice(0, 300))
  const teacherNote = typeof body.teacherNote === 'string' ? body.teacherNote.trim().slice(0, 1000) : ''
  if (problems.length === 0 && !teacherNote) throw new HttpError(400, { error: 'nothing_to_revise' })

  const used = await checkDailyLimit(userId)
  let revised
  try {
    revised = await reviseListeningTask({ level, content, problems, keepScript: body.keepScript === true, teacherNote }, userId)
  } catch (err) {
    console.error('Exam task revision failed', err)
    throw new HttpError(502, { error: 'generation_failed' })
  }
  // Keep what the teacher wrote outside the model's reach.
  revised.content.authorNotes = content.authorNotes
  res.status(200).json({ draft: { title: revised.title, content: revised.content }, remaining: Math.max(0, TASK_GENERATIONS_PER_DAY - used - 1) })
}

// --- Audio -----------------------------------------------------------------------------------

const VOICES = ['en-GB-SoniaNeural', 'en-GB-RyanNeural', 'en-GB-LibbyNeural', 'en-GB-ThomasNeural']
const SPEAKER_RE = /^((?:[A-Z][\w.'’-]*\s?){1,3}):\s+/

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/** The clean recording script as SSML: one voice per speaker, slowed to the level's speech rate. */
export function scriptSsml(content: ListeningTaskContent, level: ExamTask['level']): string {
  // Effective speed at Azure's default rate, pauses included, measured 2026-10-19: a monologue
  // (one voice, short breaks) about 170 wpm; a dialogue with speaker-change pauses about 155 wpm.
  const baseWpm = /^((?:[A-Z][\w.'’-]*\s?){1,3}):\s+/m.test(content.script) ? 155 : 170
  const rate = Math.round((levelSpec(level, content.format).wpm / baseWpm - 1) * 100)
  const voiceFor = new Map<string, string>()
  const paragraphs = cleanScript(content.script)
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
  const parts: string[] = []
  let current = VOICES[0]
  for (const para of paragraphs) {
    for (const line of para.split('\n')) {
      const label = line.match(SPEAKER_RE)?.[1]?.trim()
      if (label) {
        if (!voiceFor.has(label)) voiceFor.set(label, VOICES[voiceFor.size % VOICES.length])
        current = voiceFor.get(label) as string
      }
      const text = line.replace(SPEAKER_RE, '').trim()
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

export async function handleAudio(req: VercelRequest, res: VercelResponse, userId: string) {
  const { row, isOwner } = await loadTask(idFrom(req), userId)

  if (req.method === 'GET') {
    res.status(200).json({ url: audioIsCurrent(row) ? await signedAudioUrl(row.audio_path as string) : null, uploaded: row.audio_revision === null && !!row.audio_path })
    return
  }

  if (req.method === 'DELETE') {
    if (!isOwner) throw new HttpError(404, { error: 'Not found' })
    if (row.audio_path) await supabaseAdmin.storage.from(AUDIO_BUCKET).remove([row.audio_path])
    const { error } = await supabaseAdmin.from('exam_tasks').update({ audio_path: null, audio_revision: null }).eq('id', row.id)
    if (error) throw error
    res.status(200).json({ ok: true })
    return
  }

  if (req.method !== 'POST') throw new HttpError(405, { error: 'Method not allowed' })
  const mode = (req.body ?? {}).mode

  if (mode === 'tts') {
    // Owner or reviewer: a reviewer may be the first to open the test.
    if (audioIsCurrent(row)) {
      res.status(200).json({ url: await signedAudioUrl(row.audio_path as string) })
      return
    }
    if (!cleanScript(row.content.script).trim()) throw new HttpError(400, { error: 'empty_script' })
    let audio: Buffer
    try {
      audio = await synthesizeSsml(scriptSsml(row.content, row.level))
    } catch (err) {
      console.error('Exam task TTS failed', err)
      throw new HttpError(502, { error: 'tts_failed' })
    }
    const path = `${row.id}/r${row.revision}.mp3`
    const { error: upError } = await supabaseAdmin.storage.from(AUDIO_BUCKET).upload(path, audio, { contentType: 'audio/mpeg', upsert: true })
    if (upError) throw upError
    const old = row.audio_path && row.audio_path !== path ? row.audio_path : null
    const { error } = await supabaseAdmin.from('exam_tasks').update({ audio_path: path, audio_revision: row.revision }).eq('id', row.id)
    if (error) throw error
    if (old) await supabaseAdmin.storage.from(AUDIO_BUCKET).remove([old])
    res.status(200).json({ url: await signedAudioUrl(path) })
    return
  }

  if (!isOwner) throw new HttpError(404, { error: 'Not found' })

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
    const { error } = await supabaseAdmin.from('exam_tasks').update({ audio_path: path, audio_revision: null }).eq('id', row.id)
    if (error) throw error
    if (old) await supabaseAdmin.storage.from(AUDIO_BUCKET).remove([old])
    res.status(200).json({ url: await signedAudioUrl(path) })
    return
  }

  throw new HttpError(400, { error: 'Invalid mode' })
}

// --- Sharing, reviews ------------------------------------------------------------------------

async function teacherIds(ids: string[]): Promise<Set<string>> {
  if (ids.length === 0) return new Set()
  const { data, error } = await supabaseAdmin.from('profiles').select('user_id').in('user_id', ids).eq('role', 'teacher')
  if (error) throw error
  return new Set((data ?? []).map((r) => r.user_id as string))
}

function idList(value: unknown, max: number): string[] {
  if (!Array.isArray(value)) throw new HttpError(400, { error: 'Expected a list of ids' })
  const ids = [...new Set(value.filter((v): v is string => typeof v === 'string' && UUID_RE.test(v)))]
  if (ids.length > max) throw new HttpError(400, { error: `At most ${max} teachers` })
  return ids
}

export async function handleShare(req: VercelRequest, res: VercelResponse, userId: string) {
  if (req.method !== 'PUT') throw new HttpError(405, { error: 'Method not allowed' })
  const { row, isOwner } = await loadTask(idFrom(req), userId)
  if (!isOwner) throw new HttpError(404, { error: 'Not found' })
  const wanted = idList((req.body ?? {}).reviewerIds, POOL_MAX_MEMBERS).filter((id) => id !== userId)
  const valid = await teacherIds(wanted)
  const ids = wanted.filter((id) => valid.has(id))

  const { data: existing, error } = await supabaseAdmin.from('exam_task_reviewers').select('reviewer_id').eq('task_id', row.id)
  if (error) throw error
  const have = new Set((existing ?? []).map((r) => r.reviewer_id as string))
  const toAdd = ids.filter((id) => !have.has(id))
  const toRemove = [...have].filter((id) => !ids.includes(id))
  if (toAdd.length) {
    const { error: e } = await supabaseAdmin.from('exam_task_reviewers').insert(toAdd.map((reviewer_id) => ({ task_id: row.id, reviewer_id })))
    if (e) throw e
  }
  if (toRemove.length) {
    const { error: e } = await supabaseAdmin.from('exam_task_reviewers').delete().eq('task_id', row.id).in('reviewer_id', toRemove)
    if (e) throw e
  }
  res.status(200).json({ reviewerIds: ids })
}

const RECOMMENDATIONS: TaskRecommendation[] = ['publish', 'revise', 'reject']

export async function handleReview(req: VercelRequest, res: VercelResponse, userId: string) {
  if (req.method !== 'PUT') throw new HttpError(405, { error: 'Method not allowed' })
  const { row } = await loadTask(idFrom(req), userId)
  const body = (req.body ?? {}) as Record<string, unknown>

  const answers: Record<string, boolean | string> = {}
  if (typeof body.answers === 'object' && body.answers !== null) {
    for (const [k, v] of Object.entries(body.answers as Record<string, unknown>).slice(0, 40)) {
      if (!/^\d{1,2}$/.test(k)) continue
      if (typeof v === 'boolean') answers[k] = v
      else if (typeof v === 'string') answers[k] = v.slice(0, 120)
    }
  }
  const reasons = validReasonIds()
  const verdicts: Record<string, ItemReview> = {}
  if (typeof body.verdicts === 'object' && body.verdicts !== null) {
    for (const [k, v] of Object.entries(body.verdicts as Record<string, unknown>).slice(0, 40)) {
      if (!/^\d{1,2}$/.test(k) && k !== 'task') continue
      const review = sanitizeItemReview(v, reasons)
      if (review) verdicts[k] = review
    }
  }
  const recommendation = RECOMMENDATIONS.find((r) => r === body.recommendation) ?? null
  const overallNote = typeof body.overallNote === 'string' ? body.overallNote.trim().slice(0, OVERALL_NOTE_MAX) : ''
  const submit = body.submit === true
  if (submit && !recommendation) throw new HttpError(400, { error: 'recommendation_required' })

  const { data, error } = await supabaseAdmin
    .from('exam_task_reviews')
    .upsert(
      {
        task_id: row.id,
        reviewer_id: userId,
        revision: row.revision,
        answers,
        verdicts,
        recommendation,
        overall_note: overallNote,
        submitted_at: submit ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'task_id,reviewer_id,revision' },
    )
    .select('reviewer_id, revision, answers, verdicts, recommendation, overall_note, submitted_at')
    .single()
  if (error) throw error
  res.status(200).json({ review: toReview(data as ReviewRow, '') })
}

// --- Teachers and pools ----------------------------------------------------------------------

export async function handleTeachers(req: VercelRequest, res: VercelResponse, userId: string) {
  if (req.method !== 'GET') throw new HttpError(405, { error: 'Method not allowed' })
  const { data, error } = await supabaseAdmin.from('profiles').select('user_id').eq('role', 'teacher').neq('user_id', userId).limit(500)
  if (error) throw error
  const ids = (data ?? []).map((r) => r.user_id as string)
  const emails = await emailsFor(ids)
  const teachers = ids.map((id) => ({ id, email: emails.get(id) ?? 'unknown' })).sort((a, b) => a.email.localeCompare(b.email))
  res.status(200).json({ teachers })
}

export async function handlePools(req: VercelRequest, res: VercelResponse, userId: string) {
  const toPool = (r: { id: string; name: string; member_ids: string[] }): TeacherPool => ({ id: r.id, name: r.name, memberIds: r.member_ids ?? [] })

  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin.from('teacher_pools').select('id, name, member_ids').eq('owner_id', userId).order('name')
    if (error) throw error
    res.status(200).json({ pools: (data ?? []).map(toPool) })
    return
  }

  if (req.method === 'DELETE') {
    const { data, error } = await supabaseAdmin.from('teacher_pools').delete().eq('id', idFrom(req)).eq('owner_id', userId).select('id')
    if (error) throw error
    if (!data?.length) throw new HttpError(404, { error: 'Not found' })
    res.status(200).json({ ok: true })
    return
  }

  if (req.method !== 'POST' && req.method !== 'PUT') throw new HttpError(405, { error: 'Method not allowed' })
  const body = (req.body ?? {}) as Record<string, unknown>
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  if (!name || name.length > POOL_NAME_MAX) throw new HttpError(400, { error: `name must be 1–${POOL_NAME_MAX} characters` })
  const wanted = idList(body.memberIds, POOL_MAX_MEMBERS).filter((id) => id !== userId)
  const valid = await teacherIds(wanted)
  const memberIds = wanted.filter((id) => valid.has(id))

  if (req.method === 'POST') {
    const { data, error } = await supabaseAdmin.from('teacher_pools').insert({ owner_id: userId, name, member_ids: memberIds }).select('id, name, member_ids').single()
    if (error) throw error
    res.status(201).json({ pool: toPool(data) })
    return
  }
  const { data, error } = await supabaseAdmin
    .from('teacher_pools')
    .update({ name, member_ids: memberIds, updated_at: new Date().toISOString() })
    .eq('id', idFrom(req))
    .eq('owner_id', userId)
    .select('id, name, member_ids')
    .maybeSingle()
  if (error) throw error
  if (!data) throw new HttpError(404, { error: 'Not found' })
  res.status(200).json({ pool: toPool(data) })
}
