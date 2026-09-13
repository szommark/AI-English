import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getUserFromRequest, supabaseAdmin } from './_lib/supabaseAdmin.js'
import { getUserRole, type UserRole } from './_lib/roles.js'
import { DEFAULT_MODEL_BY_FEATURE, isModelId, type ModelFeature } from '../src/lib/models.js'

// Personas and model settings are multiplexed onto this single route (rather than
// living at /api/admin/personas, /api/admin/personas/:id, /api/admin/model-settings)
// to stay under Vercel Hobby's 12-serverless-function-per-deployment cap — see git
// history for the split-file version this replaced.

const MODEL_FEATURES: ModelFeature[] = ['rehearsal', 'grammarCoach', 'tutorBot']

interface CreatePersonaBody {
  displayName: string
  description?: string
  promptText: string
  enabledForStudents?: boolean
  enabledForTeachers?: boolean
}

interface UpdatePersonaBody {
  id: string
  displayName?: string
  description?: string
  promptText?: string
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

async function handleModelSettings(req: VercelRequest, res: VercelResponse, role: UserRole, userId: string) {
  if (role !== 'admin') {
    res.status(403).json({ error: 'Forbidden' })
    return
  }

  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin.from('model_settings').select('feature, model_id')
    if (error) {
      res.status(500).json({ error: 'Failed to load model settings' })
      return
    }
    const byFeature = new Map((data ?? []).map((row) => [row.feature, row.model_id]))
    const settings = Object.fromEntries(MODEL_FEATURES.map((f) => [f, byFeature.get(f) ?? DEFAULT_MODEL_BY_FEATURE[f]]))
    res.status(200).json({ settings })
    return
  }

  if (req.method === 'PUT') {
    const body = req.body as Record<string, unknown>
    const updates = MODEL_FEATURES.filter((f) => body[f] !== undefined)

    for (const feature of updates) {
      if (!isModelId(body[feature])) {
        res.status(400).json({ error: `Invalid model for feature ${feature}` })
        return
      }
    }

    const { error } = await supabaseAdmin.from('model_settings').upsert(
      updates.map((feature) => ({
        feature,
        model_id: body[feature],
        updated_by: userId,
        updated_at: new Date().toISOString(),
      })),
    )
    if (error) {
      res.status(500).json({ error: 'Failed to save model settings' })
      return
    }
    res.status(200).json({ ok: true })
    return
  }

  res.status(405).json({ error: 'Method not allowed' })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await getUserFromRequest(req)
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const role = await getUserRole(user.id)

  if (req.query.resource === 'models') {
    await handleModelSettings(req, res, role, user.id)
    return
  }

  // Admin listing: every field, every persona, regardless of enabled flags.
  if (req.method === 'GET' && req.query.admin === '1') {
    if (role !== 'admin') {
      res.status(403).json({ error: 'Forbidden' })
      return
    }
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

  // Learner-facing listing: only personas enabled for the caller's role.
  if (req.method === 'GET') {
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
    return
  }

  if (req.method === 'POST') {
    if (role !== 'admin') {
      res.status(403).json({ error: 'Forbidden' })
      return
    }
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

  if (req.method === 'PATCH') {
    if (role !== 'admin') {
      res.status(403).json({ error: 'Forbidden' })
      return
    }
    const body = req.body as UpdatePersonaBody
    if (!body.id) {
      res.status(400).json({ error: 'id is required' })
      return
    }

    const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (body.displayName !== undefined) update.display_name = body.displayName.trim()
    if (body.description !== undefined) update.description = body.description.trim()
    if (body.promptText !== undefined) update.prompt_text = body.promptText
    if (body.enabledForStudents !== undefined) update.enabled_for_students = Boolean(body.enabledForStudents)
    if (body.enabledForTeachers !== undefined) update.enabled_for_teachers = Boolean(body.enabledForTeachers)

    const { data, error } = await supabaseAdmin
      .from('tutor_personas')
      .update(update)
      .eq('id', body.id)
      .select()
      .maybeSingle()

    if (error || !data) {
      res.status(500).json({ error: 'Failed to update persona' })
      return
    }
    res.status(200).json({ persona: data })
    return
  }

  res.status(405).json({ error: 'Method not allowed' })
}
