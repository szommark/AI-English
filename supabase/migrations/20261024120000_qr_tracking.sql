-- Avalon: admin QR codes that point at https://avnl.hu/?qr=<slug>.
--
-- A scan lands on the site with ?qr=<slug>; the browser logs it through log_qr_scan()
-- (anonymous, so it works before sign-in) and remembers the slug for 30 days. If that
-- browser then creates an account, the slug rides along in the sign-up metadata and
-- handle_new_user() records the registration in qr_signups. The admin overview reads
-- everything through the service role (api/admin/overview.ts ?resource=qr).

create table public.qr_codes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]{4,16}$'),
  label text not null check (char_length(label) between 1 and 80),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.qr_scans (
  id bigint generated always as identity primary key,
  qr_code_id uuid not null references public.qr_codes(id) on delete cascade,
  visitor_id uuid not null,
  scanned_at timestamptz not null default now()
);

create index qr_scans_code_idx on public.qr_scans (qr_code_id, scanned_at desc);

create table public.qr_signups (
  user_id uuid primary key references auth.users(id) on delete cascade,
  qr_code_id uuid not null references public.qr_codes(id) on delete cascade,
  visitor_id uuid,
  created_at timestamptz not null default now()
);

create index qr_signups_code_idx on public.qr_signups (qr_code_id, created_at desc);

-- No policies: browsers never read these tables; the service role bypasses RLS.
alter table public.qr_codes enable row level security;
alter table public.qr_scans enable row level security;
alter table public.qr_signups enable row level security;

-- The one call a browser makes. Unknown slugs are ignored, and the same visitor
-- re-opening the same link within a minute counts once (double loads, back button).
create or replace function public.log_qr_scan(p_slug text, p_visitor uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code_id uuid;
begin
  if p_slug is null or p_visitor is null then
    return false;
  end if;

  select id into v_code_id from public.qr_codes where slug = p_slug;
  if v_code_id is null then
    return false;
  end if;

  if exists (
    select 1 from public.qr_scans
    where qr_code_id = v_code_id
      and visitor_id = p_visitor
      and scanned_at > now() - interval '1 minute'
  ) then
    return true;
  end if;

  insert into public.qr_scans (qr_code_id, visitor_id) values (v_code_id, p_visitor);
  return true;
end;
$$;

revoke all on function public.log_qr_scan(text, uuid) from public;
grant execute on function public.log_qr_scan(text, uuid) to anon, authenticated, service_role;

-- Same body as 20260831130000_roles_and_connections.sql plus the QR attribution. The
-- attribution sits in its own block so a bad metadata value can never block a sign-up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_slug text := new.raw_user_meta_data ->> 'qr_code';
  v_visitor text := new.raw_user_meta_data ->> 'qr_visitor';
begin
  insert into public.profiles (user_id) values (new.id);

  if v_slug is not null then
    begin
      insert into public.qr_signups (user_id, qr_code_id, visitor_id)
      select new.id, c.id,
        case when v_visitor ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
          then v_visitor::uuid end
      from public.qr_codes c
      where c.slug = v_slug
      on conflict (user_id) do nothing;
    exception when others then
      null;
    end;
  end if;

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

-- Per-code totals for the admin overview (service role only).
create or replace function public.admin_qr_stats()
returns table (
  id uuid,
  slug text,
  label text,
  created_at timestamptz,
  scans bigint,
  unique_visitors bigint,
  scans_7d bigint,
  last_scan_at timestamptz,
  signups bigint,
  confirmed_signups bigint
)
language sql
security definer
stable
set search_path = public
as $$
  select
    c.id, c.slug, c.label, c.created_at,
    coalesce(s.scans, 0),
    coalesce(s.unique_visitors, 0),
    coalesce(s.scans_7d, 0),
    s.last_scan_at,
    coalesce(r.signups, 0),
    coalesce(r.confirmed_signups, 0)
  from public.qr_codes c
  left join (
    select qr_code_id,
      count(*) as scans,
      count(distinct visitor_id) as unique_visitors,
      count(*) filter (where scanned_at > now() - interval '7 days') as scans_7d,
      max(scanned_at) as last_scan_at
    from public.qr_scans
    group by qr_code_id
  ) s on s.qr_code_id = c.id
  left join (
    select q.qr_code_id,
      count(*) as signups,
      count(*) filter (where u.email_confirmed_at is not null) as confirmed_signups
    from public.qr_signups q
    join auth.users u on u.id = q.user_id
    group by q.qr_code_id
  ) r on r.qr_code_id = c.id
  order by c.created_at desc;
$$;

revoke all on function public.admin_qr_stats() from public, anon, authenticated;
grant execute on function public.admin_qr_stats() to service_role;
