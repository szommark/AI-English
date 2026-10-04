# AI-English — Gamification System Design

**Status:** v2.6 — all five phases built; per-word Vocabulary XP and per-task Exam Prep XP added
**Audience:** 40+ Hungarian learners of English (and, through Exam Prep, some German learners and érettségi candidates of any age, including minors — see §8.3)
**Scope:** XP, levels, consistency (weekly goal + streaks), badges, teacher tools, social layer
**Out of scope:** Implementation. That is handed to Claude Code in phase prompts after this doc is agreed.

### Changes in v2.6

- **Vocabulary pays 1 XP per word** worked on, right or wrong, at any ladder step: spaced repetition (one award per session, counted on the server), Fast practice rounds and tests, and word games. No accuracy bonus. Daily caps: spaced repetition 100, Fast practice 50, games 50. The "all due cleared" bonus stays off, as every reviewed word already pays.
- **Exam Prep pays per task:** 10 XP per task done + up to 5 by the section's raw score, one award per handed-in section; +50 when every section of a paper has been handed in. Writing tasks earn the 10 XP (effort) at 20+ words, as writing isn't graded yet. The server re-scores the answers from its own copy of the answer keys. Retakes earn no score bonus; weekly cap 600 (§3.4).
- `xp_events.units` stores the words or tasks behind an award.
- New badges (§6.1): words practised 250 / 1,000 / 5,000; spaced repetition on 7 days; 10 Fast practice rounds; 25 games; first exam section; first full paper; 5 full papers; 60%+ practice result; personal best; a hidden German-paper badge.
- Teachers can set "Exam Prep sections handed in" as a class-challenge target (§7.3).

### Changes in v2.5

- D6 (explicit calls) and D8 (minimal `tutor_sessions`) accepted.
- Fixed the level table in §4.1: the level 5 and level 20 values were miscalculated.
- `gamification_activity_types` gains `client_awardable` and `weekly_cap_group` (§9).

### Changes in v2.4

- **D10:** Vocabulary Builder modules set: Fast practice, Spaced repetition, Games, Teacher word lists. Activity types and badges updated.
- **D4 decided:** everyone starts at zero XP. Badges based on cumulative state are granted on first evaluation (§9.1).
- **D6, D8:** explained, with recommended defaults (§9.2, §9.3). Pending Mark's confirmation.

### Changes in v2.3

- **Wisdom cards decided (D16–D18):** each card shows the proverb + its Hungarian equivalent (no literal note); one fixed proverb per badge; shown on badges only (badge wall + earn toast).

### Changes in v2.2

- **New §6.3 Wisdom cards:** every badge carries a proverb or saying, shown on hover/focus/tap, with its Hungarian equivalent.
- Data model: new `wisdoms` table; `badge_definitions.wisdom_id`.
- New open decisions D16–D18.

### Changes in v2.1

- **Decided (D11):** one XP pool across languages, with CEFR tracked per language.
- **Deferred (D12):** live-event XP. The activity type stays registered but disabled.
- **Rewritten §8.3:** the leaderboard follows Hungarian/GDPR consent rules (digital consent age 16), not an 18+ gate. Érettségi users can be adults too, so the rule is based on age, not on the section.

### Changes since v1

- Section list now matches the real top-level features in `src/data/features.ts`. Added: Érettségi Prep, Nyelvvizsga Prep, Vocabulary Builder, Business English (planned), Online Live Events (planned). Tutor Bot now covers four personas, including Lifestyle Coach.
- The section key is now the `features.ts` id, giving one source of truth.
- New §3.4 sets rules for long-form activities (mock exams).
- Language is now a dimension: XP and CEFR are handled across English and German (§4.3).
- Badges added for Exam Prep, the persona system and Vocabulary teacher lists. "All personas" is now dynamic, because personas are admin-managed.
- Minors and the public leaderboard, because of érettségi users (§8.3).
- The progress UI moves into the student dashboard **"Az én fejlődésem"** rather than a separate page.
- Open decisions updated (§12).

---

## 1. Design principles

