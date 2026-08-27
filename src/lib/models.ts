// Single source of truth for which LLMs learners can pick per feature. Both client
// components (the dropdown) and api/_lib/modelRouter.ts (the validation boundary)
// import this — same cross-boundary pattern as src/data/scenarios.ts.
//
// Kept to one model per provider: Groq's own free-tier roster shrank to just
// openai/gpt-oss-120b for general chat after moonshotai/kimi-k2-instruct (deprecated
// 2026-03-23) and deepseek-r1-distill-llama-70b (deprecated 2025-10-02) were both
// pulled. See docs/model-selector-brief.md for the full history.

export type ModelProvider = 'groq' | 'gemini'

export type ModelId = 'groq-gpt-oss-120b' | 'gemini-3.7-flash'

export interface ModelRegistryEntry {
  id: ModelId
  provider: ModelProvider
  providerModelId: string
  label: string
}

export const MODEL_REGISTRY: ModelRegistryEntry[] = [
  { id: 'groq-gpt-oss-120b', provider: 'groq', providerModelId: 'openai/gpt-oss-120b', label: 'Groq — GPT-OSS 120B' },
  { id: 'gemini-3.7-flash', provider: 'gemini', providerModelId: 'gemini-3.7-flash', label: 'Gemini — 3.7 Flash' },
]

export function isModelId(value: unknown): value is ModelId {
  return typeof value === 'string' && MODEL_REGISTRY.some((m) => m.id === value)
}

export function getModelEntry(id: ModelId): ModelRegistryEntry {
  const entry = MODEL_REGISTRY.find((m) => m.id === id)
  if (!entry) throw new Error(`Unknown model id: ${id}`)
  return entry
}

export type ModelFeature = 'rehearsal' | 'grammarCoach' | 'tutorBot'

/** Same provider as each feature's old hardcoded model, to keep behavior close. */
export const DEFAULT_MODEL_BY_FEATURE: Record<ModelFeature, ModelId> = {
  rehearsal: 'groq-gpt-oss-120b',
  grammarCoach: 'groq-gpt-oss-120b',
  tutorBot: 'gemini-3.7-flash',
}
