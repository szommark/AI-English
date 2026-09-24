import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getUserFromRequest, supabaseAdmin } from './_lib/supabaseAdmin.js'
import { issueAzureToken } from './_lib/azure.js'
import { upsertMistakeEntry } from './_lib/personalization.js'
import { getScenario } from '../src/data/scenarios.js'
import { getSoundItem } from '../src/data/pronunciationCurriculum.js'
import { DEEP_CHECK_MAX_SECONDS, MONTHLY_AZURE_SECONDS_CAP } from '../src/lib/pronunciationConfig.js'

// Single Vercel function for the whole /api/pronunciation surface (Azure token, Deep
// Check log, per-sound progress), multiplexed by ?action= to stay under Vercel Hobby's
// 12-serverless-function cap — do not add new files directly under api/.

interface PronunciationTokenRequestBody {
  scenarioId: string
}

async function handleToken(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const body = req.body as PronunciationTokenRequestBody
  // `scenarioId` also doubles as a Pronunciation Session sound-item id — that feature has no
  // "scenario" of its own, so it reuses this same token/log flow with its item id in this slot.
  const contentExists = Boolean(getScenario(body.scenarioId) ?? getSoundItem(body.scenarioId))
  if (!contentExists) {
    res.status(400).json({ error: 'Unknown scenario' })
    return
  }

  const { error: reserveError } = await supabaseAdmin.rpc('reserve_deep_check', {
    p_reserve_seconds: DEEP_CHECK_MAX_SECONDS,
    p_monthly_cap: MONTHLY_AZURE_SECONDS_CAP,
  })

  if (reserveError) {
    if (reserveError.message.includes('monthly_cap_exceeded')) {
      res.status(403).json({
        error: 'monthly_limit_reached',
        message: 'Havi keret elérve, jövő hónapban frissül.',
      })
      return
    }

    res.status(502).json({ error: reserveError.message })
    return
  }

  try {
    const { token, region } = await issueAzureToken()
    res.status(200).json({ token, region })
  } catch (err) {
    await supabaseAdmin.rpc('release_deep_check_reservation', { p_reserve_seconds: DEEP_CHECK_MAX_SECONDS })
    res.status(502).json({ error: err instanceof Error ? err.message : 'Azure token request failed' })
  }
}

interface PronunciationLogRequestBody {
  scenarioId: string
  targetSentence: string
  azureResult: unknown
  audioSeconds: number
}

async function handleLog(req: VercelRequest, res: VercelResponse, userId: string) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const body = req.body as PronunciationLogRequestBody
  const clampedSeconds = Math.max(0, Math.min(DEEP_CHECK_MAX_SECONDS, body.audioSeconds ?? 0))

  await supabaseAdmin.from('pronunciation_checks').insert({
    user_id: userId,
    scenario_id: body.scenarioId,
    target_sentence: body.targetSentence,
    azure_result: body.azureResult,
    audio_seconds: clampedSeconds,
  })

  await supabaseAdmin.rpc('true_up_deep_check_seconds', {
    p_delta: clampedSeconds - DEEP_CHECK_MAX_SECONDS,
  })

  res.status(200).json({ ok: true })
}

interface PronunciationProgressRequestBody {
  soundItemId: string
  perceptionScore?: number
  productionScore?: number
  /** Words Azure flagged as mispronounced in the production stage — written to mistake_log alongside the score upsert. */
  flaggedWords?: string[]
}

async function handleProgress(req: VercelRequest, res: VercelResponse, userId: string) {
  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('pronunciation_progress')
      .select('sound_item_id, perception_score, production_score, attempts, updated_at')
      .eq('user_id', userId)

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
    p_user_id: userId,
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
      await upsertMistakeEntry(userId, 'pronunciation', word, null)
    }
  } catch (err) {
    console.error('Failed to write pronunciation mistake_log entries', err)
  }

  res.status(200).json({ ok: true })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await getUserFromRequest(req)
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const action = req.query.action

  switch (action) {
    case 'token':
      await handleToken(req, res)
      return
    case 'log':
      await handleLog(req, res, user.id)
      return
    case 'progress':
      await handleProgress(req, res, user.id)
      return
    default:
      res.status(404).json({ error: 'Not found' })
  }
}
