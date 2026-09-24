-- AI-English: Vocabulary Builder, Phase 1 (foundation). See
-- docs/vocabulary-builder-design.md — it is the source of truth for every table here.
-- Depends on teacher_student_links from 20260831130000_roles_and_connections.sql
-- (must run after it) for the "connected teachers can read" policy below.
--
-- Deletion: deleting a teacher account cascades to their lists and teacher-owned items,
-- and from there to students' teacher-origin cards. This is intentional, so account
-- erasure is never blocked.

-- Content: shared (global) items + teacher-owned items
create table public.vocab_items (
  id uuid primary key default gen_random_uuid(),
  term text not null,
  term_normalized text not null,
  kind text not null default 'word' check (kind in ('word', 'phrase')),
  pos text,
  cefr_level text check (cefr_level in ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  topics text[] not null default '{}',
  meaning_hu text,
  definition_en text,
  example_en text,
  origin text not null check (origin in ('catalog', 'teacher', 'tutor')),
  -- null = global shared cache row; set = teacher-owned row (Phase 2)
  owner_teacher_id uuid references auth.users(id) on delete cascade,
  enrichment_status text not null default 'pending'
    check (enrichment_status in ('pending', 'done', 'failed')),
  enrichment_model_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index vocab_items_global_term_uniq
  on public.vocab_items (term_normalized, kind) where owner_teacher_id is null;
create unique index vocab_items_teacher_term_uniq
  on public.vocab_items (owner_teacher_id, term_normalized) where owner_teacher_id is not null;

alter table public.vocab_items enable row level security;
-- No public policies: read and written only via /api/vocab with the service role.

-- Upsert into the global enrichment cache. A function rather than a PostgREST upsert
-- because ON CONFLICT against a partial unique index needs the index predicate, which
-- PostgREST's on_conflict parameter cannot express. Called only from
-- api/_lib/vocabEnrichment.ts with the service role.
create or replace function public.upsert_global_vocab_items(p_items jsonb)
returns setof public.vocab_items
language sql
set search_path = public
as $$
  insert into public.vocab_items as v
    (term, term_normalized, kind, pos, cefr_level, meaning_hu, definition_en, example_en,
     origin, enrichment_status, enrichment_model_id)
  select
    i->>'term', i->>'term_normalized', i->>'kind', i->>'pos', i->>'cefr_level',
    i->>'meaning_hu', i->>'definition_en', i->>'example_en',
    i->>'origin', 'done', i->>'enrichment_model_id'
  from jsonb_array_elements(p_items) as i
  on conflict (term_normalized, kind) where owner_teacher_id is null
  do update set
    term = excluded.term,
    pos = excluded.pos,
    cefr_level = excluded.cefr_level,
    meaning_hu = excluded.meaning_hu,
    definition_en = excluded.definition_en,
    example_en = excluded.example_en,
    enrichment_status = 'done',
    enrichment_model_id = excluded.enrichment_model_id,
    updated_at = now()
  returning v.*;
$$;

revoke execute on function public.upsert_global_vocab_items(jsonb) from public, anon, authenticated;

-- Per-student cards with FSRS state (fields mirror the ts-fsrs 5.x Card type)
create table public.vocab_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id uuid not null references public.vocab_items(id) on delete cascade,
  term_normalized text not null,
  origin text not null check (origin in ('catalog', 'teacher', 'tutor')),
  due timestamptz not null default now(),
  stability double precision not null default 0,
  difficulty double precision not null default 0,
  -- Deprecated in ts-fsrs 5.x (removal planned for 6.0.0); kept while the Card type still has it.
  elapsed_days integer not null default 0,
  scheduled_days integer not null default 0,
  learning_steps integer not null default 0,
  reps integer not null default 0,
  lapses integer not null default 0,
  state smallint not null default 0 check (state between 0 and 3), -- New, Learning, Review, Relearning
  last_review timestamptz,
  ladder_step smallint not null default 1 check (ladder_step between 1 and 5),
  first_learned_at timestamptz, -- first time state reached Review; never cleared
  context_original text,
  context_corrected text,
  suspended boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, term_normalized)
);

