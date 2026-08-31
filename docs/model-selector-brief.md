# AI Model Selector — Implementation Brief

Lets learners pick which free-tier LLM powers each conversational feature, instead of the hardcoded single model per provider that exists today ([groq.ts:7](../api/_lib/groq.ts:7), [gemini.ts:5](../api/_lib/gemini.ts:5)).

## Scope

Three features get a model dropdown. Pronunciation Session does **not** — it stays on Azure Speech (assessment scoring, not a generative chat model; out of scope entirely).

| Feature | Client entry point | API route | Today's hardcoded model |
|---|---|---|---|
| Rehearsal + Test Mode (shared) | [sendChatTurn](../src/lib/api.ts:17) | [api/chat.ts](../api/chat.ts) | Groq `openai/gpt-oss-20b` |
| Grammar Coach | [requestGrammarLesson](../src/lib/grammarCoachApi.ts:23) | [api/grammar-lesson.ts](../api/grammar-lesson.ts) | Groq `openai/gpt-oss-20b` |
| Tutor Bot | [sendTutorTurn](../src/lib/tutorBotApi.ts:16) | [api/tutor-chat.ts](../api/tutor-chat.ts) | Gemini `gemini-3.1-flash-lite` |

Rehearsal and Test Mode share one preference (same underlying scenario chat, same route) — not two separate dropdowns.

## Model roster (final — 2 models, 2 providers, all $0, no billing exposure)

**Revised 2026-08-28**: the original 4-model roster (below, for record) was checked against Groq's live deprecation list before implementation and two of the four entries turned out to be dead, not just risky:

- `groq-deepseek-r1` (`deepseek-r1-distill-llama-70b`) — Groq shut this down **2025-10-02**. Not a reasoning-leak risk to mitigate (see old §4 below) — the model id simply doesn't resolve anymore.
- `groq-kimi-k2` (`moonshotai/kimi-k2-instruct`) — Groq deprecated this for free/dev tier **2026-03-23**.

Both of Groq's own recommended replacements point back to `openai/gpt-oss-120b`, already in the roster. Remaining live Groq options are either same-family as gpt-oss-120b (`openai/gpt-oss-20b`) or Preview-tier only (`qwen/qwen3.6-27b`, `qwen/qwen3.8-27b` — "may be discontinued at short notice," the same instability that got Mistral cut from consideration originally). Decision: don't paper over the gap with a same-family pick or an unstable preview model — ship with one model per provider. The picker still exists as real infrastructure (registry + router), it's just not offering a choice within Groq today; a 3rd/4th entry can be added later without any architecture change once Groq ships another stable free-tier model.

| App model id | Provider | Provider's model id | Notes |
|---|---|---|---|
| `groq-gpt-oss-120b` | Groq | `openai/gpt-oss-120b` | Best Groq quality; free tier: 30 RPM / 1K RPD / 8K TPM / 200K TPD |
| `gemini-3.1-flash-lite` | Gemini | `gemini-3.1-flash-lite` | Same model this app already ran in production for Tutor Bot before this feature; free tier: 15 RPM / 1K RPD / 250K TPM |

**Revised again, post-deploy**: `gemini-3.7-flash` shipped 2026-08-13 and looked like the better Gemini pick on paper (per third-party spec pages — see below), but once live it hit a wall the docs didn't mention: its free tier is capped at **20 requests/day/project**, confirmed via a real `429 RESOURCE_EXHAUSTED` in production, not a spec sheet. That's unworkable for a single shared API key backing every learner's Rehearsal/Grammar Coach/Tutor Bot traffic — the daily quota was gone almost immediately just from manual testing. Reverted to `gemini-3.1-flash-lite`. Lesson: for a brand-new model, the free-tier *daily* cap (not RPM/TPM, which third-party trackers report more reliably) needs to be verified against a live call before shipping, not sourced from spec-aggregator sites — the same trust gap that produced the DeepSeek/Kimi mistake above, just on quota instead of availability.

Also dropped from the original candidate list: `openai/gpt-oss-20b` (120b is the better Groq pick), `moonshotai/kimi-k2-instruct` (deprecated on Groq 2026-03-23), `deepseek-r1-distill-llama-70b` (deprecated on Groq 2025-10-02), and OpenRouter entirely (its free roster was live-checked and currently has none of DeepSeek/Kimi/Mistral/Llama for $0 — thin and shifts weekly, not worth the integration).

