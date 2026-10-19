-- AVaLoN: Teacher Toolkit, exam task maker (listening first; reading, writing and the oral
-- exam task sheet later). A teacher creates a task (AI-generated, uploaded .docx or pasted),
-- sends it to chosen teachers, and each of them tests it: answers it like a candidate, then
-- accepts or rejects every item with reasons from the publication criteria.
-- Shapes: src/lib/examTasks.ts. Every table is service-role only (api/teacher-tools.ts).

create table if not exists public.exam_tasks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  exam_part text not null check (exam_part in ('listening', 'reading', 'writing', 'speaking')),
  level text not null check (level in ('B1', 'B2', 'C1')),
  format text not null check (char_length(format) between 1 and 40),
  field text not null default 'general' check (field in ('general', 'business', 'technical', 'agri-env')),
  title text not null check (char_length(title) between 1 and 160),
  origin text not null check (origin in ('generated', 'uploaded', 'pasted')),
  source_ref text not null default '' check (char_length(source_ref) <= 500),
  content jsonb not null,
  -- Bumped on every content change; a review records the revision it tested.
  revision int not null default 1,
  -- Cached TTS of the clean script (private bucket exam-task-audio) and the revision it was made from,
  -- or a teacher-uploaded recording (audio_revision null = uploaded, used for every revision).
  audio_path text,
  audio_revision int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists exam_tasks_owner_idx on public.exam_tasks (owner_id, updated_at desc);

-- Teachers a task was sent to for testing.
create table if not exists public.exam_task_reviewers (
  task_id uuid not null references public.exam_tasks (id) on delete cascade,
  reviewer_id uuid not null references auth.users (id) on delete cascade,
  invited_at timestamptz not null default now(),
  primary key (task_id, reviewer_id)
);

create index if not exists exam_task_reviewers_reviewer_idx on public.exam_task_reviewers (reviewer_id);

-- One test per reviewer and revision: the candidate answers, then a verdict per item.
create table if not exists public.exam_task_reviews (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.exam_tasks (id) on delete cascade,
  reviewer_id uuid not null references auth.users (id) on delete cascade,
  revision int not null,
  answers jsonb not null default '{}'::jsonb,
  -- Item id → { verdict, reasons, note }; the key "task" holds whole-task reasons.
  verdicts jsonb not null default '{}'::jsonb,
  recommendation text check (recommendation in ('publish', 'revise', 'reject')),
  overall_note text not null default '' check (char_length(overall_note) <= 2000),
  submitted_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (task_id, reviewer_id, revision)
);

create index if not exists exam_task_reviews_task_idx on public.exam_task_reviews (task_id, revision);

-- A creator's saved groups of testing teachers.
create table if not exists public.teacher_pools (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  member_ids uuid[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists teacher_pools_owner_idx on public.teacher_pools (owner_id, name);

alter table public.exam_tasks enable row level security;
alter table public.exam_task_reviewers enable row level security;
alter table public.exam_task_reviews enable row level security;
alter table public.teacher_pools enable row level security;
-- No public policies: only the service role (Vercel API routes) reads/writes these tables.

-- TTS renders and uploaded recordings. Private; the API hands out short signed URLs.
insert into storage.buckets (id, name, public)
values ('exam-task-audio', 'exam-task-audio', false)
on conflict (id) do nothing;

-- AI task generation is logged (and counted per day) as 'exam_task_gen'.
alter table public.groq_usage_log drop constraint if exists groq_usage_log_call_type_check;
alter table public.groq_usage_log add constraint groq_usage_log_call_type_check
  check (call_type in ('chat', 'feedback', 'tutor_chat', 'grammar_lesson', 'grammar_exercises', 'vocab_enrich', 'vocab_generate', 'lyrics_gaps', 'tense_game', 'exam_task_gen'));
