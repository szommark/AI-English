-- AI-English: mini courses (Teacher Toolkit, /teacher/tools/courses; docs/mini-courses-design.md).
-- A teacher builds a course of 1–4 units; each unit is 4–7 modules (vocabulary, reading, grammar,
-- unit check, …) made of one-screen steps. AI drafts the content, the teacher edits it, publishes
-- the course and assigns it to connected students, who work through it alone (/my-courses).
-- Read and written only by the API (api/_lib/courses.ts, via api/teacher-tools.ts for the teacher
-- and api/gamification.ts for the student).

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160),
  -- The umbrella topic; each unit has its own sub-topic.
  topic text not null default '' check (char_length(topic) <= 160),
  level text not null check (level in ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  -- Language of the grammar explanations (the rest of the content is English).
  explain_lang text not null default 'en' check (explain_lang in ('hu', 'en', 'de')),
  status text not null default 'draft' check (status in ('draft', 'published')),
  -- Phase 3 (library): public courses, admin hiding and admin-picked self-enroll.
  visibility text not null default 'private' check (visibility in ('private', 'public')),
  admin_hidden boolean not null default false,
  self_enroll boolean not null default false,
  -- Later paywall: every access goes through canAccessCourse() in api/_lib/courses.ts.
  access_tier text not null default 'free',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists courses_teacher_idx on public.courses (teacher_id, updated_at desc);

create table if not exists public.course_units (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  -- 1..4 (MAX_UNITS_PER_COURSE in src/lib/courses.ts).
  position smallint not null check (position between 1 and 4),
  title text not null check (char_length(title) between 1 and 160),
  topic text not null default '' check (char_length(topic) <= 160),
  template text not null check (template in ('balanced', 'listening-speaking', 'reading-writing', 'compact', 'custom')),
  -- Grammar Coach curriculum ids (src/data/grammarCurriculum.ts).
  grammar_ids text[] not null default '{}',
  can_dos jsonb not null default '[]'::jsonb check (jsonb_typeof(can_dos) = 'array'),
  -- CourseBlueprint (src/lib/courses.ts): the AI outline the modules are written from.
  blueprint jsonb,
  -- A draft unit is hidden from students until the teacher publishes it.
  status text not null default 'draft' check (status in ('draft', 'published')),
  -- Later ("copy with credit"): the unit this one was copied from.
  source_unit_id uuid references public.course_units (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Positions are kept 1..n by the API (no unique constraint, so a reorder can move rows one by one).
create index if not exists course_units_course_idx on public.course_units (course_id, position);

create table if not exists public.course_modules (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.course_units (id) on delete cascade,
  position smallint not null check (position between 1 and 7),
  kind text not null check (kind in ('vocabulary', 'reading', 'listening', 'grammar', 'pronunciation', 'speaking', 'writing', 'unit_check')),
  -- A doubled module's job: Reading 2 / Listening 2 = 'second'; Speaking and Writing 'guided' → 'free'.
  variant text check (variant in ('guided', 'free', 'second')),
  title text not null check (char_length(title) between 1 and 160),
  est_minutes smallint not null default 10 check (est_minutes between 1 and 30),
  -- ModuleContent (src/lib/courses.ts); null until generated.
  content jsonb check (content is null or jsonb_typeof(content) = 'object'),
  -- Bumped on every content change; attempts remember the version they started on.
  version int not null default 1,
  updated_at timestamptz not null default now()
);

create index if not exists course_modules_unit_idx on public.course_modules (unit_id, position);

create table if not exists public.course_enrollments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  student_id uuid not null references auth.users (id) on delete cascade,
  source text not null default 'assigned' check (source in ('assigned', 'self')),
  assigned_by uuid references auth.users (id) on delete set null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (course_id, student_id)
);

create index if not exists course_enrollments_student_idx on public.course_enrollments (student_id, started_at desc);

create table if not exists public.course_module_attempts (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.course_enrollments (id) on delete cascade,
  module_id uuid not null references public.course_modules (id) on delete cascade,
  module_version int not null,
  -- The module as it was when this attempt started, so a teacher's later edit doesn't move it.
  content_snapshot jsonb not null check (jsonb_typeof(content_snapshot) = 'object'),
  -- Autosave: the step the learner is on and their answers so far ({ stepId: answer }).
  step_index smallint not null default 0,
  answers jsonb not null default '{}'::jsonb check (jsonb_typeof(answers) = 'object'),
  score smallint,
  max_score smallint,
  started_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists course_module_attempts_enrollment_idx on public.course_module_attempts (enrollment_id, module_id, started_at desc);

alter table public.courses enable row level security;
alter table public.course_units enable row level security;
alter table public.course_modules enable row level security;
alter table public.course_enrollments enable row level security;
alter table public.course_module_attempts enable row level security;
-- No public policies: only the service role (Vercel API routes) reads/writes these tables.

-- XP: a finished module (correctness bonus) and a finished unit, both awarded on the server.
insert into public.gamification_activity_types
  (key, section, module, base_xp, bonus_source, daily_xp_cap, weekly_xp_cap, weekly_cap_group, repeat_rule, client_awardable, enabled)
values
  ('courses.module_complete', 'courses', 'module', 10, 'correctness', 100, null, null, '24h_diminishing', false, true),
  ('courses.unit_complete', 'courses', 'unit', 20, null, 60, null, null, 'none', false, true)
on conflict (key) do nothing;

-- AI course generation (the unit outline and each module) is logged and counted per day.
alter table public.groq_usage_log drop constraint if exists groq_usage_log_call_type_check;
alter table public.groq_usage_log add constraint groq_usage_log_call_type_check
  check (call_type in ('chat', 'feedback', 'tutor_chat', 'grammar_lesson', 'grammar_exercises', 'vocab_enrich', 'vocab_generate', 'lyrics_gaps', 'tense_game', 'exam_task_gen', 'comp_test_gen', 'course_gen'));
