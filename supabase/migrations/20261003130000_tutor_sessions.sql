-- AI-English: minimal Tutor Bot session tracking (gamification design §9.3, D8).
--
-- One row per Tutor Bot conversation: counts only, never message text. The id is
-- generated in the browser (crypto.randomUUID()) when a conversation starts and sent
-- with every /api/tutor?action=chat request; api/tutor.ts calls record_tutor_turn()
-- on each learner message and awards tutor-bot.conversation XP once the conversation
-- reaches TUTOR_MIN_TURNS_FOR_XP learner turns.

create table public.tutor_sessions (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  persona_id text,
  started_at timestamptz not null default now(),
  last_turn_at timestamptz,
  learner_turns int not null default 0,
  xp_awarded boolean not null default false
);

create index tutor_sessions_user_id_started_at_idx on public.tutor_sessions (user_id, started_at desc);

alter table public.tutor_sessions enable row level security;

create policy "Users can read their own tutor sessions"
  on public.tutor_sessions for select
  using (auth.uid() = user_id);

-- No insert/update/delete policies: every write is service-role, from api/tutor.ts.

-- Counts one learner turn, atomically. Creates the row on the first turn; if a row
-- with this id already belongs to another user, nothing is changed and no row is
-- returned (the caller then skips tracking). award_due is true exactly once per
-- session: on the call that takes learner_turns to p_min_turns or beyond while
-- xp_awarded is still false, and that same call flips xp_awarded, so two concurrent
-- requests can never both award.
create or replace function public.record_tutor_turn(
  p_session_id uuid,
  p_user_id uuid,
  p_persona_id text,
  p_min_turns int
)
returns table (learner_turns int, award_due boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_turns int;
  v_was_awarded boolean;
begin
  insert into public.tutor_sessions as s (id, user_id, persona_id, last_turn_at, learner_turns)
  values (p_session_id, p_user_id, p_persona_id, now(), 1)
  on conflict (id) do update
    set learner_turns = s.learner_turns + 1,
        last_turn_at = now()
    where s.user_id = excluded.user_id
  returning s.learner_turns, s.xp_awarded into v_turns, v_was_awarded;

  if v_turns is null then
    return; -- the id belongs to another user
  end if;

  if v_turns >= p_min_turns and not v_was_awarded then
    update public.tutor_sessions set xp_awarded = true
      where id = p_session_id and not xp_awarded;
    if found then
      return query select v_turns, true;
      return;
    end if;
  end if;

  return query select v_turns, false;
end;
$$;

-- Called only from api/tutor.ts via supabaseAdmin, with p_user_id taken from the
-- verified JWT (same lockdown as 20260924130000_revoke_security_definer_rpc.sql).
revoke all on function public.record_tutor_turn(uuid, uuid, text, int) from public, anon, authenticated;
grant execute on function public.record_tutor_turn(uuid, uuid, text, int) to service_role;
