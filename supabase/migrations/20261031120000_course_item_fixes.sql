-- AI-English: mini courses, flagged exercises fixed by AI (docs/mini-courses-design.md).
-- A student flags a course exercise; the AI checks it at once and, when it is really wrong,
-- corrects it in the course. Every check is kept here so the teacher sees what changed and can
-- undo it. Read and written only by the API (api/_lib/courses.ts).

create table if not exists public.course_item_fixes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  module_id uuid not null references public.course_modules (id) on delete cascade,
  attempt_id uuid references public.course_module_attempts (id) on delete set null,
  -- The step's id in the attempt's snapshot (one flag per step per attempt).
  step_id text not null,
  flagged_by uuid references auth.users (id) on delete set null,
  reason text not null check (reason in ('answer_rejected', 'wrong_key', 'faulty_logic', 'unclear', 'typo', 'other')),
  note text not null default '' check (char_length(note) <= 500),
  step_before jsonb not null check (jsonb_typeof(step_before) = 'object'),
  -- The corrected step; null when the AI found nothing wrong.
  step_after jsonb check (step_after is null or jsonb_typeof(step_after) = 'object'),
  -- The AI's explanation, in the course's explanation language.
  verdict text not null default '' check (char_length(verdict) <= 1000),
  -- fixed: changed in the course · kept: nothing wrong · undone: the teacher put it back.
  status text not null check (status in ('fixed', 'kept', 'undone')),
  teacher_seen_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists course_item_fixes_course_idx on public.course_item_fixes (course_id, created_at desc);
create unique index if not exists course_item_fixes_attempt_step_idx on public.course_item_fixes (attempt_id, step_id) where attempt_id is not null;

alter table public.course_item_fixes enable row level security;
-- No public policies: only the service role (Vercel API routes) reads/writes this table.

-- The AI check of a flag, and the Speaking module's role-play turns, are logged and counted per day.
alter table public.groq_usage_log drop constraint if exists groq_usage_log_call_type_check;
alter table public.groq_usage_log add constraint groq_usage_log_call_type_check
  check (call_type in ('chat', 'feedback', 'tutor_chat', 'grammar_lesson', 'grammar_exercises', 'vocab_enrich', 'vocab_generate', 'lyrics_gaps', 'tense_game', 'exam_task_gen', 'comp_test_gen', 'course_gen', 'course_feedback', 'course_fix', 'course_roleplay'));
