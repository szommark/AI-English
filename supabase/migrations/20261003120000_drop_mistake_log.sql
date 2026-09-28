-- AI-English: retire mistake_log (20260831140000_personalization.sql).
--
-- Replaced by mistake_events (20261002120000_mistake_events.sql). Nothing has written to
-- it since then, and its rows were re-labelled into the mistake taxonomy and imported as
-- mistake_events rows with source = 'legacy' (legacy_mistake_log_id keeps the old id for
-- reference; the one-off import script is in git history, scripts/relabel-mistake-log.ts).
--
-- No cascade: nothing depends on this table, and if something unexpectedly does, the drop
-- should fail rather than take it with it. Its policies go with the table.

drop table if exists public.mistake_log;
