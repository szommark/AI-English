import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getUserFromRequest, supabaseAdmin } from './_lib/supabaseAdmin.js'
import { getUserRole } from './_lib/roles.js'

/** Personas visible to the caller's role — powers the picker on TutorBotPage. */
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

  let query = supabaseAdmin
    .from('tutor_personas')
    .select('id, display_name, description')
    .order('created_at', { ascending: true })

  if (role === 'teacher') {
    query = query.eq('enabled_for_teachers', true)
  } else if (role === 'student') {
    query = query.eq('enabled_for_students', true)
  }

  const { data, error } = await query
  if (error) {
    res.status(500).json({ error: 'Failed to load personas' })
    return
  }

  res.status(200).json({
    personas: (data ?? []).map((p) => ({ id: p.id, displayName: p.display_name, description: p.description })),
  })
}
