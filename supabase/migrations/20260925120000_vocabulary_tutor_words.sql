-- AI-English: Vocabulary Builder, Phase 4 (Tutor Bot words, vocabulary_mastery → view).
-- See docs/vocabulary-builder-design.md (decision 1, §4.2, §5.2, §6.3) — the source of truth.
--
-- 1. ensure_global_vocab_items: find-or-create global items for Tutor Bot words.
-- 2. Move any vocabulary_mastery rows into vocab_cards (origin 'tutor', FSRS New).
-- 3. Keep the old table as vocabulary_mastery_legacy and replace it with a read-only view
--    over vocab_cards, so its readers (api/connect.ts student-detail, the learner summary
--    in api/_lib/personalization.ts) keep working unchanged.
--
-- Safe in either order with the Phase 4 code deploy: until this runs, the new code's
-- vocabulary_mastery reads still hit the table; after it runs, the old code's writes to
-- vocabulary_mastery fail on the read-only view and are already ignored there.

-- Find-or-create global (owner_teacher_id is null) items. Existing rows — enriched or
-- not — are returned untouched; missing ones are inserted with enrichment_status
-- 'pending' and filled in later by enrichTerms (whose upsert_global_vocab_items updates
-- the same row). A function because ON CONFLICT on the partial unique index needs the
-- index predicate, which PostgREST can't express.
-- p_items: [{ term, term_normalized, kind, origin }], normalized by the API.
create or replace function public.ensure_global_vocab_items(p_items jsonb)
returns setof public.vocab_items
language sql
set search_path = public
as $$
  with wanted as (
    select distinct on (i.value->>'term_normalized', i.value->>'kind')
      i.value->>'term' as term,
      i.value->>'term_normalized' as term_normalized,
      i.value->>'kind' as kind,
      i.value->>'origin' as origin
    from jsonb_array_elements(p_items) with ordinality as i(value, ord)
    order by i.value->>'term_normalized', i.value->>'kind', i.ord
  ),
  inserted as (
    insert into public.vocab_items (term, term_normalized, kind, origin, enrichment_status)
    select term, term_normalized, kind, origin, 'pending' from wanted
    on conflict (term_normalized, kind) where owner_teacher_id is null do nothing
    returning *
  )
  select * from inserted
  union all
  select v.* from public.vocab_items v
  join wanted w on w.term_normalized = v.term_normalized and w.kind = v.kind
  where v.owner_teacher_id is null
    and not exists (select 1 from inserted i where i.id = v.id);
$$;

revoke all on function public.ensure_global_vocab_items(jsonb) from public, anon, authenticated;
grant execute on function public.ensure_global_vocab_items(jsonb) to service_role;

-- Keep the old table (renamed) as a backup rather than dropping it. Its RLS and select
-- policies move with it, so it stays readable only by the student and connected teachers.
alter table public.vocabulary_mastery rename to vocabulary_mastery_legacy;

-- Migrate legacy rows into cards. The legacy status only counted sightings ("mastered" =
-- seen 3 times), not learning, so every card starts as FSRS New (the column defaults).
-- Words were stored trim().toLowerCase()d; finish normalizing like normalizeTerm()
-- (src/lib/vocab.ts): straight apostrophes, collapsed spaces, no surrounding punctuation.
with legacy as (
  select user_id, last_seen_at,
    regexp_replace(
      regexp_replace(lower(translate(word, '‘’ʼ', '''''''')), '\s+', ' ', 'g'),
      '^[[:punct:][:space:]]+|[[:punct:][:space:]]+$', '', 'g'
    ) as term_normalized
  from public.vocabulary_mastery_legacy
),
terms as (
  select distinct term_normalized,
    case when term_normalized like '% %' then 'phrase' else 'word' end as kind
  from legacy
  where term_normalized <> ''
)
insert into public.vocab_items (term, term_normalized, kind, origin, enrichment_status)
select term_normalized, term_normalized, kind, 'tutor', 'pending' from terms
on conflict (term_normalized, kind) where owner_teacher_id is null do nothing;

with legacy as (
  select user_id, last_seen_at,
    regexp_replace(
      regexp_replace(lower(translate(word, '‘’ʼ', '''''''')), '\s+', ' ', 'g'),
      '^[[:punct:][:space:]]+|[[:punct:][:space:]]+$', '', 'g'
    ) as term_normalized
  from public.vocabulary_mastery_legacy
)
insert into public.vocab_cards (user_id, item_id, term_normalized, origin, created_at, updated_at)
select distinct on (l.user_id, l.term_normalized)
  l.user_id, i.id, l.term_normalized, 'tutor', l.last_seen_at, now()
from legacy l
join public.vocab_items i
  on i.owner_teacher_id is null
 and i.term_normalized = l.term_normalized
 and i.kind = case when l.term_normalized like '% %' then 'phrase' else 'word' end
where l.term_normalized <> ''
order by l.user_id, l.term_normalized, l.last_seen_at desc
on conflict (user_id, term_normalized) do nothing;

-- The replacement view (design §6.3). security_invoker, so vocab_cards' RLS applies:
-- students see their own rows, connected teachers their students'. 21 days is
-- MASTERED_STABILITY_DAYS in src/lib/vocab.ts. Suspended cards are excluded.
create view public.vocabulary_mastery with (security_invoker = true) as
select
  c.user_id,
  c.term_normalized as word,
  case
    when c.state in (0, 1) then 'new'                       -- New, Learning
    when c.state = 2 and c.stability >= 21 then 'mastered'  -- Review, stable
    else 'practicing'                                       -- Review (< 21 days), Relearning
  end as status,
  c.reps as occurrences,
  coalesce(c.last_review, c.created_at) as last_seen_at
from public.vocab_cards c
where not c.suspended;

-- Read-only: a simple view is auto-updatable in Postgres, and writes through it would
-- land in vocab_cards. All card writes go through /api/vocab.
revoke insert, update, delete, truncate on public.vocabulary_mastery from public, anon, authenticated, service_role;
