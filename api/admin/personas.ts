import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getUserFromRequest, supabaseAdmin } from '../_lib/supabaseAdmin.js'
import { getUserRole } from '../_lib/roles.js'

interface CreatePersonaBody {
  displayName: string
  description?: string
  promptText: string
  enabledForStudents?: boolean
  enabledForTeachers?: boolean
}

function slugify(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'persona'
}

/** Generates a unique persona id from the display name — appends -2, -3, ... on collision. */
async function generateUniqueId(displayName: string): Promise<string> {
  const baseId = slugify(displayName)
  let id = baseId
  for (let suffix = 2; ; suffix++) {
    const { data: existing } = await supabaseAdmin.from('tutor_personas').select('id').eq('id', id).maybeSingle()
    if (!existing) return id
    id = `${baseId}-${suffix}`
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
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

  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('tutor_personas')
      .select(
        'id, display_name, description, prompt_text, enabled_for_students, enabled_for_teachers, is_builtin, created_at',
      )
      .order('created_at', { ascending: true })

    if (error) {
      res.status(500).json({ error: 'Failed to load personas' })
      return
    }
    res.status(200).json({ personas: data })
    return
  }

  if (req.method === 'POST') {
    const body = req.body as CreatePersonaBody
    if (!body.displayName?.trim() || !body.promptText?.trim()) {
      res.status(400).json({ error: 'displayName and promptText are required' })
      return
    }

    const id = await generateUniqueId(body.displayName)

    const { data, error } = await supabaseAdmin
      .from('tutor_personas')
      .insert({
        id,
        display_name: body.displayName.trim(),
        description: body.description?.trim() ?? '',
        prompt_text: body.promptText,
        enabled_for_students: Boolean(body.enabledForStudents),
        enabled_for_teachers: Boolean(body.enabledForTeachers),
        is_builtin: false,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      res.status(500).json({ error: 'Failed to create persona' })
      return
    }
    res.status(201).json({ persona: data })
    return
  }

  res.status(405).json({ error: 'Method not allowed' })
}
