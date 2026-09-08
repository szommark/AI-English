import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getUserFromRequest, supabaseAdmin } from './_lib/supabaseAdmin.js'
import { upsertMistakeEntry } from './_lib/personalization.js'
import { getSoundItem } from '../src/data/pronunciationCurriculum.js'

interface PronunciationProgressRequestBody {
  soundItemId: string
  perceptionScore?: number
  productionScore?: number
  /** Words Azure flagged as mispronounced in the production stage — written to mistake_log alongside the score upsert. */
  flaggedWords?: string[]
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await getUserFromRequest(req)
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('pronunciation_progress')
      .select('sound_item_id, perception_score, production_score, attempts, updated_at')
      .eq('user_id', user.id)

    if (error) {
      res.status(502).json({ error: error.message })
      return
    }

    res.status(200).json({
      progress: (data ?? []).map((row) => ({
        soundItemId: row.sound_item_id,
        perceptionScore: row.perception_score,
        productionScore: row.production_score,
        attempts: row.attempts,
        updatedAt: row.updated_at,
      })),
    })
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const body = req.body as PronunciationProgressRequestBody
  if (!body.soundItemId || !getSoundItem(body.soundItemId)) {
    res.status(400).json({ error: 'Unknown sound item' })
    return
  }

  const { error } = await supabaseAdmin.rpc('upsert_pronunciation_progress', {
    p_user_id: user.id,
    p_sound_item_id: body.soundItemId,
    p_perception_score: body.perceptionScore ?? null,
    p_production_score: body.productionScore ?? null,
  })

  if (error) {
    res.status(502).json({ error: error.message })
    return
  }

  // Per-attempt phoneme/prosody detail isn't stored (see docs/pronunciation-session-brief.md),
  // but the flagged words themselves feed the same cross-feature mistake_log signal that
  // grammar/vocabulary corrections already write to — a failure here shouldn't fail the
  // score upsert above, which already succeeded.
  try {
    for (const word of body.flaggedWords ?? []) {
      await upsertMistakeEntry(user.id, 'pronunciation', word, null)
    }
  } catch (err) {
    console.error('Failed to write pronunciation mistake_log entries', err)
  }

  res.status(200).json({ ok: true })
}
