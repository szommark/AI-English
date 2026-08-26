# Grammar Coach — Implementation Brief

Replaces the `coming-soon` placeholder for `grammar-coach` in [`src/data/features.ts`](../src/data/features.ts) → new route `/grammar-coach`, new page `src/pages/GrammarCoachPage.tsx`.

**Visual reference:** [Grammar Coach Board](https://claude.ai/code/artifact/6a0d4278-f485-4117-817c-3e9c3ff34611) — working mockup of the full screen (rail + board + voice bar, with theme/state/widget tweaks) plus a widget reference sheet.

## Layout

- **Left rail:** CEFR levels A1–C2, each expandable to a list of grammar items (fixed curriculum, new data file `src/data/grammarCurriculum.ts`, same shape pattern as `features.ts`). Status dots per item are illustrative only for now — see "Progress tracking" below.
- **Center:** the board — a wood-framed chalkboard, textured, in a black or green theme (pure visual toggle, no functional difference).
- **Below board:** the voice bar (play/pause, segment-dot progress, speed control — see "Voice bar reality check").
- Mobile layout: out of scope for this pass.

## Visual design (settled)

The chalkboard look — wood frame, chalk-dust texture, handwritten display font ("Patrick Hand") — is confined to the board's interior. Everything around it (rail, header, voice bar) matches the app's existing vocabulary exactly: white cards, `rounded-2xl` + `border-slate-200` + `shadow-sm`, `slate`/`indigo` text, and **amber** as this feature's accent (pulled from its `features.ts` entry — consistent with how each feature already owns a color). The end-of-lesson practice check is styled as a paper index card "taped" to the board, visually distinguishing "the teacher's chalk" from "your turn." See the artifact for exact styling to carry into implementation.

## Lifecycle of one lesson

1. **Click a grammar item** → look up cache (see Caching). If cached, prefetch it silently. Board stays idle — "press play to begin" — it does not render content until Play.
2. **Click Play:**
   - If not cached, show a loading state on the board while Groq generates it.
   - Once the segment script is available and validated, cache it, then play segments in order: render segment *i*'s board widget, speak segment *i*'s narration via the existing `useSpeechSynthesis` hook, and on `onend` advance to segment *i+1*.
3. **Practice check:** after the last segment, show a short check (reusing `PracticeSentence`/`WordMatchFeedback`) — an immediate right/wrong moment with a "try another" option. It does **not** persist a "mastered" state yet (see Progress tracking).

## Content model (fixed widget set)

Each generated lesson is `{ segments: [{ widget, narration }] }`. Widget types (see the mockup's Widgets sheet for exact visual specs):

- `rule-box` — title + short rule text
- `example-sentence` — tokens with a `highlighted` flag, for marking the grammar feature inside a sentence
- `comparison-table` — rows across 2+ columns
- `sentence-structure-diagram` — ordered labeled blocks (Subject / Verb / Object…)
- `bullet-list` — short list items

The LLM only ever picks from this set — never free-form markup — so the board stays visually consistent and safe to render.

## Generation (on the fly)

- Model: Groq (`llama-3.1-8b-instant`), reusing `callGroq` from [`api/_lib/groq.ts`](../api/_lib/groq.ts) — add `callGroqGrammarLesson(item, cefrLevel)` following the same **strict-JSON-only** convention as `parseFeedbackJson`. Validate the returned JSON against the widget allowlist before rendering.
- **Language rule:** A1–A2 → rule text + narration in Hungarian, examples stay in English (consistent with [`buildTutorSystemPrompt`](../api/_lib/prompts.ts)). B1+ → English throughout.
- Narration audio is the browser's native `speechSynthesis` (confirmed via [`useSpeechSynthesis.ts`](../src/hooks/useSpeechSynthesis.ts) — Azure is only used for pronunciation scoring in this app). No audio files to generate or store — only the text script is cached.

## Caching

Shared cache (first generation serves everyone after): Supabase table `grammar_lessons(cefr_level, grammar_item_id, content jsonb, created_at)`, keyed on `(cefr_level, grammar_item_id)`. Only a **validated, successful** generation is ever written here — a failed or malformed attempt is never cached (see Error/retry UX).

## Error/retry UX

If the Groq call or the schema validation fails, retry once (new logic — distinct from the existing 429-only retry already in `groq.ts`). If the retry also fails: **fail silently**. Concretely:

- No error banner or message is shown to the learner.
- The board quietly reverts to the idle "press play to begin" state, as if nothing happened.
- The failure is logged server-side for aggregate visibility.
- Nothing is cached.
- The learner can simply press play again.

## Progress tracking — deferred

Not built in this pass. No `grammar_progress` table, no persisted seen/mastered state. The rail's status dots are illustrative only for now, not wired to real data. The practice check still runs as an immediate-feedback moment (see Lifecycle step 3), but its "mark as mastered" persistence comes back once tracking ships in a later phase.

## Voice bar reality check

Native `speechSynthesis` has no real seek/scrub and no known duration ahead of time:

- **Play/pause** uses real `speechSynthesis.pause()`/`.resume()` — fine on desktop Chrome/Edge.
- **Progress is a stepped/chapter indicator** (one dot per segment), not a continuous scrubber — "back"/"forward" mean previous/next segment.
- **Speed control** maps directly to `utterance.rate` (0.75 / 1 / 1.25).
