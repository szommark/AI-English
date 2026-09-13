import { supabaseAdmin } from './supabaseAdmin.js'
import { DEFAULT_MODEL_BY_FEATURE, isModelId, type ModelFeature, type ModelId } from '../../src/lib/models.js'

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