1. **Adult, not childish.** Tasteful visuals, no mascot, no confetti storms, no sound effects by default. Celebrations are short and dismissible.
2. **Progress over pressure.** The app rewards regularity, not perfection. Missing a day never produces a loss alarm or a guilt message.
3. **Real language level is sacred.** The CEFR level reflects assessed ability and can never be bought with XP. XP levels are for motivation and are shown separately.
4. **Competition is always opt-in.** Personal progress is the default. Teacher and class views are layered on, and public leaderboards need the learner's consent.
5. **Extensible by registration, not rewrites.** New features and modules join the system by registering activity types and badge definitions. They do not modify the core.
6. **Cost-safe.** XP never rewards spamming expensive calls (Azure, Groq). Caps are named constants.
7. **Tamper-proof.** XP is awarded server-side only. The client can never write XP directly.

---

## 2. Structure and terminology

| Term | Meaning |
|---|---|
| **Section** | A top-level feature. Its key is the `features.ts` id. |
| **Module** | A sub-area inside a section |
| **Activity type** | A registered, XP-earning unit of work, keyed `<section>.<activity>` |
| **XP event** | One row in the XP ledger |

*(D1: rename "session" to "section" in code and docs.)*

### 2.1 Section registry (as known today, please confirm — D10)

| Section key (`features.ts` id) | Modules / sub-units | Status | Gamified from |
|---|---|---|---|
| `conversational-english` | Live scenario conversation, Rehearsal mode | Active | Phase 1 |
| `tutor-bot` | Personas: Language Coach, Grammar & Vocab Corrector, Public Speaking Mentor, Lifestyle Coach, plus admin-uploaded ones | Active | Phase 1 |
| `grammar-coach` | Curriculum units | Active | Phase 1 |
| `pronunciation-session` | Sound bank (live); Stress patterns, Connected speech (planned) | Active | Phase 1 |
| `vocabulary-builder` | Fast practice, Spaced repetition, Games, Teacher word lists | Planned | When shipped |
| `erettsegi-prep` | Booklets: Reading, Nyelvhelyesség, Listening, Writing | Planned | When shipped |
| `nyelvvizsga-prep` | Sections: Reading, Writing, Listening | Planned | When shipped |
| `business-english` | TBD | Coming soon | When shipped |
| `live-events` | Online live events | Under construction | When shipped (D12) |

**Rule:** a section or module that isn't shipped can still have its activity types registered with `enabled = false`. Turning gamification on for it is then a data change, not a code change.

---

## 3. XP model

### 3.1 Formula

```
awarded_xp = base_xp + performance_bonus
performance_bonus = round(base_xp × BONUS_MAX_RATIO × performance_score)   // score 0.0–1.0
BONUS_MAX_RATIO = 0.5
```

The performance score is supplied per activity type from existing data. Activities with no natural score get effort XP only.

### 3.2 Anti-farming and cost rules

- **Per-activity-type daily XP cap.** Once a type reaches its cap, the activity still works but earns 0 XP, and the UI says so plainly.
- **Diminishing repeats.** Repeating the *same item* within 24h earns 50% the second time and 0% from the third. Long-form activities follow a different rule (§3.4).
- **Costly features** (Azure deep-check, Tutor Bot, LLM-graded writing) get the tightest caps, aligned with the existing usage caps.

### 3.3 Activity catalogue (initial values are named constants)

