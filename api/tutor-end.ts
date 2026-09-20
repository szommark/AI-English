import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getUserFromRequest, supabaseAdmin } from './_lib/supabaseAdmin.js'
import { parseFeedbackJson } from './_lib/groq.js'
import { buildTutorFeedbackPrompt } from './_lib/prompts.js'
import { callModel } from './_lib/modelRouter.js'
import { getModelForFeature } from './_lib/modelSettings.js'
import { logModelUsage } from './_lib/usageLog.js'
import { recordFeedbackToPersonalization } from './_lib/personalization.js'
import type { ChatMessage, FeedbackResult } from '../src/lib/types.js'

interface TutorEndRequestBody {
  fullTranscript: ChatMessage[]
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

  const body = req.body as TutorEndRequestBody
  const modelId = await getModelForFeature('tutorBot')
  const fullTranscript = Array.isArray(body.fullTranscript) ? body.fullTranscript : []

  let feedback: FeedbackResult
  try {
    const { systemPrompt, messages } = buildTutorFeedbackPrompt(fullTranscript)
    const feedbackResult = await callModel(modelId, systemPrompt, messages)
    feedback = parseFeedbackJson(feedbackResult.content)

    await logModelUsage({
      userId: user.id,
      scenarioId: 'tutor-bot',
      callType: 'feedback',
      modelId,
      usage: feedbackResult.usage,
    })
  } catch {
    feedback = { strengths: [], corrections: [] }
  }

  try {
    const { error } = await supabaseAdmin.from('sessions').insert({
      user_id: user.id,
      scenario_id: null,
      mode: 'tutor',
      transcript: fullTranscript,
      feedback,
    })
    if (error) throw error
  } catch (err) {
    console.error('Failed to save tutor session', err)
  }

  await recordFeedbackToPersonalization(user.id, feedback, modelId)

  res.status(200).json({ feedback })
}
