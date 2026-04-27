# Data Model: Blog Management Module

**Branch**: `007-blog-management` | **Phase**: 1 | **Date**: 2026-04-27

---

## Supabase Tables

### `public.categories`

```sql
create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text,
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);
```

**Indexes**:
- `categories_slug_idx` UNIQUE on `slug`
- `categories_sort_order_idx` on `sort_order ASC`

**RLS policies**: Enable RLS; authenticated users can SELECT, INSERT, UPDATE, DELETE (admin-only module).

---

### `public.blogs`

```sql
create table public.blogs (
  id                 uuid primary key default gen_random_uuid(),
  title              text not null,
  slug               text not null unique,
  excerpt            text,
  category_id        uuid references public.categories(id) not null,
  featured_image_url text,
  content            text not null default '',
  reading_time       integer,
  status             text not null default 'Draft'
                       check (status in ('Draft','Review','Scheduled','Published','Archived')),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
```

**Indexes**:
- `blogs_slug_idx` UNIQUE on `slug`
- `blogs_status_idx` on `status`
- `blogs_category_id_idx` on `category_id`
- `blogs_created_at_idx` on `created_at DESC`

**updated_at trigger**:
```sql
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger blogs_updated_at
before update on public.blogs
for each row execute function update_updated_at();
```

**RLS policies**: Enable RLS; authenticated users can SELECT, INSERT, UPDATE, DELETE.

---

## Supabase Storage

### `blog-images` bucket

| Property | Value |
|----------|-------|
| Bucket name | `blog-images` |
| Public | Yes (blog featured images are intentionally public) |
| Allowed MIME types | `image/jpeg`, `image/png`, `image/webp`, `image/gif` |
| Max file size | 5 MB |

**Upload path convention**: `{blogId}/{filename}` (e.g. `550e8400-e29b-41d4-a716/hero.jpg`)

**Public URL pattern**: Retrieved via `supabase.storage.from('blog-images').getPublicUrl(path).data.publicUrl`

---

## TypeScript Models

### `model/Category.ts`

```ts
export type Category = {
  id: string
  name: string
  slug: string
  description: string | undefined
  sortOrder: number
  isActive: boolean
  createdAt: string
}

export type CategoryFormValues = {
  name: string
  slug: string
  description: string
  sortOrder: number
  isActive: boolean
}

export const CATEGORY_FORM_DEFAULTS: CategoryFormValues = {
  name: '',
  slug: '',
  description: '',
  sortOrder: 0,
  isActive: true,
}
```

### `model/Blog.ts`

```ts
export type BlogStatus = 'Draft' | 'Review' | 'Scheduled' | 'Published' | 'Archived'

export const BLOG_STATUSES: BlogStatus[] = [
  'Draft', 'Review', 'Scheduled', 'Published', 'Archived',
]

export const STATUS_BADGE_CLASS: Record<BlogStatus, string> = {
  Draft:     'badge-secondary',
  Review:    'badge-primary',
  Scheduled: 'badge-warning',
  Published: 'badge-success',
  Archived:  'badge-dark',
}

export type Blog = {
  id: string
  title: string
  slug: string
  excerpt: string | undefined
  categoryId: string
  categoryName: string        // denormalized via JOIN for listing
  featuredImageUrl: string | undefined
  content: string
  readingTime: number | undefined
  status: BlogStatus
  createdAt: string
  updatedAt: string
}

export type BlogFormValues = {
  title: string
  slug: string
  excerpt: string
  categoryId: string
  featuredImageFile: File | null
  featuredImageUrl: string | undefined
  content: string
  readingTime: string          // string for controlled input, parsed to number on submit
  status: BlogStatus
}

export const BLOG_FORM_DEFAULTS: BlogFormValues = {
  title: '',
  slug: '',
  excerpt: '',
  categoryId: '',
  featuredImageFile: null,
  featuredImageUrl: undefined,
  content: '',
  readingTime: '',
  status: 'Draft',
}
```

---

## Repository Row Types

### `categoryRepository.ts` — DB row shape

```ts
type CategoryDbRow = {
  id: string
  name: string
  slug: string
  description: string | null
  sort_order: number
  is_active: boolean
  created_at: string
}
```

### `blogRepository.ts` — DB row shape (with JOIN)

```ts
type BlogDbRow = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  category_id: string
  categories: { name: string } | null   // from .select('*, categories(name)')
  featured_image_url: string | null
  content: string
  reading_time: number | null
  status: string
  created_at: string
  updated_at: string
}
```

---

## Entity Relationships

```
categories (1) ──< blogs (many)
  id  ←────────── category_id (FK, NOT NULL)

blog-images bucket
  path: {blogId}/{filename}
  ↑ referenced by blogs.featured_image_url
```

**Deletion rule**: A category with referenced blogs CANNOT be deleted. The application checks `blogs.count WHERE category_id = {id}` before allowing deletion.

---

## Validation Rules

### Category

| Field | Rule |
|-------|------|
| name | Required, non-empty string |
| slug | Required, unique across categories, pattern `[a-z0-9-]+` |
| description | Optional |
| sort_order | Required integer ≥ 0 |
| is_active | Required boolean |

### Blog

| Field | Rule |
|-------|------|
| title | Required, non-empty string |
| slug | Required, unique across blogs (excluding self on edit), pattern `[a-z0-9-]+` |
| excerpt | Optional |
| category_id | Required, must reference an existing active category |
| featured_image_file | Optional on edit (retains existing if omitted); MIME: jpeg/png/webp/gif; max 5 MB |
| content | Required (TinyMCE; non-empty HTML) |
| reading_time | Optional positive integer |
| status | Required, one of BlogStatus union values |

---

## State Transitions: Blog Status

```
Draft ──→ Review ──→ Scheduled ──→ Published ──→ Archived
  └──────────────────────────────────────────→ Archived
  └──→ (any status allowed via dropdown — no enforced FSM)
```

No server-side state machine enforced; the status dropdown allows free selection of any value. Transition logic is at the author's discretion.
