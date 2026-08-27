import { DEFAULT_MODEL_BY_FEATURE, isModelId, type ModelFeature, type ModelId } from './models'

const STORAGE_KEYS: Record<ModelFeature, string> = {
  rehearsal: 'aiEnglish:model:rehearsal',
  grammarCoach: 'aiEnglish:model:grammarCoach',
  tutorBot: 'aiEnglish:model:tutorBot',
}

export function getModelPreference(feature: ModelFeature): ModelId {
  if (typeof window === 'undefined') return DEFAULT_MODEL_BY_FEATURE[feature]
  const stored = window.localStorage.getItem(STORAGE_KEYS[feature])
  return isModelId(stored) ? stored : DEFAULT_MODEL_BY_FEATURE[feature]
}

export function setModelPreference(feature: ModelFeature, modelId: ModelId): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEYS[feature], modelId)
}

export type { ModelFeature }
