import { supabaseAdmin } from './supabaseAdmin.js'
import { DEFAULT_MODEL_BY_FEATURE, isModelId, MODEL_REGISTRY, type ModelFeature, type ModelId, type ModelProvider } from '../../src/lib/models.js'

/**
 * Admin-set model for a feature, falling back to DEFAULT_MODEL_BY_FEATURE if no row
 * exists yet (keeps behavior identical until an admin actually changes something).
 * Same shape as getUserRole() in roles.ts.
 */
export async function getModelForFeature(feature: ModelFeature): Promise<ModelId> {
  const { data } = await supabaseAdmin.from('model_settings').select('model_id').eq('feature', feature).maybeSingle()
  if (data && isModelId(data.model_id)) return data.model_id
  return DEFAULT_MODEL_BY_FEATURE[feature]
}

/** The server env var holding each provider's API key. */
export const PROVIDER_KEY_ENV: Record<ModelProvider, string> = {
  groq: 'GROQ_API_KEY',
  gemini: 'GEMINI_API_KEY',
  mistral: 'MISTRAL_API_KEY',
  deepseek: 'DEEPSEEK_API_KEY',
  anthropic: 'ANTHROPIC_API_KEY',
}

/** Models whose provider API key is set on the server (the admin picker greys out the rest). */
export function availableModelIds(): ModelId[] {
  return MODEL_REGISTRY.filter((m) => !!process.env[PROVIDER_KEY_ENV[m.provider]]).map((m) => m.id)
}
