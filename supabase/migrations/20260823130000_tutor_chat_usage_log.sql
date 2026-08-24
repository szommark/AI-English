-- AI-English: Tutor Bot now logs its Gemini calls to groq_usage_log (name kept for
-- history — it predates Gemini support) with call_type 'tutor_chat'. scenario_id is
-- a plain text column (not FK'd to the static scenario list), so a synthetic
-- 'tutor-bot' value there is safe.

alter table public.groq_usage_log drop constraint if exists groq_usage_log_call_type_check;
alter table public.groq_usage_log add constraint groq_usage_log_call_type_check
  check (call_type in ('chat', 'feedback', 'tutor_chat'));