New default per feature (replaces today's hardcoded model, same provider as before to keep behavior close):

- Rehearsal/Test Mode: `groq-gpt-oss-120b` (was Groq 20b)
- Grammar Coach: `groq-gpt-oss-120b` (was Groq 20b)
- Tutor Bot: `gemini-3.1-flash-lite` (unchanged from before this feature)

## Architecture changes

### 1. Shared model registry — `src/lib/models.ts` (new)

A single array of the 4 entries above (`{ id, provider, providerModelId, label }`), importable from both client code and `api/_lib/*` — same cross-boundary pattern already used for [scenarios.ts](../src/data/scenarios.ts) and [grammarCurriculum.ts](../src/data/grammarCurriculum.ts), which `api/chat.ts` and `api/grammar-lesson.ts` already import directly. This is the single source of truth the dropdown renders from and the server validates against.

### 2. Provider wrappers become model-parametric

- [groq.ts](../api/_lib/groq.ts): drop the module-level `MODEL` constant; `callGroq(messages, model)` takes the provider model id as a parameter. `callGroqChat`, `callGroqFeedback`, `callGroqGrammarLesson` each gain a `model: string` parameter and pass it through. Covers 3 of the 4 registry entries (`groq-gpt-oss-120b`, `groq-kimi-k2`, `groq-deepseek-r1`) — no new provider wrapper needed for those.
- [gemini.ts](../api/_lib/gemini.ts): `GEMINI_URL` becomes a template (`.../models/${model}:generateContent`) instead of a fixed constant; `callGeminiChat(systemPrompt, history, model)` gains the parameter.

Only 2 providers, so no new API key or provider wrapper is needed beyond what's already in the codebase — the change is purely "parametrize the existing two."

### 3. Router — `api/_lib/modelRouter.ts` (new)

`callModel(appModelId, systemPrompt, messages)`: looks up `appModelId` in the registry, 400s if it's not one of the 4 known ids (never trust a client-supplied model string directly — this is the validation boundary), dispatches to `callGroq` or `callGeminiChat` with the provider's own model id. Each API route calls this instead of a provider-specific function directly, so `api/chat.ts`, `api/grammar-lesson.ts`, and `api/tutor-chat.ts` stop caring which provider backs a given choice.

### 4. ~~Known risk — DeepSeek R1 distill reasoning leakage~~ (moot — model dropped)

Moot: `groq-deepseek-r1` was removed from the roster entirely (see revision note above) because Groq deprecated the underlying model in 2025-10, not because the reasoning-leak was mitigated. If a reasoning-tuned model is added to the roster in the future (e.g. a Qwen model once it reaches Production tier), re-check this: Groq's `reasoning_format` param (`parsed` / `raw` / `hidden`) covers Qwen-family reasoning models and would be the fix — confirmed live against Groq's docs 2026-08-28.

### 5. Grammar Coach caching — schema change (decided: yes, extend the key)

Today's cache is keyed only on `(cefr_level, grammar_item_id)` — primary key in [20260826120000_grammar_lessons.sql:10](../supabase/migrations/20260826120000_grammar_lessons.sql:10) — one shared, provider-agnostic lesson per curriculum item. Decision: extend this to `(cefr_level, grammar_item_id, model_id)` so each model gets its own cached variant, and a learner's model choice actually changes what they see.

New migration (e.g. `supabase/migrations/<timestamp>_grammar_lessons_model_id.sql`):

- Add `model_id text not null default 'groq-gpt-oss-120b'` to `grammar_lessons` (the default backfills existing rows to the feature's new default model so nothing already cached is orphaned).
- Drop the existing `primary key (cefr_level, grammar_item_id)`, add `primary key (cefr_level, grammar_item_id, model_id)`.
- [grammar-lesson.ts](../api/grammar-lesson.ts): `readCachedLesson` and the insert at the end both gain a `model_id` filter/column matching the request's chosen model.

Consequence: up to 2x the distinct cache rows (one per model per curriculum item) and up to 2x the first-generation Groq/Gemini calls across the whole curriculum — still $0 since every model here is free-tier, just more cache misses the first time each (item, model) pair is requested.

### 6. Client — preference storage and UI

No new Supabase table needed. Mirrors the existing client-only, localStorage-backed pattern in [voiceSelection.ts](../src/lib/voiceSelection.ts) (`getAccentPreference`/`setAccentPreference`) exactly:

- `src/lib/modelSelection.ts` (new): `getModelPreference(feature)` / `setModelPreference(feature, modelId)`, keys `aiEnglish:model:rehearsal`, `aiEnglish:model:grammarCoach`, `aiEnglish:model:tutorBot`. Falls back to the feature's default id (above) when nothing is stored.
- `src/components/ModelPicker.tsx` (new): a `<select>` reused across the three feature surfaces, rendering `MODEL_REGISTRY` labels, reading/writing via `modelSelection.ts`. Same shape as the voice `<select>` in [VoiceSettingsPage.tsx:76-91](../src/pages/VoiceSettingsPage.tsx:76).
- Placement: inline on each feature's own page (near the scenario/lesson header), not centralized on `VoiceSettingsPage` — that page is scoped to voice/accent, and the requirement here is per-feature, not global.
- The three client call sites (`sendChatTurn`, `requestGrammarLesson`, `sendTutorTurn`) each gain a `model` param, read from `modelSelection.ts` at call time and sent in the POST body.

## Rate limits — no fallback in v1

Both models are free but rate-limited (see table above). No cost risk, but a learner can hit a 429 during a burst — as happened in practice with `gemini-3.7-flash`'s 20/day cap, which is what forced the revert above. Proposed v1 behavior: surface the existing error path as-is (`api/chat.ts` and `api/tutor-chat.ts` already `res.status(502)` on a provider failure) — no automatic fallback to a different model. Auto-fallback (e.g. retry on a second free model when the first 429s) is a reasonable follow-up but adds meaningful complexity (cross-provider retry logic, and for Grammar Coach, a cache-key model mismatch) — deferred until real usage shows it's needed.

## Status

Roster (revised to 2 models after live-checking Groq's deprecation list), architecture, and the Grammar Coach schema change are all settled. Implementing.
