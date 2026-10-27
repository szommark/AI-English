# Language coach tools — research for the Teacher Toolkit

Research date: 2026-10-26. Input for the Teacher Toolkit session (`/teacher/tools`).
Goal: collect the tools language coaches use, with **goal setting** as the base tool, and rank Hungarian (and a few international) coach sites by how useful their content is.

Everything below comes from public pages only. Paid courses, member areas, books and sign-up lead magnets were not opened, so some sites may hold more than the ranking shows.

---

## 1. Key findings

1. **Hungarian coach sites name many models but publish very few tools.** Most pages say "GROW", "SMART" or "coaching tools" without a worksheet, a question list or a template. This is a gap Avalon can fill: concrete, reusable tools that a teacher can run with a student.
2. **The same coaching arc appears on every site:** free intake / "clarity" call → *why* (motivation) → *where am I now* → goal → action plan → weekly accountability → review. The Toolkit should follow this arc, so tools hand data to each other.
3. **Motivation comes before the goal.** Ambrus Mónika calls it *"step zero"* (*nulladik lépés*): a goal driven by a boss, a certificate or family runs out. Koncsag Réka asks "What will change in your life if you reach this goal?" A goal tool without a "why" step would miss what these coaches value most.
4. **Blocks are a main topic:** speaking anxiety, low confidence, procrastination, perfectionism and old school experiences. Every serious site offers a way to work on them.
5. **Accountability is the product.** Weekly goal tracking, accountability partners and daily check-ins (Ambrus) and "regular feedback and accountability" (nyelvi-coaching.hu, Mátrai) are what learners pay for. Avalon already has a weekly goal and streak, which is the start of this.
6. **Avalon already has a lot of the evidence layer** that coaches collect by hand: the weekly active-days goal and week streak (`weeklyGoalDays`, `weekStreak` in `src/lib/gamification/types.ts`), exam papers (érettségi, nyelvvizsga), mistake events, pronunciation scores and vocabulary lists.

---

## 2. Goal-setting taxonomy

A goal in Avalon can be described along **8 dimensions**. The first two shape the UI; the rest are fields or tags.

### 2.1 Level — the goal hierarchy (most important)

