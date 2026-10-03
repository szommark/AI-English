import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getUserFromRequest, supabaseAdmin } from './_lib/supabaseAdmin.js'
import { parseFeedbackJson } from './_lib/groq.js'
import { buildFeedbackPrompt } from './_lib/prompts.js'
import { callModel } from './_lib/modelRouter.js'
import { getModelForFeature } from './_lib/modelSettings.js'
import { logModelUsage } from './_lib/usageLog.js'
import { recordFeedbackToPersonalization } from './_lib/personalization.js'
import { awardXp } from './_lib/gamification.js'
import { SCENARIO_MIN_TURNS_FOR_XP } from '../src/lib/gamification/constants.js'
import { getScenario } from '../src/data/scenarios.js'
import type { ChatMessage } from '../src/lib/types.js'

const MAX_USER_TURNS = 6
const HISTORY_WINDOW = 4

interface ChatRequestBody {
  scenarioId: string
  mode: 'rehearsal' | 'test'
  history: ChatMessage[]
  turnIndex: number
  fullTranscript?: ChatMessage[]
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

  const body = req.body as ChatRequestBody
  const scenario = getScenario(body.scenarioId)
  if (!scenario) {
    res.status(400).json({ error: 'Unknown scenario' })
    return
  }
  const modelId = await getModelForFeature('rehearsal')

  // Daily session cap intentionally removed while the user base is small (see git
  // history for this line — `git log -p -- api/chat.ts` — to reinstate the
  // increment_daily_session_count RPC call that used to run here on turnIndex 0).

  const recentHistory = body.history.slice(-HISTORY_WINDOW)

  let chatResult
  try {
    chatResult = await callModel(modelId, scenario.systemPrompt, recentHistory)
  } catch (err) {
    res.status(502).json({ error: err instanceof Error ? err.message : 'Model request failed' })
    return
  }

  await logModelUsage({ userId: user.id, scenarioId: scenario.id, callType: 'chat', modelId, usage: chatResult.usage })

  const done = body.turnIndex >= MAX_USER_TURNS - 1

  if (!done) {
    res.status(200).json({ reply: chatResult.content, done: false })
    return
  }

  const fullTranscript: ChatMessage[] = [
    ...(body.fullTranscript ?? body.history),
    { role: 'assistant', content: chatResult.content },
  ]

  let feedback
  try {
    const { systemPrompt, messages } = buildFeedbackPrompt(scenario.title, scenario.aiRole, fullTranscript)
    const feedbackResult = await callModel(modelId, systemPrompt, messages)
    feedback = parseFeedbackJson(feedbackResult.content)

    await logModelUsage({
      userId: user.id,
      scenarioId: scenario.id,
      callType: 'feedback',
      modelId,
      usage: feedbackResult.usage,
    })
  } catch {
    feedback = { strengths: [], corrections: [] }
  }

  let sessionId: string | null = null
  try {
    const { data, error } = await supabaseAdmin
      .from('sessions')
      .insert({
        user_id: user.id,
        scenario_id: scenario.id,
        mode: body.mode,
        transcript: fullTranscript,
        feedback,
      })
      .select('id')
      .single()
    if (error) throw error
    sessionId = data.id
  } catch (err) {
    console.error('Failed to save session', err)
  }

  await recordFeedbackToPersonalization(user.id, feedback, modelId, { id: sessionId, source: 'scenario' })

  // XP for the finished conversation: "Teszt mód" (test) is the live scenario, "Gyakorlás"
  // (rehearsal) the guided one. The feedback has no numeric score yet, so no performance
  // bonus. awardXp never throws.
  const learnerTurns = fullTranscript.filter((m) => m.role === 'user').length
  const xp =
    learnerTurns >= SCENARIO_MIN_TURNS_FOR_XP
      ? await awardXp({
          userId: user.id,
          activityType: body.mode === 'test' ? 'conversational-english.scenario_live' : 'conversational-english.rehearsal',
          itemRef: scenario.id,
          language: 'en',
          performanceScore: null,
        })
      : null

  res.status(200).json({ reply: chatResult.content, done: true, feedback, xp })
}
