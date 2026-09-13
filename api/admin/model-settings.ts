import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getUserFromRequest, supabaseAdmin } from '../_lib/supabaseAdmin.js'
import { getUserRole } from '../_lib/roles.js'
import { DEFAULT_MODEL_BY_FEATURE, isModelId, type ModelFeature } from '../../src/lib/models.js'

const FEATURES: ModelFeature[] = ['rehearsal', 'grammarCoach', 'tutorBot']

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
    const { data, error } = await supabaseAdmin.from('model_settings').select('feature, model_id')
    if (error) {
      res.status(500).json({ error: 'Failed to load model settings' })
      return
    }

    const byFeature = new Map((data ?? []).map((row) => [row.feature, row.model_id]))
    const settings = Object.fromEntries(FEATURES.map((f) => [f, byFeature.get(f) ?? DEFAULT_MODEL_BY_FEATURE[f]]))
    res.status(200).json({ settings })
    return
  }

  if (req.method === 'PUT') {
    const body = req.body as Record<string, unknown>
    const updates = FEATURES.filter((f) => body[f] !== undefined)

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
        updated_by: user.id,
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
