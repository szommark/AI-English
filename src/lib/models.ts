// Single source of truth for which LLMs an admin can pick per feature. Both client
// components (the dropdown) and api/_lib/modelRouter.ts (the validation boundary)
// import this — same cross-boundary pattern as src/data/scenarios.ts.
//
// Groq: one model only — its free-tier roster shrank to openai/gpt-oss-120b for general
// chat after moonshotai/kimi-k2-instruct (deprecated 2026-03-23) and
// deepseek-r1-distill-llama-70b (deprecated 2025-10-02) were pulled. gemini-3.7-flash was
// tried and reverted — its free tier is capped at 20 requests/day/project (confirmed via a
// live 429), unworkable for a single shared API key backing the whole app.
// gemini-3.1-flash-lite is the model this app ran in production before this feature
// existed. See docs/model-selector-brief.md for the full history.
//
// Added 2026-11-08: Mistral Small (pay as you go — new free accounts can no longer create
// API keys), DeepSeek Flash (pay as you go, very cheap) and Claude Haiku 5.5 / Sonnet 5.5
// (pay as you go; new Console accounts get a one-time starter credit). A model whose API key is not set on
// the server is shown as unavailable in the admin picker (see api/_lib/modelRouter.ts).

export type ModelProvider = 'groq' | 'gemini' | 'mistral' | 'deepseek' | 'anthropic'

export type ModelId =
  | 'groq-gpt-oss-120b'
  | 'gemini-3.1-flash-lite'
  | 'mistral-small'
  | 'deepseek-flash'
  | 'claude-haiku-5-5'
  | 'claude-sonnet-5-5'

export interface ModelRegistryEntry {
  id: ModelId
  provider: ModelProvider
  providerModelId: string
  label: string
  /** Free quota or price, shown under the admin picker. */
  cost: string
}

export const MODEL_REGISTRY: ModelRegistryEntry[] = [
  {
    id: 'groq-gpt-oss-120b', provider: 'groq', providerModelId: 'openai/gpt-oss-120b', label: 'Groq — GPT-OSS 120B',
    cost: 'Free: about 1,000 requests and 200K tokens a day, shared by every feature on Groq',
  },
  {
    id: 'gemini-3.1-flash-lite', provider: 'gemini', providerModelId: 'gemini-3.1-flash-lite', label: 'Gemini — 3.1 Flash Lite',
    cost: 'Free: about 500 requests a day',
  },
  {
    // "-latest" follows Mistral's current Small model (Small 4 in Nov 2026).
    id: 'mistral-small', provider: 'mistral', providerModelId: 'mistral-small-latest', label: 'Mistral — Small',
    cost: 'Paid: pay as you go (Mistral dropped its free API plan in late 2026)',
  },
  {
    id: 'deepseek-flash', provider: 'deepseek', providerModelId: 'deepseek-flash', label: 'DeepSeek — V4.1 Flash',
    cost: 'Paid: about $0.30 in / $1.20 out per million tokens (servers in China)',
  },
  {
    id: 'claude-haiku-5-5', provider: 'anthropic', providerModelId: 'claude-haiku-5-5', label: 'Claude — Haiku 5.5',
    cost: 'Paid: $0.10 in / $0.50 out per million tokens; one-time starter credit for new accounts',
  },
  {
    id: 'claude-sonnet-5-5', provider: 'anthropic', providerModelId: 'claude-sonnet-5-5', label: 'Claude — Sonnet 5.5',
    cost: 'Paid: $2 in / $10 out per million tokens; one-time starter credit for new accounts',
  },
]

export function isModelId(value: unknown): value is ModelId {
  return typeof value === 'string' && MODEL_REGISTRY.some((m) => m.id === value)
}

export function getModelEntry(id: ModelId): ModelRegistryEntry {
  const entry = MODEL_REGISTRY.find((m) => m.id === id)
  if (!entry) throw new Error(`Unknown model id: ${id}`)
  return entry
}

export type ModelFeature =
  | 'rehearsal'
  | 'grammarCoach'
  | 'tutorBot'
  | 'vocabulary'
  | 'courses'
  | 'examTasks'
  | 'compTests'

export const MODEL_FEATURES: ModelFeature[] = ['rehearsal', 'grammarCoach', 'tutorBot', 'vocabulary', 'courses', 'examTasks', 'compTests']

/** Same provider as each feature's old hardcoded model, to keep behavior close. */
export const DEFAULT_MODEL_BY_FEATURE: Record<ModelFeature, ModelId> = {
  rehearsal: 'groq-gpt-oss-120b',
  grammarCoach: 'groq-gpt-oss-120b',
  tutorBot: 'gemini-3.1-flash-lite',
  // Vocabulary enrichment writes Hungarian; follow Grammar Coach's larger model, not Tutor Bot's.
  vocabulary: 'groq-gpt-oss-120b',
  // The three generators were hardcoded to GPT-OSS 120B with Gemini as the backup.
  courses: 'groq-gpt-oss-120b',
  examTasks: 'groq-gpt-oss-120b',
  compTests: 'groq-gpt-oss-120b',
}
