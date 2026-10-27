-- AI-English: learner goals, set with the GROW model (Goal · Reality · Options · Will).
-- A student has at most 3 open goals (pending + active; enforced in api/_lib/learnerGoals.ts).
-- A connected teacher can start one, filled in or blank: it is 'pending' until the student
-- completes and confirms it. A student's own goal is active at once. The Reality
-- self-assessment is kept as a history of ratings, so the student sees start vs now.
-- Read and written only by api/gamification.ts (?action=goals…).

create table if not exists public.learner_goals (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users (id) on delete cascade,
  -- The student themself, or the teacher who sent it.
  created_by uuid references auth.users (id) on delete set null,
  status text not null default 'active'
    check (status in ('pending', 'active', 'achieved', 'dropped')),
  -- KEEP IN SYNC with GOAL_TYPES (src/lib/goals.ts). Null only while pending (a blank form).
  goal_type text check (goal_type in ('exam', 'work', 'life', 'skill', 'confidence', 'learning')),
  title text check (char_length(title) between 1 and 120),
  deadline date,
  why text check (char_length(why) <= 500),
  options text[] not null default '{}' check (cardinality(options) <= 8),
  -- [{ "id": "…", "text": "…", "done": false }], at most 8.
  steps jsonb not null default '[]'::jsonb check (jsonb_typeof(steps) = 'array'),
  -- Practice days a week; confirming the goal sets the learner's weekly goal to it
  -- (set_weekly_goal, WEEKLY_GOAL_MIN_DAYS..WEEKLY_GOAL_MAX_DAYS).
  days_per_week smallint check (days_per_week between 2 and 5),
  -- The teacher's pre-filled Reality rating on a pending goal; it becomes the first rating
  -- when the student confirms.
  draft_rating jsonb,
  show_on_home boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  confirmed_at timestamptz,
  closed_at timestamptz,
  check (status = 'pending' or (goal_type is not null and title is not null))
);

create index if not exists learner_goals_student_idx on public.learner_goals (student_id, created_at);

create table if not exists public.learner_goal_ratings (
  id bigint generated always as identity primary key,
  goal_id uuid not null references public.learner_goals (id) on delete cascade,
  -- "Where am I now on this goal?" 0–10.
  overall smallint not null check (overall between 0 and 10),
  -- { "speaking": 3, "listening": 4, … } — KEEP IN SYNC with GOAL_SKILLS, each 1–10, any subset.
  skills jsonb not null default '{}'::jsonb check (jsonb_typeof(skills) = 'object'),
  created_at timestamptz not null default now()
);

create index if not exists learner_goal_ratings_goal_idx on public.learner_goal_ratings (goal_id, created_at);

alter table public.learner_goals enable row level security;
alter table public.learner_goal_ratings enable row level security;
-- No public policies: only the service role (Vercel API routes) reads/writes these tables.
