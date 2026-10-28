-- Avalon: automatic crash capture (Report a problem, phase 2).
--
-- The browser silently batches uncaught errors, unhandled promise rejections and React render
-- crashes and posts them to /api/connect?action=client-errors (signed-out visitors too). The API
-- fingerprints each error and calls record_client_error() with the service role, so the same bug
-- firing 500 times stays one row with a counter. Admins read them on /admin/feedback?tab=errors
-- through /api/admin/overview?resource=client-errors.

create table public.client_errors (
  -- sha1 of kind + normalised message + top stack frame (api/_lib/clientErrors.ts).
  fingerprint text primary key check (fingerprint ~ '^[0-9a-f]{40}$'),
  kind text not null check (kind in ('error', 'rejection', 'render')),
  message text not null check (char_length(message) between 1 and 500),
  stack text check (stack is null or char_length(stack) <= 4000),
  last_page_path text check (last_page_path is null or char_length(last_page_path) <= 500),
  last_app_version text check (last_app_version is null or char_length(last_app_version) <= 40),
  last_browser text check (last_browser is null or char_length(last_browser) <= 120),
  occurrences bigint not null default 0,
  -- A resolved error that happens again reopens itself; ignored ones stay ignored.
  status text not null default 'open' check (status in ('open', 'resolved', 'ignored')),
  status_changed_at timestamptz,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create index client_errors_last_seen_idx on public.client_errors (last_seen_at desc);
create index client_errors_first_seen_idx on public.client_errors (first_seen_at desc);

-- Per-day counters for "this week" totals.
create table public.client_error_days (
  fingerprint text not null references public.client_errors(fingerprint) on delete cascade,
  day date not null,
  occurrences integer not null default 0,
  primary key (fingerprint, day)
);

-- Signed-in users who hit the error ("users affected"); signed-out visitors only add to counts.
create table public.client_error_users (
  fingerprint text not null references public.client_errors(fingerprint) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  last_seen_at timestamptz not null default now(),
  primary key (fingerprint, user_id)
);

alter table public.client_errors enable row level security;
alter table public.client_error_days enable row level security;
alter table public.client_error_users enable row level security;
-- No public policies: only the service role (Vercel API routes) reads/writes these tables.

-- Records p_count occurrences of one error. Returns false when a brand-new fingerprint is
-- refused because more than 200 new ones appeared in the last hour (a flood guard: the
-- endpoint accepts signed-out visitors, so random messages must not grow the table unbounded).
create or replace function public.record_client_error(
  p_fingerprint text,
  p_kind text,
  p_message text,
  p_stack text,
  p_page_path text,
  p_app_version text,
  p_browser text,
  p_user_id uuid,
  p_count integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer := greatest(1, least(coalesce(p_count, 1), 1000));
begin
  if not exists (select 1 from public.client_errors where fingerprint = p_fingerprint) then
    if (select count(*) from public.client_errors where first_seen_at > now() - interval '1 hour') >= 200 then
      return false;
    end if;
    insert into public.client_errors (fingerprint, kind, message, stack)
    values (p_fingerprint, p_kind, p_message, p_stack)
    on conflict (fingerprint) do nothing;
  end if;

  update public.client_errors
  set occurrences = occurrences + v_count,
      stack = coalesce(p_stack, stack),
      last_page_path = p_page_path,
      last_app_version = p_app_version,
      last_browser = p_browser,
      last_seen_at = now(),
      status = case when status = 'resolved' then 'open' else status end,
      status_changed_at = case when status = 'resolved' then now() else status_changed_at end
  where fingerprint = p_fingerprint;

  insert into public.client_error_days (fingerprint, day, occurrences)
  values (p_fingerprint, current_date, v_count)
  on conflict (fingerprint, day) do update
    set occurrences = public.client_error_days.occurrences + excluded.occurrences;

  if p_user_id is not null then
    insert into public.client_error_users (fingerprint, user_id)
    values (p_fingerprint, p_user_id)
    on conflict (fingerprint, user_id) do update set last_seen_at = now();
  end if;

  return true;
end;
$$;

-- Admin inbox: every error with its 7-day count and affected users, busiest first.
create or replace function public.admin_client_error_stats(p_limit integer default 200)
returns table (
  fingerprint text,
  kind text,
  message text,
  stack text,
  last_page_path text,
  last_app_version text,
  last_browser text,
  occurrences bigint,
  occurrences_7d bigint,
  users bigint,
  users_7d bigint,
  status text,
  status_changed_at timestamptz,
  first_seen_at timestamptz,
  last_seen_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    e.fingerprint, e.kind, e.message, e.stack, e.last_page_path, e.last_app_version, e.last_browser,
    e.occurrences,
    coalesce((select sum(d.occurrences) from public.client_error_days d
              where d.fingerprint = e.fingerprint and d.day > current_date - 7), 0)::bigint,
    (select count(*) from public.client_error_users u where u.fingerprint = e.fingerprint),
    (select count(*) from public.client_error_users u
     where u.fingerprint = e.fingerprint and u.last_seen_at > now() - interval '7 days'),
    e.status, e.status_changed_at, e.first_seen_at, e.last_seen_at
  from public.client_errors e
  order by 9 desc, e.last_seen_at desc
  limit greatest(1, least(coalesce(p_limit, 200), 500));
$$;

revoke all on function public.record_client_error(text, text, text, text, text, text, text, uuid, integer) from public, anon, authenticated;
grant execute on function public.record_client_error(text, text, text, text, text, text, text, uuid, integer) to service_role;
revoke all on function public.admin_client_error_stats(integer) from public, anon, authenticated;
grant execute on function public.admin_client_error_stats(integer) to service_role;
