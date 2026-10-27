# Intake form (Felmérő kérdőív) — spec

Status: draft spec, 2026-10-26. Nothing is built. Builds on [language-coach-tools-research.md](language-coach-tools-research.md) (tool 4.1, taxonomy section 2).

## 1. Purpose

The intake form is the first tool in the coaching arc. A new student fills it in before the first lesson, or together with the teacher in that lesson. It has three jobs:

1. **Give the teacher a one-screen picture** of the learner: history, level, needs, motivation, time, blocks and goal. This replaces the first 20 minutes of a "getting to know you" lesson.
2. **Pre-fill the Goal plan** (research doc 3.1), so the teacher and student refine a goal instead of starting from a blank page.
3. **Personalise the app.** A short goal line goes into `learner_profiles.learner_goal`, which the AI tutor prompt already reads (`api/_lib/prompts.ts`) but nothing writes yet.

It follows Koncsag Réka's **Past – Present – Future** structure, which coaches use for the first meeting instead of a placement test.

## 2. Design rules

- **10–12 minutes**, 8 short screens, with a progress bar. Coaches report that long pre-forms get abandoned.
- **Everything is skippable** except the main goal type (G1). A skipped answer is shown to the teacher as "—", not as a problem.
- **Draft saved on every screen**, so the student can stop and come back.
- **Hungarian first**, with an English toggle through the normal i18n. Answer chips are short; free-text fields are few and optional.
- **No diagnosis language.** Words like "anxiety" or "block" appear only on the teacher view. The student sees neutral wording ("How do you feel when…").
- **Mobile first.** Most students will open the link on a phone.
- **No sensitive data asked for.** The research found coaches working with family history and trauma (Ambrus). Avalon must not ask about health, trauma or family. Those topics belong in a live conversation, not a stored form (see section 8).

## 3. Two ways to fill it

| Mode | Who | When | Notes |
|---|---|---|---|
| **Send to student** | Teacher sends it from the Toolkit; the student fills it in on their own account | Before the first lesson | Needs an active `teacher_student_links` row. The student sees it as a card on their home screen or under My progress |
| **Fill together** | Teacher's screen, in the lesson, talking through the questions | First lesson | Same form. The teacher types and the student answers aloud. Not for projector or class mode, because the answers are private |

Both modes save to the same record. After submission the teacher adds **teacher-only notes** (section H).

## 4. The questions

Legend: **Type**: `single` = one choice · `multi` = several chips · `scale` = slider · `text` = free text · `date`. **Feeds**: where the answer is used later.

### Screen 0 — Welcome
Text (HU/EN): what the form is for, about 10 minutes, every question is optional, only your teacher sees the answers.
Consent checkbox: "I agree that my teacher can see these answers." Required to continue. Section 8 covers minors.

### Screen A — About you (Rólad)
| ID | Question (HU / EN) | Type | Options | Feeds |
|---|---|---|---|---|
| A1 | Hány éves vagy? / *How old are you?* | single | under 14 · 14–17 · 18–25 · 26–40 · 41–60 · 60+ | Consent rule (section 8); content choice |
| A2 | Mivel foglalkozol? / *What do you do?* | single + text | Secondary school student · University student · Employee · Manager · Self-employed · Not working now · Retired · Other: ___ | Situations defaults (D) |
| A3 | Szakterület (ha releváns) / *Field, if relevant* | text | e.g. IT, healthcare, sales | Scenario and vocab topics |
| A4 | Milyen más nyelveket beszélsz? / *What other languages do you speak?* | multi + level | German, French, Spanish, Italian, Russian, Other · each with basic / good / fluent | Teacher context |

### Screen B — Past: learning history (Múlt)
| ID | Question | Type | Options | Feeds |
|---|---|---|---|---|
| B1 | Mióta tanulsz angolul (összesen)? / *How long have you studied English in total?* | single | Just starting · under 1 year · 1–3 years · 4–8 years · more than 8 years | Plateau flag (section 6) |
| B2 | Hol tanultál eddig? / *Where have you learned so far?* | multi | School · Language school · Private teacher · Apps · On my own (books, videos) · At work · Living abroad · Series / games / social media | Teacher context |
| B3 | Milyen vizsgát tettél már? / *Which exams have you taken?* | multi, each with level + result | Érettségi (közép / emelt) · Nyelvvizsga (ECL, Origó, Euroexam, TELC, LCCI, other) B1 / B2 / C1 · IELTS · Cambridge · None | Goal plan step 2 |
| B4 | Mi működött a legjobban? / *What worked best for you?* | multi | Conversation · Series and films · Songs · Reading · Grammar exercises · Word cards / apps · Writing · Living abroad · Other: ___ | Method menu (tool 4.4) |
| B5 | Mi nem működött? / *What didn't work?* | multi | Same list | Method menu |
| B6 | Mi segített már korábban egy nehéz tanulási helyzetben? / *What helped you before when learning got hard?* | text, optional | — | Goal plan step 5 (resources). Koncsag's question |
| B7 | Milyen volt a legjobb angolórád vagy tanárod? Mitől? / *Describe your best English lesson or teacher. What made it good?* | text, optional | — | Teacher style |

