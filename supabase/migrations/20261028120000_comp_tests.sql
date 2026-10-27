-- AI-English: comprehension tests (Teacher Toolkit, /teacher/tools/comp-tests).
-- A teacher makes a reading or listening test (AI generated, then edited), prints it or assigns
-- it to connected students, who take it in the app (/my-tests). Each assignment holds one
-- attempt: the answers, a snapshot of the test as it was answered, and the score.
-- Read and written only by the API (api/_lib/compTests.ts, via api/teacher-tools.ts for the
-- teacher and api/gamification.ts for the student).

create table if not exists public.comp_tests (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users (id) on delete cascade,
  skill text not null check (skill in ('reading', 'listening')),
  level text not null check (level in ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  title text not null check (char_length(title) between 1 and 160),
  topic text not null default '' check (char_length(topic) <= 160),
  -- Listening: how many times a student may play the recording (0 = no limit).
  max_plays smallint not null default 2 check (max_plays between 0 and 3),
  -- CompTestContent (src/lib/compTests.ts): { text, style?, sections: [...] }.
  content jsonb not null check (jsonb_typeof(content) = 'object'),
  -- Listening recording in the private bucket comp-test-audio. audio_key is the hash of the
  -- script + level + style the TTS was made from ('upload' for the teacher's own MP3, kept
  -- whatever the script says).
  audio_path text,
  audio_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists comp_tests_teacher_idx on public.comp_tests (teacher_id, updated_at desc);

create table if not exists public.comp_test_assignments (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references public.comp_tests (id) on delete cascade,
  student_id uuid not null references auth.users (id) on delete cascade,
  assigned_by uuid references auth.users (id) on delete set null,
  assigned_at timestamptz not null default now(),
  due_at timestamptz,
  -- Filled in when the student submits.
  submitted_at timestamptz,
  answers jsonb,
  content_snapshot jsonb,
  -- The teacher's re-marks of typed answers: { "s2/7": true, … }.
  overrides jsonb not null default '{}'::jsonb check (jsonb_typeof(overrides) = 'object'),
  -- CompResult: { score, max, items: [...] }; score/max copied out for lists.
  result jsonb,
  score smallint,
  max_score smallint,
  unique (test_id, student_id),
  check ((submitted_at is null) = (answers is null))
);

create index if not exists comp_test_assignments_student_idx on public.comp_test_assignments (student_id, assigned_at desc);

alter table public.comp_tests enable row level security;
alter table public.comp_test_assignments enable row level security;
-- No public policies: only the service role (Vercel API routes) reads/writes these tables.

-- TTS renders and uploaded recordings. Private; the API hands out short signed URLs.
insert into storage.buckets (id, name, public)
values ('comp-test-audio', 'comp-test-audio', false)
on conflict (id) do nothing;

-- AI test generation is logged (and counted per day) as 'comp_test_gen'.
alter table public.groq_usage_log drop constraint if exists groq_usage_log_call_type_check;
alter table public.groq_usage_log add constraint groq_usage_log_call_type_check
  check (call_type in ('chat', 'feedback', 'tutor_chat', 'grammar_lesson', 'grammar_exercises', 'vocab_enrich', 'vocab_generate', 'lyrics_gaps', 'tense_game', 'exam_task_gen', 'comp_test_gen'));
