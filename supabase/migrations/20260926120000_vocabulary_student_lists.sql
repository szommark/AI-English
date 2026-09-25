-- AI-English: Vocabulary Builder — student word lists and Fast practice on any list
-- (docs/vocabulary-builder-design.md §7.1–§7.2).
--
-- 1. Students compile their own word lists (topic, level, 1–10 AI-picked words, then
--    editable). Words from them are items/cards with origin 'student'.
-- 2. Fast practice (formerly Full practice) runs on any list — also on words that aren't
--    in spaced repetition — so its answers point at the item, not at a card.
-- 3. The usage log gets the 'vocab_generate' call type (picking words for a new list),
--    which also meters the daily compile limit.
--
-- Writes go through api/vocab.ts with the service role (repo convention).

-- 1. 'student' origin -------------------------------------------------------------------
-- Previous definitions: the inline checks in 20260924120000_vocabulary_builder.sql.
alter table public.vocab_items drop constraint if exists vocab_items_origin_check;
alter table public.vocab_items add constraint vocab_items_origin_check
  check (origin in ('catalog', 'teacher', 'tutor', 'student'));

alter table public.vocab_cards drop constraint if exists vocab_cards_origin_check;
alter table public.vocab_cards add constraint vocab_cards_origin_check
  check (origin in ('catalog', 'teacher', 'tutor', 'student'));

create table public.vocab_student_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  -- One of the fixed topic ids in src/lib/vocab.ts (VOCAB_TOPICS), or the student's own
  -- free-text topic.
  topic text not null,
  cefr_level text not null check (cefr_level in ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index vocab_student_lists_user_idx on public.vocab_student_lists (user_id, created_at desc);

-- Items are global (shared enrichment cache) rows. Deleting a list or removing a word
-- never touches the student's cards: learning progress stays.
create table public.vocab_student_list_items (
  list_id uuid not null references public.vocab_student_lists(id) on delete cascade,
  item_id uuid not null references public.vocab_items(id) on delete cascade,
  position integer not null default 0,
  primary key (list_id, item_id)
);

alter table public.vocab_student_lists enable row level security;
alter table public.vocab_student_list_items enable row level security;

create policy "Users can read their own word lists"
  on public.vocab_student_lists for select
  using (auth.uid() = user_id);

create policy "Users can read the items of their own word lists"
  on public.vocab_student_list_items for select
  using (
    exists (
      select 1 from public.vocab_student_lists l
      where l.id = vocab_student_list_items.list_id and l.user_id = auth.uid()
    )
  );

-- 2. Fast practice on items -------------------------------------------------------------
alter table public.vocab_drill_runs
  add column source text,
  add column student_list_id uuid references public.vocab_student_lists(id) on delete set null,
  -- The words of the run; an answer must be for one of them.
  add column item_ids uuid[] not null default '{}';

update public.vocab_drill_runs set source = case when list_id is not null then 'teacher' else 'mixed' end;

alter table public.vocab_drill_runs
  alter column source set not null,
  add constraint vocab_drill_runs_source_check
    check (source in ('teacher', 'custom', 'conversations', 'mixed'));

alter table public.vocab_drill_answers add column item_id uuid references public.vocab_items(id) on delete cascade;

update public.vocab_drill_answers a set item_id = c.item_id
from public.vocab_cards c
where c.id = a.card_id;

-- Rows whose card is gone can't be backfilled (their card delete would have cascaded
-- them anyway), so none should be left; drop any defensively.
delete from public.vocab_drill_answers where item_id is null;

alter table public.vocab_drill_answers
  drop constraint vocab_drill_answers_run_id_card_id_exercise_key,
  drop column card_id,
  alter column item_id set not null,
  add constraint vocab_drill_answers_run_id_item_id_exercise_key unique (run_id, item_id, exercise);

-- 3. Usage log ---------------------------------------------------------------------------
-- Previous definition: 20260924120000_vocabulary_builder.sql.
alter table public.groq_usage_log drop constraint if exists groq_usage_log_call_type_check;
alter table public.groq_usage_log add constraint groq_usage_log_call_type_check
  check (call_type in ('chat', 'feedback', 'tutor_chat', 'grammar_lesson', 'vocab_enrich', 'vocab_generate'));

-- The daily compile limit counts a user's 'vocab_generate' rows since UTC midnight.
create index if not exists groq_usage_log_user_call_type_idx
  on public.groq_usage_log (user_id, call_type, created_at desc);
