import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getUserFromRequest, supabaseAdmin } from './_lib/supabaseAdmin.js'
import { issueAzureToken } from './_lib/azure.js'
import { getScenario } from '../src/data/scenarios.js'
import { getSoundItem } from '../src/data/pronunciationCurriculum.js'
import { DEEP_CHECK_MAX_SECONDS, MONTHLY_AZURE_SECONDS_CAP } from '../src/lib/pronunciationConfig.js'

interface PronunciationTokenRequestBody {
  scenarioId: string
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