| Activity type | Base XP | Bonus source | Daily XP cap |
|---|---|---|---|
| `conversational-english.scenario_live` | 20 | Scenario feedback score | 60 |
| `conversational-english.rehearsal` | 10 | None | 30 |
| `tutor-bot.conversation` (any persona; `persona_id` stored in `item_ref`) | 15 | None (effort only) | 45 |
| `grammar-coach.exercise` | 10 | Correctness | 80 |
| `pronunciation-session.funnel_stage` | 10 | Stage accuracy | 100 |
| `pronunciation-session.swipe_set` | 5 | Set accuracy | 50 |
| `pronunciation-session.deep_check` | 5 | Azure score | 50 |
| `pronunciation-session.stress_drill` *(disabled)* | 10 | Accuracy | 80 |
| `pronunciation-session.connected_speech_drill` *(disabled)* | 10 | Accuracy | 80 |
| `vocabulary.fast_practice` (a round or test) | 1 per word answered | None | 50 |
| `vocabulary.srs_review` (a session) | 1 per word reviewed | None | 100 |
| `vocabulary.srs_all_due_cleared` *(disabled)* | 10 | None | 10 |
| `vocabulary.game` (one game) | 1 per word on the grid | None | 50 |
| `vocabulary-builder.teacher_list_completed` | 30 | None | — |
| `exam-prep.erettsegi_section_complete` (one booklet) | 10 per task done | Raw score % | see §3.4 |
| `exam-prep.erettsegi_writing_task` *(disabled: counted in its section)* | 20 | Rubric score | see §3.4 |
| `exam-prep.erettsegi_paper_complete` | 50 | None | see §3.4 |
| `exam-prep.nyelvvizsga_*` | same shapes as érettségi | | see §3.4 |
| `live-events.attended` *(disabled, D12)* | 40 | None | — |
| `teacher.bonus` | Set by teacher | — | See §7 |
| `challenge.complete` | Set by challenge | — | — |

A `tutor-bot.conversation` counts only after `TUTOR_MIN_TURNS_FOR_XP = 6` learner turns. This depends on the Tutor Bot session-persistence gap being closed (D8). The same 6-turn rule applies to live scenarios.

**Vocabulary notes (v2.6).** Every word worked on earns 1 XP, whatever the module or ladder step. Spaced repetition has the highest daily cap because it carries the most learning value; Fast practice and games are capped lower, so they stay fun extras and don't become the cheapest XP source.

**Target feel:** a focused 15–20 minute practice day earns about 60–80 XP. One full mock paper earns about 200–250 XP, roughly three ordinary days, which matches its 45–90 minutes of effort.

### 3.4 Long-form activities (mock exams)

Mock exams don't fit daily caps or the 24h repeat rule, so they get their own rules:

- **Award per task, recorded per booklet/section (v2.6), not per paper.** A learner who stops halfway still gets credit for the finished sections. `paper_complete` is a bonus on top.
- **Weekly cap instead of daily:** `EXAM_WEEKLY_XP_CAP = 600` (about 2–3 full papers). This also matches the exam-prep doc's suggestion of a weekly attempt throttle.
- **Repeated sitting rule.** Retaking the *same* `sitting_id` earns effort XP only on objective sections (no performance bonus, since the answers may be remembered). Writing tasks still earn the full bonus, because the text is new.
- **Performance uses the raw "feladatpont" percentage**, in line with the exam-prep recommendation to avoid scaled scores.

---

## 4. Levels

### 4.1 XP levels (motivational)

```
step(n) = LEVEL_BASE_STEP + LEVEL_STEP_INCREMENT × (n − 1)
LEVEL_BASE_STEP = 100, LEVEL_STEP_INCREMENT = 20
```

| Level | Cumulative XP needed | Approximate time to reach (70 XP/day, 3 days/week) |
|---|---|---|
| 2 | 100 | ~2 days |
| 5 | 520 | ~2.5 weeks |
| 10 | 1,620 | ~2 months |
| 20 | 5,320 | ~6 months |

Cumulative XP to reach level L = `100·(L−1) + 10·(L−1)·(L−2)`.

Level titles are cosmetic and bilingual, grouped every 5 levels. *(D2)*

### 4.2 CEFR level (real ability)

- Read from `cefr_history` and shown separately from the XP level.
- It is never influenced by XP.
- A CEFR level-up triggers a milestone badge.

### 4.3 Languages (decided, D11)

Exam Prep brings German into the app, so the design treats language as a dimension:

- **One XP pool and one XP level per learner across languages.** Effort is effort, and splitting levels would make both feel slow. Each XP event stores `language` so per-language breakdowns are possible.
- **CEFR is per language** ("Angol: B1 · Német: A2"). This assumes `cefr_history` gains a `language` column or equivalent. *(D11)*
- **Leaderboard leagues** use the learner's CEFR band in the language of the activity that earned the weekly XP. For a mixed week, the main language (the one with the most XP that week) decides. *(D5)*

---

## 5. Consistency: weekly goal + gentle streak

### 5.1 Definitions

