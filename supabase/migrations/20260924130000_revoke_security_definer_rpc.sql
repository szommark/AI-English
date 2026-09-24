-- AI-English: lock down security definer functions that were callable over RPC.
--
-- Supabase grants EXECUTE on every new public-schema function to anon and
-- authenticated by default, and none of the earlier migrations revoked it. Because
-- these functions are security definer and take user ids / budget amounts as plain
-- parameters, any browser client could call supabase.rpc() on them directly and act
-- on another user's data or on the shared Azure budget. Every legitimate caller uses
-- supabaseAdmin (service role) from api/, so revoke from public, anon and
-- authenticated and grant to service_role explicitly (same pattern as
-- admin_usage_snapshot / admin_llm_usage in 20260921120000_usage_meters.sql).
--
-- current_user_role() is intentionally NOT revoked: the RLS policies on
-- teacher_student_links, connection_attempts and tutor_personas call it as the
-- querying role, so authenticated (and anon, whose reads of those tables also
-- evaluate the policies) still need EXECUTE. It only reads the caller's own role.
-- pacific_day_start() is not security definer and exposes nothing, so it is left alone.

-- Called only from api/connect.ts (?action=redeem) via supabaseAdmin, with
-- p_student_id taken from the verified JWT. Open to authenticated, a user could
-- link any other user to a teacher by passing someone else's p_student_id.
revoke all on function public.redeem_invite_code(text, uuid) from public, anon, authenticated;
grant execute on function public.redeem_invite_code(text, uuid) to service_role;

-- Called only from api/pronunciation.ts (?action=progress) via supabaseAdmin, with
-- p_user_id taken from the verified JWT. Open, it let anyone write another user's
-- pronunciation progress.
revoke all on function public.upsert_pronunciation_progress(uuid, text, numeric, numeric) from public, anon, authenticated;
grant execute on function public.upsert_pronunciation_progress(uuid, text, numeric, numeric) to service_role;

-- No current caller (the daily session cap was removed from api/chat.ts; if it is
-- reinstated it runs there via supabaseAdmin). Open, it let anyone bump another
-- user's daily session count.
revoke all on function public.increment_daily_session_count(uuid, integer) from public, anon, authenticated;
grant execute on function public.increment_daily_session_count(uuid, integer) to service_role;

-- Shared Azure Deep Check budget, called only from api/pronunciation.ts
-- (?action=token and ?action=log) via supabaseAdmin. Open, anyone could exhaust
-- the monthly budget (reserve / true_up) or undo reservations (release / true_up
-- with a negative delta) and bypass the cap.
revoke all on function public.reserve_deep_check(integer, integer) from public, anon, authenticated;
grant execute on function public.reserve_deep_check(integer, integer) to service_role;

revoke all on function public.release_deep_check_reservation(integer) from public, anon, authenticated;
grant execute on function public.release_deep_check_reservation(integer) to service_role;

revoke all on function public.true_up_deep_check_seconds(integer) from public, anon, authenticated;
grant execute on function public.true_up_deep_check_seconds(integer) to service_role;

-- Trigger function for on_auth_user_created. Trigger functions are not EXECUTE-
-- checked when the trigger fires, so revoking does not affect signup; it just
-- removes it from the RPC surface.
revoke all on function public.handle_new_user() from public, anon, authenticated;

-- Event trigger function created by Supabase's "auto-enable RLS" setting, not by
-- a migration in this repo, so guard on it existing (fresh/local databases may not
-- have it). Like handle_new_user, it should never be callable over RPC.
do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    revoke all on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end;
$$;
