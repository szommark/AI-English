-- AI-English: Vocabulary Builder, Phase 2 (teacher word lists). See
-- docs/vocabulary-builder-design.md (§4.1, §4.3, §5.1, §6.2) — it is the source of truth.
-- The tables already exist (20260924120000_vocabulary_builder.sql); this migration only
-- adds the two SQL functions api/vocab.ts needs. No schema change.
--
-- Both functions are plain (security invoker) and called only from api/vocab.ts via
-- supabaseAdmin (service role), which bypasses RLS. Their parameters are trusted ids
-- (the teacher id comes from the verified JWT; students are link-checked by the API
-- route first), so they must never be callable over RPC by anon or authenticated —
-- hence the revoke/grant at the end of each (same pattern as
-- 20260924130000_revoke_security_definer_rpc.sql).

-- Insert or update a teacher's own vocab_items rows (design §4.1). A function rather than
-- a PostgREST upsert because ON CONFLICT against the partial unique index
-- vocab_items_teacher_term_uniq needs the index predicate, which PostgREST's on_conflict
-- parameter cannot express.
--
-- Every inserted row gets owner_teacher_id = p_teacher_id, so the conflict target can
-- only ever match that teacher's own rows: global cache rows (owner_teacher_id is null)
-- and other teachers' rows are never written. One row per (teacher, term): editing a
-- term's meaning in one list changes it in every list of that teacher that uses it.
--
-- p_items: [{ term, term_normalized, kind, pos, cefr_level, meaning_hu, definition_en,
-- example_en }], already normalized and validated by the API. Duplicate term_normalized
-- entries are collapsed (first one wins) so ON CONFLICT never hits the same row twice.
create or replace function public.upsert_teacher_vocab_items(p_teacher_id uuid, p_items jsonb)
returns setof public.vocab_items
language sql
set search_path = public
as $$
  insert into public.vocab_items as v
    (term, term_normalized, kind, pos, cefr_level, meaning_hu, definition_en, example_en,
     origin, owner_teacher_id, enrichment_status)
  select distinct on (i.value->>'term_normalized')
    i.value->>'term', i.value->>'term_normalized', i.value->>'kind',
    nullif(i.value->>'pos', ''), nullif(i.value->>'cefr_level', ''),
    nullif(i.value->>'meaning_hu', ''), nullif(i.value->>'definition_en', ''),
    nullif(i.value->>'example_en', ''),
    'teacher', p_teacher_id, 'done'
  from jsonb_array_elements(p_items) with ordinality as i(value, ord)
  order by i.value->>'term_normalized', i.ord
  on conflict (owner_teacher_id, term_normalized) where owner_teacher_id is not null
  do update set
    term = excluded.term,
    kind = excluded.kind,
    pos = excluded.pos,
    cefr_level = excluded.cefr_level,
    meaning_hu = excluded.meaning_hu,
    definition_en = excluded.definition_en,
    example_en = excluded.example_en,
    origin = 'teacher',
    enrichment_status = 'done',
    updated_at = now()
  returning v.*;
$$;

revoke all on function public.upsert_teacher_vocab_items(uuid, jsonb) from public, anon, authenticated;
grant execute on function public.upsert_teacher_vocab_items(uuid, jsonb) to service_role;

-- Assign a list to students and create or upgrade their cards, in one transaction
-- (design §4.3, §5.1). Also used after a list edit, with the list's currently assigned
-- students, to create cards for newly added terms: it is idempotent, so terms that
-- already have cards are just counted as unchanged.
--
-- The caller (api/vocab.ts) has already checked that every student has an active
-- teacher_student_links row to the list's teacher; this function does not re-check.
--
-- Per (student, list term), matched on term_normalized:
--   * no card yet            -> insert a new card: origin 'teacher', the teacher's item,
--                               FSRS "New" (state 0, due now, all counters 0 — the same
--                               values as newCardFields() in api/_lib/vocabScheduler.ts),
--                               ladder_step 1;
--   * card on a global item  -> switch item_id to the teacher's item and origin to
--                               'teacher'; FSRS state, ladder_step, first_learned_at,
--                               context columns and suspended are left untouched;
--   * card on a teacher item -> unchanged (this teacher's item already, or another
--                               teacher's: the first teacher's item wins, and list
--                               progress is matched on term_normalized anyway).
create or replace function public.assign_vocab_list(p_list_id uuid, p_student_ids uuid[])
returns table (
  assignments_created integer,
  cards_created integer,
  cards_upgraded integer,
  cards_unchanged integer
)
language plpgsql
set search_path = public
as $$
declare
  v_pairs integer;
begin
  if not exists (select 1 from public.vocab_lists where id = p_list_id) then
    raise exception 'list_not_found';
  end if;

  insert into public.vocab_list_assignments (list_id, student_id)
  select p_list_id, s.student_id
  from (select distinct unnest(p_student_ids) as student_id) s
  on conflict (list_id, student_id) do nothing;
  get diagnostics assignments_created = row_count;

  select count(*)::integer into v_pairs
  from (select distinct unnest(p_student_ids)) s
  cross join public.vocab_list_items li
  where li.list_id = p_list_id;

  -- Upgrade first: only cards that exist now and point at a global item.
  update public.vocab_cards c
  set item_id = i.id,
      origin = 'teacher',
      updated_at = now()
  from public.vocab_list_items li
  join public.vocab_items i on i.id = li.item_id,
    public.vocab_items cur
  where li.list_id = p_list_id
    and c.user_id = any (p_student_ids)
    and c.term_normalized = i.term_normalized
    and cur.id = c.item_id
    and cur.owner_teacher_id is null;
  get diagnostics cards_upgraded = row_count;

  insert into public.vocab_cards
    (user_id, item_id, term_normalized, origin,
     due, stability, difficulty, elapsed_days, scheduled_days, learning_steps,
     reps, lapses, state, last_review, ladder_step)
  select s.student_id, i.id, i.term_normalized, 'teacher',
     now(), 0, 0, 0, 0, 0,
     0, 0, 0, null, 1
  from (select distinct unnest(p_student_ids) as student_id) s
  cross join public.vocab_list_items li
  join public.vocab_items i on i.id = li.item_id
  where li.list_id = p_list_id
  on conflict (user_id, term_normalized) do nothing;
  get diagnostics cards_created = row_count;

  cards_unchanged := v_pairs - cards_created - cards_upgraded;
  return next;
end;
$$;

revoke all on function public.assign_vocab_list(uuid, uuid[]) from public, anon, authenticated;
grant execute on function public.assign_vocab_list(uuid, uuid[]) to service_role;
