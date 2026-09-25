import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getUserFromRequest, supabaseAdmin } from './_lib/supabaseAdmin.js'
import { parseFeedbackJson } from './_lib/groq.js'
import { callModel } from './_lib/modelRouter.js'
import { logModelUsage } from './_lib/usageLog.js'
import { getModelForFeature } from './_lib/modelSettings.js'
import { getUserRole } from './_lib/roles.js'
import { getPersonaForRole, applyPersonaTokens } from './_lib/personas.js'
import { buildTutorSystemPrompt, buildTutorFeedbackPrompt } from './_lib/prompts.js'
import { getLearnerProfile, recordFeedbackToPersonalization } from './_lib/personalization.js'
import { addTutorWords } from './_lib/vocabTutorWords.js'
import type { ChatMessage, FeedbackResult } from '../src/lib/types.js'
import type { AddedTutorWord } from '../src/lib/vocab.js'

// Single Vercel function for the whole /api/tutor surface (conversation turn,
// end-of-session feedback), multiplexed by ?action= to stay under Vercel Hobby's
// 12-serverless-function cap — do not add new files directly under api/.

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

async function handleChat(req: VercelRequest, res: VercelResponse, userId: string, userEmail: string | undefined) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const body = req.body as TutorChatRequestBody

  const role = await getUserRole(userId)
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
  const systemPrompt = await buildSystemPrompt(userId, userEmail, Boolean(body.isFirstSession), persona.promptText)
  const modelId = await getModelForFeature('tutorBot')

  let chatResult
  try {
    chatResult = await callModel(modelId, systemPrompt, historyForModel)
  } catch (err) {
    res.status(502).json({ error: err instanceof Error ? err.message : 'Model request failed' })
    return
  }

  await logModelUsage({
    userId,
    scenarioId: 'tutor-bot',
    callType: 'tutor_chat',
    modelId,
    usage: chatResult.usage,
  })

  res.status(200).json({ reply: chatResult.content, turnIndex: body.turnIndex, ended: false })
}

interface TutorEndRequestBody {
  fullTranscript: ChatMessage[]
}

async function handleEnd(req: VercelRequest, res: VercelResponse, userId: string, userEmail: string | undefined) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
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
      userId,
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
      user_id: userId,
      scenario_id: null,
      mode: 'tutor',
      transcript: fullTranscript,
      feedback,
    })
    if (error) throw error
  } catch (err) {
    console.error('Failed to save tutor session', err)
  }

  // Study targets go straight into the Vocabulary deck (design §5.2). Never fatal: the
  // learner still gets their feedback if this fails.
  let addedWords: AddedTutorWord[] = []
  try {
    const { cefrLevel } = await getLearnerProfile(userId, userEmail)
    addedWords = await addTutorWords(userId, feedback.vocabulary ?? [], cefrLevel)
  } catch (err) {
    console.error('Failed to add tutor words to the vocabulary deck', err)
  }

  await recordFeedbackToPersonalization(userId, feedback, modelId)

  res.status(200).json({ feedback, addedWords })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await getUserFromRequest(req)
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const action = req.query.action

  switch (action) {
    case 'chat':
      await handleChat(req, res, user.id, user.email)
      return
    case 'end':
      await handleEnd(req, res, user.id, user.email)
      return
    default:
      res.status(404).json({ error: 'Not found' })
  }
}
