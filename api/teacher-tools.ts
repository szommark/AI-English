import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getUserFromRequest, supabaseAdmin } from './_lib/supabaseAdmin.js'
import { getUserRole, hasTeacherAccess } from './_lib/roles.js'
import { suggestLyricsGaps, suggestionsToday } from './_lib/lyricsSuggest.js'
import {
  LYRICS_GOAL_MAX_LENGTH,
  LYRICS_MAX_GAPS,
  LYRICS_MAX_LENGTH,
  LYRICS_SUGGESTIONS_PER_DAY,
  sanitizeLyricsActivity,
  tokenizeLyrics,
  type LyricsActivity,
  type LyricsActivityContent,
  type LyricsActivitySummary,
} from '../src/lib/lyricsGapFill.js'
import { sanitizeTenseSettingInput } from '../src/lib/tenseExplorerPolicy.js'
import { deleteTenseSetting, getTenseSetting, isActiveStudent, saveTenseSetting } from './_lib/tenseExplorerSettings.js'
import {
  handleAudio,
  handleExamTasks,
  handleGenerate,
  handlePools,
  handlePublish,
  handleReview,
  handleRevise,
  handleShare,
  handleTeachers,
  HttpError,
} from './_lib/examTasks.js'

// Single Vercel function for the Teacher Toolkit (docs/teacher-toolkit-design.md), teacher
// role only (everyone else gets 403). Multiplexed by ?action= like api/vocab.ts: each new
// tool adds actions here rather than a new file under api/ (Vercel Hobby caps a deployment
// at 12 functions).
//
// Lyrics gap-fill:
//   GET    lyrics                 the caller's activities, newest edit first (summaries)
//   GET    lyrics&id=             one activity
//   POST   lyrics                 create { title, artist, videoUrl, content } → { activity }
//   PUT    lyrics&id=             replace (same body) → { activity }
//   DELETE lyrics&id=             delete
//   POST   lyrics-suggest         { lyrics, goal, count, level? } → { gaps, remaining };
//                                  at most LYRICS_SUGGESTIONS_PER_DAY per UTC day (429)
// An activity that doesn't exist and one that belongs to another teacher both return 404.
//
// Tense Explorer settings (which tenses students see in Grammar Coach, docs/tense-explorer-design.md):
//   GET    tense-explorer[&studentId=]   { classSetting, studentSetting? } (null = not set)
//   PUT    tense-explorer                { tenses, allowCustomize, studentId? } → { setting }
//   DELETE tense-explorer[&studentId=]   remove the class setting or a student's override
// A studentId that isn't one of the caller's active students returns 404.
//
// Exam task maker (listening first; see api/_lib/examTasks.ts for every action):
//   exam-tasks, exam-task-publish, exam-task-generate, exam-task-revise, exam-task-audio, exam-task-share,
//   exam-task-review, teachers, teacher-pools

// AI task generation and TTS rendering can take tens of seconds.
export const config = { maxDuration: 60 }

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const CEFR = new Set(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])

interface ActivityRow {
  id: string
  title: string
  artist: string
  video_url: string
  content: LyricsActivityContent
  created_at: string
  updated_at: string
}

