import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getUserFromRequest, nextUtcMidnight, supabaseAdmin } from './_lib/supabaseAdmin.js'
import { callGroqChat, callGroqFeedback, parseFeedbackJson } from './_lib/groq.js'
import { buildTutorSystemPrompt } from './_lib/prompts.js'
import type { ChatMessage } from '../src/lib/types.js'

const DAILY_LIMIT = 3
const MAX_USER_TURNS = 6
const HISTORY_WINDOW = 4

const TUTOR_TITLE = 'Tutor Bot conversation'
const TUTOR_ROLE = 'Tutor'

// Placeholder sample profile — real per-learner persistence is out of scope for this build.
// Only "first vs returning session" is a real, DB-backed check (see buildPromptForUser).
const SAMPLE_PROFILE = {
  learnerName: 'Alex',
  cefrLevel: 'B1' as const,
  learnerGoal: 'general everyday conversation practice',
  suggestedTopic: 'weekend plans',
}

type TutorChatBody =
  | { type: 'greet' }
  | { type: 'turn'; history: ChatMessage[]; turnIndex: number; fullTranscript?: ChatMessage[] }
  | { type: 'end'; fullTranscript: ChatMessage[] }

async function buildPromptForUser(userId: string): Promise<string> {
  const { count } = await supabaseAdmin
    .from('sessions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('mode', 'tutor')

  const isFirstSession = !count || count === 0

  return buildTutorSystemPrompt({
    ...SAMPLE_PROFILE,
    personalizationSummary: isFirstSession
      ? "This is their first Tutor Bot session — there's no history yet, so ask what they'd like to work on naturally if it comes up."
      : "They've used Tutor Bot before, but no detailed profile is saved yet beyond that — keep things natural rather than pretending to remember specifics.",
  })
}

async function logUsage(userId: string, callType: 'chat' | 'feedback', usage: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number } | null) {
  await supabaseAdmin.from('groq_usage_log').insert({
    user_id: userId,
    scenario_id: null,
    call_type: callType,
    prompt_tokens: usage?.prompt_tokens ?? null,
    completion_tokens: usage?.completion_tokens ?? null,
    total_tokens: usage?.total_tokens ?? null,
  })
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

  const body = req.body as TutorChatBody

  if (body.type === 'end') {
    if (!body.fullTranscript || body.fullTranscript.length === 0) {
      res.status(200).json({ feedback: { strengths: [], corrections: [] } })
      return
    }

    let feedback
    try {
      const feedbackResult = await callGroqFeedback(TUTOR_TITLE, TUTOR_ROLE, body.fullTranscript)
      feedback = parseFeedbackJson(feedbackResult.content)
      await logUsage(user.id, 'feedback', feedbackResult.usage)
    } catch {
      feedback = { strengths: [], corrections: [] }
    }

    await supabaseAdmin.from('sessions').insert({
      user_id: user.id,
      scenario_id: null,
      mode: 'tutor',
      transcript: body.fullTranscript,
      feedback,
    })

    res.status(200).json({ feedback })
    return
  }

  if (body.type === 'greet') {
    const { error: capError } = await supabaseAdmin.rpc('increment_daily_session_count', {
      p_user_id: user.id,
      p_max: DAILY_LIMIT,
    })
    if (capError) {
      res.status(403).json({ error: 'daily_cap_exceeded', resetAt: nextUtcMidnight() })
      return
    }

    const systemPrompt = await buildPromptForUser(user.id)

    let result
    try {
      result = await callGroqChat(systemPrompt, [
        {
          role: 'user',
          content:
            '(The learner has just opened the conversation. Greet them and start naturally, following the system prompt.)',
        },
      ])
    } catch (err) {
      res.status(502).json({ error: err instanceof Error ? err.message : 'Groq request failed' })
      return
    }

    await logUsage(user.id, 'chat', result.usage)

    res.status(200).json({ reply: result.content, done: false })
    return
  }

  // body.type === 'turn'
  const recentHistory = body.history.slice(-HISTORY_WINDOW)
  const systemPrompt = await buildPromptForUser(user.id)

  let chatResult
  try {
    chatResult = await callGroqChat(systemPrompt, recentHistory)
  } catch (err) {
    res.status(502).json({ error: err instanceof Error ? err.message : 'Groq request failed' })
    return
  }

  await logUsage(user.id, 'chat', chatResult.usage)

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
    const feedbackResult = await callGroqFeedback(TUTOR_TITLE, TUTOR_ROLE, fullTranscript)
    feedback = parseFeedbackJson(feedbackResult.content)
    await logUsage(user.id, 'feedback', feedbackResult.usage)
  } catch {
    feedback = { strengths: [], corrections: [] }
  }

  await supabaseAdmin.from('sessions').insert({
    user_id: user.id,
    scenario_id: null,
    mode: 'tutor',
    transcript: fullTranscript,
    feedback,
  })

  res.status(200).json({ reply: chatResult.content, done: true, feedback })
}
