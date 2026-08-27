# Pronunciation Session — MVP Implementation Brief

Replaces the `coming-soon` placeholder for `pronunciation-session` in [`src/data/features.ts`](../src/data/features.ts) → new route `/pronunciation-session`, new page `src/pages/PronunciationSessionPage.tsx`.

Curriculum grounded in the author's own dissertation on teaching listening comprehension to Hungarian elementary/adult learners (classroom study, 9 students, minimal-pair + dictation tests), and Nádasdy's *Background to English Pronunciation* (2006). Target accent: **user-selectable, US or UK** (see "Accent selection" below) — the thesis's own sources (Nádasdy, BBC Learning English) lean British, but the tool shouldn't force that on every learner.

## MVP scope — 6 items, not the full curriculum

A broader 19-item curriculum was drafted (consonants, vowels, stress & rhythm, connected speech) but the MVP ships only the six items with the strongest evidence from the thesis's own classroom data:

1. **Th sounds** (θ/ð) — no Hungarian equivalent; substituted with t/d or sz/z.
2. **W vs V** — collapses onto /v/ in both production and perception (thesis data: "wanted" misheard for "find it").
3. **æ vs e** — the single most error-prone pair in the thesis's own minimal-pair test (`head/had`, `dead/dad`).
4. **Schwa** — no reduced vowel in Hungarian; ties directly into weak-form perception failures.
5. **Word stress placement** — Hungarian is always first-syllable stress; thesis's strongest example is "about" repeatedly misheard as "but" (the unstressed first syllable gets dropped, not just mis-stressed).
6. **Weak forms** — "some" → "send," "are" → "of"/"a," "I" → "a," all documented in the thesis's own dictation tests.

Everything else drafted earlier (dark-l, r-dropping, /əʊ/ vs /aʊ/, linking, elision, assimilation, etc.) is a phase-2 curriculum extension — same data shape, just more rows, added once the MVP's mechanics are validated.

## Layout