| Level | HU label | What it is | Example | Time horizon | Measured by |
|---|---|---|---|---|---|
| **L0 Vision / purpose** | Jövőkép, „miért” | The life change behind the learning (Dörnyei's *Ideal L2 self*) | "I lead the Monday meeting in English without dread." | 1–3 years | Feeling, self-description |
| **L1 Outcome goal** | Fő cél | A concrete result, often external | B2 nyelvvizsga by June; job interview in English; move to Vienna | 3–12 months | Pass/fail, date |
| **L2 Proficiency / performance goal** | Szintcél, készségcél | What the learner can *do* | "I can give a 5-minute project update (B2 spoken production)." | 1–3 months | CEFR can-do checklist, teacher rating, recording |
| **L3 Process / habit goal** | Szokáscél | Behaviour the learner controls | 4 active days a week; 15 minutes of shadowing a day | Weekly | Count, streak (**already in Avalon**) |
| **L4 Action / session goal** | Heti lépés, óracél | The next small step | "Record one 2-minute answer before Thursday." | This week / this lesson | Done / not done |

Rule: every L1 goal should have at least one L2 milestone and one L3 habit under it. Otherwise it stays a wish. This hierarchy is the "breaking down" step that all frameworks share: SMART, OKR, ACTFL can-do and Dörnyei's "operationalising the vision".

### 2.2 Domain — what the goal is about

| Domain | Sub-types (pick-list) | Seen on |
|---|---|---|
| **Exam / certificate** | Érettségi (közép/emelt), nyelvvizsga (B1/B2/C1 — ECL, Origó, Euroexam, TELC, LCCI), IELTS, Cambridge (B2 First, C1 Advanced), diploma requirement | Koncsag (TELC), nyelvi-coaching.hu (LCCI), Horváth (IELTS/Cambridge), Angol Intézet |
| **Work situation** | Meetings, presentation, negotiation, emails, job interview, small talk with colleagues, phone/video calls | Ambrus, nyelvi-coaching.hu, Horváth, Astrolingva, English side by side |
| **Life situation** | Travel, moving abroad, partner/family, helping children with homework, hobby/culture | Koncsag (relocation to DACH countries), Ambriel (living abroad package), Németh |
| **Skill** | Speaking, listening, reading, writing, pronunciation, vocabulary, grammar | All |
| **Affective / mindset** | Confidence, speaking anxiety, exam anxiety, perfectionism, "I'm too old / not talented" | Ambrus (main focus), Koncsag, English side by side, nyelvi-coaching.hu |
| **Learning to learn** | Find a method that fits, study habits, time management, autonomy, using resources/AI | Koncsag 80h course, Ambriel, Ambrus |

### 2.3 Time horizon
Long (6–24 months) · Coaching process (Ambrus: 4 months; Ambriel: 2–5 weeks; nyelvi-coaching.hu: 6–10 sessions) · 90 days (StoryLearning planner) · Week · Session.

### 2.4 Motivation source
Based on Self-Determination Theory and Dörnyei's L2 Motivational Self System. Store it as a tag on the L0/L1 goal.

| Type | Learner says | Risk |
|---|---|---|
| Intrinsic | "I enjoy it." | Low |
| Identified / Ideal L2 self | "It matters to me; it's who I want to be." | Low |
| Introjected / Ought-to self | "I should; I'd be ashamed if I didn't." | Medium: guilt-driven, burns out |
| External | "My boss / the diploma requires it." | High: the "step zero" warning (Ambrus) |

A goal with only an external source is a signal for the teacher to run the motivation tools (see 3.2).

### 2.5 Orientation
- **Approach vs avoidance:** "speak confidently in meetings" vs "stop freezing in meetings". Rephrase avoidance goals into approach goals.
- **Mastery vs performance:** "get better at listening to fast speech" vs "score 80% on the listening paper". Both are fine; a mix is best.

### 2.6 Measurement type
Binary (passed / did it) · Self-rating scale 1–10 (solution-focused scaling question) · Skills wheel (self-rating per skill) · CEFR can-do checklist · Count (days, minutes, words, recordings) · Evidence (a recording, a written sample, a mock-exam score) · Teacher rating.
Avalon can fill many of these automatically: active days, exam scores, pronunciation %, mastered words.

### 2.7 Ownership
Learner-set · Co-created with the teacher (the coaching norm) · Teacher-assigned · External (school, employer, HR). Astrolingva aligns company goals with HR expectations, so "external stakeholder" is a real case for business clients.

### 2.8 Lifecycle status
`draft → active → on track / at risk → achieved | revised | dropped`
Dropping a goal is a valid outcome, not a failure. Ambrus describes a client who let go of an unused certificate goal and then learned for her own reasons. Keep a short "why changed" note on every revision.

---

## 3. Goal-setting frameworks (what to build the tool from)

| Framework | Steps | Best used for | Source |
|---|---|---|---|
| **SMART / SMARTER** | Specific, Measurable, Achievable, Relevant, Time-bound (+ Evaluated, Reviewed) | Checking an L1/L2 goal before saving | Common; nyelvi-coaching.hu; CASLS InterCom; StoryLearning |
| **GROW** | Goal → Reality → Options → Will (way forward) | Structuring a coaching session or the whole wizard | nyelvi-coaching.hu, Horváth Mariann |
| **WOOP / MCII** (Oettingen) | Wish → Outcome → Obstacle → Plan ("If [obstacle], then I will [action]") | Turning a goal into a plan that survives real life; anxiety | Research (small L2 studies, mixed results) |
| **Implementation intentions** (Gollwitzer) | "When/where X happens, I will do Y." | L3 habit goals ("After my morning coffee I do 10 min of shadowing.") | Research |
| **Locke & Latham goal-setting theory** | Clarity, challenge, commitment, feedback, task complexity | Design rules for the tool: feedback loop, not too easy | Research |
| **Dörnyei & Hadfield vision programme** | Create the vision → strengthen → substantiate (reality check) → operationalise (goals, plans) → keep alive → counterbalance (feared self / obstacles) | The L0 "why" step; activities like *My Ideal Self*, *Identity Tree*, *Reality Check*, *Overcoming Obstacles* | *Motivating Learning* (2013). Dörnyei is Hungarian, which is a nice local link |
| **CEFR / ACTFL can-do reflective cycle** | Set goal → choose strategies → self-assess → give evidence → reflect → new goal | L2 proficiency goals and milestones | NCSSFL-ACTFL Can-Do, LinguaFolio |
| **Past – Present – Future intake** | Past: experiences, what worked · Present: motivation, goals, time · Future: shared plan | The first session / intake form | Koncsag Réka |
| **4As** (Sam Moinet) | Agenda → Awareness → Action steps → Accountability | Weekly check-in session structure | Ferenczi's ILCA 2022 notes |
| **Solution-focused questions** | Miracle question, scaling 0–10, exceptions ("When did it already work?") | Reality step, review | Koncsag ("What helped you before?") |
| **Fluency / skills wheel** | Rate each skill 1–10, pick the 1–3 to grow | Baseline + choosing focus | StoryLearning planner (wheel of life adapted) |
| **OKR-lite** | 1 objective + 2–3 measurable key results per quarter | Business clients, 90-day plans | General |

### 3.1 Proposed Avalon flow: "Célkitűzés / Goal plan" (6 steps, GROW + WOOP + SMART)

1. **Why (L0).** Vision prompt plus a motivation-source check (2.4). Warn gently when the only reason is external.
2. **Where am I now.** Skills wheel self-rating, pre-filled with app evidence the teacher can see (recent exam scores, pronunciation %, active weeks).
3. **Target (L1).** Pick a domain and sub-type (2.2), set a deadline, run a SMART check (each letter is a small tick, with a hint when it fails).
4. **Milestones (L2).** Suggest CEFR can-do statements for the target level and domain; the learner picks and edits 2–5 of them.
5. **Plan (L3/L4).** Weekly habit (writes to the existing `weeklyGoalDays`), 1–3 "if-then" plans (WOOP obstacle → plan), and the first L4 step for this week.
6. **Review rhythm.** Weekly scale 0–10 plus 4As check-in; monthly milestone review; status change with a note (2.8).

The teacher can run it live in a lesson (projector or class mode, like the lyrics tool) or send it as homework. Data stays private per teacher–student pair, matching the Toolkit's current scope rule.

### 3.2 Question bank (collected from the sites, ready for the wizard)

**Why / motivation**
- Mit fog megváltoztatni az életedben, ha eléred ezt a célt? / *What will change in your life if you reach this goal?* (Koncsag)
- Mi lenne számodra az igazi siker? / *What would real success look like for you?* (Koncsag)
- Neked mi a célod a nyelvtanulás projekttel? / *What is your goal with this language project?* (Ambrus)
- Even if your company expects it, why is it important to **you**? (Ambrus)
- Would you protect this study time in your calendar like an important meeting? (Ambrus)
- When you think of the goal, do you feel obligation, or pride, satisfaction and security? (Ambrus)
- Is there a dream you dismissed as impossible, such as working abroad or presenting in English? (Ambrus)

**Reality / past**
- Mi segített már korábban egy nehéz tanulási helyzetben? / *What helped you before in a difficult learning situation?* (Koncsag)
- What did you try before, what worked, and what didn't? (Koncsag: Past–Present–Future)
- In which situations do you need English? Which skills need the most work? (Angol Intézet intake)
- How much time do you really have each week? (Koncsag, Ambrus)

**Destination / measure**
- Where do you want to end up? How will you know you have arrived? (Ambrus)
- On a scale of 0–10, where are you now? What would one point higher look like? (solution-focused)

**Plan / obstacles**
- What will most likely get in the way? When that happens, what exactly will you do? (WOOP)
- What is the smallest step you can take before our next lesson? (4As / GROW Will)
- Who could be your accountability partner? (Ambrus)

---

## 4. Catalogue of other language-coach tools

Grouped by the coaching arc. "Avalon hook" lists existing data or features a tool can reuse. Priority is a suggestion for the Toolkit roadmap (P1 = build next).

### 4.1 Intake and diagnosis
| Tool | What it does | Seen on | Avalon hook | Prio |
|---|---|---|---|---|
| **Intake questionnaire** | Pre-session form: history, needs, time, goals | Koncsag (sent before the free call), nyelvi-coaching.hu (*Igényfelmérés*), Angol Intézet | Student profile | P1 |
| **Learner history timeline** | Past–Present–Future map of past schools, teachers, good and bad experiences | Koncsag; Ambrus (family history, school trauma) | — | P2 |
| **Needs analysis (situations)** | List the real situations where the learner uses English, rated by frequency and difficulty | Angol Intézet, Horváth, Astrolingva | Scenario mode, exam tasks | P2 |
| **Level test** | Diagnostic test | Horváth (free 50-question test), Angol Intézet, nyelvi-coaching.hu (written + oral) | Exam papers, practice modes | have |
| **Chemistry call script** | 10–15 min fit-check with goals and expectations | Angol Intézet, Ambrus (*Clarity Session*) | — | P3 |

### 4.2 Motivation and vision
| Tool | What it does | Seen on | Avalon hook | Prio |
|---|---|---|---|---|
| **"Step zero" motivation check** | Sort reasons into intrinsic, identified, introjected and external; find a personal reason | Ambrus | Goal plan step 1 | P1 |
| **Ideal L2 self visualisation** | Guided "future me speaking English" script, written or recorded | Dörnyei & Hadfield; English side by side (meeting visualisation); nyelvi-coaching.hu (vivid goal) | TTS narration (Azure voices exist) | P2 |
| **Values clarification** | Link the goal to 3 personal values | Astrolingva | — | P3 |
| **Feared self / ought-to self check** | Name the "what if I don't" picture and the outside pressure | Dörnyei | — | P3 |

### 4.3 Self-assessment and progress evidence
| Tool | What it does | Seen on | Avalon hook | Prio |
|---|---|---|---|---|
| **Skills wheel** | 1–10 per skill, repeated monthly to show change | StoryLearning (Fluency Wheel) | Auto-suggest from scores | P1 |
| **CEFR can-do checklist** | "I can…" statements per level and skill, ticked with evidence | ACTFL / LinguaFolio, European Language Portfolio | Exam levels, task types | P1 |
| **Evidence portfolio** | Before/after recordings and writing samples | Implied by Ambrus testimonials | Speaking exam recordings, pronunciation | P2 |
| **Wins log / done list** | Small successes collected weekly, used against "I'm not progressing" | Ferenczi (Hossner: positive feedback, stepwise rewards) | XP notifications, badges | P2 |

### 4.4 Planning, habits and time
| Tool | What it does | Seen on | Avalon hook | Prio |
|---|---|---|---|---|
| **Action plan** | Written plan made by the learner with the coach | nyelvi-coaching.hu, Mátrai, Ambriel | Goal plan step 5 | P1 |
| **Weekly habit goal + streak** | Days per week target | Ambrus (*daily check-ins*), StoryLearning tracker | **Exists:** `weeklyGoalDays`, `weekStreak` | have |
| **If-then plans** | Implementation intentions for obstacles | WOOP research | Goal plan step 5 | P1 |
| **Time audit / micro-slots** | Find 5–15-minute slots in a busy week; anti-burnout | Ambrus (post on forcing English into a busy schedule), Ambriel (fitting study into daily life) | — | P2 |
| **Method menu** | Learner tries methods one at a time and keeps what works | Ambriel, Koncsag ("your own learning methodology") | Tile links to Avalon modes | P2 |
| **Resource map** | One list of the learner's best resources | StoryLearning | Teacher word lists | P3 |

### 4.5 Mindset and blocks
| Tool | What it does | Seen on | Avalon hook | Prio |
|---|---|---|---|---|
| **Limiting-belief reframe (TIRED)** | True? Impact? Remove? Evidence? Do. Examples: "too old", "no talent", "lazy" | Ferenczi (Sam Moinet); Ambrus posts on age, laziness and talent myths | — | P2 |
| **Thought reframing card** | Rewrite the worried thought | Koncsag | — | P2 |
| **Anxiety check** | Short self-rating for speaking or exam anxiety (FLCAS-style, Horwitz) | Ambrus, nyelvi-coaching.hu (exam blocks), English side by side (exam stress) | Before/after speaking exam | P2 |
| **Psychodrama / role-play** | Act out the feared situation safely | Ambrus (psychodrama-based), Mátrai (SomatoDrama) | Scenario mode, AI examiner | have (partly) |

### 4.6 Speaking confidence
| Tool | What it does | Seen on | Avalon hook | Prio |
|---|---|---|---|---|
| **Speaking challenge ladder** | Graded mini challenges from easy to scary | Ambrus (*mini challenges*), Ambriel (free speaking challenges; *Dare to Speak Club*) | XP / badges per rung | P1 |
| **Storytelling practice** | Tell a personal story with a simple structure | Ambriel | Speaking practice mode | P3 |
| **Conversation club** | Low-stakes group speaking | Angol Intézet, Ambriel | — | out of scope |

### 4.7 Accountability and review
| Tool | What it does | Seen on | Avalon hook | Prio |
|---|---|---|---|---|
| **Weekly check-in (4As)** | Agenda, awareness, action, accountability; 5 minutes at the start of a lesson | Ferenczi; Ambrus (weekly goal tracking) | Week panel, class summary card | P1 |
| **Accountability partner** | A peer pair who check each other's weekly step | Ambrus | Would need a sharing model; leaderboard is off pending legal check | P3 |
| **Scaling review** | 0–10 now vs last time, with "what made the difference?" | Solution-focused coaching | Goal plan step 6 | P1 |
| **End-of-process review** | Walk through every topic, summarise progress, set the next goal | Ambriel (final session), Astrolingva (follow-up) | Goal history | P2 |

### 4.8 Teacher side (for the teacher, not the student)
| Tool | What it does | Seen on | Prio |
|---|---|---|---|
| **Coaching question cards** | Question deck sorted by GROW stage | ILCA (*Coaching Cards*) | P2: the question bank in 3.2 can be shown as cards |
| **Session notes template** | Goal, insight, agreed step, next date | General coaching practice | P2 |
| **Coaching-stance self-check** | Am I rescuing, over-explaining, holding control? | Koncsag 80h course (teacher role shift) | P3 |
| **Language Coaching Markers / standards** | Check practice against ILCA standards | ILCA (standards guide download) | Reference only |

The teacher-business tools Koncsag focuses on (pricing, packages, niching) are out of scope for the Toolkit.

### 4.9 A useful map: Koncsag Réka's 80-hour course modules
Her *Nyelvtanári Coaching Eszköztár* course is the clearest public list of what a coaching teacher needs. It maps directly onto the catalogue above:

1. Leading structured processes: active listening, forward-moving questions → **question bank, session notes**
2. Coaching-style communication → **question cards**
3. Handling blocks: motivation loss, anxiety, low confidence, procrastination → **4.5 mindset tools**
4. Learner autonomy: realistic goals, personal strategies, progress tracking → **goal plan, wheel, can-do, habit**
5. Coaching-based consultation → **intake**
6. Teacher role shift (less control, more learner responsibility) → **stance self-check**

---

## 5. Site ranking

### 5.1 Scoring rubric
Each site was scored 1–5 on five criteria, weighted for what the Toolkit needs:

| Criterion | Weight |
|---|---|
| **Tools** — named, concrete tools, models and techniques | 30% |
| **Free** — usable free resources (tests, worksheets, challenges, guides) | 20% |
| **Depth** — amount and depth of articles and case studies | 20% |
| **Goals** — how specific the goal-setting content is | 20% |
| **Fit** — fit for Avalon's audience (Hungarian learners of English) | 10% |

### 5.2 Ranking

| # | Site | Who | Tools | Free | Depth | Goals | Fit | **Score** | Best content to take |
|---|---|---|---|---|---|---|---|---|---|
| 1 | [ambrusmonika.com](https://ambrusmonika.com/) | Ambrus Mónika, holistic English mentor, coach, psychodrama, about 30 years' experience | 3 | 1 | 5 | 4 | 5 | **3.4** | 23 blog posts (2022–2025) on blocks, myths and motivation; the "step zero" question set; a 4-month programme design with weekly goal tracking, accountability partners and daily check-ins |
| 2 | [ambrielcoaching.hu](https://ambrielcoaching.hu/angol-nyelvi-coaching/) | Sopron-based English, German and Japanese coach | 2 | 4 | 3 | 4 | 5 | **3.3** | Most free material: speaking challenges, a goal-reaching guide for newsletter subscribers, a song worksheet, a TOP 10 task pack. Clear package topics. Some pages still contain placeholder text |
| 3 | [gabriellaferenczi.com](https://gabriellaferenczi.com/2022/07/07/ilca-2022/) | Gabriella Ferenczi, German and Hungarian language coach (UK) | 5 | 2 | 3 | 3 | 2 | **3.3** | Most concrete named tools: TIRED, 4As, single-question listening, task-based goals, ILCA Language Coaching Markers |
| 4 | [ilcaglobal.com](https://ilcaglobal.com/) | International Language Coaching Association (co-founded by Gabriella Kovács and Carrie McKinnon) | 4 | 3 | 4 | 2 | 3 | **3.3** | Coaching standards guide (free with sign-up), coaching cards, e-books, Expert Talks, blog, FEEL certification |
| 5 | [nyelvi-coaching.hu](https://nyelvi-coaching.hu/mit-jelent-a-nyelvi-coaching/) | Yes You Can Training & Coaching Kft. | 4 | 1 | 3 | 4 | 4 | **3.2** | Names GROW, 4D, SMART, a written action plan and goal visualisation; a case study; an article on exam-candidate blocks; a needs-assessment form |
| 6 | [horvathmariann.com](https://www.horvathmariann.com/teaching) | Horváth Mariann, English teacher and coach | 3 | 3 | 2 | 3 | 5 | **3.0** | GROW-based 4–6 session coaching; free 50-question level test; link collection; a small blog (6 posts) |
| 7 | [englishsidebyside.com](https://englishsidebyside.com/nyelvi-coaching/) | English coach (Neurolanguage Coaching®) | 4 | 1 | 2 | 3 | 4 | **2.8** | Names 3Ms, 5Cs, PACT/PQC, PROGRESS, ICF standards and a goal system reviewed regularly. Only names, no details |
| 8 | [koncsagreka.hu](https://koncsagreka.hu/) | Koncsag Réka, German and English language coach, tutor mentor | 3 | 1 | 3 | 3 | 3 | **2.7** | Past–Present–Future intake; 3 strong coaching questions; the 80-hour course module list (4.9). Mostly about mentoring tutors' businesses and German learners |
| 9 | [angolintezet.hu](https://angolintezet.hu/angol-nyelvi-coach/) | Angol Intézet (English school) | 2 | 4 | 2 | 2 | 5 | **2.7** | Chemistry call; ICF PCC and ILCA-trained coaches; free extras (business mini-course, AI prompts for IELTS Speaking, placement test) |
| 10 | [astrolingva.hu](https://astrolingva.hu/hu/nyelvi-coaching/) | AstroLingva Kft. (Porkoláb Ildikó) | 3 | 1 | 1 | 3 | 3 | **2.2** | A clear process list (starting point → motivation → values → goal → follow-up); DISC; executive coaching combined with language |
| 11 | [szilviamatrai.com](https://szilviamatrai.com/nyelvi-coaching-megoldas/) | Mátrai Szilvia, PCC coach | 1 | 1 | 2 | 2 | 4 | **1.7** | A conceptual article (action plan, accountability, solution focus) |
| 12 | [globusonline.hu](https://www.globusonline.hu/megoldasok/nyelvi-coaching/) | GLOBUS corporate language training | 1 | 1 | 1 | 2 | 3 | **1.4** | Marketing only: diagnostic first session, no fixed syllabus |
| 13 | [nemethemese.com](https://www.nemethemese.com/angol-nyelvi-coaching) | Németh Emese Karolina, coach, supervisor, art therapist | 1 | 1 | 1 | 1 | 4 | **1.3** | Conversational English coaching; no tools described |

`brainist.hu/angol-nyelvi-coaching/` returned 404.

**How to read it:** The two sites you sent score differently. **Ambrus** has the richest content for the learner-side motivation tools. **Koncsag** shows few tools publicly, but her course curriculum (4.9) is the best outline of the teacher-side skill set. For concrete, copyable tools, the international sources are stronger than the Hungarian ones (see 5.3).

### 5.3 Non-coach sources worth more than most coach sites
| Source | What to take |
|---|---|
| [StoryLearning Language Goal Planner](https://storylearning.com/free-language-goal-planner-v3) | Fluency wheel, SMART goals for 3 priorities over 90 days, daily plan, resource list, monthly consistency tracker |
| [CASLS InterCom](https://caslsintercom.uoregon.edu/content/29129) (University of Oregon) | Free goal tracker worksheet, SMARTER goals activity, needs-based goal-setting handout |
| [NCSSFL-ACTFL Can-Do Statements](https://www.actfl.org/educator-resources/ncssfl-actfl-can-do-statements) and [LinguaFolio](https://lfonetwork.uoregon.edu/linguafolio-jr/create-the-plan/) | "I can" checklists and the set → strategise → self-assess → evidence → reflect cycle |
| Hadfield & Dörnyei, *Motivating Learning* (2013) | Vision-programme activities (*My Ideal Self*, *Identity Tree*, *Reality Check*, *Overcoming Obstacles*) |
| Kovács Gabriella, *A Comprehensive Language Coaching Handbook* (Pavilion, 2022) | Language-coaching tools and case studies, with reflection prompts at the end of each chapter (not read; paid) |
| [Cambridge English "New year, new goals"](https://assets.cambridgeenglish.org/stakeholders/new-year-new-goals.pdf) and the [Mango Languages goal article](https://articles.mangolanguages.com/resources/learn/general/how-to-learn-a-language/learning-tips-and-tricks/setting-good-goals) | Simple learner-facing goal prompts ("when, where, how much") |

---

## 6. Suggested build order for the Toolkit

1. **Goal plan** (section 3.1), connected to the existing weekly goal and streak. This is the base that the other tools hang from.
2. **Intake questionnaire** (Past–Present–Future plus situations), which feeds the goal plan. Detailed spec: [intake-form-spec.md](intake-form-spec.md).
3. **Skills wheel and CEFR can-do checklist** as the "where am I now" and milestone parts.
4. **Weekly 4As check-in plus scaling review**, shown on the teacher's student card.
5. **Speaking challenge ladder** and **mindset cards** (TIRED reframe, anxiety check).

Technical notes for the build session: add each tool as a tile on `TeacherToolsPage` and as a new `?action=` on `api/teacher-tools.ts`, because the Vercel function count is at 10/12. A goal store will need a migration (no goal table exists yet; only `weeklyGoalDays` in gamification). Decide early whether students can see and edit their own goals: the current Toolkit scope is teacher-private, with no student assignment yet.

---

## Sources
- https://koncsagreka.hu/ · /nyelvi-coaching/ · /nyelvi-coach-kepzes-nyelvtanaroknak/ · /coaching-szemlelet-a-tanitasban/ · /blog/
- https://ambrusmonika.com/ · /blog/ · /tobb-mint-tanulas-hogyan-lesz-az-angol-egyeni-fejlodesed-resze/ · /ha-azert-tanulsz-angolul-mert-ezt-varjak-toled-a-munkahelyeden-kudarcra-vagy-itelve/
- https://nyelvi-coaching.hu/mit-jelent-a-nyelvi-coaching/
- https://ambrielcoaching.hu/angol-nyelvi-coaching/ · /blog/ · /top-10/
- https://angolintezet.hu/angol-nyelvi-coach/
- https://www.horvathmariann.com/teaching · /blog
- https://astrolingva.hu/hu/nyelvi-coaching/
- https://englishsidebyside.com/nyelvi-coaching/
- https://szilviamatrai.com/nyelvi-coaching-megoldas/ · /rolam/
- https://www.nemethemese.com/angol-nyelvi-coaching
- https://www.globusonline.hu/megoldasok/nyelvi-coaching/
- https://ilcaglobal.com/
- https://gabriellaferenczi.com/2022/07/07/ilca-2022/
- https://pavpub.com/pavilion-elt/a-comprehensive-language-coaching-handbook
- https://storylearning.com/free-language-goal-planner-v3
- https://caslsintercom.uoregon.edu/content/29129
- https://www.actfl.org/educator-resources/ncssfl-actfl-can-do-statements
- https://lfonetwork.uoregon.edu/linguafolio-jr/create-the-plan/
- https://en.wikipedia.org/wiki/Language_coaching
- WOOP/MCII in L2 learning: https://scholarsarchive.byu.edu/etd/9313 · https://journal.unisza.edu.my/jonus/index.php/jonus/article/view/822
- Hadfield & Dörnyei, *Motivating Learning*: https://ihworld.com/ih-journal/issues/issue-35/motivating-learning-by-jill-hadfield-and-zoltán-doernyei-pearson
