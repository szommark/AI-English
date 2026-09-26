-- AI-English: Vocabulary Builder — mastered words (docs/vocabulary-builder-design.md §6.4).
--
-- A review that schedules a card's next gap at RETIRE_INTERVAL_DAYS (365) or more retires
-- it: retired_at is set and the card stops coming up in review sessions. Its FSRS state is
-- kept, so the student can put it back ("Review again", which clears retired_at and makes
-- it due now). Retired cards still count as learned for teacher-list progress, and the
-- vocabulary_mastery view is unchanged (a retired card's stability is far above 21 days).

alter table public.vocab_cards add column retired_at timestamptz;

-- Review sessions and the due count only look at cards in rotation.
drop index public.vocab_cards_due_idx;
create index vocab_cards_due_idx on public.vocab_cards (user_id, due) where not suspended and retired_at is null;
