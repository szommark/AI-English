-- AI-English: Vocabulary Builder — word bank (docs/vocabulary-builder-design.md §5.3, §7.2).
--
-- 1. vocab_word_bank: which terms exist at which level and topic, from the CEFR-J
--    Wordlist 1.5 (A1–B2) and the Octanove Vocabulary Profile C1/C2. Filled by
--    `npm run wordbank:import` (scripts/import-word-bank.ts), not by this migration.
--    Meanings and examples are not stored here: they are enriched on demand into
--    vocab_items (§4.2) the first time a word lands in a student's list.
-- 2. pick_word_bank_terms: random terms for a topic and level, for compiling a list.
-- 3. vocab_compiles: one row per compiled or regenerated list. The daily compile limit
--    counts these (it used to count 'vocab_generate' usage rows, but a list filled
--    entirely from the bank makes no word-picking model call).
--
-- Writes go through the service role (API routes and the import script).

create table public.vocab_word_bank (
  id bigint generated always as identity primary key,
  term text not null,
  term_normalized text not null unique,
  kind text not null check (kind in ('word', 'phrase')),
  pos text check (pos in ('noun', 'verb', 'adjective', 'adverb', 'phrase', 'other')),
  cefr_level text not null check (cefr_level in ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  -- VOCAB_TOPICS ids (src/lib/vocab.ts), from data/wordbank/topic-map.json.
  topics text[] not null default '{}',
  source text not null check (source in ('cefrj', 'octanove')),
  -- Taken out of compiled lists without deleting the row (re-imports keep it hidden).
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);

create index vocab_word_bank_level_idx on public.vocab_word_bank (cefr_level) where not hidden;
create index vocab_word_bank_topics_idx on public.vocab_word_bank using gin (topics);

alter table public.vocab_word_bank enable row level security;
-- No public policies: read and written only with the service role.

-- Up to p_count random visible terms for a topic and level, none in p_exclude
-- (normalized terms the student already has). A function because PostgREST can't
-- order by random().
create or replace function public.pick_word_bank_terms(p_topic text, p_level text, p_count integer, p_exclude text[])
returns setof public.vocab_word_bank
language sql
volatile
set search_path = public
as $$
  select *
  from public.vocab_word_bank
  where not hidden
    and cefr_level = p_level
    and p_topic = any(topics)
    and not (term_normalized = any(coalesce(p_exclude, '{}')))
  order by random()
  limit greatest(p_count, 0);
$$;

revoke all on function public.pick_word_bank_terms(text, text, integer, text[]) from public, anon, authenticated;
grant execute on function public.pick_word_bank_terms(text, text, integer, text[]) to service_role;

create table public.vocab_compiles (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  list_id uuid references public.vocab_student_lists(id) on delete set null,
  -- Where the words came from; null for compiles recorded before this table existed.
  bank_words integer,
  ai_words integer,
  created_at timestamptz not null default now()
);

create index vocab_compiles_user_idx on public.vocab_compiles (user_id, created_at desc);

alter table public.vocab_compiles enable row level security;

create policy "Users can read their own vocab compiles"
  on public.vocab_compiles for select
  using (auth.uid() = user_id);

-- Carry over today's (and earlier) compiles so the switch doesn't reset anyone's limit.
insert into public.vocab_compiles (user_id, created_at)
select user_id, created_at
from public.groq_usage_log
where call_type = 'vocab_generate' and user_id is not null;