- **Active day:** at least one XP-earning activity completed, in the Europe/Budapest timezone. A completed exam booklet counts.
- **Week:** Monday 00:00 to Sunday 23:59, Europe/Budapest.

### 5.2 Weekly goal (primary)

- The learner picks 2–5 active days per week (default 3). A change takes effect from the next week.
- **Week streak** = consecutive weeks in which the goal was met. This is the headline streak.

### 5.3 Daily streak (secondary)

- One freeze is earned for each week the goal is met (`MAX_FREEZES = 2`).
- Freezes are consumed silently. A broken streak gets a neutral message only.

### 5.4 Week closing

A Vercel cron job runs Monday at 00:05 Europe/Budapest. It closes the previous week, updates week streaks, grants freezes and resets the weekly exam cap. Daily streak state is evaluated lazily.

---

## 6. Badges

### 6.1 Categories and examples

| Category | Examples |
|---|---|
| **Milestone** | 100 / 500 / 1,000 words learned; Level 10; first CEFR level-up (per language) |
| **Mastery** | Sound mastered (perception + production above threshold); grammar point mastered |
| **Consistency** | 4 / 12 / 26 weekly goals in a row |
| **Conversational / situational** | First Tutor Bot conversation; 10 conversations; a badge per persona (e.g. 5 Public Speaking Mentor sessions); "Explorer": tried every enabled persona; scenario-family badges (restaurant, travel, workplace, doctor…) |
| **Exam** *(new)* | First mock booklet; first full mock paper; above 60% raw on a full paper (pass-level signal, labelled "practice result", never "you'd pass"); personal best beaten; all four érettségi booklets completed in one sitting |
| **Vocabulary** | Completed first teacher word list; 5 teacher lists completed; all due cards cleared 7 days in a row; 25 games played; every vocabulary game tried |
| **Hidden** | Undisclosed until earned; *welcome back* after a 30-day break, never a shame badge |
| **Challenge** | Completing a teacher's class challenge |

### 6.2 Declarative badge engine

Badges are data rows with a `criteria_type`, evaluated by a generic engine:

| criteria_type | Parameters | Example |
|---|---|---|
| `event_count` | activity_type, count, optional filter (`item_ref`, language, scenario tag) | 5 × `tutor-bot.conversation` where persona = public-speaking |
| `metric_threshold` | registered metric, threshold | `words_mastered ≥ 100` |
| `mastery_flag` | item type, item id | /θ/ mastered |
| `week_streak` | weeks | 12 weeks in a row |
| `distinct_count` | activity_type, distinct field, target (number or `"all_enabled"`) | every enabled persona used |
| `score_threshold` *(new)* | activity_type, min performance score | full paper ≥ 0.6 raw |
| `personal_best` *(new)* | activity_type, grouping (e.g. exam_type + level) | beat own best mock score |
| `challenge_complete` | challenge id | — |
| `custom` | handler key | rare edge cases |

**Admin-managed personas.** `"all_enabled"` is resolved against the personas enabled *at evaluation time*. A badge already earned is never revoked when a new persona is added, but the new persona then counts toward a "tier 2" of the badge. Per-persona badges are created by inserting a row when a persona is uploaded. A default row can be generated automatically from the persona's name. *(D13)*

**Adding a new feature** (e.g. Business English, Stress patterns) takes three steps:
1. Register its activity types.
2. Call the shared award function.
3. Insert badge rows.

The core gamification code stays untouched.

### 6.3 Wisdom cards (proverbs on badges)

Each badge carries a short proverb or saying that fits its theme. This keeps the reward adult and reflective rather than "game-like", and it turns every badge into a small language-learning moment. Proverbs are idiomatic English, and their Hungarian equivalents are often not literal translations, which is exactly what this audience finds interesting.

**What a wisdom card shows**
- The proverb in the **target language** of the badge (English for most; German for German exam badges).
- The **Hungarian equivalent**: the real Hungarian saying where one exists, not a word-for-word translation.
- A **🔊 play button** using browser-native TTS (free), with the accent following the US/GB toggle.
- An optional **"Add to my deck"** link that sends the proverb to the Vocabulary Builder as a phrase card (once that feature ships).

**Example pairings** *(Hungarian equivalents to be reviewed by Mark before shipping)*

