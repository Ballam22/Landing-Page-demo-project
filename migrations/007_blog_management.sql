-- Migration: 007 Blog Management
-- Run this in Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)

create or replace function public.is_blog_manager()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users
    where id = auth.uid()
      and role in ('Admin', 'Manager')
  );
$$;

-- Categories table
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text,
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

create unique index if not exists categories_slug_idx on public.categories(slug);
create index if not exists categories_sort_order_idx on public.categories(sort_order asc);

alter table public.categories enable row level security;
drop policy if exists "Authenticated users can manage categories" on public.categories;
drop policy if exists "Admins and managers can manage categories" on public.categories;
create policy "Admins and managers can manage categories"
  on public.categories for all
  to authenticated
  using (public.is_blog_manager())
  with check (public.is_blog_manager());

-- Blogs table
create table if not exists public.blogs (
  id                 uuid primary key default gen_random_uuid(),
  title              text not null,
  slug               text not null unique,
  excerpt            text,
  category_id        uuid not null references public.categories(id),
  featured_image_url text,
  content            text not null default '',
  reading_time       integer,
  status             text not null default 'Draft'
                       check (status in ('Draft','Review','Scheduled','Published','Archived')),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create unique index if not exists blogs_slug_idx on public.blogs(slug);
create index if not exists blogs_status_idx on public.blogs(status);
create index if not exists blogs_category_id_idx on public.blogs(category_id);
create index if not exists blogs_created_at_idx on public.blogs(created_at desc);

-- updated_at trigger
create or replace function public.update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger blogs_updated_at
  before update on public.blogs
  for each row execute function public.update_updated_at();

alter table public.blogs enable row level security;
drop policy if exists "Authenticated users can manage blogs" on public.blogs;
drop policy if exists "Admins and managers can manage blogs" on public.blogs;
create policy "Admins and managers can manage blogs"
  on public.blogs for all
  to authenticated
  using (public.is_blog_manager())
  with check (public.is_blog_manager());

-- Storage bucket (run separately if needed)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'blog-images',
  'blog-images',
  true,
  5242880,
  array['image/jpeg','image/png','image/webp','image/gif']
)
on conflict (id) do nothing;

drop policy if exists "Public read for blog-images" on storage.objects;
create policy "Public read for blog-images"
  on storage.objects for select
  to public
  using (bucket_id = 'blog-images');

drop policy if exists "Authenticated upload to blog-images" on storage.objects;
create policy "Authenticated upload to blog-images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'blog-images' and public.is_blog_manager());

drop policy if exists "Authenticated update blog-images" on storage.objects;
create policy "Authenticated update blog-images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'blog-images' and public.is_blog_manager())
  with check (bucket_id = 'blog-images' and public.is_blog_manager());

drop policy if exists "Authenticated delete from blog-images" on storage.objects;
create policy "Authenticated delete from blog-images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'blog-images' and public.is_blog_manager());

-- Default categories
insert into public.categories (name, slug, description, sort_order, is_active)
values
  (
    'Digital Currencies',
    'digital-currencies',
    'Posts about cryptocurrency, blockchain, digital assets, and market trends.',
    10,
    true
  ),
  (
    'Tech',
    'tech',
    'Posts about software, hardware, startups, AI, and technology news.',
    20,
    true
  ),
  (
    'Science',
    'science',
    'Posts about research, discoveries, space, health science, and innovation.',
    30,
    true
  )
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_active = true;
