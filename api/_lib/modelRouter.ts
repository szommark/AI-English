import type { ChatMessage } from '../../src/lib/types.js'
import { getModelEntry, type ModelId } from '../../src/lib/models.js'
import { callGroq, type GroqResult } from './groq.js'
import { callGeminiChat, type GeminiResult } from './gemini.js'

/** Dispatches to whichever provider the learner's chosen model belongs to. */
export async function callModel(
  appModelId: ModelId,
  systemPrompt: string,
  messages: ChatMessage[],
): Promise<GroqResult | GeminiResult> {
  const entry = getModelEntry(appModelId)

  if (entry.provider === 'groq') {
    return callGroq([{ role: 'system', content: systemPrompt }, ...messages], entry.providerModelId)
  }
  return callGeminiChat(systemPrompt, messages, entry.providerModelId)
}