| Badge theme | Proverb | Hungarian equivalent |
|---|---|---|
| Consistency (weekly goals) | Rome wasn't built in a day. | Nem egy nap alatt épült Róma. |
| Milestone (words learned) | Practice makes perfect. | Gyakorlat teszi a mestert. |
| Steady progress / level-up | Slow and steady wins the race. | Lassan járj, tovább érsz. |
| Mock exam completed | No pain, no gain. | Munka nélkül nincs kalács. |
| Welcome back (hidden) | Better late than never. | Jobb későn, mint soha. |
| Hidden "quiet listener" badge | Speech is silver, silence is golden. | Beszélni ezüst, hallgatni arany. |
| German exam badge | Übung macht den Meister. | Gyakorlat teszi a mestert. |

**When and how it is shown**
- **Earned badges:** the wisdom card appears on **hover (desktop), keyboard focus, or tap (touch)**. Hover alone isn't enough: many 40+ users are on tablets or phones, where hover doesn't exist, so tap opens the same card as a small popover or bottom sheet. Focus support also makes it accessible to screen readers.
- **One fixed proverb per badge**, so a badge and its saying always belong together.
- **Badges only:** wisdoms are not shown at level-up, at weekly-goal completion or on the dashboard.
- **The moment a badge is earned:** the celebration toast shows the proverb once, under the badge name. This is when it lands best.
- **Locked badges:** show the badge criteria only. The proverb is part of the reward and stays hidden.
- **Hidden badges:** show nothing until earned.

**Content rules**
- Prefer **traditional proverbs**, which are public domain and safe. Avoid modern quotes from named people (copyright and frequent misattribution risk). If a quote is attributed, the attribution must be verified.
- Groq may *draft* candidate pairings, but every proverb and Hungarian equivalent is **reviewed by Mark** before it goes live. Hungarian equivalents are easy to get subtly wrong.
- **Tone check:** nothing preachy, nothing about age, nothing implying the learner is slow or behind.

**Extensibility.** Wisdoms live in their own table, and a badge points to one. Each badge has exactly one wisdom. New badges (including auto-generated persona badges, §6.2) get one assigned, by default from an unused reviewed wisdom with a matching theme tag. An admin can edit wisdom text without touching badges.

---

## 7. Teacher tools

### 7.1 Teacher view

For each student: level, weekly-goal status, streaks, XP by section, badges, and mock-exam results by section. Teachers also get a class summary.

### 7.2 Bonus XP

- Requires a reason.
- Capped at `TEACHER_BONUS_WEEKLY_CAP = 50` XP per student per week.
- Logged with `awarded_by`.

### 7.3 Class challenges

- **Types:** collective or individual.
- **Duration:** 1–4 weeks.
- **New targets:** "complete teacher word list X" and "complete one mock booklet" are allowed challenge targets, not just XP or activity counts.

---

## 8. Social layer

### 8.1 Layers

| Layer | Default | Who controls it |
|---|---|---|
| Teacher view | On for connected students | Automatic via invite-code connection |
| Class comparison | Off | Teacher toggles per class |
| Public leaderboard | Off | Learner opts in, nickname only |

### 8.2 Public leaderboard rules

- Ranks by weekly XP, resetting every Monday.
- Leagues by CEFR band (see §4.3).
- Shows nickname and level only. Leaving is instant. An admin kill switch is available.

### 8.3 Age and consent rules (decided in principle, D14)

Érettségi Prep can be used by adults and minors, so the rules depend on the learner's age, not the section. They follow the applicable regulations:

- **Legal basis.** Joining the public leaderboard is optional, so it relies on the learner's **consent** (GDPR Art. 6(1)(a)). This brings in GDPR Art. 8: in Hungary, children can give digital consent themselves from **age 16**. Below that, a parent must give or authorise consent.
- **Rule at opt-in:**
  - **16 or older:** can opt in themselves.
  - **Under 16:** cannot join the public leaderboard in v1. A verified parental-consent flow is a possible later addition but is not worth building now.
