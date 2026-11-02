-- AI-English: practice log for the progress pages (Phase 2 of the aligned "Az én fejlődésem" /
-- teacher student page). One row per started activity, finished_at set when it is finished:
--   vocab_game       word grid or crossword (variant), with the word list it was played on
--   grammar_written  Grammar Coach written practice (item_ref = lesson id), score 0–100
--   tense_game       Past · Present · Future: a round (variant 'round', item_ref = level) or a
--                    story (variant 'story', item_ref = story id), score 0–100
-- Starts are recorded too (they earn no XP). Word list card view is deliberately not logged.
--
-- Writes go through api/gamification.ts (practice-start / practice-finish) with the service
-- role (repo convention); students can read their own rows, teachers read via the API.

create table if not exists public.practice_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('vocab_game', 'grammar_written', 'tense_game')),
  variant text check (variant is null or variant in ('grid', 'crossword', 'round', 'story')),
  item_ref text check (item_ref is null or char_length(item_ref) <= 120),
  -- Word games only; null for games logged before the list was recorded.
  list_source text check (list_source is null or list_source in ('teacher', 'custom', 'conversations')),
  list_id uuid references public.vocab_lists (id) on delete set null,
  student_list_id uuid references public.vocab_student_lists (id) on delete set null,
  word_count int check (word_count is null or word_count > 0),
  score numeric check (score is null or score between 0 and 100),
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create index if not exists practice_log_user_kind_idx on public.practice_log (user_id, kind, started_at desc);

alter table public.practice_log enable row level security;

drop policy if exists "Users can read their own practice log" on public.practice_log;
create policy "Users can read their own practice log"
  on public.practice_log for select
  using (auth.uid() = user_id);

-- Backfill: finished activities already in the XP ledger (from before this log). They have no
-- separate start, and word games have no list. Scores were stored 0–1.
insert into public.practice_log (user_id, kind, variant, item_ref, score, started_at, finished_at)
select
  e.user_id,
  case
    when e.activity_type = 'vocabulary.game' then 'vocab_game'
    when e.item_ref like '%/written' then 'grammar_written'
    else 'tense_game'
  end,
  case
    when e.item_ref like 'tense-game/%' then 'round'
    when e.item_ref like 'tense-story/%' then 'story'
  end,
  case
    when e.item_ref like '%/written' then left(e.item_ref, char_length(e.item_ref) - char_length('/written'))
    when e.item_ref like 'tense-game/%' then substr(e.item_ref, char_length('tense-game/') + 1)
    when e.item_ref like 'tense-story/%' then substr(e.item_ref, char_length('tense-story/') + 1)
  end,
  case
    when e.activity_type = 'vocabulary.game' or e.performance_score is null then null
    else round(least(1, greatest(0, e.performance_score)) * 100)
  end,
  e.created_at,
  e.created_at
from public.xp_events e
where (
    e.activity_type = 'vocabulary.game'
    or (e.activity_type = 'grammar-coach.exercise'
        and (e.item_ref like '%/written' or e.item_ref like 'tense-game/%' or e.item_ref like 'tense-story/%'))
  )
  and not exists (select 1 from public.practice_log p where p.user_id = e.user_id);
