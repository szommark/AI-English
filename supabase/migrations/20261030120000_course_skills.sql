-- AI-English: mini courses, listening/speaking/writing modules (docs/mini-courses-design.md).
-- Listening recordings (Azure TTS of the module's script) live in a private bucket; the API hands
-- out short signed URLs. AI feedback on a learner's written or spoken answer is logged and counted
-- per day as 'course_feedback'.

insert into storage.buckets (id, name, public)
values ('course-audio', 'course-audio', false)
on conflict (id) do nothing;

alter table public.groq_usage_log drop constraint if exists groq_usage_log_call_type_check;
alter table public.groq_usage_log add constraint groq_usage_log_call_type_check
  check (call_type in ('chat', 'feedback', 'tutor_chat', 'grammar_lesson', 'grammar_exercises', 'vocab_enrich', 'vocab_generate', 'lyrics_gaps', 'tense_game', 'exam_task_gen', 'comp_test_gen', 'course_gen', 'course_feedback'));