- **Left rail:** category groups (for the MVP, effectively one flat list of the 6 items — the Consonants/Vowels/Stress-Rhythm/Connected-Speech grouping only matters once phase 2 adds enough items to need it). Same shape pattern as `grammarCurriculum.ts` and `features.ts`. Status shows a **dual score** per item (perception / production), not a single traffic-light dot.
- **Top of page, above the rail:** a primary "Start today's session" call-to-action — the default entry point. Composes a run of items (MVP: cycle unattempted items first, then the lowest-scoring ones — no need for anything smarter yet).
- **Center:** the drill card — one stage of one item at a time. Visual identity is **rose**-accented (this feature's color in `features.ts`) with a soundwave/audio motif, distinct from Grammar Coach's chalkboard so each feature keeps its own visual identity.
- **Below the drill card:** a segment-dot strip showing progress through the 4-stage funnel (not narration segments like Grammar Coach's voice bar — here each dot is a stage), plus a replay button and a slow-speed toggle (`rate: 0.75`, reusing `useSpeechSynthesis` the same way Grammar Coach's speed control does).
- Mobile layout: out of scope for this pass (consistent with Grammar Coach's precedent).

## Session composition

Two entry points:
- **Browse by sound** (the rail) — targeted practice of one specific item.
- **Start today's session** — chains 4–5 items end-to-end, each running its own 4-stage funnel, ending in one aggregate session summary.

## Per-item drill funnel (4 stages, fixed order on first attempt)

`forced-choice → odd-one-out → dictation → production`

1. **Forced choice.** TTS speaks one of two words (e.g. "thin" / "sin"); learner taps which one played. Flash feedback, auto-advance (~800ms). 3 rounds. No mic, no Azure cost.
2. **Odd-one-out.** Three unlabeled cards (A/B/C — no spelling shown, matching the thesis's own test design of testing ears not eyes). Each independently replayable before answering. No mic, no Azure cost.
3. **Dictation.** A connected-speech sentence plays (not an isolated word — this is the stage that catches what 1–2 can't, per the thesis's own finding that isolated recognition didn't predict connected-speech performance). Replay capped at 3 plays with a visible counter, matching the cap used in the thesis's own tests. Text input, submit. Feedback highlights only the diverging word(s) inline, reusing the fuzzy-match approach already in [`wordMatch.ts`](../src/lib/wordMatch.ts) rather than flat right/wrong.
4. **Production.** Hands off to the existing Azure deep-check flow — same recording UI as [`DeepCheckPanel`](../src/components/DeepCheckPanel.tsx), scored against a sentence authored to isolate the target sound (avoid stacking other hard sounds in the same sentence, or the score can't be attributed to the skill being tested). Feedback goes beyond the current 4-score summary — see "Phoneme and prosody feedback" below.

**Gating:** strictly sequential on first attempt. On a repeat visit to an already-attempted item, add a "skip to production" shortcut.

## Phoneme and prosody feedback (stage 4)

`runDeepCheck` in [`pronunciation.ts`](../src/lib/pronunciation.ts) already requests more than it reads. Two things are sitting in the Azure response, unused, and both cost nothing extra to surface — no new Azure call, just reading more of the response that's already coming back:

- **Phoneme-level detail.** `PronunciationAssessmentGranularity.Phoneme` (`pronunciation.ts:18`) means each word in `detail.Words[]` carries a `Phonemes[]` array — a score per individual phoneme, not just per word. Currently only the word-level `AccuracyScore`/`ErrorType` is read. For the MVP, this is what should power the flagged-word interaction: tap a word Azure marked as mispronounced and see which specific phoneme was off (e.g. the θ in "think" came out as a t), rather than just "this word was wrong."
- **Prosody.** `pronunciationConfig.enableProsodyAssessment = true` (`pronunciation.ts:21`) is set but the result is never read. Prosody assessment returns structured break/intonation feedback per word — `UnexpectedBreak` (a pause inserted where a native speaker wouldn't), `MissingBreak` (no pause where one's expected), and `Monotone` (flat pitch, missing the stress pattern). This maps directly onto two curriculum items that nothing else in the tool currently evaluates: **word stress placement** and **weak forms** — Azure can flag that the stress pattern was wrong or that the rhythm was off, not just that the sentence scored 62.

Both extend `PronunciationCheckResult` (in [`types.ts`](../src/lib/types.ts)) and `PronunciationResultCard`'s rendering, but nothing about the Azure call itself changes — same audio, same request, just parsing more of what comes back. Only the session-level dual scores (perception/production) are persisted to `pronunciation_progress`; per-phoneme and prosody detail is shown in the moment and not stored long-term, keeping the data model simple.

## Content model (hand-authored, static — no LLM generation)

Unlike Grammar Coach, this content is **not** generated on the fly — phonetic precision needs deliberate authoring, not LLM judgment. A static data file (`src/data/pronunciationCurriculum.ts`, same shape pattern as `scenarios.ts`) holds, per item:

- `id`, `title`, `titleHu`, IPA symbol(s), a short Hungarian-language note on the specific confusion (e.g. *"A magyarban nincs ilyen hang — általában t/d vagy sz/z hanggal helyettesítjük."*)
- `minimalPairs`: word pairs for stage 1 (e.g. think/sink, thin/tin)
- `oddOneOutSets`: triads for stage 2, avoiding phonetically ambiguous groupings (the thesis flagged `booth/bought/tenth` as a design mistake to avoid — the shared final phoneme assumption was wrong)
- `dictationSentences`: connected-speech sentences for stage 3, ideally drawn from or modeled on the thesis's own authentic examples ("about," "some," "find it" patterns)
- `productionSentences`: sentences for stage 4, worded to isolate the target sound cleanly for Azure's `referenceText`

No Supabase caching table needed for content — it ships with the app like `scenarios.ts` does.

## Progress tracking — not deferred, unlike Grammar Coach

New Supabase table `pronunciation_progress(user_id, sound_item_id, perception_score, production_score, attempts, updated_at)`. Because the thesis's central finding is that perception and production scores can diverge sharply (a student can ace isolated minimal pairs and still fail the same sound in dictation or speech), the two scores are tracked and displayed **separately**, never collapsed into one number — this is what drives the rail's dual-score status and the "today's session" weighting.

## Accent selection (US vs UK)

`pronunciation.ts:13` currently hardcodes `speechConfig.speechRecognitionLanguage = 'en-US'` — a mismatch with the brief's British-English framing, since UK-specific behavior like r-dropping would be scored as an *error* under US norms. Rather than hardcoding either direction, the learner picks a target accent (General American / British English), stored as a simple per-user preference — the same kind of setting [`VoiceSettingsPage.tsx`](../src/pages/VoiceSettingsPage.tsx) already manages, so this likely belongs there rather than a new settings surface.

The choice drives two things together, not just one — they have to move in lockstep or the learner is trained against one accent and scored against another:

- **Scoring:** `speechRecognitionLanguage` is set to `en-US` or `en-GB` accordingly before the Azure call.
- **Playback:** the TTS voice used for stages 1–3 (via `useSpeechSynthesis`/`voiceSelection.ts`) must match the same accent — hearing an American voice model a word and then getting scored against British norms in stage 4 would be actively confusing.

**Curriculum impact for the MVP's 6 items:** minimal, since th, w/v, æ/e, schwa, word stress, and weak forms don't meaningfully differ between US and UK for a Hungarian learner — the toggle mostly just changes which Azure recognition locale and which TTS voice get used. The one item where content itself would need to branch by accent is **English R** (rhotic in US, non-rhotic in UK) — already deferred to the phase-2 curriculum, so no MVP content needs to be authored twice. Default: British English, matching the thesis's own sourcing, switchable anytime.

## Azure budget handling

Stages 1–3 are entirely local (`speechSynthesis` + `SpeechRecognition`/text input, zero Azure cost) — only stage 4 touches Azure. This naturally front-loads the free stages and gates the expensive one behind them, protecting the existing shared `MONTHLY_AZURE_SECONDS_CAP`. Stage 4 reuses `DEEP_CHECK_MAX_SECONDS` and the existing token/quota flow in [`api.ts`](../src/lib/api.ts) as-is — no new Azure plumbing needed.

## Error/retry UX

- Stages 1–3: no network call beyond TTS (local) — failure modes are minimal. If speech synthesis voice loading fails, fall back to the existing voice-selection logic in `voiceSelection.ts`.
- Stage 4: reuse `DeepCheckPanel`'s existing error handling (limit errors surfaced, other failures shown with a retry option) rather than building new error UX.

## Out of scope for MVP

- Mobile layout.
- Full 19-item curriculum (phase 2).
- Category grouping in the rail (only matters once item count grows).
- Adaptive/smart session composition (MVP: unattempted-first, then lowest-score).
- Historical tracking of phoneme/prosody detail over time (only the session-level dual scores persist; per-attempt phoneme/prosody feedback is shown in the moment, not stored).
- Accent-dependent curriculum content (e.g. the rhotic/non-rhotic English R item) — deferred to phase 2 along with the R item itself.
