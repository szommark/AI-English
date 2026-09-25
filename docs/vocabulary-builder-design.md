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
| 6 | Vocabulary is its **own feature**, the **sixth landing tile**, route `/vocabulary` | Same pattern as Grammar Coach and Pronunciation: an entry in `src/data/features.ts`. The tile shows a "N due" badge when reviews are waiting. Accent: the app's teal (needs a new `FeatureAccent`). |
| 7 | Name: **Vocabulary** in English, **Szótanuló** in Hungarian | Tile title and page heading, through the existing i18n. |
| 8 | Every teacher list item **must have a Hungarian meaning** before the list can be saved | Recognition (step 1, §7) needs one. The editor highlights rows still missing a meaning after enrichment and blocks Save; the API returns 400 naming those terms. |
| 9 | Global cache rows created from teacher uploads get **`origin = 'teacher'`**, not `'catalog'` | `origin = 'catalog'` on a global row means the term comes from the reviewed word bank (§5.3; the review covers the bank's topic mapping, and meanings are enriched like any other item). Teacher-sourced cache rows stay distinguishable as unreviewed, and Phase 5 only publishes reviewed ones. |
| 10 | Teacher lists can be **archived, not deleted** (for now) | `archived_at` hides a list from the teacher's default view; assignments, cards and progress stay. Hard delete is deferred (§12). |
| 11 | The teacher section is called **Szólisták / Word lists / Wortlisten** | All new UI strings go through `src/lib/i18n.tsx` in hu, en and de. |

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
4. Write successful results to the global cache as well, so every later use of that term is free. The row's `origin` records where the term came from (decision 9): `'teacher'` for teacher uploads, `'tutor'` for Tutor Bot sessions, and `'catalog'` only for reviewed catalog items.
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
2. **Add terms** — three ways, all feeding the same preview table: paste (one per line, optional `term ; Hungarian meaning ; example` columns), upload CSV/XLSX (parsed in the browser), or an **"Add word" button** that adds a single term (with optional meaning and example) to the list. "Add word" also works on a saved list, where it follows the "editing a list after assignment" rule below. Max `LIST_MAX_ITEMS` per list.
3. **Preview & edit** — blanks are enriched server-side; the teacher sees a table (term, meaning, example, level) and can edit any cell or delete a row before saving. Failed enrichments are highlighted for manual entry, and Save stays blocked until every row has a Hungarian meaning (decision 8). The browser sends terms to `enrich` in chunks of `ENRICH_BATCH_SIZE`, one after another, and fills rows as each chunk returns: no single request runs long enough to risk the function time limit, and the teacher sees progress. CSV/XLSX parsing is loaded on demand with a dynamic `import()`, and must not use the unmaintained `xlsx` package from the npm registry (known advisories CVE-2023-30533 and CVE-2024-22363).
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

### 5.3 Word bank (Phase 5)

The terms students' compiled lists draw on first (§7.2). The model fills whatever the bank can't cover.

- **Sources** (`data/wordbank/`, cited in the README and under the compile form):
  - The CEFR-J Wordlist 1.5 (A1–B2, with topic columns). Free for commercial use with citation.
  - The Octanove Vocabulary Profile C1/C2 1.0 (CC BY-SA 4.0), which has no topics.
- **Not used:** Oxford 3000/5000 and the English Vocabulary Profile. Both are publisher-owned, with no clear licence for embedding.
- **`vocab_word_bank`** holds one row per normalized term: term, kind, part of speech, CEFR level, `topics` (VOCAB_TOPICS ids), `source` and `hidden`. It has no meanings. Those are enriched on demand into `vocab_items` (§4.2) the first time a word lands in a student's list, and cached from then on.
- **Import:** `npm run wordbank:import` (`scripts/import-word-bank.ts`, built by `scripts/wordBank.ts`). It is idempotent, upserts on `term_normalized`, and never sends `hidden`.
  - Spelling variants such as "color/colour" keep the first spelling.
  - A headword listed several times keeps its lowest level and the union of its topics.
  - Function words (determiners, prepositions, modals…) are skipped.
- **Topics:** `data/wordbank/topic-map.json` maps CEFR-J's Core Inventory and Threshold categories onto the 10 topics, and lists the ones deliberately left out. The import fails on a category the file doesn't mention. Mark's review covers this mapping; the published list itself is trusted.
  - 1,869 of the 8,454 bank words carry a topic.
  - Most topics have 30–140 words per level. Nature & weather and Feelings & people are thin (under 16 words per level), and C1/C2 has no topics, so the model fills those. CEFR-J's "Personal identification" (mostly job titles) and "Relations with other people" (crime, violence, politics next to friendship) are deliberately left out of Feelings & people.
- **Picking:** `pick_word_bank_terms(topic, level, count, exclude)` returns random visible terms at exactly the chosen level, excluding what the student already has. Custom (free-text) topics use the model only.
- **Items from the bank** are created with `origin = 'catalog'` (the term came from the reviewed catalog; decision 9). Model-picked terms get `origin = 'student'`.
- **Later:** an "Explore" tab for browsing the bank by level and topic, and a way to hide individual words (the `hidden` flag is already there).

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

**Student Vocabulary page:** three tabs — **Fast practice** (§7.1), **My wordlists** (§7.2) and **Spaced repetition** (the Daily review session above, with its stats). The earlier "From my teacher" and "My words" tabs are folded into My wordlists. "Explore" (catalog, Phase 5) comes later.

### 7.1 Fast practice (Gyors gyakorlás / Schnellübung)

Every exercise, over any list, any time — whether or not its words are learned or in spaced repetition.

- **Starting a run:** pick a list (from the Fast practice tab or from a list's page), then untick any words to leave out. At most `DRILL_MAX_WORDS` (= `LIST_MAX_ITEMS`, so a whole list fits) per run.
- **Order:** round by round, easiest first: recognition for every word, then recall, gap-fill, listening. Words are shuffled within each round. An exercise that can't run for a word (no Hungarian meaning, no sentence containing the term, no speech synthesis) is skipped, not stepped down, so no word gets the same exercise twice.
- **Recorded apart from scheduling:** answers go to `vocab_drill_answers` (one row per run, **item** and exercise — words need no card), grouped by `vocab_drill_runs` (`source` custom/teacher/conversations, the list id, `item_ids`, `word_count`, `started_at`, `finished_at`). An answer must be for one of the run's `item_ids`. Runs never touch FSRS state, `ladder_step` or `vocab_reviews`, so they don't reschedule cards, use up `NEW_CARDS_PER_DAY` or move teacher-list progress. Cramming would distort FSRS intervals.
- **Summary:** correct/total per round; "Again with these words", "Change words", "Close" (back to where the run started).
- **API:** `drill-start` `{ list: { kind, id }, itemIds }`, `drill-answer` `{ runId, itemId, exercise, correct, usedHint, responseMs }`, `drill-finish` `{ runId }`. Every word gets recognition distractors.
- **Not yet:** teacher-visible Fast practice history.

### 7.2 My wordlists (Szólistáim / Meine Wortlisten)

All of a student's lists, filterable by where they come from:

| Kind | What | Spaced repetition |
|---|---|---|
| **custom** (made by me) | Compiled by the student (below); `vocab_student_lists` + `vocab_student_list_items` | Only when the student presses "Add to spaced repetition": cards with `origin = 'student'`, FSRS New; words that already have a card keep it (§4.3) |
| **teacher** | Lists assigned by a teacher (§5.1), with progress | Automatic on assignment, as before |
| **conversations** | The Tutor Bot words (§5.2) — a virtual list over `origin = 'tutor'` cards | Automatic, as before |

- **Compiling a list:** topic (one of 10 fixed topics — travel, food & drink, work, shopping, health, home & family, free time, education, nature & weather, feelings & people — or the student's own, up to `CUSTOM_TOPIC_MAX_LENGTH`), CEFR level (default: the learner's level) and `COMPILE_MIN_WORDS`–`COMPILE_MAX_WORDS` (1–10) words. Terms come from the word bank first (§5.3). For whatever it can't cover, one model call picks the rest (`buildVocabWordPickPrompt`, logged as `vocab_generate`). Both skip terms the student already has in their deck or lists. The terms then go through the cached enrichment pipeline (§4.2): bank words become `origin = 'catalog'` items, and model words `origin = 'student'` ones. `'student'` items are unreviewed, like `'teacher'` and `'tutor'` ones (decision 9).
- **Daily limit:** `COMPILES_PER_DAY` = 5 compiles + regenerations per student per UTC day, counted from `vocab_compiles` (one row per compile, with how many words came from the bank and from the model; 429 once reached).
- **Editing custom lists:** rename, remove a word, add a typed word (enriched through the cache), "New set of words" (regenerate: same topic, level and size; counts towards the daily limit), delete. Deleting a list or removing a word never touches the student's cards — learning progress stays.
- **Per word:** its spaced-repetition state (not in review / new / learning / learned / paused). Any word with a card can be paused or resumed; conversation words can also be removed (hard delete, as before); teacher words can only be paused.
- **API:** `wordlists` (GET), `wordlist` (GET `&kind=&id=`, PATCH rename, DELETE), `wordlist-compile` (POST `{ topic, cefrLevel, count, title }`), `wordlist-regenerate`, `wordlist-word` (POST add / DELETE `&itemId=`), `wordlist-srs` (POST).

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

API surface (one action-routed function to stay inside the Vercel function limit, same pattern as `api/teacher.ts` / `api/connect.ts`): `api/vocab.ts?action=` `enrich | lists | list | assign | student-lists | overview | session | review | my-lists | cards | remove | suspend`, with teacher-only actions role-checked like `handleStudentDetail`. (`student-lists` feeds the student detail page's Word lists box; `list` takes GET/POST/PUT, and PATCH for archiving. `overview` gives the due/new counts behind the landing tile badge; `my-lists` feeds the "From my teacher" tab; `suspend` pauses or resumes a card — the only option for teacher-origin cards.)

## 10. Phases

| Phase | Scope | Visible result |
|---|---|---|
| 1 | Migration (all tables above), `ts-fsrs` + scheduler wrapper, enrichment lib + cache, `vocabulary` model feature, `vocab_enrich` usage type, `api/vocab.ts` with `enrich` action | None for users; enrichment testable via API |
| 2 | Teacher Word lists: create, paste/upload, preview/edit, assign, per-student list progress on the teacher dashboard | Teachers can build and assign lists |
| 3 | Student Vocabulary page + practice session (steps 1–4), "From my teacher" tab, landing-page tile | Students practise teacher lists; completion tracking live |
| 4 | Tutor Bot structured extraction + auto-add + undo; migrate `vocabulary_mastery` rows into cards; replace table with the view | Tutor words flow into the deck |
| 5 | Word bank: CEFR-J + Octanove import, topic mapping, bank-first compiled lists; "Explore" tab later | Compiled lists draw on a curated word list |
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
- Hard delete of teacher lists (decision 10), including what happens to assignments and to cards created from the list.
