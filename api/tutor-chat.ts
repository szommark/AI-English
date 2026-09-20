import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getUserFromRequest } from './_lib/supabaseAdmin.js'
import { callModel } from './_lib/modelRouter.js'
import { logModelUsage } from './_lib/usageLog.js'
import { getModelForFeature } from './_lib/modelSettings.js'
import { getUserRole } from './_lib/roles.js'
import { getPersonaForRole, applyPersonaTokens } from './_lib/personas.js'
import { buildTutorSystemPrompt } from './_lib/prompts.js'
import { getLearnerProfile } from './_lib/personalization.js'
import type { ChatMessage } from '../src/lib/types.js'

const HISTORY_WINDOW = 4

// Soft anti-runaway guard, NOT a business rule — just a safety net so a stuck client
// can't loop forever calling Gemini. Change this freely; it isn't a session cap.
const MAX_TURN_INDEX = 40

const WRAP_UP_REPLY =
  "We've covered a lot today, so let's leave it there for now. Great job practicing — see you next time!"

const KICKOFF_MESSAGE: ChatMessage = {
  role: 'user',
  content: '(The learner has just opened the conversation. Greet them and start naturally, following the system prompt.)',
}

interface TutorChatRequestBody {
  history: ChatMessage[]
  turnIndex: number
  isFirstSession?: boolean
  personaId: string
}

async function buildSystemPrompt(
  userId: string,
  userEmail: string | undefined,
  isFirstSession: boolean,
  personaBlock: string,
): Promise<string> {
  const profile = await getLearnerProfile(userId, userEmail)

  const openingGuidance = isFirstSession
    ? "== OPENING THIS SESSION ==\nThis is the learner's first Tutor Bot session. Introduce yourself briefly and warmly, then ask what they'd like to work on or talk about today."
    : '== OPENING THIS SESSION ==\nThe learner has used Tutor Bot before. Give a short, personalized greeting — don\'t re-introduce yourself or re-ask what their goal is.'

  const resolvedPersonaBlock = applyPersonaTokens(personaBlock, { ...profile, openingGuidance })

  return buildTutorSystemPrompt({ ...profile, openingGuidance, personaBlock: resolvedPersonaBlock })
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

  const body = req.body as TutorChatRequestBody

  const role = await getUserRole(user.id)
  const persona = await getPersonaForRole(body.personaId, role)
  if (!persona) {
    res.status(400).json({ error: 'Unknown persona' })
    return
  }

  if (body.turnIndex >= MAX_TURN_INDEX) {
    res.status(200).json({ reply: WRAP_UP_REPLY, turnIndex: body.turnIndex, ended: true })
    return
  }

  const recentHistory = body.history.slice(-HISTORY_WINDOW)
  // Gemini's contents array can't be empty — the very first call of a session (no
  // history yet) needs a synthetic kickoff turn to prompt the opening line. Harmless
  // to include for Groq too, which has no such restriction.
  const historyForModel = recentHistory.length > 0 ? recentHistory : [KICKOFF_MESSAGE]
  const systemPrompt = await buildSystemPrompt(user.id, user.email, Boolean(body.isFirstSession), persona.promptText)
  const modelId = await getModelForFeature('tutorBot')

  let chatResult
  try {
    chatResult = await callModel(modelId, systemPrompt, historyForModel)
  } catch (err) {
    res.status(502).json({ error: err instanceof Error ? err.message : 'Model request failed' })
    return
  }

  await logModelUsage({
    userId: user.id,
    scenarioId: 'tutor-bot',
    callType: 'tutor_chat',
    modelId,
    usage: chatResult.usage,
  })

  res.status(200).json({ reply: chatResult.content, turnIndex: body.turnIndex, ended: false })
}
