// Single source of truth for which LLMs learners can pick per feature. Both client
// components (the dropdown) and api/_lib/modelRouter.ts (the validation boundary)
// import this — same cross-boundary pattern as src/data/scenarios.ts.
//
// Kept to one model per provider: Groq's own free-tier roster shrank to just
// openai/gpt-oss-120b for general chat after moonshotai/kimi-k2-instruct (deprecated
// 2026-03-23) and deepseek-r1-distill-llama-70b (deprecated 2025-10-02) were both
// pulled. gemini-3.7-flash was tried and reverted — its free tier is capped at just 20
// requests/day/project (confirmed via a live 429: RESOURCE_EXHAUSTED, not a spec sheet),
// unworkable for a single shared API key backing the whole app. gemini-3.1-flash-lite is
// the model this app ran in production before this feature ever existed. See
// docs/model-selector-brief.md for the full history.

export type ModelProvider = 'groq' | 'gemini'

export type ModelId = 'groq-gpt-oss-120b' | 'gemini-3.1-flash-lite'

export interface ModelRegistryEntry {
  id: ModelId
  provider: ModelProvider
  providerModelId: string
  label: string
}

export const MODEL_REGISTRY: ModelRegistryEntry[] = [
  { id: 'groq-gpt-oss-120b', provider: 'groq', providerModelId: 'openai/gpt-oss-120b', label: 'Groq — GPT-OSS 120B' },
  { id: 'gemini-3.1-flash-lite', provider: 'gemini', providerModelId: 'gemini-3.1-flash-lite', label: 'Gemini — 3.1 Flash Lite' },
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
  tutorBot: 'gemini-3.1-flash-lite',
}