- **Mechanism:** an age self-declaration at opt-in ("Elmúltam 16 éves / I am 16 or older"). Store only the confirmation and its timestamp, not the date of birth (data minimisation).
- **Teacher control:** a teacher can disable public-leaderboard opt-in for everyone in a class (e.g. a secondary-school group). Class comparison is unaffected, since the teacher manages it inside the class.
- **Extra protection for 16–17-year-olds:** nickname only (with a profanity/real-name check), no photo, no free text, instant withdrawal. These are the same rules as for adults, so no separate code path is needed.
- **Clear language:** the opt-in text must be short and plain Hungarian, as GDPR Art. 12 requires for information addressed to children.
- **Beyond gamification:** if under-16s can register for the app at all, the app's overall legal basis for minors (consent vs. contract) needs its own check. That's outside this doc but should be flagged before Exam Prep launches. *(D15)*

*Not legal advice. Have the opt-in wording and the under-16 handling checked against NAIH guidance or by a data-protection lawyer before Phase 5.*

---

## 9. Data model (sketch)

All tables have RLS. Writes happen server-side only.

- **`gamification_activity_types`**: `key` PK, `section` (`features.ts` id), `module`, `base_xp`, `bonus_source`, `daily_xp_cap`, `weekly_xp_cap` (nullable), `weekly_cap_group` (nullable, e.g. `'exam'`), `repeat_rule` (`'24h_diminishing'` | `'sitting_effort_only'` | `'none'`), `client_awardable` (bool: may the browser trigger it via `/api/gamification/award`?), `enabled`.
- **`xp_events`**: `id`, `user_id`, `activity_type`, `item_ref` (sound id, persona id, sitting id…), `language` (`'en'` | `'de'`), `base_xp`, `bonus_xp`, `performance_score`, `awarded_by`, `reason`, `created_at`.
- **`learner_gamification`**: `user_id` PK, `total_xp`, `level`, `weekly_goal_days`, `week_streak`, `best_week_streak`, `daily_streak`, `freezes`, `last_active_date`, `leaderboard_opt_in`, `nickname`, `opt_in_at`, `age_16_confirmed_at`.
- **`weekly_progress`**: `user_id`, `week_start`, `active_days`, `goal_days`, `goal_met`, `xp`, `exam_xp`.
- **`badge_definitions`**: as in v1, plus `section` (nullable) for grouping on the badge wall, and `wisdom_id` (nullable FK).
- **`wisdoms`** *(new)*: `id`, `text` (proverb in its own language), `text_language` (`'en'` | `'de'`), `hungarian_equivalent`, `theme_tags` (text[], e.g. `consistency`, `effort`, `return`), `reviewed` (bool; only reviewed rows are shown), `enabled`.
- **`user_badges`**, **`class_challenges`**, **`challenge_progress`**: as in v1.

**Single award entry point:** `award_xp(user_id, activity_type, item_ref, language, performance_score)`.

### 9.1 Launch state (D4 decided: start from zero)

- Every learner starts at 0 XP, Level 1, and no streaks. Nothing is backfilled from past activity.
- **Exception, badges based on current state:** mastery and metric badges (e.g. /θ/ mastered, 100 words learned) are evaluated against the learner's current data on their first visit after launch. Learners keep credit for what they have genuinely achieved, but they get no XP for it. Count-based badges (e.g. 10 Tutor Bot conversations) only count activity after launch.

### 9.2 How XP gets awarded (D6 decided)

There are two ways to connect existing features to `award_xp`:

| | **A. Database triggers** | **B. Explicit server calls** (recommended) |
|---|---|---|
| How it works | Supabase runs `award_xp` automatically whenever a feature saves a row (e.g. a new `pronunciation_progress` row) | Each feature's server code calls one shared helper (`awardXp(...)`) when an activity is finished |
| Pros | Features don't need to know gamification exists | Visible in the TypeScript code, easy to read, test and debug; works for activities that don't save a row (games, fast practice) |
| Cons | Logic hidden inside the database; harder to debug; doesn't work for activities that save nothing | Each new feature must remember to call the helper (one line, enforced by a checklist) |

**Recommendation: B.** It fits the existing pattern (Vercel API routes + service role) and is easier to follow as your skills grow. Client-side activities (drills, games) call one endpoint, `POST /api/gamification/award`, which validates the activity type, applies caps and rate limits, and never trusts an XP number sent by the browser.

