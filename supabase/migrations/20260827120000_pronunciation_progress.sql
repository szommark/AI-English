-- AI-English: Pronunciation Session — dual perception/production score tracking, one row
-- per (user, sound item). Only the session-level scores persist; per-attempt phoneme and
-- prosody detail is shown in the moment and never stored (see docs/pronunciation-session-brief.md).

create table if not exists public.pronunciation_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  sound_item_id text not null,
  perception_score numeric,
  production_score numeric,
  attempts int not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, sound_item_id)
);

alter table public.pronunciation_progress enable row level security;
-- No public policies: only the service role (Vercel API routes) reads/writes this table,
-- matching grammar_lessons.

-- Atomically upserts one item's progress row. Each score is coalesced against the existing
-- value so a partial update (e.g. the "skip to production" shortcut, which only has a
-- production score) never clobbers the other side's most recent score. attempts always
-- increments by one per call, since one call represents one completed funnel run.
create or replace function public.upsert_pronunciation_progress(
  p_user_id uuid,
  p_sound_item_id text,
  p_perception_score numeric,
  p_production_score numeric
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.pronunciation_progress (user_id, sound_item_id, perception_score, production_score, attempts, updated_at)
  values (p_user_id, p_sound_item_id, p_perception_score, p_production_score, 1, now())
  on conflict (user_id, sound_item_id) do update
  set perception_score = coalesce(excluded.perception_score, public.pronunciation_progress.perception_score),
      production_score = coalesce(excluded.production_score, public.pronunciation_progress.production_score),
      attempts = public.pronunciation_progress.attempts + 1,
      updated_at = now();
end;
$$;
