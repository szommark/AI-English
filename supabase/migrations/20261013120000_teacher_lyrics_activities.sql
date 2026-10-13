-- AI-English: Teacher Toolkit, lyrics gap-fill maker (docs/teacher-toolkit-design.md).
-- One row per saved activity, private to the teacher who made it. The song, the gaps and
-- every worksheet option live in `content` (shape: LyricsActivityContent in
-- src/lib/lyricsGapFill.ts, validated by api/teacher-tools.ts before every write).

create table if not exists public.teacher_lyrics_activities (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  artist text not null default '' check (char_length(artist) <= 120),
  video_url text not null default '' check (char_length(video_url) <= 300),
  content jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists teacher_lyrics_activities_teacher_idx
  on public.teacher_lyrics_activities (teacher_id, updated_at desc);

alter table public.teacher_lyrics_activities enable row level security;
-- No public policies: only the service role (Vercel API routes) reads/writes this table.

-- AI gap suggestions are logged (and counted per day) as 'lyrics_gaps'.
alter table public.groq_usage_log drop constraint if exists groq_usage_log_call_type_check;
alter table public.groq_usage_log add constraint groq_usage_log_call_type_check
  check (call_type in ('chat', 'feedback', 'tutor_chat', 'grammar_lesson', 'grammar_exercises', 'vocab_enrich', 'vocab_generate', 'lyrics_gaps'));
