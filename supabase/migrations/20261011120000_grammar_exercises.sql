-- AI-English: Grammar Coach written practice cache (word order, form, transformation).
-- Same shape and key as grammar_lessons: one shared row per (cefr_level, grammar_item_id,
-- model_id, lang), written only after a validated, successful generation.

create table if not exists public.grammar_exercises (
  cefr_level text not null,
  grammar_item_id text not null,
  model_id text not null,
  lang text not null default 'hu',
  content jsonb not null,
  created_at timestamptz not null default now(),
  primary key (cefr_level, grammar_item_id, model_id, lang)
);

alter table public.grammar_exercises enable row level security;
-- No public policies: only the service role (Vercel API routes) reads/writes this table.

alter table public.groq_usage_log drop constraint if exists groq_usage_log_call_type_check;
alter table public.groq_usage_log add constraint groq_usage_log_call_type_check
  check (call_type in ('chat', 'feedback', 'tutor_chat', 'grammar_lesson', 'grammar_exercises', 'vocab_enrich', 'vocab_generate'));
