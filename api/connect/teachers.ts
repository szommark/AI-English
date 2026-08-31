import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getUserFromRequest, supabaseAdmin } from '../_lib/supabaseAdmin.js'

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

  const { data: links, error } = await supabaseAdmin
    .from('teacher_student_links')
    .select('teacher_id, created_at')
    .eq('student_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) {
    res.status(500).json({ error: 'Failed to load connected teachers' })
    return
  }

  // A student's connected-teacher list is small at this app's scale, so a simple
  // per-link loop (rather than a batched auth.users lookup) is acceptable — same
  // tradeoff as api/teacher/roster.ts's per-student loop.
  const teachers = await Promise.all(
    (links ?? []).map(async (link) => {
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(link.teacher_id)
      return {
        teacherId: link.teacher_id,
        email: authUser.user?.email ?? 'unknown',
        connectedAt: link.created_at,
      }
    }),
  )

  res.status(200).json({ teachers })
}
