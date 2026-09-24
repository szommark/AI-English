# AI-English: Vocabulary Builder — Design Document

**Date:** 2026-09-24
**Scope:** A new Vocabulary feature: one per-student deck of words and phrases, fed by three sources (teacher lists, Tutor Bot conversations, a level/topic catalog), practised in a single spaced-repetition session. Written after reviewing `api/_lib/personalization.ts`, `api/_lib/prompts.ts`, `api/tutor-end.ts`, `api/teacher.ts` and the personalization / roles migrations on `main`. Commit to `docs/vocabulary-builder-design.md`.

---

## 1. What exists today

- `api/tutor-end.ts` runs the end-of-session feedback prompt, which returns `vocabularyNoted`: 0–5 bare strings. No context sentence, no meaning, no word/phrase distinction.
- `upsertVocabulary` in `api/_lib/personalization.ts` writes them to `vocabulary_mastery` (PK `(user_id, word)`), promoting status purely by sightings: 1st → `new`, 2nd → `practicing`, 3rd+ → `mastered`. The code comment already calls this a placeholder.
- If the feedback call fails, the fallback is `{ strengths: [], corrections: [] }` — vocabulary for that session is silently lost.
- Readers of `vocabulary_mastery`: `api/teacher.ts` (student-detail counts by status) and `maybeUpdateSummaryAndCefr` (`word, status`, limit 30).
- There is no practice anywhere — words are recorded, never studied.

## 2. Decisions (locked)

| # | Decision | Consequence |
|---|---|---|
| 1 | `vocabulary_mastery` is **replaced by a view** derived from the new cards table | Existing readers keep working unchanged; the table's rows are migrated into cards first (Phase 4). |
| 2 | Tutor Bot words are **added automatically** | No confirmation screen. Noise is controlled by a per-session cap, dedup, and a student-side "remove" action (§5.2). |
| 3 | Hungarian meanings, definitions and examples are **Groq-generated**, cached globally | Teachers can edit in the upload preview; catalog items get a review pass by Mark before going live. |
| 4 | **Teacher lists ship first** | Phase order in §9. |
| 5 | Teacher lists have **completion tracking**, no due dates for now | `completed_at` on the assignment (§6). A `due_at` column can be added later without breaking anything. |

## 3. Core model: one deck, three sources

```
teacher list ─┐
tutor session ├──► vocab_items (shared content) ──► vocab_cards (per student, FSRS state) ──► practice session
catalog pack ─┘                                                   │
                                                                  └──► vocab_reviews (log)
```

- **Item** = the content: term, kind, meaning, example, level, topics. Shared.
- **Card** = one student's relationship with one term: origin, FSRS scheduling state, the student's own context sentence (tutor origin), suspended flag.
- **One card per student per term** (`unique (user_id, term_normalized)`). If the same term arrives from two sources, the existing card is kept (its learning history is what matters) and only the item it points at may be upgraded (§4.3).

## 4. Content: `vocab_items`

### 4.1 Global vs. teacher-owned items

- **Global items** (`owner_teacher_id is null`): the shared enrichment cache used by the Tutor Bot and the catalog. Unique on `(term_normalized, kind)` among global rows. One default sense per term — good enough for tutor/catalog, where the context sentence disambiguates.
- **Teacher items** (`owner_teacher_id = teacher`): created on list upload. Unique per `(owner_teacher_id, term_normalized)`. A teacher's edits (their own Hungarian meaning, their own example) only ever touch their own row — one teacher can never overwrite another's content or the global cache.

### 4.2 Enrichment

Any missing field (Hungarian meaning, simple English definition, example sentence, part of speech, CEFR guess, word vs. phrase) is filled by one batched Groq call:

