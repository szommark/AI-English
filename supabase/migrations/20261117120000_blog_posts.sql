-- Avalon blog (/blog), ported from the tobbmintangol.hu blog engine.
--
-- A post is Markdown (Hungarian base text, optional EN/DE versions). A post with external_url is
-- a card only: it opens that address (the older posts on tobbmintangol.hu). Without one, the post
-- is read on avln.hu at /blog/<slug>.
--
-- Anyone can read published posts; only admins write, straight from the browser through RLS
-- (no API function: Vercel Hobby caps the deployment at 12). Pictures go to the public
-- blog-images bucket, which only admins can write to.

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 200),
  title text not null check (char_length(title) between 1 and 200),
  excerpt text not null check (char_length(excerpt) between 1 and 500),
  content text not null default '',
  title_en text check (char_length(title_en) <= 200),
  excerpt_en text check (char_length(excerpt_en) <= 500),
  content_en text,
  title_de text check (char_length(title_de) <= 200),
  excerpt_de text check (char_length(excerpt_de) <= 500),
  content_de text,
  image_url text check (char_length(image_url) <= 500),
  external_url text check (external_url ~ '^https://' and char_length(external_url) <= 500),
  published boolean not null default false,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- A post read on avln.hu needs its text; a card that opens elsewhere doesn't.
  constraint blog_posts_has_body check (external_url is not null or char_length(btrim(content)) > 0)
);

create index blog_posts_published_at_idx on public.blog_posts (published_at desc);

create or replace function public.blog_posts_touch()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger blog_posts_touch
  before update on public.blog_posts
  for each row execute function public.blog_posts_touch();

alter table public.blog_posts enable row level security;

grant select on public.blog_posts to anon, authenticated;
grant insert, update, delete on public.blog_posts to authenticated;

-- Admins also see drafts (the editor lists them).
create policy "blog_posts_read"
  on public.blog_posts for select to anon, authenticated
  using (published or public.current_user_role() = 'admin');

create policy "blog_posts_admin_insert"
  on public.blog_posts for insert to authenticated
  with check (public.current_user_role() = 'admin');

create policy "blog_posts_admin_update"
  on public.blog_posts for update to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

create policy "blog_posts_admin_delete"
  on public.blog_posts for delete to authenticated
  using (public.current_user_role() = 'admin');

-- Post pictures: public to read (the bucket is public), 5 MB, admins upload.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('blog-images', 'blog-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do nothing;

create policy "blog_images_admin_insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'blog-images' and public.current_user_role() = 'admin');

create policy "blog_images_admin_update"
  on storage.objects for update to authenticated
  using (bucket_id = 'blog-images' and public.current_user_role() = 'admin');

create policy "blog_images_admin_delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'blog-images' and public.current_user_role() = 'admin');
