import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getUserFromRequest, supabaseAdmin } from '../_lib/supabaseAdmin.js'
import { getUserRole } from '../_lib/roles.js'

interface RosterEntry {
  studentId: string
  email: string
  connectedAt: string
  sessionCount: number
  lastSessionAt: string | null
}

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

  const role = await getUserRole(user.id)
  if (role !== 'teacher') {
    res.status(403).json({ error: 'Forbidden' })
    return
  }

  const { data: links, error } = await supabaseAdmin
    .from('teacher_student_links')
    .select('student_id, created_at')
    .eq('teacher_id', user.id)
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
