-- AI-English: per-correction mistake events, replacing mistake_log's one-row-per-category
-- running counts. One row per end-of-session correction, linked to its session, so the
-- learner's "Az én fejlődésem" page can say how many of their recent sessions a mistake
-- showed up in, and every example is kept rather than only the latest.
--
-- mistake_log is NOT touched here: it stays as the read-only source for
-- scripts/relabel-mistake-log.ts and is retired in a later migration once the re-label
-- has been applied and checked. Nothing writes to it any more.

create table public.mistake_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  -- Null for re-labelled legacy rows, and if the session insert itself failed.
  session_id uuid references public.sessions(id) on delete set null,
  -- Both lists must match src/data/mistakeTaxonomy.ts exactly; change them together.
  area text not null check (area in (
    'verbs_tenses', 'questions_negatives', 'nouns_articles', 'pronouns',
    'prepositions', 'word_order', 'vocabulary', 'other'
  )),
  subtype text not null check (subtype in (
    'missing_be', 'past_forms', 'perfect_vs_past', 'simple_vs_continuous', 'future_forms', 'third_person_s',
    'do_support', 'question_word_order',
    'articles', 'plural_countable',
    'he_she', 'his_her', 'missing_subject',
    'prep_time_place', 'dependent_prep',
    'sentence_order', 'adverb_position',
    'wrong_word', 'collocation',
    'other'
  )),
  example_original text,
  example_corrected text,
  note text,
  source text not null check (source in ('scenario', 'tutor', 'legacy')),
  -- Legacy rows only: how many occurrences the old mistake_log row stood for.
  legacy_occurrences int,
  -- Legacy rows only: the mistake_log row this was imported from, so the import is idempotent.
  legacy_mistake_log_id bigint unique,
  created_at timestamptz not null default now()
);

create index mistake_events_user_id_created_at_idx on public.mistake_events (user_id, created_at desc);
create index mistake_events_session_id_idx on public.mistake_events (session_id);

alter table public.mistake_events enable row level security;

-- Same two read policies as mistake_log (20260831140000_personalization.sql).
create policy "Users can read their own mistake events"
  on public.mistake_events for select
  using (auth.uid() = user_id);

create policy "Connected teachers can read student mistake events"
  on public.mistake_events for select
  using (
    exists (
      select 1 from public.teacher_student_links l
      where l.student_id = mistake_events.user_id
        and l.teacher_id = auth.uid()
        and l.status = 'active'
    )
  );

-- No insert/update/delete policies: every write is service-role, from
-- api/_lib/personalization.ts and scripts/relabel-mistake-log.ts.
