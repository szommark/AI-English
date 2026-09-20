import { supabaseAdmin } from './supabaseAdmin.js'
import { getModelEntry, type ModelId } from '../../src/lib/models.js'

export type LlmCallType = 'chat' | 'feedback' | 'tutor_chat' | 'grammar_lesson'

/**
 * Records one LLM call in groq_usage_log (name is historical — it holds Groq and Gemini),
 * attributed to the provider and model that actually served it. Never throws: a logging
 * failure must not fail the learner's reply.
 */
export async function logModelUsage(args: {
  userId: string | null
  scenarioId: string | null
  callType: LlmCallType
  modelId: ModelId
  usage: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number } | null | undefined
}): Promise<void> {
  try {
    const entry = getModelEntry(args.modelId)
    const { error } = await supabaseAdmin.from('groq_usage_log').insert({
      user_id: args.userId,
      scenario_id: args.scenarioId,
      call_type: args.callType,
      provider: entry.provider,
      model_id: entry.providerModelId,
      prompt_tokens: args.usage?.prompt_tokens ?? null,
      completion_tokens: args.usage?.completion_tokens ?? null,
      total_tokens: args.usage?.total_tokens ?? null,
    })
    if (error) throw error
  } catch (err) {
    console.error(`Failed to log ${args.callType} usage`, err)
  }
}
