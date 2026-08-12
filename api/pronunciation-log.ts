import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getUserFromRequest, supabaseAdmin } from './_lib/supabaseAdmin.js'
import { DEEP_CHECK_MAX_SECONDS } from '../src/lib/pronunciationConfig.js'

interface PronunciationLogRequestBody {
  scenarioId: string
  targetSentence: string
  azureResult: unknown
  audioSeconds: number
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const user = await getUserFromRequest(req)
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const body = req.body as PronunciationLogRequestBody
  const clampedSeconds = Math.max(0, Math.min(DEEP_CHECK_MAX_SECONDS, body.audioSeconds ?? 0))

  await supabaseAdmin.from('pronunciation_checks').insert({
    user_id: user.id,
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
