-- AI-English: Vocabulary Builder, Full practice (docs/vocabulary-builder-design.md §7.1).
--
-- Full practice runs every exercise (recognition, recall, gap-fill, listening) over words
-- the student picks, outside the spaced-repetition schedule. Its answers are recorded
-- here, apart from vocab_reviews: they never reschedule a card, never count towards the
-- daily new-card limit, and never move teacher-list progress.
--
-- Writes go through api/vocab.ts with the service role (repo convention); students can
-- read their own rows.

create table public.vocab_drill_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  -- The teacher list the words were picked from, if any (the student may have edited
  -- the selection after picking it).
  list_id uuid references public.vocab_lists(id) on delete set null,
  word_count integer not null check (word_count > 0),
  started_at timestamptz not null default now(),
  -- Set when the student finishes or ends the run; null for an abandoned tab.
  finished_at timestamptz
);

create index vocab_drill_runs_user_idx on public.vocab_drill_runs (user_id, started_at desc);

create table public.vocab_drill_answers (
  id bigint generated always as identity primary key,
  run_id uuid not null references public.vocab_drill_runs(id) on delete cascade,
  card_id uuid not null references public.vocab_cards(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise text not null check (exercise in ('recognition', 'recall', 'context', 'listening')),
  correct boolean not null,
  used_hint boolean not null default false,
  response_ms integer,
  answered_at timestamptz not null default now(),
  -- One answer per word per exercise per run; a double-submitted answer is ignored.
  unique (run_id, card_id, exercise)
);

create index vocab_drill_answers_user_idx on public.vocab_drill_answers (user_id, answered_at desc);

alter table public.vocab_drill_runs enable row level security;
alter table public.vocab_drill_answers enable row level security;

create policy "Users can read their own vocab drill runs"
  on public.vocab_drill_runs for select
  using (auth.uid() = user_id);

create policy "Users can read their own vocab drill answers"
  on public.vocab_drill_answers for select
  using (auth.uid() = user_id);