function toActivity(row: ActivityRow): LyricsActivity {
  return {
    id: row.id,
    title: row.title,
    artist: row.artist,
    videoUrl: row.video_url,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function idFrom(req: VercelRequest): string {
  const id = req.query.id
  if (typeof id !== 'string' || !UUID_RE.test(id)) throw new HttpError(404, { error: 'Not found' })
  return id
}

function parseBody(req: VercelRequest) {
  try {
    return sanitizeLyricsActivity(req.body)
  } catch (err) {
    throw new HttpError(400, { error: err instanceof Error ? err.message : 'Invalid activity' })
  }
}

async function handleLyrics(req: VercelRequest, res: VercelResponse, teacherId: string) {
  const columns = 'id, title, artist, video_url, content, created_at, updated_at'

  if (req.method === 'GET' && req.query.id === undefined) {
    const { data, error } = await supabaseAdmin
      .from('teacher_lyrics_activities')
      .select('id, title, artist, content, updated_at')
      .eq('teacher_id', teacherId)
      .order('updated_at', { ascending: false })
    if (error) throw error
    const activities: LyricsActivitySummary[] = (data ?? []).map((r) => ({
      id: r.id as string,
      title: r.title as string,
      artist: r.artist as string,
      gapCount: Array.isArray((r.content as LyricsActivityContent | null)?.gaps) ? (r.content as LyricsActivityContent).gaps.length : 0,
      updatedAt: r.updated_at as string,
    }))
    res.status(200).json({ activities })
    return
  }

  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('teacher_lyrics_activities')
      .select(columns)
      .eq('id', idFrom(req))
      .eq('teacher_id', teacherId)
      .maybeSingle()
    if (error) throw error
    if (!data) throw new HttpError(404, { error: 'Not found' })
    res.status(200).json({ activity: toActivity(data as ActivityRow) })
    return
  }

  if (req.method === 'POST') {
    const input = parseBody(req)
    const { data, error } = await supabaseAdmin
      .from('teacher_lyrics_activities')
      .insert({ teacher_id: teacherId, title: input.title, artist: input.artist, video_url: input.videoUrl, content: input.content })
      .select(columns)
      .single()
    if (error) throw error
    res.status(201).json({ activity: toActivity(data as ActivityRow) })
    return
  }

  if (req.method === 'PUT') {
    const id = idFrom(req)
    const input = parseBody(req)
    const { data, error } = await supabaseAdmin
      .from('teacher_lyrics_activities')
      .update({
        title: input.title,
        artist: input.artist,
        video_url: input.videoUrl,
        content: input.content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('teacher_id', teacherId)
      .select(columns)
      .maybeSingle()
    if (error) throw error
    if (!data) throw new HttpError(404, { error: 'Not found' })
    res.status(200).json({ activity: toActivity(data as ActivityRow) })
    return
  }

  if (req.method === 'DELETE') {
    const { data, error } = await supabaseAdmin
      .from('teacher_lyrics_activities')
      .delete()
      .eq('id', idFrom(req))
      .eq('teacher_id', teacherId)
      .select('id')
    if (error) throw error
    if (!data || data.length === 0) throw new HttpError(404, { error: 'Not found' })
    res.status(200).json({ ok: true })
    return
  }

  throw new HttpError(405, { error: 'Method not allowed' })
}

async function handleTenseExplorer(req: VercelRequest, res: VercelResponse, teacherId: string) {
  const rawStudentId = req.method === 'PUT' ? (req.body ?? {}).studentId : req.query.studentId
  let studentId: string | null = null
  if (rawStudentId !== undefined && rawStudentId !== null && rawStudentId !== '') {
    if (typeof rawStudentId !== 'string' || !UUID_RE.test(rawStudentId)) throw new HttpError(404, { error: 'Not found' })
    if (!(await isActiveStudent(teacherId, rawStudentId))) throw new HttpError(404, { error: 'Not found' })
    studentId = rawStudentId
  }

  if (req.method === 'GET') {
    const classSetting = await getTenseSetting(teacherId, null)
    if (!studentId) {
      res.status(200).json({ classSetting })
      return
    }
    res.status(200).json({ classSetting, studentSetting: await getTenseSetting(teacherId, studentId) })
    return
  }
  if (req.method === 'PUT') {
    let input
    try {
      input = sanitizeTenseSettingInput(req.body)
    } catch (err) {
      throw new HttpError(400, { error: err instanceof Error ? err.message : 'Invalid setting' })
    }
    res.status(200).json({ setting: await saveTenseSetting(teacherId, studentId, input) })
    return
  }
  if (req.method === 'DELETE') {
    await deleteTenseSetting(teacherId, studentId)
    res.status(200).json({ ok: true })
    return
  }
  throw new HttpError(405, { error: 'Method not allowed' })
}

async function handleLyricsSuggest(req: VercelRequest, res: VercelResponse, teacherId: string) {
  if (req.method !== 'POST') throw new HttpError(405, { error: 'Method not allowed' })
  const body = (req.body ?? {}) as Record<string, unknown>

  const lyrics = typeof body.lyrics === 'string' ? body.lyrics : ''
  if (lyrics.length > LYRICS_MAX_LENGTH) throw new HttpError(400, { error: `lyrics is longer than ${LYRICS_MAX_LENGTH} characters` })
  const doc = tokenizeLyrics(lyrics)
  if (doc.words.length === 0) throw new HttpError(400, { error: 'lyrics is empty' })

  const goal = typeof body.goal === 'string' ? body.goal.trim().replace(/\s+/g, ' ') : ''
  if (goal.length > LYRICS_GOAL_MAX_LENGTH) throw new HttpError(400, { error: `goal is longer than ${LYRICS_GOAL_MAX_LENGTH} characters` })
  const count = typeof body.count === 'number' && Number.isInteger(body.count) ? body.count : NaN
  if (!(count >= 1 && count <= LYRICS_MAX_GAPS)) throw new HttpError(400, { error: `count must be 1–${LYRICS_MAX_GAPS}` })
  const level = typeof body.level === 'string' && CEFR.has(body.level) ? body.level : null

  const used = await suggestionsToday(teacherId)
  if (used >= LYRICS_SUGGESTIONS_PER_DAY) {
    throw new HttpError(429, { error: 'daily_limit', limit: LYRICS_SUGGESTIONS_PER_DAY })
  }

  let gaps
  try {
    gaps = await suggestLyricsGaps(doc, { goal, count, level }, teacherId)
  } catch (err) {
    console.error('Lyrics gap suggestion failed', err)
    throw new HttpError(502, { error: 'suggestion_failed' })
  }
  res.status(200).json({ gaps, remaining: Math.max(0, LYRICS_SUGGESTIONS_PER_DAY - used - 1) })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await getUserFromRequest(req)
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  try {
    if (!hasTeacherAccess(await getUserRole(user.id))) throw new HttpError(403, { error: 'Forbidden' })
    switch (req.query.action) {
      case 'lyrics':
        await handleLyrics(req, res, user.id)
        return
      case 'lyrics-suggest':
        await handleLyricsSuggest(req, res, user.id)
        return
      case 'tense-explorer':
        await handleTenseExplorer(req, res, user.id)
        return
      case 'exam-tasks':
        await handleExamTasks(req, res, user.id)
        return
      case 'exam-task-publish':
        await handlePublish(req, res, user.id)
        return
      case 'exam-task-generate':
        await handleGenerate(req, res, user.id)
        return
      case 'exam-task-revise':
        await handleRevise(req, res, user.id)
        return
      case 'exam-task-audio':
        await handleAudio(req, res, user.id)
        return
      case 'exam-task-share':
        await handleShare(req, res, user.id)
        return
      case 'exam-task-review':
        await handleReview(req, res, user.id)
        return
      case 'teachers':
        await handleTeachers(req, res, user.id)
        return
      case 'teacher-pools':
        await handlePools(req, res, user.id)
        return
      default:
        res.status(404).json({ error: 'Not found' })
    }
  } catch (err) {
    if (err instanceof HttpError) {
      res.status(err.status).json(err.body)
      return
    }
    console.error('api/teacher-tools failed', { action: req.query.action, error: err })
    res.status(500).json({ error: 'Something went wrong' })
  }
}
