-- AI-English: Vocabulary Builder — mixed-level student lists (docs/vocabulary-builder-design.md §7.2).
--
-- A student can compile a list at 'mixed' level: its words are spread over the learner's
-- level and the levels either side (B1 -> A2, B1, B2), and each word shows its own level.
-- Previous definition: the inline check in 20260926120000_vocabulary_student_lists.sql.

alter table public.vocab_student_lists drop constraint if exists vocab_student_lists_cefr_level_check;
alter table public.vocab_student_lists add constraint vocab_student_lists_cefr_level_check
  check (cefr_level in ('A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'mixed'));
