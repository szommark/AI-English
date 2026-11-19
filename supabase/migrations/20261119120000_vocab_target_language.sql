-- Avalon: Danish as a second target language in the Vocabulary Builder (Phase 1: schema).
-- See docs/vocabulary-builder-design.md for the tables this extends.
--
-- Identity. Danish items share vocab_items with the English ones. To keep a Danish "is"
-- (ice cream) or "hus" apart from an English row with the same spelling, a non-English
-- row's term_normalized carries a language prefix: 'da:' || normalizeTerm(term) (built
-- by termKey in src/lib/vocab.ts). So every unique index, SQL function, onConflict
-- target and SRS map keeps working on term_normalized alone, and a learner's Danish
-- card never collides with their English one. vocab_items_term_language_check below
-- ties the prefix to target_language. Before this migration no key could start with
-- 'da:' (normalizeTerm never adds one, and the constraint fails loudly if an old row
-- did). termKey also refuses an English term that would normalize to 'da:…'.
--
-- Column reuse for Danish rows (no renames, so every reader keeps working):
--   term            the Danish word; nouns bare (hus), the article in `article` (et)
--   definition_en   the optional English gloss (the model's meaningEn)
--   example_en      the Danish example sentence (example in the item's target language)
--   meaning_hu      the Hungarian meaning, as for English rows
--   example_hu      the Hungarian translation of the example (new, Danish only for now)
--
-- Danish words are generated once by the model, stored with review_status
-- 'needs_review' and reused by every later compile; a teacher/admin marks them reviewed
-- (Phase 2). Existing rows become target_language 'en', review_status 'reviewed'.
--
-- RLS: no new policies. vocab_items has none (service role only, via /api/vocab), and
-- the own-row select policy on vocab_student_lists covers its new column.

-- 1. vocab_items: language, review state and the Danish card fields.
alter table public.vocab_items
  add column if not exists target_language text not null default 'en',
  add column if not exists review_status text not null default 'reviewed',
  add column if not exists article text,
  add column if not exists pronunciation_hint text,
  add column if not exists example_hu text,
  add column if not exists verb_forms text[];

alter table public.vocab_items drop constraint if exists vocab_items_target_language_check;
alter table public.vocab_items add constraint vocab_items_target_language_check
  check (target_language in ('en', 'da'));

alter table public.vocab_items drop constraint if exists vocab_items_review_status_check;
alter table public.vocab_items add constraint vocab_items_review_status_check
  check (review_status in ('needs_review', 'reviewed'));

alter table public.vocab_items drop constraint if exists vocab_items_article_check;
alter table public.vocab_items add constraint vocab_items_article_check
  check (article in ('en', 'et'));

-- The key prefix matches the language: a non-English row starts with '<lang>:', an English
-- row starts with no language prefix. Add each new language's prefix to the English list.
alter table public.vocab_items drop constraint if exists vocab_items_term_language_check;
alter table public.vocab_items add constraint vocab_items_term_language_check
  check (
    case
      when target_language = 'en' then term_normalized not like 'da:%'
      else term_normalized like target_language || ':%'
    end
  );

comment on column public.vocab_items.target_language is
  'Language of term. Non-English rows key term_normalized as ''<lang>:'' || normalizeTerm(term).';
comment on column public.vocab_items.review_status is
  'needs_review: generated, not yet checked by a teacher/admin. English rows are reviewed.';
comment on column public.vocab_items.definition_en is
  'English definition (English rows) or short English gloss (other languages).';
comment on column public.vocab_items.example_en is
  'Example sentence in the item''s target language (Danish rows: the Danish example).';
comment on column public.vocab_items.article is 'Danish nouns: en or et (term is the bare noun).';
comment on column public.vocab_items.pronunciation_hint is 'Simple respelling for a Hungarian reader, not IPA.';
comment on column public.vocab_items.example_hu is 'Hungarian translation of example_en.';
comment on column public.vocab_items.verb_forms is 'Danish verbs: infinitive, present, past, perfect (spise, spiser, spiste, har spist).';

-- Picking stored Danish items for a compile: by language and level, then topic.
create index if not exists vocab_items_lang_level_idx
  on public.vocab_items (target_language, cefr_level)
  where owner_teacher_id is null and target_language <> 'en';
create index if not exists vocab_items_lang_topics_idx
  on public.vocab_items using gin (topics)
  where owner_teacher_id is null and target_language <> 'en';

-- 2. Student word lists: the list's language.
alter table public.vocab_student_lists
  add column if not exists target_language text not null default 'en';
alter table public.vocab_student_lists drop constraint if exists vocab_student_lists_target_language_check;
alter table public.vocab_student_lists add constraint vocab_student_lists_target_language_check
  check (target_language in ('en', 'da'));

-- 3. upsert_global_vocab_items: same signature, now also writes the new columns.
-- English callers send none of them, so English rows behave exactly as before
-- (target_language 'en', review_status 'reviewed', topics untouched). A conflict never
-- overwrites a reviewed non-English row: a regenerated Danish word leaves a teacher-checked
-- one as it is (the caller reads its id back). Topics sent are merged into the row's.
create or replace function public.upsert_global_vocab_items(p_items jsonb)
returns setof public.vocab_items
language sql
set search_path = public
as $$
  insert into public.vocab_items as v
    (term, term_normalized, kind, pos, cefr_level, meaning_hu, definition_en, example_en,
     origin, enrichment_status, enrichment_model_id,
     target_language, review_status, article, pronunciation_hint, example_hu, verb_forms, topics)
  select
    i->>'term', i->>'term_normalized', i->>'kind', i->>'pos', i->>'cefr_level',
    i->>'meaning_hu', i->>'definition_en', i->>'example_en',
    i->>'origin', 'done', i->>'enrichment_model_id',
    coalesce(i->>'target_language', 'en'),
    coalesce(i->>'review_status', 'reviewed'),
    i->>'article',
    i->>'pronunciation_hint',
    i->>'example_hu',
    case when jsonb_typeof(i->'verb_forms') = 'array'
      then array(select jsonb_array_elements_text(i->'verb_forms')) end,
    case when jsonb_typeof(i->'topics') = 'array'
      then array(select jsonb_array_elements_text(i->'topics')) else '{}'::text[] end
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
    review_status = excluded.review_status,
    article = excluded.article,
    pronunciation_hint = excluded.pronunciation_hint,
    example_hu = excluded.example_hu,
    verb_forms = excluded.verb_forms,
    topics = case
      when excluded.topics = '{}'::text[] then v.topics
      else array(select distinct t from unnest(v.topics || excluded.topics) as t order by t)
    end,
    updated_at = now()
  where v.target_language = 'en' or v.review_status = 'needs_review'
  returning v.*;
$$;

revoke execute on function public.upsert_global_vocab_items(jsonb) from public, anon, authenticated;
grant execute on function public.upsert_global_vocab_items(jsonb) to service_role;
