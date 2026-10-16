-- Grammar Coach: the explanation language is now the learner's choice at every level (their
-- UI language or English) instead of "UI language at A1/A2, English above". It joins the
-- cache key of both Grammar Coach caches.
--
-- Lessons: old rows keep explain_lang = '' and are never read again — the new lessons are
-- longer, more detailed and tag English inside Hungarian/German narration, so every lesson
-- is regenerated on first play.
-- Exercises: only the two instructions depend on it, so old rows are kept and labelled with
-- the language their instructions were written in under the old rule.

alter table public.grammar_lessons
  add column if not exists explain_lang text not null default '';

alter table public.grammar_lessons drop constraint if exists grammar_lessons_pkey;
alter table public.grammar_lessons add constraint grammar_lessons_pkey
  primary key (cefr_level, grammar_item_id, model_id, lang, explain_lang);

alter table public.grammar_exercises
  add column if not exists explain_lang text not null default '';

update public.grammar_exercises
  set explain_lang = case when cefr_level in ('A1', 'A2') and lang <> 'en' then lang else 'en' end
  where explain_lang = '';

alter table public.grammar_exercises drop constraint if exists grammar_exercises_pkey;
alter table public.grammar_exercises add constraint grammar_exercises_pkey
  primary key (cefr_level, grammar_item_id, model_id, lang, explain_lang);