create index vocab_cards_due_idx on public.vocab_cards (user_id, due) where not suspended;
create index vocab_cards_item_idx on public.vocab_cards (item_id);

alter table public.vocab_cards enable row level security;

create policy "Users can read their own vocab cards"
  on public.vocab_cards for select
  using (auth.uid() = user_id);

create policy "Connected teachers can read student vocab cards"
  on public.vocab_cards for select
  using (
    exists (
      select 1 from public.teacher_student_links l
      where l.student_id = vocab_cards.user_id
        and l.teacher_id = auth.uid()
        and l.status = 'active'
    )
  );

create table public.vocab_reviews (
  id bigint generated always as identity primary key,
  card_id uuid not null references public.vocab_cards(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise text not null
    check (exercise in ('recognition', 'recall', 'context', 'listening', 'production', 'conversation')),
  correct boolean not null,
  used_hint boolean not null default false,
  response_ms integer,
  rating smallint not null check (rating between 1 and 4), -- Again, Hard, Good, Easy
  state_before smallint not null,
  reviewed_at timestamptz not null default now()
);

create index vocab_reviews_user_idx on public.vocab_reviews (user_id, reviewed_at desc);

alter table public.vocab_reviews enable row level security;

create policy "Users can read their own vocab reviews"
  on public.vocab_reviews for select
  using (auth.uid() = user_id);

-- Teacher lists
create table public.vocab_lists (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  cefr_level text check (cefr_level in ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.vocab_list_items (
  list_id uuid not null references public.vocab_lists(id) on delete cascade,
  item_id uuid not null references public.vocab_items(id) on delete cascade,
  position integer not null default 0,
  primary key (list_id, item_id)
);

create table public.vocab_list_assignments (
  list_id uuid not null references public.vocab_lists(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  completed_at timestamptz, -- set once when every list term has a learned card; never cleared
  primary key (list_id, student_id)
);

alter table public.vocab_lists enable row level security;
alter table public.vocab_list_items enable row level security;
alter table public.vocab_list_assignments enable row level security;

create policy "Teachers can read their own vocab lists"
  on public.vocab_lists for select
  using (auth.uid() = teacher_id);

create policy "Students can read vocab lists assigned to them"
  on public.vocab_lists for select
  using (
    exists (
      select 1 from public.vocab_list_assignments a
      where a.list_id = vocab_lists.id and a.student_id = auth.uid()
    )
  );

create policy "Students can read their own list assignments"
  on public.vocab_list_assignments for select
  using (auth.uid() = student_id);

create policy "Teachers can read assignments of their own lists"
  on public.vocab_list_assignments for select
  using (
    exists (
      select 1 from public.vocab_lists l
      where l.id = vocab_list_assignments.list_id and l.teacher_id = auth.uid()
    )
  );

-- vocab_list_items: no public policies — read via /api/vocab only.
-- No insert/update/delete policies on any table above: every write is service-role.

-- Usage log: enrichment calls. Previous definition: 20260826120000_grammar_lessons.sql.
alter table public.groq_usage_log drop constraint if exists groq_usage_log_call_type_check;
alter table public.groq_usage_log add constraint groq_usage_log_call_type_check
  check (call_type in ('chat', 'feedback', 'tutor_chat', 'grammar_lesson', 'vocab_enrich'));

-- Admin-selectable model for enrichment. Previous definition: the inline check in
-- 20260913120000_personas_and_model_settings.sql, which Postgres names model_settings_feature_check.
alter table public.model_settings drop constraint if exists model_settings_feature_check;
alter table public.model_settings add constraint model_settings_feature_check
  check (feature in ('rehearsal', 'grammarCoach', 'tutorBot', 'vocabulary'));