### Screen C — Present: level and skills (Most: szint)
| ID | Question | Type | Options | Feeds |
|---|---|---|---|---|
| C1 | Melyik mondat illik rád leginkább? / *Which sentence fits you best?* | single | Six plain "I can…" lines, one per CEFR level A1–C2 (e.g. B1: "I can manage most everyday situations and talk about familiar topics, but I often look for words."), plus "I don't know" | Suggested level. **Does not overwrite `cefr_level`**: the teacher confirms |
| C2 | Skills wheel (Készségkerék): rate yourself 1–10 | 7 scales | Listening · Reading · Speaking · Writing · Pronunciation · Vocabulary · Grammar | Goal plan step 2; tool 4.3. Shown as a wheel |
| C3 | Melyik a legnehezebb? / *Which is hardest?* | single | The same 7 skills | Focus suggestion |

### Screen D — Present: situations (Most: helyzetek)
Needs analysis. The list is pre-sorted by A2: workers see work situations first, school students see exams first.

| ID | Question | Type | Feeds |
|---|---|---|---|
| D1 | Milyen helyzetekben használod vagy szeretnéd használni az angolt? / *Where do you use, or want to use, English?* Each picked situation gets **how often** (never yet / sometimes / often) and **how hard** (easy / OK / hard) | multi + 2 mini-scales | Goal plan step 3; scenario and exam task picks |

Situation list: Meetings · Presentations · Emails and chat at work · Phone and video calls · Small talk · Job interview · Negotiation · Reading for work · Travel · Living or moving abroad · Films, series, YouTube · Social media and gaming · Talking with foreign friends or family · Helping my child with English · School lessons · Exam · Other: ___

The pairs marked "often + hard" become the top of the teacher's needs list.

### Screen E — Present: motivation (Most: miért?)
This is Ambrus Mónika's "step zero". Each reason carries a hidden motivation-type tag (taxonomy 2.4). The student doesn't see the tags.

| ID | Question | Type | Options → hidden tag | Feeds |
|---|---|---|---|---|
| E1 | Miért tanulsz most angolul? / *Why are you learning English now?* | multi, up to 3 | I enjoy it → *intrinsic* · I want to grow as a person → *identified* · It helps my career or plans → *identified* · I'd like to live, study or work abroad → *identified* · I'd feel embarrassed if I couldn't → *introjected* · I feel I should → *introjected* · My job or boss requires it → *external* · I need a certificate or diploma → *external* · My school or parents want it → *external* | Motivation flag (section 6); goal plan step 1 |
| E2 | Kinek az ötlete volt? / *Whose idea was it?* | single | Mine · My employer's · My school's · My family's · Mixed | Ownership (taxonomy 2.7) |
| E3 | Mennyire fontos ez neked most? / *How important is this to you right now?* | scale 0–10 | — | Readiness ruler (section 6) |
| E4 | Mennyire bízol benne, hogy eléred? / *How confident are you that you'll get there?* | scale 0–10 | — | Readiness ruler |

E3 and E4 are the **importance and confidence rulers** from motivational interviewing. They are quick and give the teacher a lot: high importance with low confidence calls for small wins first; low importance calls for the "why" work before any plan.