1. Normalize terms (trim, lowercase, collapse whitespace, strip surrounding punctuation).
2. Look up global items for each normalized term — reuse what exists (a teacher item with blanks copies from the global row).
3. Send only the misses to Groq in batches (`ENRICH_BATCH_SIZE`), strict JSON out, validated like `parseFeedbackJson`. Unparseable/invalid entries are marked `enrichment_status = 'failed'` rather than guessed.
4. Write successful results to the global cache as well, so every later use of that term is free.
5. Log each call to `groq_usage_log` with `call_type = 'vocab_enrich'`.

**Model quality note.** Hungarian output from an 8B model is noticeably weaker than English output. Enrichment gets its own admin-selectable feature key (`vocabulary`) in `model_settings`, defaulting to the larger model the Grammar Coach already uses — not the Tutor Bot's chat model.

### 4.3 Item precedence on a card

When a card already exists and a new source brings the same term:

- teacher item beats global item → card's `item_id` is switched to the teacher's item, FSRS state untouched;
- a global item never replaces a teacher item;
- if two different teachers assign the same term to one student, the card keeps the first teacher's item. List progress is matched on `term_normalized`, not `item_id`, so both teachers still see correct progress.

## 5. The three sources

### 5.1 Teacher lists (Phase 2)

On the teacher dashboard, a new **Word lists** section:

1. **Create list** — title, optional description and CEFR level.
2. **Add terms** — paste (one per line, optional `term ; Hungarian meaning ; example` columns) or upload CSV/XLSX, parsed in the browser. Max `LIST_MAX_ITEMS` per list.
3. **Preview & edit** — blanks are enriched server-side; the teacher sees a table (term, meaning, example, level) and can edit any cell or delete a row before saving. Failed enrichments are highlighted for manual entry.
4. **Assign** — to selected connected students, or "all current students" (a convenience that creates one assignment row per active link at that moment; students who connect later are not auto-assigned).
5. On assignment, a card (`origin = 'teacher'`, FSRS `New`, due now) is created or upgraded for each term, per student.

