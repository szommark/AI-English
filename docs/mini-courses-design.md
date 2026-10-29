# Mini Courses — Design Brief

Status: design agreed 2026-10-29; Phase 1 merged (PR #140); listening, speaking and writing modules + the rule change of 2026-10-30 on `feat/mini-courses-skills`.

## What it is

A coursebook-style unit that a learner works through alone on a phone, about 10 minutes at a time. Teachers build units (AI drafts, teacher edits), keep them private or publish them to a library, and assign them to their students. Admins pick a small set of public courses that any student can start themselves.

It mostly **sequences tools Avalon already has**: Grammar Coach exercises, the comp-test reading/listening engine, word lists + flashcards, the AI speaking examiner, and the pronunciation sound sheet. The new parts are the builder, the course player and the library.

## Decisions

| Topic | Decision |
|---|---|
| Who creates | Teachers only |
| Course length | **1–4 units.** A course starts with one unit; the teacher can add units to their own course (4 is the ceiling for now) |
| Unit length | **4–7 modules**: Vocabulary + a skill pair (Reading + Writing or Listening + Speaking), plus Grammar and/or a Unit check (both optional, at least one of them when nothing else makes 4); 7 is the maximum |
| Order | Fixed and linear, self-paced. No calendar |
| Content | AI-generated, teacher-curated (every module editable before publishing) |
| Visibility | Private or public, set by the teacher. Public courses appear in the library instantly; admins can hide any |
| Who learns | Students assigned by their teacher, **plus** self-enroll in public courses that an **admin** has picked |
| Price | Free now; one access check so a paywall can be added later in one place |
| Deferred | Combining units/courses (when built: **copy with credit**, never a live link), CEFR level rules for combining, scheduling, paywall |

## Changes after testing (2026-10-31)

- **Listening:** scripts are real-life situations (mostly dialogues) and plain spoken text; Markdown and stage directions are stripped before recording (`plainScript`), and older recordings made with them are re-made automatically. Students see **all the questions on one screen** under a pinned player and answer while listening, then check them together.
- **Grammar:** every item uses a different verb, subject and situation; a tense review spreads the items over **all** its tenses and practises choosing between them.
- **Speaking = Tutor Bot role-play:** the main speaking task is a live spoken conversation with the Tutor Bot (its photo, voice and hands-free listening; typing as a fallback) in a real-life situation with goals and a set number of turns; the AI marks the learner's side (/10). Guided Speaking keeps one short "speak" step before it.
- **Flags + AI fixes:** students can flag any exercise (the Grammar Coach reasons). The AI checks it at once; if it is really wrong it is corrected in the course and in the student's attempt. The teacher sees every check (before/after, verdict) under "Exercises flagged by students" and can undo a fix. Table `course_item_fixes`, 20 flags per student per day.
- **Reusing recordings:** a unit that starts with Listening and has no pasted text may reuse one of the same teacher's earlier recordings at the same level (course units or listening comprehension tests) when the AI judges its topic close to the unit; the script and audio are reused and the words come from it.

## Concepts

| Level | Coursebook equivalent | In the app |
|---|---|---|
| Course | The book | Title, level, umbrella topic, visibility; an ordered list of 1–4 units |
| Unit | A double-page unit | One sub-topic, 4–7 modules, 2–3 can-do statements |

A full 4-unit Balanced course is 28 modules, about 4–5 hours of study.

### Multi-unit courses

- All units share the course's **level** and explanation language. Each unit has its own sub-topic, template and grammar point(s) (e.g. course "Travel": booking, at the airport, problems, reviews).
- **Recycling:** a new unit's blueprint gets the earlier units' word sets and grammar, so its texts reuse some of them, and its Unit check includes 1–2 items from earlier units.
- The builder warns (doesn't block) when a grammar point is already taught in another unit of the same course.
- The teacher can reorder units and delete a unit (not the last one). In the player, unit *n* unlocks when unit *n−1* is finished.
| Module | A section (Vocabulary, Reading…) | One sitting, 5–15 min, 6–10 steps |
| Step | One exercise | One screen, about a minute, saved as soon as it's answered |

## Unit templates

| Template | Modules | Count |
|---|---|---|
| **Balanced** (default) | Vocabulary · Reading *or* Listening · Grammar · Pronunciation · Speaking · Writing · Unit check | 7 |
| **Listening + Speaking** | Vocabulary · Listening · Grammar · Pronunciation · Speaking (guided) · Speaking (free) · Unit check | 7 |
| **Reading + Writing** | Vocabulary · Reading · Grammar · Writing (guided) · Reading 2 · Writing (free) · Unit check | 7 |
| **Compact** | Vocabulary · Reading *or* Listening · Grammar · Writing *or* Speaking (the pair) · Unit check | 4–5 (Grammar and the check are switches; at least one stays on) |
| **Custom** | Start from any template; remove, double or reorder | 4–7 |

Until the Pronunciation module exists, templates leave it out (Balanced and Listening + Speaking have 6 modules) and show it as "coming soon". Every template has a "Grammar module" and an "End with a unit check" switch.

### Builder rules

1. **Always present:** Vocabulary and a skill pair: Reading + Writing or Listening + Speaking. Grammar (2026-10-31) and the Unit check are optional; the Unit check, when present, is always last. Grammar points are required (1–2) only with a Grammar module; without one they are optional and, if picked, still shape the texts and tasks.
2. **4 ≤ modules ≤ 7.** Writing and Speaking come after the first text (Reading or Listening).
3. **Pronunciation needs spoken work:** offered only when the unit has a Listening or Speaking module (so Reading + Writing never shows it).
4. **A doubled module does a different job:**
   - Reading 2 / Listening 2: a new text on the same topic, using the same words and grammar.
   - Speaking: guided (model answer + prompts) → free (role-play or long turn).
   - Writing: guided (model text, gap/reorder, then a short controlled text) → free (the full task).
   - Vocabulary, Grammar, Pronunciation and Unit check can't be doubled.
5. **Vocabulary comes first.** Grammar comes after the first input module, because it's noticed in that text. Otherwise the teacher may reorder.
6. **The teacher's own text (optional):** an article or a listening script pasted into the unit form (up to 6,000 characters). The AI takes the unit's words from it and builds the first Reading or Listening module around it unchanged (for Listening it is read aloud); otherwise the AI writes the text.

### Listening, speaking and writing (built 2026-10-30)

- **Listening:** the script is recorded with Azure TTS (the comprehension tests' voices, the level's speed) into the private `course-audio` bucket when the module is written or its script edited; students get a signed URL. Steps: warm-up → listen → questions (with a "Listen again" button) → transcript last. A unit can't be published while a listening module's recording is missing ("Make recording").
- **Writing:** model text → practice on its useful phrases → a write step (word range by level: A1 20–35 … C1 180–220). Guided = a short controlled text; free = the full task with planning tips.
- **Speaking:** useful phrases → a choice → speak steps. The learner records (browser speech recognition, continuous) or types; the transcript can be corrected. Guided shows the model answer first; free/main tasks show it after the feedback.
- **AI marking:** write/speak answers are marked by the AI (score /10: task 4, accuracy 3, range 3; 2–4 sentences of feedback in the explanation language; up to 4 corrections). Once per step, stored on the attempt by the server — the browser can't set a score. 40 feedback calls per user per day (`course_feedback`). An open step is worth 10 points in the module score. "Get feedback" waits for at least half the minimum word count.

## Module specs

Targets by level. Times are for the learner; "items" are vocabulary items, not steps.

| Module | Time | A2 | B1 | B2 | C1 | Reuses |
|---|---|---|---|---|---|---|
| Vocabulary | 6–8 min | 8–10 items | 10–12 | 12–14 | 12–15 | Word lists + flashcards, word speak button |
| Reading | 10–12 min | ~150 words | ~250 | ~400 | ~500 | Comp-test content + `TestText` / question types |
| Listening | 8–10 min | 1 min audio | 1.5–2 | 2–3 | 3 | Comp-test TTS + `comp-test-audio` bucket, `LimitedAudio` |
| Grammar | 10–12 min | 1 point | 1 point | 1–2 | 1–2 | `grammarCurriculum.ts`, Grammar Coach written practice |
| Pronunciation | 5–7 min | 1 feature | 1 | 1 | 1 | `pronunciationCurriculum.ts`, sound sheet / shadowing (Azure) |
| Speaking | 8–10 min | 2–3 turns | 3–4 | 4 + long turn | long turn | Exam speaking examiner (Groq + Azure) |
| Writing | 10–15 min | 40–60 words | 80–120 | ~150 | ~200 | New: AI feedback on a short text |
| Unit check | 5–8 min | 8 items | 8–10 | 10 | 10 | New: mixed items drawn from the unit |

C2 follows C1 targets. A1 is allowed but Pronunciation/Writing stay short (A1 writing ~20–30 words).

### Inside each module

Every module has the same shape so the player stays simple:

1. **Warm-up** (1 step): a picture/question prompt or a quick recall of the previous module.
2. **Input** (1–3 steps): words, text, audio, grammar box, model answer.
3. **Practice** (3–5 steps): tap-first exercises (choose, match, order, gap); typing only where producing language is the point.
4. **Produce** (0–1 step): say or write something with what was practised.
5. **Exit check** (1 step): 1–3 quick items; the score feeds the module result.

Module-specific notes:

- **Vocabulary:** the word set becomes a word list the student keeps (flashcards after the course). Steps: meet the words (card + audio) → match meaning → gap sentences → recall.
- **Reading:** text and questions never share one scrolling screen. The text lives in a drawer/tab; tapping a question highlights its paragraph. The text must contain the unit's grammar point(s) and most of the word set.
- **Listening:** played up to twice (comp-test `max_plays`), transcript shown after answering.
- **Grammar:** guided discovery from the input text ("Find 3 examples in the text…") → grammar box (saved to a "My grammar" shelf later) → practice → produce. The explanation language (Hungarian/English) follows the Grammar Coach setting.
- **Pronunciation:** one feature linked to the unit (e.g. -ed endings with past simple, weak forms with question forms).
- **Speaking guided:** model answer with audio → shadow a line → answer prompts. **Speaking free:** a short role-play or long turn with the AI examiner, using the unit's words.
- **Writing:** voice dictation allowed; AI feedback on task, accuracy and use of the unit's words/grammar.
- **Unit check:** vocabulary, grammar and comprehension items; ticks off the unit's can-do statements. There's no pass mark that blocks progress.

## Authoring flow (teacher)

1. **Create form:** title, level (A1–C2), topic, grammar point(s) (picked from `grammarCurriculum` for that level; 1–2 per unit), template, optional notes. Custom template opens the module list editor (rules above enforced live).
2. **AI blueprint** (one call): can-do statements, word set, reading/listening brief, grammar focus, pronunciation feature, speaking/writing tasks, unit-check plan. Shown as an editable outline.
3. **Generate modules** from the approved blueprint, one call per module, with progress shown per module. Generated all at once at authoring time, so the teacher can check everything before anyone sees it.
4. **Edit** each module: same editing style as comp tests (edit text, items, answers; regenerate one module or one item).
5. **Preview as a student** (the existing test-mode idea): the real player, nothing saved.
6. **Publish:** private (assign to own students) or public (library). It can be unpublished or set back to private later.
7. **Add a unit** (up to 4): the create form again with level and explanation language fixed by the course, then steps 2–5 for the new unit. A new unit stays a draft (hidden from students) until the teacher publishes it.

Editing a course that students have started: students keep the version of each module they started (snapshot per attempt, as comp-test assignments do); new attempts get the edited version.

## Library and access

- **Library page** (teachers): all public courses, filtered by level, template/skill focus and topic search. Shows author (credit), module list, estimated time. Actions: preview, assign to my students. Teachers can't edit someone else's course (copying comes with combining, later).
- **Admin:** an `/admin` courses tab lists public courses with two switches: **hidden** (removes from library and self-enroll; current students keep access) and **open for self-enroll**.
- **Students:** a "My courses" page with assigned courses and a short "Start a course" shelf of admin-picked courses. Home card: "Continue: Unit 1 · Reading · 11 min".
- **Access check:** one server function, `canAccessCourse(user, course)`, used by every course read and enrollment. Today: assigned → yes; self-enroll-open + public + not hidden → yes. The paywall later changes only this function (plus an `access_tier` column, default `'free'`).
- Bad content goes through the existing **Report a problem** button (feedback reports with a course/module reference).

## Student player (mobile)

- Linear: the next module unlocks when the previous one is finished, and the next unit when the previous unit is; finished modules can be redone (best score kept).
- Course overview screen: the units as chapters with progress rings; a course-complete screen after the last unit.
- One step per screen, big bottom buttons in the thumb zone, a progress bar per module.
- Autosave after every step; leaving and coming back resumes at the same step.
- Module result screen: score, words learned, "next up". Unit end: can-do ticks, unit-check score, a summary of words and grammar.
- XP through the existing gamification (a new XP source per module / per unit), same rules as exams and vocabulary.

## Data model (sketch)

All tables service-role only (RLS on, no public policies), read and written by the API, like `comp_tests`.

```
courses             id, teacher_id, title, level, topic, visibility ('private'|'public'),
                    admin_hidden bool, self_enroll bool, access_tier text default 'free',
                    explain_lang, status ('draft'|'published'), created_at, updated_at
course_units        id, course_id, position (1–4), title, topic, template, grammar_ids text[],
                    can_dos jsonb, blueprint jsonb, status ('draft'|'published'),
                    source_unit_id null  -- for "copy with credit" later
course_modules      id, unit_id, position, kind ('vocabulary'|'reading'|'listening'|'grammar'|
                    'pronunciation'|'speaking'|'writing'|'unit_check'), variant ('guided'|'free'|
                    'second'|null), est_minutes, content jsonb, audio_path, audio_key,
                    version int, updated_at
course_enrollments  id, course_id, student_id, source ('assigned'|'self'), assigned_by,
                    started_at, completed_at, unique (course_id, student_id)
course_module_attempts
                    id, enrollment_id, module_id, module_version, content_snapshot jsonb,
                    step_index, answers jsonb, result jsonb, score, max_score,
                    started_at, completed_at
```

- Generation is logged in `groq_usage_log` as new call types `course_blueprint` and `course_module`. Student-time AI (writing feedback, speaking) uses the existing call types / Azure quota.
- Listening audio reuses the comp-test TTS path and bucket pattern (or a `course-audio` bucket).

## API and routes

- The repo uses 10 of 12 Vercel functions, so **no new top-level file**. Teacher authoring, library and assign = new actions on `api/teacher-tools.ts` (the Toolkit convention); student player + self-enroll = actions on `api/gamification.ts` (where `/my-tests` lives); admin switches = `api/admin/overview.ts` or an admin-gated action on `teacher-tools.ts`.
- Shared logic in `api/_lib/courses.ts` (CRUD, access check, rules) and `api/_lib/courseGenerate.ts` (prompts).
- Shared types and builder rules in `src/lib/courses.ts`, so the client and server enforce the same rules (1–4 units, 4–7 modules, pronunciation, doubling). The 4-unit ceiling is one constant (`MAX_UNITS_PER_COURSE`); the migration's position check matches it.
- Routes:
  - `/teacher/tools/courses` (my courses + library tab), `/teacher/tools/courses/new`, `/teacher/tools/courses/:courseId`
  - `/my-courses`, `/my-courses/:enrollmentId` (player)
  - `/admin/courses`

## Phases

Each phase is one or a few PRs; the migration is hand-run before merge as usual.

**Phase 1 — Builder + player, core modules, private only**
- Migration (all tables above).
- Create form, blueprint, generate, edit, preview, publish as private, assign to connected students.
- Add, reorder and delete units (up to 4), with recycling of earlier units' words and grammar.
- Modules: Vocabulary, Reading, Grammar, Unit check, so the **Compact (Reading)** template works end to end; the other templates show their extra modules as "coming soon".
- Student `/my-courses` + player, autosave/resume, results, XP.

**Phase 2 — The remaining modules**
- Built: Listening (TTS + audio), Speaking guided/free, Writing guided/free with AI feedback; skill-pair rules, optional Unit check, the teacher's own text.
- Still to do: Pronunciation (then it returns to Balanced and Listening + Speaking).

**Phase 3 — Library and self-enroll**
- Public visibility, library tab with filters and author credit, assign from library.
- `/admin/courses`: hide + open for self-enroll.
- Student "Start a course" shelf and self-enroll; Report a problem for course content.

**Later (not designed yet)**
- Combining units/courses from other teachers (copy with credit via `source_unit_id`), level rules for combining; raising the 4-unit ceiling.
- Scheduling, spaced-review modules, reminders.
- Paywall (change `canAccessCourse` + `access_tier`).

## Open questions

- Students already enrolled when a teacher publishes a new unit: the unit simply appears at the end of their course (assumed).
- CEFR level rule for combining ("leave it open for one"): to settle when combining is designed.
- Writing feedback cost: limit attempts per module per day?