### 9.3 Tutor Bot persistence (D8 decided)

Today `api/tutor-chat.ts` answers messages but **saves nothing**: no record that a conversation happened, how many turns it had or which persona was used. For gamification this means the server can't check the "6 learner turns" rule, so Tutor Bot XP would have to trust the browser.

**Recommendation:** a minimal fix in Phase 1. Add a `tutor_sessions` table (`id`, `user_id`, `persona_id`, `started_at`, `last_turn_at`, `learner_turns`). `tutor-chat.ts` creates or updates the row on each message and calls `awardXp` once `learner_turns` reaches 6.

- This stores **counts, not transcripts**, so it's light on cost and on GDPR.
- Saving full transcripts is a separate decision. The Vocabulary Builder's "words from Tutor Bot" source may need it later, but gamification doesn't.

**Integration:** `pronunciation_progress`, the vocabulary cards view, `cefr_history` (per language), `exam_attempts` (section scores → `section_complete` events; personal-best badges).

---

## 10. UI touchpoints

- **Header chip:** level, week-goal ring, small daily-streak flame.
- **Badge wall and badge toast:** the wisdom card on hover/focus/tap and in the earn toast (§6.3).
- **End-of-activity summary:** XP earned, with base and bonus shown separately.
- **Exam results screen:** XP per booklet plus a paper bonus, shown below the score breakdown, never above it. The exam result matters more.
- **"Az én fejlődésem" (student dashboard):** gamification lives here as one panel among the progress panels: level and XP by section, weekly history, badge wall (hidden badges shown as "?"). The dashboard's "next step" suggestion can point to the nearest badge or the weekly goal.
- **Settings:** weekly goal, leaderboard opt-in with nickname and age self-declaration (16+), celebration intensity.
- **Teacher class settings:** toggle class comparison; toggle "public leaderboard allowed for this class".

---

## 11. Phasing

| Phase | Content |
|---|---|
| 1 | Minimal `tutor_sessions` (D8); registry (all sections registered, unshipped ones disabled), ledger, `award_xp` + `/api/gamification/award`, XP wired into the four active sections, level display |
| 2 | Weekly goal, streaks, freezes, Monday cron |
| 3 | Badge engine + initial catalogue with reviewed wisdom pairings; gamification panel in "Az én fejlődésem" |
| 4 | Teacher view additions, bonus XP, class challenges |
| 5 | Class comparison, public leaderboard (leagues, 16+ consent rule, teacher class toggle); legal check of opt-in wording first |
| As shipped | Enable Vocabulary Builder, Exam Prep, Business English and Live Events activity types + badge rows |

---

## 12. Open decisions

- **D1:** Rename "session" to "section" in code and docs?
- **D2:** Level title list (bilingual).
- **D3:** Bronze/silver/gold badge tiers?
- ~~D4~~ **Decided:** start from zero; current-state badges granted on first evaluation (§9.1).
- **D5:** Leaderboard league boundaries; how mixed-language weeks are placed.
- ~~D6~~ **Decided:** explicit server calls (§9.2).
- **D7:** Exact XP values and caps (§3.3, §3.4).
- ~~D8~~ **Decided:** minimal Tutor Bot session tracking (counts only) in Phase 1 (§9.3).
- **D9:** Badge icon style.
- ~~D10~~ **Decided:** section list confirmed, with Vocabulary Builder modules added.
- ~~D11~~ **Decided:** one XP pool, CEFR per language. Still open: does `cefr_history` need a `language` column? (Check during Phase 1.)
- **D12 (deferred):** Live-event XP. Decide when Live Events is designed; the activity type is pre-registered but disabled.
- **D13 (new):** Auto-generate a badge row for each uploaded persona, or create them manually?
- ~~D14~~ **Decided in principle:** 16+ self-declaration, no leaderboard for under-16s in v1, teacher class toggle (§8.3). Legal wording check pending.
- ~~D16–D18~~ **Decided:** proverb + Hungarian equivalent; one fixed proverb per badge; badges only.
- **D15 (new):** The app's general legal basis for under-16 accounts (outside gamification, but it blocks Exam Prep launch for minors).
