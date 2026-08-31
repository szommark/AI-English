-- AI Model Selector: each cached grammar lesson is now specific to the model that
-- generated it, so a learner's model choice actually changes what they see. The
-- default backfills existing rows to the feature's new default model so nothing
-- already cached is orphaned by the new primary key.

alter table public.grammar_lessons
  add column if not exists model_id text not null default 'groq-gpt-oss-120b';

alter table public.grammar_lessons drop constraint if exists grammar_lessons_pkey;
alter table public.grammar_lessons add constraint grammar_lessons_pkey
  primary key (cefr_level, grammar_item_id, model_id);
