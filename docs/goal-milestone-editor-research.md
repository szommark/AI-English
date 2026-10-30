# Goal milestone editor: research

Research date: 2026-10-30. Builds on `docs/language-coach-tools-research.md` (goal hierarchy L0–L4) and the GROW goal tool (PR #129).

**Idea (user):** under a goal, the teacher adds tasks such as mini courses, conversational situations, word lists, tests, exam tasks and papers, and pronunciation exercises, and gives each one a date by which it should be done. The teacher builds the plan by hand, or lets the AI draft it.

---

## 1. Key findings

1. **The goal tool has the top level but not the middle.** `learner_goals` stores the goal (L1), a deadline, and `steps` (plain text with a done flag, at most 8). There are no dated checkpoints (L2 milestones) and no link from a step to real content (L4 tasks). The milestone editor fills this gap.
2. **Avalon already records most completions in one place.** `xp_events` (`activity_type` + `item_ref` + `performance_score`) logs a row every time a student finishes a scenario, exam section or paper, course module or unit, grammar exercise, pronunciation stage, and so on. Capped events (0 XP) are still logged. So tasks can tick themselves off without new tracking code in each tool.
3. **Four content types already have their own assignment rows.** A milestone task should create these, not copy them:

   | Content | Existing assignment | Due date today | Done signal |
   |---|---|---|---|
   | Mini course | `course_enrollments` (source `assigned`) | none | `completed_at`; `courses.module_complete` / `unit_complete` XP |
   | Comprehension test | `comp_test_assignments` | **`due_at` exists** | `submitted_at`, `score` / `max_score` |
   | Word list | `vocab_list_assignments` | none | `completed_at` (every word learned); `vocabulary.teacher_list_completed` XP |
   | Class challenge | `class_challenges` | `starts_on`–`ends_on` | `challenge.complete` XP |

4. **The other content types have no assignment at all.** The plan task itself becomes the assignment:

   | Content | Catalog | Done signal (`xp_events`) |
   |---|---|---|
   | Conversational situation | `src/data/scenarios.ts` (37 scenarios) | `conversational-english.scenario_live` / `.rehearsal`, `item_ref` = scenario id |
   | Exam paper (érettségi, nyelvvizsga) | `src/data/exams/catalog.ts` | `exam-prep.*_section_complete` (`<paper>/<section>`), `*_paper_complete` (`<paper>`), with score |
   | Pronunciation sound | `src/data/pronunciationCurriculum.ts` | `pronunciation-session.funnel_stage` (`<sound>:<stage>`), `swipe_set` (phoneme), `deep_check` |
   | Stress / connected speech unit | `/pronunciation/stress-patterns/:unitId`, `/connected-speech/:unitId` | the `stress_drill` / `connected_speech_drill` keys exist, but I found no call that awards them, so this needs checking |
   | Grammar Coach lesson | `src/data/grammarCurriculum.ts` | `grammar-coach.exercise` (`item_ref` = lesson id, `/written` for written practice) |
   | Tutor Bot conversation | — | `tutor-bot.conversation` (no topic, so it can only be counted) |

5. **Teacher exam tasks are not student-facing yet.** `exam_tasks` (the maker) only go to teacher testers (`exam_task_reviewers`, draft/published gate). To assign one to a student we need a new "assign to student" path. The teacher test mode player can probably be reused.

---

## 2. What the research says

| Finding | Source | What it means for the editor |
|---|---|---|
| Near subgoals beat one distant goal. They give frequent signs of progress, which builds self-efficacy and cuts procrastination. Near and far goals together work best. | Bandura & Schunk 1981; Bandura 1997; Schunk | Keep the far goal (exam in June) and add milestones every 1–3 weeks. Show progress per milestone, not only for the whole goal. |
| Evenly spaced deadlines beat one final deadline. When people set their own deadlines, most bunch them at the end. | Ariely & Wertenbroch 2002 | Spread milestone dates evenly by default, and warn when dates bunch at the end. |
| …but recent replications found a weak effect or none. | Psychological Science replication; Hyndman & Bisin 2025 | Use deadlines to structure the plan, not as a hard rule. Keep them soft: overdue is fine and can be moved. |
| In LMSs, due dates sit on items and prerequisites handle the order. Locking a module behind a missed prerequisite date strands students; this is a known Canvas problem. | Canvas guides and community | Don't lock content by date. Use the order only as a suggestion ("next up"), never as a lock. |
| AI study plans work best as a draft the teacher edits, and they go out of date as new results come in. | Vendor and blog sources (weak evidence) | AI drafts → teacher reviews → teacher publishes. Offer "re-plan" when a student falls behind, again as a draft. |
| Every L1 goal needs at least one L2 milestone and one L3 habit. | Our own research doc, §2.1 | The editor is the L2/L4 part. The L3 habit (days per week) is already on the goal. |

---

## 3. Proposed shape (draft, waiting for the user's answers)

### 3.1 Structure
```
Goal (learner_goals, L1)            "B2 nyelvvizsga, 2027-06-10"
 └─ Milestone (L2, dated)           "Can follow a work meeting — by 15 Dec"
     └─ Task (L4, content + date)   Mini course "Meetings", due 1 Dec
                                     Scenario "Weekly stand-up", due 8 Dec, rule: score ≥ 70%
                                     Word list "Business verbs", due 8 Dec
```

### 3.2 Data (new tables, service-role only like the goal tables)
- `goal_milestones`: `goal_id`, `title`, optional CEFR can-do text, `due_on`, `sort`, `status` (open / done / skipped), `completed_at`.
- `goal_tasks`: `milestone_id`, `kind` (course, scenario, word_list, comp_test, exam_paper, exam_task, pron_sound, pron_unit, grammar_lesson, custom), `ref` (id in its catalog), `title` snapshot, `due_on`, `rule` jsonb (`{ "type": "complete" }`, `{ "type": "score", "min": 0.7 }`, `{ "type": "count", "n": 3 }`), `status`, `completed_at`, `source` (manual / ai), and the id of the assignment row it created.
- Done check: when the plan opens, and after an XP award, match open tasks against `xp_events` (and the four assignment tables) created after the task's `created_at`.

### 3.3 Manual editor (teacher)
- Vertical timeline from today to the goal deadline. Milestones are the step ovals already used on the sound sheet. Tasks sit under each milestone.
- "Add task" picker with one tab per content type. It searches the teacher's own items (courses, lists, comp tests, exam tasks) and the built-in catalogs.
- Date helpers: "spread evenly", "every Friday", and a warning when tasks bunch at the end or when the week's load goes past the goal's days per week.
- Publishing the plan creates the enrollment, test and list assignments, so the student sees them in /my-courses and /my-tests as before.

### 3.4 AI mode
- **Input:** goal type, title, deadline, CEFR level, days per week, Reality ratings, recent `mistake_events` areas, pronunciation progress, exam scores, plus a catalog of **allowed item ids** (built-ins and the teacher's own items).
- **Output:** JSON with milestones and tasks that may reference only those ids. The server validates it and drops unknown ids.
- The teacher sees the draft in the same editor, edits it, then publishes. Nothing reaches the student without the teacher's publish.
- **Re-plan:** when a milestone is overdue or at risk, the AI suggests new dates or easier tasks, again as a draft.

### 3.5 Student side
- /my-goals: the same timeline, read-only, with tasks that open their tool directly.
- Home: a "This week" card listing tasks due in the next 7 days.
- Overdue tasks get a soft amber label, never a lock. Gamification could add a small XP bonus for finishing a milestone on time.

### 3.6 Possible phases
1. Milestones and tasks with manual editing and auto-ticking for scenarios, courses, word lists and comp tests.
2. The other content types (exam papers, pronunciation, grammar), plus assigning teacher exam tasks to students.
3. AI draft and re-plan.
4. A home "This week" card, an on-time milestone bonus, and an at-risk notice for the teacher.

---

## 4. Decisions (user, 2026-10-30)
- A plan always sits under a GROW goal (`learner_goals`).
- Two levels: dated milestones, each with dated content tasks.
- The AI drafts only from existing content (built-in and the teacher's own). The teacher reviews it and publishes.
- A plan is for one student.
- A task is done when it is finished. For scored items the teacher can also set a minimum score.
- Only the teacher edits the plan, before and after publishing. The student's view is read-only.
- Published exam tasks from the maker get an "assign to student" path.

---

## Sources
- Bandura & Schunk 1981, proximal self-motivation: https://uploads-ssl.webflow.com/59faaf5b01b9500001e95457/5bc552d85141987915dab842_Bandura%20&%20Schunk,%201981.pdf
- Schunk, goal setting and self-efficacy (ERIC): https://files.eric.ed.gov/fulltext/ED462671.pdf
- Ariely & Wertenbroch 2002, procrastination and deadlines: https://erationality.media.mit.edu/papers/dan/eRational/Dynamic%20preferences/deadlines.pdf
- Replication in Psychological Science: https://journals.sagepub.com/doi/full/10.1177/09567976261460772
- Hyndman & Bisin, replication working paper: https://bpb-us-e1.wpmucdn.com/wp.nyu.edu/dist/c/16384/files/2025/09/Ariely_Replication-1.pdf
- Canvas prerequisites, requirements and locking: https://ready.msudenver.edu/canvas-spotlight/prerequisites-requirements-and-locking-in-canvas-modules/
- Canvas community, missed prerequisite due date: https://community.canvaslms.com/thread/51176-prerequisites-requirements-what-if-a-student-misses-a-due-date
- Canvas community, date vs prerequisite locks: https://community.canvaslms.com/t5/Canvas-Question-Forum/Pre-Requisite-and-Date-Time-Locked-Modules/m-p/579989
- AI study plans going stale: https://www.lowcode.agency/blog/how-to-use-ai-to-generate-personalised-study-plans-for-every-student
- Draft-then-refine review (Bytelearn): https://aiindigo.com/blog/bytelearn-review-2026-personalized-learning-at-scale