Editing a list after assignment: added terms create cards for assigned students; removed terms leave existing cards alone (the student keeps what they've studied) but drop out of list progress.

### 5.2 Tutor Bot, automatic (Phase 4)

The Tutor feedback prompt's `vocabularyNoted: string[]` becomes structured:

```json
"vocabulary": [
  { "term": "book a table", "kind": "phrase",
    "learnerSaid": "I want to reserve a desk for two",
    "betterVersion": "I'd like to book a table for two",
    "reason": "lacked" }
]
```

`reason` is one of:

- `lacked` — the learner reached for a word/phrase and didn't have it (from vocabulary corrections);
- `asked` — the learner asked how to say something;
- `switched` — the learner used a Hungarian word mid-sentence; the English equivalent is the item. (Hungarian-specific and the highest-value signal: it is exactly the word they didn't know.)

Words the learner already used correctly are **not** extracted — they aren't study targets.

Auto-add rules (decision 2):

- at most `MAX_TUTOR_ITEMS_PER_SESSION` per session, priority `switched` > `asked` > `lacked`;
- skip terms the student already has a card for (active or suspended);
- `learnerSaid` / `betterVersion` are stored on the card as the student's personal context;
- the feedback card shows "Added to your words: …" with a one-tap undo per word;
- on the Vocabulary page, any card can be removed (hard delete for tutor/catalog origin; teacher-origin cards can only be suspended, so list progress stays honest).

The same prompt change applies to the Rehearsal/Test feedback prompt (`buildFeedbackPrompt`) for consistency, but only Tutor Bot sessions auto-add in the first pass.

### 5.3 Catalog (Phase 5)

- **Source list:** CEFR-J Wordlist 1.5 (A1–B2), which includes topic columns. Free for commercial use with citation — add an attribution line on the Vocabulary page and in the repo README.
- **C1/C2:** Octanove C1/C2 1.0 is CC BY-SA 4.0 — keep it in a clearly separated import with its own attribution, or skip until C1 learners exist.
- **Not used:** Oxford 3000/5000, English Vocabulary Profile (publisher-owned; no clear licence for embedding).
- **Topic packs:** CEFR-J topics map onto the app's own topic taxonomy (travel, work, small talk, …) via a small mapping file Mark curates. Phrase/collocation packs (CEFR-J is mostly single words) are Groq-generated per topic and level, reviewed by Mark, then published.
- Students browse by level (default = their `learner_profiles.cefr_level`, never locked) and topic, and add a whole pack or single items (`origin = 'catalog'`).

## 6. Scheduling & completion

### 6.1 FSRS

- Library: `ts-fsrs` (TypeScript FSRS implementation, requires Node ≥ 20), run **server-side only** in the API route, so the scheduling state and teacher-visible progress can't be edited by the client.
- `REQUEST_RETENTION = 0.9`, fuzz on, default learning steps. All named constants.
- Students never press Again/Hard/Good/Easy. The exercise result maps to a rating:

| Result | Rating |
|---|---|
| wrong | Again |
| right, but used a hint or second attempt | Hard |
| right | Good |
| right and faster than `FAST_ANSWER_MS` | Easy (not available on step 1 — multiple choice is too easy to guess fast) |

### 6.2 What "learned" and "completed" mean

- A card is **learned** once its FSRS state has reached `Review` at least once (i.e. it graduated from the learning steps). Tracked as `first_learned_at` on the card — sticky, so a later lapse doesn't un-complete a teacher's list.
- A teacher list assignment is **completed** when every term in the list has a learned card for that student. `completed_at` is set once and never cleared.
- Teacher progress per student per list: `learned / total`, plus `started` (at least one review) count.

### 6.3 Mapping for the `vocabulary_mastery` view (decision 1)

| Card | `status` |
|---|---|
| state New or Learning | `new` |
| state Review/Relearning, stability < `MASTERED_STABILITY_DAYS` (21) | `practicing` |
| state Review, stability ≥ 21 days | `mastered` |

`word = term_normalized`, `occurrences = reps`, `last_seen_at = coalesce(last_review, created_at)`. Suspended cards excluded. Created `with (security_invoker = true)` so the cards table's RLS applies.

## 7. The practice session (Phase 3)

A card's exercise type climbs with its `ladder_step`, which advances on Good/Easy and drops one step on Again:

1. **Recognition** — English term shown/spoken → pick the Hungarian meaning from 4 options (distractors: other cards in the deck, else same-level global items).
2. **Recall** — Hungarian meaning → type the English term (tolerant matching: case, punctuation, one-character typo = Hard, not Again).
3. **Context** — gap-fill in the example sentence (or the student's own `betterVersion` for tutor cards).
4. **Listening** — hear the term in a sentence (browser TTS, existing US/GB toggle) → type it; reuse `src/lib/wordMatch.ts`.
5. **Production** (Phase 6) — say or write your own sentence with the term; judged by one Groq call. The only exercise that costs tokens.

Steps 1–4 are fully deterministic and client-rendered; only the result is POSTed for scheduling.

**Session composition:** all due cards first (oldest due first, max `MAX_REVIEWS_PER_SESSION`), then up to `NEW_CARDS_PER_DAY` new cards, teacher-origin new cards before others. A session ends at the cap or when nothing is due; the summary shows reviewed / new / next due.

**Student Vocabulary page:** tabs "Practice", "From my teacher" (one section per assigned list with its progress bar), "My words" (all cards, filter by origin, remove/suspend), and later "Explore" (catalog).

## 8. Closing the loop with the Tutor Bot (Phase 6)

- At Tutor session start, up to `TUTOR_TARGET_WORDS` (3–5) cards in Learning/Relearning or due soon are injected into the system prompt: create natural chances for the learner to use them; never quiz.
- The feedback prompt gets the same list back and reports which ones the learner used correctly; each counts as a Good review (`exercise = 'conversation'`).

## 9. Data model

All writes go through API routes with the service role (repo convention). RLS is enabled everywhere; read policies mirror `20260831140000_personalization.sql` (own rows + connected teachers).

- **`vocab_items`** — `id uuid pk`, `term`, `term_normalized`, `kind ('word'|'phrase')`, `pos`, `cefr_level`, `topics text[]`, `meaning_hu`, `definition_en`, `example_en`, `origin ('catalog'|'teacher'|'tutor')`, `owner_teacher_id uuid null`, `enrichment_status ('pending'|'done'|'failed')`, `enrichment_model_id`, timestamps. Partial unique indexes: global `(term_normalized, kind) where owner_teacher_id is null`; teacher `(owner_teacher_id, term_normalized) where owner_teacher_id is not null`.
- **`vocab_cards`** — `id uuid pk`, `user_id`, `item_id`, `term_normalized`, `origin`, the ts-fsrs `Card` fields (`due, stability, difficulty, elapsed_days, scheduled_days, learning_steps, reps, lapses, state, last_review`), `ladder_step`, `first_learned_at`, `context_original`, `context_corrected`, `suspended`, timestamps. `unique (user_id, term_normalized)`; index `(user_id, due) where not suspended`.
- **`vocab_reviews`** — `id bigint identity`, `card_id`, `user_id`, `exercise`, `correct`, `used_hint`, `response_ms`, `rating`, `state_before`, `reviewed_at`.
- **`vocab_lists`** — `id uuid pk`, `teacher_id`, `title`, `description`, `cefr_level`, `archived_at`, timestamps.
- **`vocab_list_items`** — `list_id`, `item_id`, `position`; pk `(list_id, item_id)`.
- **`vocab_list_assignments`** — `list_id`, `student_id`, `assigned_at`, `completed_at`; pk `(list_id, student_id)`.

API surface (one action-routed function to stay inside the Vercel function limit, same pattern as `api/teacher.ts` / `api/connect.ts`): `api/vocab.ts?action=` `enrich | lists | list | assign | session | review | cards | remove`, with teacher-only actions role-checked like `handleStudentDetail`.

## 10. Phases

| Phase | Scope | Visible result |
|---|---|---|
| 1 | Migration (all tables above), `ts-fsrs` + scheduler wrapper, enrichment lib + cache, `vocabulary` model feature, `vocab_enrich` usage type, `api/vocab.ts` with `enrich` action | None for users; enrichment testable via API |
| 2 | Teacher Word lists: create, paste/upload, preview/edit, assign, per-student list progress on the teacher dashboard | Teachers can build and assign lists |
| 3 | Student Vocabulary page + practice session (steps 1–4), "From my teacher" tab, landing-page tile | Students practise teacher lists; completion tracking live |
| 4 | Tutor Bot structured extraction + auto-add + undo; migrate `vocabulary_mastery` rows into cards; replace table with the view | Tutor words flow into the deck |
| 5 | Catalog: CEFR-J import, topic mapping, reviewed phrase packs, "Explore" tab | Self-serve topic/level packs |
| 6 | Tutor loop-back + Production step (Groq-judged) | Conversation counts as practice |

One phase per fresh Claude Code session, PR per phase, migration run manually between phases.

## 11. Constants (initial values, all tuneable)

`ENRICH_BATCH_SIZE = 15` · `LIST_MAX_ITEMS = 100` · `REQUEST_RETENTION = 0.9` · `FAST_ANSWER_MS = 4000` · `NEW_CARDS_PER_DAY = 10` · `MAX_REVIEWS_PER_SESSION = 40` · `MAX_TUTOR_ITEMS_PER_SESSION = 5` · `MASTERED_STABILITY_DAYS = 21` · `TUTOR_TARGET_WORDS = 4`

## 12. Deferred / open

- Due dates on assignments (column addable later).
- Auto-assigning lists to students who connect after assignment.
- Multiple senses per global term (current: one default sense; teacher items and tutor context cover the common cases).
- Azure pronunciation check on vocabulary items (would count against the existing daily Deep Check cap).
- Teacher-visible review of tutor-added words.
