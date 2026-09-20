-- Provider/model attribution for LLM usage (table name is historical; it logs Groq and Gemini).
alter table public.groq_usage_log add column if not exists provider text;
alter table public.groq_usage_log add column if not exists model_id text;

-- Legacy backfill from call_type. Approximation: Tutor Bot's end-of-session feedback was
-- logged as 'feedback' even when Gemini served it, so those rows are counted as groq here.
update public.groq_usage_log
set provider = case when call_type = 'tutor_chat' then 'gemini' else 'groq' end
where provider is null;
-- model_id intentionally left null for legacy rows.

create index if not exists groq_usage_log_created_at_idx
  on public.groq_usage_log (created_at desc);

-- Manual meter values (values with no public vendor API, e.g. Supabase egress).
create table if not exists public.usage_manual_entries (
  meter_id text primary key,
  value numeric not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);
alter table public.usage_manual_entries enable row level security;
-- No public policies: service role only.

-- Database size, storage size and an activity-based MAU proxy, service role only.
create or replace function public.admin_usage_snapshot()
returns jsonb
language sql
security definer
set search_path = public, auth, storage
as $$
  select jsonb_build_object(
    'db_bytes', pg_database_size(current_database()),
    'storage_bytes', coalesce((select sum((metadata->>'size')::bigint) from storage.objects), 0),
    'total_users', (select count(*) from auth.users),
    'active_users_30d', (
      select count(distinct user_id) from auth.sessions
      where coalesce(updated_at, created_at) >= now() - interval '30 days'
    )
  );
$$;
revoke all on function public.admin_usage_snapshot() from public, anon, authenticated;
grant execute on function public.admin_usage_snapshot() to service_role;

-- Token totals by provider, model and call type since a given instant.
create or replace function public.admin_llm_usage(p_since timestamptz)
returns table (
  provider text, model_id text, call_type text, calls bigint,
  prompt_tokens bigint, completion_tokens bigint, total_tokens bigint
)
language sql
security definer
set search_path = public
as $$
  select provider, model_id, call_type, count(*),
         coalesce(sum(prompt_tokens), 0), coalesce(sum(completion_tokens), 0), coalesce(sum(total_tokens), 0)
  from public.groq_usage_log
  where created_at >= p_since
  group by provider, model_id, call_type;
$$;
revoke all on function public.admin_llm_usage(timestamptz) from public, anon, authenticated;
grant execute on function public.admin_llm_usage(timestamptz) to service_role;

-- Start of the current Pacific-time day. Gemini's requests-per-day quota resets at midnight Pacific,
-- which is about 09:00 in Budapest, so "today" for Gemini is NOT the UTC day. DST-safe.
create or replace function public.pacific_day_start()
returns timestamptz
language sql
stable
as $$
  select date_trunc('day', now() at time zone 'America/Los_Angeles') at time zone 'America/Los_Angeles';
$$;
