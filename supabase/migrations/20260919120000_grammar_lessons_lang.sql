-- Grammar Coach lessons are now generated per UI language (hu / en / de), so the cache key
-- gains a `lang` column. Existing rows were all generated for the Hungarian base language.

alter table public.grammar_lessons
  add column if not exists lang text not null default 'hu';

alter table public.grammar_lessons drop constraint if exists grammar_lessons_pkey;
alter table public.grammar_lessons add constraint grammar_lessons_pkey
  primary key (cefr_level, grammar_item_id, model_id, lang);
