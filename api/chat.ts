import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getUserFromRequest, supabaseAdmin } from './_lib/supabaseAdmin.js'
import { callGroqChat, callGroqFeedback, parseFeedbackJson } from './_lib/groq.js'
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

  // Daily session cap intentionally removed while the user base is small (see git
  // history for this line — `git log -p -- api/chat.ts` — to reinstate the
  // increment_daily_session_count RPC call that used to run here on turnIndex 0).

  const recentHistory = body.history.slice(-HISTORY_WINDOW)

  let chatResult
  try {
    chatResult = await callGroqChat(scenario.systemPrompt, recentHistory)
  } catch (err) {
    res.status(502).json({ error: err instanceof Error ? err.message : 'Groq request failed' })
    return
  }

  try {
    const { error } = await supabaseAdmin.from('groq_usage_log').insert({
      user_id: user.id,
      scenario_id: scenario.id,
      call_type: 'chat',
      prompt_tokens: chatResult.usage?.prompt_tokens ?? null,
      completion_tokens: chatResult.usage?.completion_tokens ?? null,
      total_tokens: chatResult.usage?.total_tokens ?? null,
    })
    if (error) throw error
  } catch (err) {
    console.error('Failed to log chat usage', err)
  }

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
    const feedbackResult = await callGroqFeedback(scenario.title, scenario.aiRole, fullTranscript)
    feedback = parseFeedbackJson(feedbackResult.content)

    try {
      const { error } = await supabaseAdmin.from('groq_usage_log').insert({
        user_id: user.id,
        scenario_id: scenario.id,
        call_type: 'feedback',
        prompt_tokens: feedbackResult.usage?.prompt_tokens ?? null,
        completion_tokens: feedbackResult.usage?.completion_tokens ?? null,
        total_tokens: feedbackResult.usage?.total_tokens ?? null,
      })
      if (error) throw error
    } catch (err) {
      console.error('Failed to log feedback usage', err)
    }
  } catch {
    feedback = { strengths: [], corrections: [] }
  }

  try {
    const { error } = await supabaseAdmin.from('sessions').insert({
      user_id: user.id,
      scenario_id: scenario.id,
      mode: body.mode,
      transcript: fullTranscript,
      feedback,
    })
    if (error) throw error
  } catch (err) {
    console.error('Failed to save session', err)
  }

  res.status(200).json({ reply: chatResult.content, done: true, feedback })
}
