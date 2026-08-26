-- AI-English: Grammar Coach lesson cache — one row per (cefr_level, grammar_item_id),
-- shared across all learners since content only depends on the fixed curriculum, not
-- the requesting user. Only a validated, successful Groq generation is ever written here.

create table if not exists public.grammar_lessons (
  cefr_level text not null,
  grammar_item_id text not null,
  content jsonb not null,
  created_at timestamptz not null default now(),
  primary key (cefr_level, grammar_item_id)
);

alter table public.grammar_lessons enable row level security;
-- No public policies: only the service role (Vercel API routes) reads/writes this table.

alter table public.groq_usage_log drop constraint if exists groq_usage_log_call_type_check;
alter table public.groq_usage_log add constraint groq_usage_log_call_type_check
  check (call_type in ('chat', 'feedback', 'tutor_chat', 'grammar_lesson'));
