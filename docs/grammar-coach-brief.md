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

## Practice panel: speaking + written (added 2026-10-11)

The "Your turn" index card now sits under the board as soon as a grammar point is picked; the lesson does not have to be played first. It has two tabs, both kept mounted so switching keeps the learner's answers:

- **Speaking** — unchanged: the lesson's `practice` sentences with `PracticeSentence`. If the lesson isn't loaded yet, "Prepare the sentences" generates it without starting playback.
- **Writing** — a separately generated and cached set (`grammar_exercises` table, same key as `grammar_lessons`; `POST /api/grammar-lesson` with `kind: "exercises"`): 5 × word order (shuffled tiles plus one extra word), 5 × form (one `___` gap + a cue in brackets, e.g. the infinitive), 5 × transformation (e.g. active → passive). The model writes the form/transformation instructions per grammar point, which generalizes the three types to every curriculum item. Answers are checked in the browser against accepted-answer lists (`src/lib/grammarExercises.ts`: case, commas, curly apostrophes and the final mark don't count). Finishing all 15 awards `grammar-coach.exercise` XP with `itemRef` `<item id>/written` and the share correct as the score.

## Tense Explorer (added 2026-10-12)

A second mode on the same page: a **Lessons | Tense explorer** switch under the heading (`?mode=explorer`, default Lessons). In explorer mode the rail, board, voice bar and practice panel are not rendered; all page hooks still run above the switch, so the lesson flow and `?lesson=<id>` deep links behave as before. Design: [`tense-explorer-design.md`](tense-explorer-design.md).

- **What it is:** the learner types a verb or phrase ("play football", "to travel", "wash my hands") into any of 13 boxes (the 12 tenses plus *be going to*) and sees positive / question / negative sentences, a "When do we use it?" panel (form, uses, time words, a *For Hungarian speakers* note) in English or Hungarian, a timeline, and an "Open the lesson" link to the matching curriculum item. Boxes can be hidden (presets All / Present / Past / Future / Simple / Continuous / Perfect / Perfect continuous, or a Boxes popover); two pinned boxes are shown side by side in Compare with a one-line contrast note.
- **Static and offline:** sentences come from a rule-based engine (`src/lib/tenseEngine/`: inflection with British spelling, 141 irregular verbs, *be*/*have*/*do* as main verbs, possessive/reflexive adaptation, time cues, stative-verb warnings). No API routes, no LLM calls, no Supabase reads or writes, **no XP**. Content lives in `src/data/tenseExplorerContent.ts`, the timeline in `src/components/GrammarCoach/TenseTimeline.tsx`, the UI in `src/components/GrammarCoach/TenseExplorer/`. `npm run check:tenses` checks the engine and the content (including that every `lessonId` exists).
- **Subjects:** by default ("Varied") box *i* in grid order gets `SUBJECTS[(i + seed) % 6]` (`assignSubjects`), so all six subjects appear and neighbouring boxes never share one; "Shuffle subjects" increments the seed. The subject select can fix one subject for every box. A box's three sentences always share its subject, and in Compare both boxes use the first pinned box's subject.
- **Persistence:** visible boxes, subject mode, time cue and explanation language are kept in `localStorage` (`ai-english:tense-explorer`, every access in try/catch). Verbs and the shuffle seed are not persisted.
- **Listen:** each sentence has a speaker button using the existing `useSpeechSynthesis` hook with the learner's accent preference.
