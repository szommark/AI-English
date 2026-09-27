-- AI-English: Vocabulary Builder — Fast practice tests (docs/vocabulary-builder-design.md §7.1).
--
-- A list with more than 20 words offers a test: 20% of its words (rounded up), picked at
-- random by the API, asked as recall with no hint and one try (a typo counts as wrong).
-- The score is the share of right answers; words left unanswered count as wrong. Like
-- Fast practice, a test never reschedules cards, uses up new cards or moves teacher-list
-- progress. The list shows the last and best score.
--
-- Writes go through api/vocab.ts with the service role (repo convention).

create table public.vocab_tests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source text not null check (source in ('teacher', 'custom', 'conversations')),
  list_id uuid references public.vocab_lists(id) on delete cascade,
  student_list_id uuid references public.vocab_student_lists(id) on delete cascade,
  -- The words asked; an answer must be for one of them.
  item_ids uuid[] not null,
  word_count integer not null check (word_count > 0),
  -- Set when the test is finished (null for an abandoned tab, which has no score).
  correct_count integer check (correct_count between 0 and word_count),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  check ((finished_at is null) = (correct_count is null))
);

create index vocab_tests_user_idx on public.vocab_tests (user_id, finished_at desc);

create table public.vocab_test_answers (
  test_id uuid not null references public.vocab_tests(id) on delete cascade,
  item_id uuid not null references public.vocab_items(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  correct boolean not null,
  answered_at timestamptz not null default now(),
  -- One answer per word; a double-submitted answer is ignored.
  primary key (test_id, item_id)
);

alter table public.vocab_tests enable row level security;
alter table public.vocab_test_answers enable row level security;

create policy "Users can read their own vocab tests"
  on public.vocab_tests for select
  using (auth.uid() = user_id);

create policy "Users can read their own vocab test answers"
  on public.vocab_test_answers for select
  using (auth.uid() = user_id);
