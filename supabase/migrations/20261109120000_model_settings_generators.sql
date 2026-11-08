-- AI-English: three more admin-selectable model settings — Mini courses, Exam task maker
-- (with the web source finder) and Comprehension tests. Until an admin picks a model, each
-- keeps its old hardcoded default (GPT-OSS 120B with Gemini as the backup), so no rows are
-- inserted here. Model ids themselves are validated in code (src/lib/models.ts), not here.
-- Previous definition: 20260924120000_vocabulary_builder.sql.
alter table public.model_settings drop constraint if exists model_settings_feature_check;
alter table public.model_settings add constraint model_settings_feature_check
  check (feature in ('rehearsal', 'grammarCoach', 'tutorBot', 'vocabulary', 'courses', 'examTasks', 'compTests'));
