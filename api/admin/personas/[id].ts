import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getUserFromRequest, supabaseAdmin } from '../../_lib/supabaseAdmin.js'
import { getUserRole } from '../../_lib/roles.js'

interface PatchPersonaBody {
  displayName?: string
  description?: string
  promptText?: string
  enabledForStudents?: boolean
  enabledForTeachers?: boolean
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PATCH') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const user = await getUserFromRequest(req)
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const role = await getUserRole(user.id)
  if (role !== 'admin') {
    res.status(403).json({ error: 'Forbidden' })
    return
  }

  const id = req.query.id as string
  const body = req.body as PatchPersonaBody

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (body.displayName !== undefined) update.display_name = body.displayName.trim()
  if (body.description !== undefined) update.description = body.description.trim()
  if (body.promptText !== undefined) update.prompt_text = body.promptText
  if (body.enabledForStudents !== undefined) update.enabled_for_students = Boolean(body.enabledForStudents)
  if (body.enabledForTeachers !== undefined) update.enabled_for_teachers = Boolean(body.enabledForTeachers)

  const { data, error } = await supabaseAdmin.from('tutor_personas').update(update).eq('id', id).select().maybeSingle()

  if (error || !data) {
    res.status(500).json({ error: 'Failed to update persona' })
    return
  }

  res.status(200).json({ persona: data })
}
