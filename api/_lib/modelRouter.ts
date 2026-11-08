import type { ChatMessage } from '../../src/lib/types.js'
import { getModelEntry, type ModelId } from '../../src/lib/models.js'
import { callGroq, type GroqResult, type ModelCallOptions } from './groq.js'
import { callGeminiChat, type GeminiResult } from './gemini.js'
import { callOpenAiCompatible } from './openaiCompatible.js'
import { callClaude } from './anthropic.js'

/** Dispatches to whichever provider the chosen model belongs to. */
export async function callModel(
  appModelId: ModelId,
  systemPrompt: string,
  messages: ChatMessage[],
  options: ModelCallOptions = {},
): Promise<GroqResult | GeminiResult> {
  const entry = getModelEntry(appModelId)

  switch (entry.provider) {
    case 'groq':
      return callGroq([{ role: 'system', content: systemPrompt }, ...messages], entry.providerModelId, options)
    case 'gemini':
      return callGeminiChat(systemPrompt, messages, entry.providerModelId, options)
    case 'mistral':
    case 'deepseek':
      return callOpenAiCompatible(entry.provider, systemPrompt, messages, entry.providerModelId, options)
    case 'anthropic':
      return callClaude(systemPrompt, messages, entry.providerModelId, options)
  }
}

export interface ModelAttempt extends ModelCallOptions {
  modelId: ModelId
}

const PRIMARY_BACKUP: ModelId = 'groq-gpt-oss-120b'
const SECONDARY_BACKUP: ModelId = 'gemini-3.1-flash-lite'

/** The backup for a chosen model: GPT-OSS 120B, or Gemini when GPT-OSS is the chosen one. */
export function backupModel(primary: ModelId): ModelId {
  return primary === PRIMARY_BACKUP ? SECONDARY_BACKUP : PRIMARY_BACKUP
}

/**
 * Attempts for one JSON generation: the chosen model in JSON mode; for GPT-OSS (whose JSON
 * mode fails when its reasoning runs out of tokens) once more without JSON mode and with
 * lighter reasoning; then the backup model. With the default model (GPT-OSS) this is the
 * same chain the generators used before the model became selectable.
 */
export function attemptChain(
  primary: ModelId,
  base: { maxTokens: number; temperature: number; reasoningEffort?: 'low' | 'medium' | 'high'; retryWithoutJson?: boolean; backupMaxTokens?: number },
): ModelAttempt[] {
  const { maxTokens, temperature, reasoningEffort, retryWithoutJson, backupMaxTokens } = base
  const attempts: ModelAttempt[] = [{ modelId: primary, json: true, maxTokens, temperature, ...(reasoningEffort ? { reasoningEffort } : {}) }]
  if (retryWithoutJson && primary === PRIMARY_BACKUP) {
    attempts.push({ modelId: primary, json: false, maxTokens, temperature, reasoningEffort: 'low' })
  }
  const backup = backupModel(primary)
  attempts.push({
    modelId: backup,
    json: true,
    maxTokens: backupMaxTokens ?? maxTokens,
    temperature,
    // Only GPT-OSS takes a reasoning depth here; the Gemini backup never had one.
    ...(backup === PRIMARY_BACKUP && reasoningEffort ? { reasoningEffort } : {}),
  })
  return attempts
}
