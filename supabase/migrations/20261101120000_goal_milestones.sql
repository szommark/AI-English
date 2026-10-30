-- AVaLoN: goal milestones. Under a learner goal (learner_goals) the teacher plans dated
-- milestones, each with dated content tasks: a mini course, a conversational situation
-- (scenario), a word list or a comprehension test. Only the teacher edits the plan; the
-- student sees it read-only. A task ticks itself off when the student finishes the linked
-- content (checked when the plan is read). Courses, tests and lists are assigned through
-- their own tables once the goal is active.
-- Design: docs/goal-milestone-editor-research.md. Shapes: src/lib/goalPlans.ts.
-- Read and written only by api/gamification.ts (?action=goal-plan…, api/_lib/goalPlans.ts).

create table if not exists public.goal_milestones (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.learner_goals (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  -- An optional can-do statement ("I can follow a short work meeting").
  note text check (char_length(note) <= 300),
  due_on date not null,
  position smallint not null default 0,
  -- Set once every task under it is done.
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists goal_milestones_goal_idx on public.goal_milestones (goal_id, position);

create table if not exists public.goal_tasks (
  id uuid primary key default gen_random_uuid(),
  milestone_id uuid not null references public.goal_milestones (id) on delete cascade,
  goal_id uuid not null references public.learner_goals (id) on delete cascade,
  -- KEEP IN SYNC with TASK_KINDS (src/lib/goalPlans.ts).
  kind text not null check (kind in ('course', 'scenario', 'word_list', 'comp_test')),
  -- courses.id, vocab_lists.id or comp_tests.id; a scenario id from src/data/scenarios.ts.
  ref text not null check (char_length(ref) between 1 and 80),
  -- The content's title when it was added, so the plan reads well if it is renamed or deleted.
  title text not null check (char_length(title) between 1 and 160),
  due_on date not null,
  position smallint not null default 0,
  -- Scenario: which mode counts — Test (live), Practice (rehearsal) or either.
  scenario_mode text check (scenario_mode in ('test', 'practice', 'any')),
  -- Comprehension test: the lowest score (%) that counts as done; null = any submitted test.
  min_score smallint check (min_score between 1 and 100),
  -- The course_enrollments / comp_test_assignments row it created or linked to.
  assignment_id uuid,
  -- When the content was assigned (the goal is active); only then is it checked for completion.
  assigned_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  check ((kind = 'scenario') = (scenario_mode is not null)),
  check (kind = 'comp_test' or min_score is null)
);

create index if not exists goal_tasks_goal_idx on public.goal_tasks (goal_id);
create index if not exists goal_tasks_milestone_idx on public.goal_tasks (milestone_id, position);

alter table public.goal_milestones enable row level security;
alter table public.goal_tasks enable row level security;
-- No public policies: only the service role (Vercel API routes) reads/writes these tables.
