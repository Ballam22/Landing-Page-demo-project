# Quickstart: Blog Management Module

**Branch**: `007-blog-management` | **Date**: 2026-04-27

This document covers everything needed to set up the database schema, storage bucket, and new dependencies before development begins.

---

## 1. Install New Dependencies

```bash
npm install tinymce @tinymce/tinymce-react
npm install --save-dev @types/tinymce
```

TinyMCE self-hosted assets must be copied to the `public/` folder so Vite serves them:

```bash
# From project root
cp -r node_modules/tinymce public/tinymce
```

Add to `.gitignore`:
```
/public/tinymce
```

The `<Editor tinymceScriptSrc='/tinymce/tinymce.min.js' />` prop points Vite at the self-hosted build.

---

## 2. Create Supabase Tables

Run the following SQL in the Supabase SQL Editor (Dashboard → SQL Editor → New Query):

```sql
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

-- Enable RLS
alter table public.categories enable row level security;
create policy "Authenticated users can manage categories"
  on public.categories for all
  to authenticated
  using (true)
  with check (true);

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

-- updated_at auto-trigger
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

-- Enable RLS
alter table public.blogs enable row level security;
create policy "Authenticated users can manage blogs"
  on public.blogs for all
  to authenticated
  using (true)
  with check (true);
```

---

## 3. Create Supabase Storage Bucket

In the Supabase Dashboard → Storage → New Bucket:

| Setting | Value |
|---------|-------|
| Bucket name | `blog-images` |
| Public bucket | ✅ Yes |
| Allowed MIME types | `image/jpeg, image/png, image/webp, image/gif` |
| Max upload size | `5 MB` |

Or via SQL:

```sql
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'blog-images',
  'blog-images',
  true,
  5242880,
  array['image/jpeg','image/png','image/webp','image/gif']
)
on conflict (id) do nothing;

create policy "Public read for blog-images"
  on storage.objects for select
  to public
  using (bucket_id = 'blog-images');

create policy "Authenticated upload to blog-images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'blog-images');

create policy "Authenticated delete from blog-images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'blog-images');
```

---

## 4. Environment Variables

Ensure `.env` has:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

No additional env vars are needed for TinyMCE when self-hosted.

---

## 5. Verify Setup

1. Run `npm run dev` — no compile errors
2. Navigate to `/blog-management/categories` — page loads without errors
3. In Supabase Dashboard, confirm `categories` and `blogs` tables exist
4. In Supabase Storage, confirm `blog-images` bucket exists and is public
5. Create one test category — it should appear in the table
6. Create one test blog with that category — it should appear in the blog table

---

## 6. Module File Locations (cheat sheet)

```
src/app/modules/blog-management/
├── BlogManagementPage.tsx
├── category-management/
│   ├── CategoryManagementPage.tsx
│   ├── CategoryManagementContext.tsx
│   ├── model/Category.ts
│   ├── repository/categoryRepository.ts
│   ├── service/categoryService.ts
│   ├── controller/useCategoryController.ts
│   ├── hooks/useCategoryManagement.ts
│   └── components/
│       ├── CategoriesTable.tsx
│       ├── CategoryModal.tsx
│       ├── CategoryModalForm.tsx
│       └── DeleteConfirmDialog.tsx
└── blog-posts/
    ├── BlogListPage.tsx
    ├── BlogFormPage.tsx
    ├── BlogManagementContext.tsx
    ├── model/Blog.ts
    ├── repository/blogRepository.ts
    ├── service/blogService.ts
    ├── controller/useBlogController.ts
    ├── hooks/useBlogManagement.ts
    └── components/
        ├── BlogsTable.tsx
        ├── BlogForm.tsx
        ├── StatusBadge.tsx
        └── DeleteConfirmDialog.tsx
```

**Routing** (add to `src/app/routing/PrivateRoutes.tsx`):
```tsx
<Route path='blog-management'>
  <Route index element={<Navigate to='categories' />} />
  <Route path='categories' element={<SuspensedView><CategoryManagementPage /></SuspensedView>} />
  <Route path='blogs' element={<SuspensedView><BlogListPage /></SuspensedView>} />
  <Route path='blogs/new' element={<SuspensedView><BlogFormPage /></SuspensedView>} />
  <Route path='blogs/:id/edit' element={<SuspensedView><BlogFormPage /></SuspensedView>} />
</Route>
```
