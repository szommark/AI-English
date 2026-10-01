# Pronunciation sessions — Sound Bank, Stress Patterns, Connected Speech

Extends [`pronunciation-session-brief.md`](pronunciation-session-brief.md). Pronunciation is now three named sessions behind one hub. The new content comes from the author's dissertation on teaching listening to Hungarian elementary learners: §1.4.2 (word stress), §1.4.3 (connected speech: rhythm, weak forms, linking, elision, assimilation) and the classroom errors in §3.3 (about→but, find it→"fáj did", wake up→"we cup", fulfilled→"full feel", it's easy→"this").

## Routes

| Route | Page |
|---|---|
| `/pronunciation` | `PronunciationHubPage` — three cards + the cross-session "Érdemes újra gyakorolni" queue |
| `/pronunciation/sound-bank` | `PronunciationChartPage` — the former `/pronunciation` phoneme chart, renamed **Sound Bank** (unchanged otherwise) |
| `/pronunciation/sounds/:phonemeId` | `PhonemeDetailPage` (unchanged) |
| `/pronunciation/stress-patterns[/:unitId]` | `LessonSessionPage` with `stressPatterns` |
| `/pronunciation/connected-speech[/:unitId]` | `LessonSessionPage` with `connectedSpeech` |

Session names stay English in every UI language; descriptions and exercise copy are Hungarian, like the rest of this area.

## Content model

`src/data/pronunciationLessons/` — hand-authored, static (no LLM), same "pending linguistic review" caveat as `phonemes.ts`.

A **unit** = a short theory (`TheoryBlock[]`, example chips speak on click, `soundsLike` respelling is text only) + a body:
- `{ kind: 'steps' }` — exercises: `listen-choose`, `syllable-tap`, `token-select` (tap words, or tap the gaps between words), `odd-one-out`, `dictation`, `production` (Azure, skippable).
- `{ kind: 'funnel' }` — runs an existing `pronunciationCurriculum.ts` item through `DrillFunnel`. `word-stress` (Stress 3) and `weak-forms` (Connected Speech 2) had no UI entry point before; they live here now.

**Stress Patterns (4 units):** Hungarian vs English stress · suffixes that fix the stress (-tion/-ic/-ity, -ee/-eer/-ese) · weak first syllables (about/but) · same spelling, different stress (present/present).

**Connected Speech (6 layers):** 1 rhythm · 2 weak forms · 3 linking (consonant→vowel, /w/, /j/) · 4 elision · 5 assimilation (place + coalescent) · 6 putting it together (mixed phenomena, dictation, read-aloud).

## Audio

Browser TTS only. It reads carefully and often will **not** produce the reduced form, so the exercises test knowing/noticing the phenomenon (where words join, which sound drops, what the fast form is), not discriminating a TTS-rendered reduction; the fast form is shown as text. The heteronym unit (Stress 4) feeds the whole sentence to TTS so the voice can pick the reading from context — check it on the voices you ship with. Stress positions in the key are ones that hold in both GA and RP; magazine/afternoon/employee were left out on purpose.

## Progress and scoring

`pronunciation_progress` (no migration — `sound_item_id` is free text). A steps unit stores under its own unit id: perception = mean accuracy of the non-production steps (`perceptionScoreFromRatios`; token-select scores hits minus false picks), production = Azure score if the read-aloud step wasn't skipped. A funnel unit stores under its curriculum item id (`DrillFunnel` records it). The API accepts unit ids in both the progress write and the Azure token request (`getLessonUnit`), and `loadPronunciationProgress` / `ResurfaceQueue` route unit rows back to their unit page.

## Checks

`npm run check:pronunciation` — ids, index ranges, syllables joining to the target word, tokens matching the audio sentence, keyWords present in dictation sentences, funnel ids existing in the curriculum.