### Screen F — Present: time, habits, feelings (Most: idő és érzések)
| ID | Question | Type | Options | Feeds |
|---|---|---|---|---|
| F1 | Reálisan hány napot tudsz angolozni egy héten? / *Realistically, how many days a week can you practise?* | single | 1 · 2 · 3 · 4 · 5 · 6 · 7 | **Suggests `weeklyGoalDays`.** The student confirms it in the goal plan; the form doesn't set it directly |
| F2 | Mennyi időt egy ilyen napon? / *How much time on such a day?* | single | 5–10 min · 15–20 min · 30 min · 45–60 min · more than 1 hour | Realism check (section 6) |
| F3 | Mikor? / *When?* | multi | Morning · Commute · Lunch break · Evening · Weekend | If-then plans (goal plan step 5) |
| F4 | Mi szokott közbejönni? / *What usually gets in the way?* | multi | Tiredness · No time · I forget · It gets boring · I don't know what to practise · I'm afraid of mistakes · I want it perfect or not at all · Other: ___ | WOOP obstacles (goal plan step 5) |
| F5 | Hogy érzed magad, amikor angolul kell megszólalnod? / *How do you feel when you have to speak English?* 4 statements, 1–5 (not true → very true) | 4 scales | "I get nervous even when I'm prepared." · "I'd rather stay silent than make a mistake." · "I worry what others think of my English." · "I feel more confident in writing than speaking." | Speaking-comfort flag (section 6) |

F5 is Avalon's own wording in the spirit of foreign-language anxiety scales. Do not copy items from published scales such as FLCAS, which are copyrighted.

### Screen G — Future: the goal (Jövő)
| ID | Question | Type | Options | Feeds |
|---|---|---|---|---|
| G1 | **Mi a fő célod?** / *What is your main goal?* **(required)** | single, then sub-type | Exam or certificate → type and level · Work situation → pick from D1 · Life situation (travel, moving abroad, family) · Get better at a skill → pick from C2 · Feel more confident speaking · Find a way of learning that works for me | Goal plan L1 domain (taxonomy 2.2) |
| G2 | Van határidő? / *Is there a deadline?* | date, or "No deadline" | — | Goal plan step 3; realism check |
| G3 | Mit fog megváltoztatni az életedben, ha eléred? / *What will change in your life when you reach it?* | text, optional | — | Goal plan L0 vision. Koncsag's question |
| G4 | Honnan fogod tudni, hogy megérkeztél? / *How will you know you've arrived?* | text, optional | — | First milestone draft (L2). Ambrus's question |
| G5 | Milyen órát szeretnél? / *What kind of lessons do you want?* | multi | Lots of speaking · Clear grammar explanations · Exam practice · Homework between lessons · Using the app between lessons | Lesson planning |
| G6 | Hogyan javítsalak? / *How should I correct you?* | single | Straight away · At the end of a task · In writing after the lesson · Only big mistakes | Correction agreement. Nyelvi-coaching.hu agrees with each learner how the coach will step in. Could later feed the AI tutor too |

### Screen H — Anything else + teacher notes
| ID | Question | Who | Type |
|---|---|---|---|
| H1 | Van még valami, amit tudnom kellene? / *Anything else I should know?* | Student | text, optional. Hint under the box: "No need to share health or private family matters here. If something matters, we can talk about it in person." |
| H2 | Teacher observations | Teacher only | text |
| H3 | Confirmed CEFR level | Teacher only | single A1–C2. Writes `learner_profiles.cefr_level` and a `cefr_history` row with rationale "intake" |
| H4 | Agreed first focus | Teacher only | text, 1 line |

## 5. Teacher view: the intake summary card

After submission the teacher sees one card on the student's page in the Toolkit:

```
Kiss Anna · 26–40 · Employee (IT) · 4–8 years of English · B1 (self) → teacher: —
GOAL     Work situation: meetings · deadline: 2027-03-01
WHY      career (identified) · employer's idea · importance 8 · confidence 3
NEEDS    often + hard: meetings, small talk · phone calls
SKILLS   [wheel]  lowest: speaking 3, listening 4 · highest: reading 7
TIME     3 days × 15–20 min · evenings, commute
BLOCKS   afraid of mistakes, perfectionism · speaking comfort: low
WORKED   series, reading · DIDN'T: grammar drills, word cards
FLAGS    ⚑ confidence much lower than importance  ⚑ low speaking comfort
LESSONS  lots of speaking · correct at the end of a task
[ Start goal plan ]   [ Add notes ]   [ Re-send / new round ]
```

**Start goal plan** opens the Goal plan pre-filled from G1–G4, C2, F1–F4 and E1.

## 6. Flags (rule-based, shown only to the teacher)

Flags are prompts for a conversation, never labels. Each one carries a suggested tool from the research doc.

