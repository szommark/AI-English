import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getUserFromRequest, supabaseAdmin } from '../../_lib/supabaseAdmin.js'
import { getUserRole } from '../../_lib/roles.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const user = await getUserFromRequest(req)
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const studentId = req.query.studentId
  if (typeof studentId !== 'string') {
    res.status(400).json({ error: 'Missing studentId' })
    return
  }

  const role = await getUserRole(user.id)
  if (role !== 'teacher') {
    res.status(403).json({ error: 'Forbidden' })
    return
  }

  const { data: link } = await supabaseAdmin
    .from('teacher_student_links')
    .select('id')
    .eq('teacher_id', user.id)
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
