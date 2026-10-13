-- AI-English: Grammar Coach "Past · Present · Future" game. Each AI answer check is logged
-- (and counted per learner per day, see api/_lib/tenseGame.ts) as 'tense_game'. No new table:
-- the question bank is static (src/data/tenseGameQuestions.ts) and rounds are not stored.
alter table public.groq_usage_log drop constraint if exists groq_usage_log_call_type_check;
alter table public.groq_usage_log add constraint groq_usage_log_call_type_check
  check (call_type in ('chat', 'feedback', 'tutor_chat', 'grammar_lesson', 'grammar_exercises', 'vocab_enrich', 'vocab_generate', 'lyrics_gaps', 'tense_game'));