| Flag | Rule | Suggested next tool |
|---|---|---|
| **Outside motivation only** | Every E1 tag is *external* or *introjected* | "Step zero" motivation check (4.2) |
| **Readiness gap** | E3 − E4 ≥ 4 | Small wins first: speaking challenge ladder (4.6), wins log (4.3) |
| **Low importance** | E3 ≤ 4 | Vision work before a plan (4.2) |
| **Low speaking comfort** | F5 average ≥ 4 (of 5) | Challenge ladder; anxiety check before and after the speaking exam (4.5) |
| **Plateau** | B1 = "more than 8 years" and C1 ≤ B1 | Limiting-belief reframe (TIRED) (4.5); method menu (4.4) |
| **Tight deadline** | Rough hours available before G2 (F1 × F2 × weeks) are far below a CEFR step. Guideline: one level is about 200 guided learning hours, with large individual differences | Talk about the timeline; split the goal (taxonomy 2.1) |
| **Self-rating vs evidence** | C1 or C2 self-rating differs from app evidence (exam scores, pronunciation %) by more than one band | Discuss in the first lesson. Don't correct in the form |
| **Many failed methods** | B5 has ≥ 4 picks | Method menu, try one at a time (4.4) |

Optional later: a short AI summary, generated with the admin's model setting and logged in `groq_usage_log` like the lyrics suggestions, with a daily cap. The rule-based card should come first, because it is predictable and free.

## 7. Re-take ("new round")

The teacher can send the form again after a coaching process, or every 3–6 months. Answers from the previous round are pre-filled. The card then shows **then vs now**: the wheel overlay, C1 change, E3/E4 change and goal status. This is the "end-of-process review" tool (4.7) for free.

## 8. Privacy and consent

- **Teacher-only visibility.** Only connected teachers (active `teacher_student_links`) and the student can read the record, matching the `learner_profiles` RLS pattern.
- **Minors.** Hungary sets the age of digital consent at 16. For A1 = "under 14" or "14–17", show a parent/guardian consent step, or allow only "fill together" mode. **Check this with the same legal review that the leaderboard is waiting for.**
- **No special-category data** (health, trauma, family background) as structured fields. The H1 hint steers away from it. The teacher's H2 notes should follow the same rule.
- **Deletion.** The record is deleted with the user (cascade on `auth.users`). When a teacher link is revoked, that teacher loses access.

## 9. Data and API sketch

New table (migration needed; hand-run SQL as usual):

```sql
create table public.intake_forms (
  id bigint generated always as identity primary key,
  teacher_id uuid not null references auth.users(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  round int not null default 1,
  status text not null default 'sent'
    check (status in ('sent', 'draft', 'submitted', 'reviewed')),
  mode text not null default 'send' check (mode in ('send', 'together')),
  schema_version int not null default 1,
  answers jsonb not null default '{}'::jsonb,   -- keyed by question id: A1, B3, D1…
  teacher_notes jsonb not null default '{}'::jsonb, -- H2–H4, never shown to the student
  sent_at timestamptz not null default now(),
  submitted_at timestamptz,
  reviewed_at timestamptz,
  unique (teacher_id, student_id, round)
);
```

Notes:
- `answers` as jsonb keyed by question ID keeps the form editable without migrations. `schema_version` lets old rounds render correctly after questions change.
- RLS: the student can read their rows and update `answers` while the status is `sent` or `draft`. The teacher can read and update `teacher_notes` and the status while the link is active. Use `teacher_notes` in a separate column so a student update can never touch it.
- **Teacher side**: new `?action=` values on `api/teacher-tools.ts`, such as `intake-send`, `intake-get`, `intake-list` and `intake-review`.
- **Student side**: `api/teacher-tools.ts` returns 403 to non-teachers, so the student's get/save/submit must go on an existing student-facing function. `api/connect.ts` already handles teacher–student links. There are 10 of 12 Vercel functions, so don't add a new file.
- On submit, write a one-line goal ("Meetings at work, by March 2027; wants confidence speaking") to `learner_profiles.learner_goal` so the AI tutor uses it.

## 10. Open decisions for the build session

1. **Student-facing feature.** This would be the Toolkit's first tool that students open themselves; until now Toolkit items are private to the teacher. Confirm that's wanted.
2. **Where the student sees it:** a home-screen card, the My progress menu, or both.
3. **Minors:** parental consent step vs "fill together only" (legal check).
4. **Build with the Goal plan or before it.** The intake works alone (summary card and flags), but its biggest payoff is pre-filling the goal plan.
5. **AI summary:** now or later.
