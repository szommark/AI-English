import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getUserFromRequest, supabaseAdmin } from './_lib/supabaseAdmin.js'
import { getUserRole } from './_lib/roles.js'

// Single Vercel function for the whole /api/teacher surface (invite-code, roster,
// student detail), dispatched by an `action` query param rather than by path
// segments — this project's vercel.json defines custom `rewrites`, which disables
// Vercel's automatic filesystem-based dynamic route matching ([param]/[...param])
// for anything but a literal path, so a path-segment-based catch-all silently falls
// through to the SPA instead of reaching the function. Consolidated from three
// separate files (including the students/[studentId].ts dynamic route) to stay
// under the Hobby plan's 12-Serverless-Function limit.

const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

function generateInviteCode(): string {
  const raw = Array.from({ length: 8 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('')
  return `${raw.slice(0, 4)}-${raw.slice(4)}`
}

async function handleInviteCode(req: VercelRequest, res: VercelResponse, userId: string) {
  const role = await getUserRole(userId)
  if (role !== 'teacher') {
    res.status(403).json({ error: 'Forbidden' })
    return
  }

  if (req.method === 'GET') {
    const { data: existing, error } = await supabaseAdmin
      .from('teacher_invite_codes')
      .select('code')
      .eq('teacher_id', userId)
      .maybeSingle()

    if (error) {
      res.status(500).json({ error: 'Failed to load invite code' })
      return
    }

    if (existing) {
      res.status(200).json({ code: existing.code })
      return
    }

    for (let attempt = 0; attempt < 2; attempt++) {
      const code = generateInviteCode()
      const { error: insertError } = await supabaseAdmin.from('teacher_invite_codes').insert({ teacher_id: userId, code })

      if (!insertError) {
        res.status(200).json({ code })
        return
      }
    }

    res.status(500).json({ error: 'Failed to generate invite code' })
    return
  }

  if (req.method === 'POST') {
    // Upsert on teacher_id (the table's primary key) rather than update, so this
    // also works the first time — a teacher who never called GET first still gets
    // a code rather than a silent no-op update matching zero rows.
    for (let attempt = 0; attempt < 2; attempt++) {
      const code = generateInviteCode()
      const { error } = await supabaseAdmin.from('teacher_invite_codes').upsert({
        teacher_id: userId,
        code,
        use_count: 0,
        created_at: new Date().toISOString(),
      })

      if (!error) {
        res.status(200).json({ code })
        return
      }
    }

    res.status(500).json({ error: 'Failed to regenerate invite code' })
    return
  }

  res.status(405).json({ error: 'Method not allowed' })
}

interface RosterEntry {
  studentId: string
  email: string
  connectedAt: string
  sessionCount: number
  lastSessionAt: string | null
}

async function handleRoster(req: VercelRequest, res: VercelResponse, userId: string) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const role = await getUserRole(userId)
  if (role !== 'teacher') {
    res.status(403).json({ error: 'Forbidden' })
    return
  }

  const { data: links, error } = await supabaseAdmin
    .from('teacher_student_links')
    .select('student_id, created_at')
    .eq('teacher_id', userId)
    .eq('status', 'active')

  if (error) {
    res.status(500).json({ error: 'Failed to load roster' })
    return
  }

  const students: RosterEntry[] = []

  // A teacher's roster is small at this app's scale, so a simple per-student loop
  // (rather than a batched auth.users lookup) is acceptable.
  for (const link of links ?? []) {
    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(link.student_id)
    const { count } = await supabaseAdmin
      .from('sessions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', link.student_id)
    const { data: lastSession } = await supabaseAdmin
      .from('sessions')
      .select('created_at')
      .eq('user_id', link.student_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    students.push({
      studentId: link.student_id,
      email: authUser.user?.email ?? 'unknown',
      connectedAt: link.created_at,
      sessionCount: count ?? 0,
      lastSessionAt: lastSession?.created_at ?? null,
    })
  }

  students.sort((a, b) => {
    if (!a.lastSessionAt) return 1
    if (!b.lastSessionAt) return -1
    return b.lastSessionAt.localeCompare(a.lastSessionAt)
  })

  res.status(200).json({ students })
}

async function handleStudentDetail(req: VercelRequest, res: VercelResponse, userId: string) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const studentId = req.query.studentId
  if (typeof studentId !== 'string') {
    res.status(400).json({ error: 'Missing studentId' })
    return
  }

  const role = await getUserRole(userId)
  if (role !== 'teacher') {
    res.status(403).json({ error: 'Forbidden' })
    return
  }

  const { data: link } = await supabaseAdmin
    .from('teacher_student_links')
    .select('id')
    .eq('teacher_id', userId)
    .eq('student_id', studentId)
    .eq('status', 'active')
    .maybeSingle()

  if (!link) {
    // Deliberately the same 404 whether the student doesn't exist or the teacher
    // just isn't connected to them — no reason to leak which one it is.
    res.status(404).json({ error: 'Not found' })
    return
  }

  const [{ data: sessions }, { data: mistakes }, { data: vocabulary }, { data: cefrHistory }] = await Promise.all([
    supabaseAdmin
      .from('sessions')
      .select('id, scenario_id, mode, feedback, created_at')
      .eq('user_id', studentId)
      .order('created_at', { ascending: false })
      .limit(50),
    supabaseAdmin
      .from('mistake_log')
      .select('category, occurrences, last_seen_at')
      .eq('user_id', studentId)
      .order('occurrences', { ascending: false })
      .limit(10),
    supabaseAdmin.from('vocabulary_mastery').select('status').eq('user_id', studentId),
    supabaseAdmin
      .from('cefr_history')
      .select('cefr_level, rationale, created_at')
      .eq('user_id', studentId)
      .order('created_at', { ascending: true }),
  ])

  const vocabularyCounts = { new: 0, practicing: 0, mastered: 0 }
  for (const row of vocabulary ?? []) {
    const status = row.status as 'new' | 'practicing' | 'mastered'
    if (status in vocabularyCounts) vocabularyCounts[status] += 1
  }

  res.status(200).json({
    sessions: (sessions ?? []).map((s) => ({
      id: s.id,
      scenarioId: s.scenario_id,
      mode: s.mode,
      feedback: s.feedback,
      createdAt: s.created_at,
    })),
    mistakes: (mistakes ?? []).map((m) => ({
      category: m.category,
      occurrences: m.occurrences,
      lastSeenAt: m.last_seen_at,
    })),
    vocabulary: vocabularyCounts,
    cefrHistory: (cefrHistory ?? []).map((c) => ({
      cefrLevel: c.cefr_level,
      rationale: c.rationale,
      createdAt: c.created_at,
    })),
  })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await getUserFromRequest(req)
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const action = req.query.action

  switch (action) {
    case 'invite-code':
      await handleInviteCode(req, res, user.id)
      return
    case 'roster':
      await handleRoster(req, res, user.id)
      return
    case 'student-detail':
      await handleStudentDetail(req, res, user.id)
      return
    default:
      res.status(404).json({ error: 'Not found' })
  }
}
