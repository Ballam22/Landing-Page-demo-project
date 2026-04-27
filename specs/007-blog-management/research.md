# Research: Blog Management Module

**Branch**: `007-blog-management` | **Phase**: 0 | **Date**: 2026-04-27

---

## Decision 1: Rich Text Editor — TinyMCE

**Decision**: Use `@tinymce/tinymce-react` with TinyMCE Cloud (no-download CDN mode) or self-hosted via `tinymce` npm package.

**Rationale**: The spec explicitly requires TinyMCE. The `@tinymce/tinymce-react` wrapper integrates cleanly with React 18 and Formik via controlled `onEditorChange` callback. Using the npm package (`tinymce` + `@tinymce/tinymce-react`) avoids CDN dependency and API key requirement for basic features; a free API key from tiny.cloud covers the cloud-hosted approach if preferred.

**Alternatives considered**:
- Quill / react-quill — smaller bundle but spec explicitly requires TinyMCE
- Draft.js — more complex, no direct spec requirement
- Tiptap — modern but not required by spec

**Implementation pattern**:
```tsx
import {Editor} from '@tinymce/tinymce-react'

<Editor
  tinymceScriptSrc='/tinymce/tinymce.min.js'   // self-hosted
  value={formik.values.content}
  onEditorChange={(content) => formik.setFieldValue('content', content)}
  init={{plugins: 'link image lists table code', toolbar: '...', ...}}
/>
```

**Constitution note**: TinyMCE is a new major dependency not in package.json. Justification: no existing rich-text editor is available in the locked stack; the spec explicitly mandates TinyMCE; no Metronic or Bootstrap alternative provides comparable authoring capability.

---

## Decision 2: Storage Bucket — blog-images (not avatars)

**Decision**: Create and use a separate `blog-images` Supabase Storage bucket for blog featured images.

**Rationale**: The spec explicitly specifies the `blog-images` bucket. Blog images are a conceptually distinct asset class from user avatars — mixing them in the `avatars` bucket would make access-control policies and lifecycle management harder. The constitution's reference to the `avatars` bucket was written before blog content existed.

**Constitution amendment required**: Principle X currently mandates the `avatars` bucket for all uploads. This feature requires a `blog-images` bucket. The amendment is: "Storage bucket must be appropriate to the asset type — avatars bucket for user profile images, blog-images bucket for blog featured images." This is a justified extension, not a violation.

**Implementation**: Same pattern as avatars — `supabase.storage.from('blog-images').upload(path, file)` and `getPublicUrl(path)`.

**Bucket policy**: Public (blog featured images are intentionally public-facing assets).

---

## Decision 3: Slug Auto-Generation Pattern

**Decision**: Generate slugs client-side using a utility function: lowercase → trim → replace non-alphanumeric with hyphens → collapse multiple hyphens → strip leading/trailing hyphens.

**Rationale**: Consistent with how user management handles similar derived fields. Client-side generation gives instant feedback. Uniqueness validated on submit via repository query.

**Implementation**:
```ts
export function toSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}
```

**Uniqueness check**: Repository function `isSlugTaken(slug, excludeId?)` queries Supabase. The `excludeId` parameter allows edit mode to skip self-comparison.

---

## Decision 4: Blog Form — Full-Page Route (not Modal)

**Decision**: The "Add Blog" and "Edit Blog" forms are separate routed pages, not modals. The listing page routes to `/blog-management/blogs/new` and `/blog-management/blogs/:id/edit`.

**Rationale**: Spec explicitly states "full-page form (not a modal)." Full-page routes support browser back-navigation, bookmarking, and are appropriate for long forms with a rich-text editor. React Router nested routes handle this cleanly.

**Route structure**:
```
/blog-management                  → BlogManagementPage (redirect to /categories)
/blog-management/categories       → CategoryManagementPage
/blog-management/blogs            → BlogListPage
/blog-management/blogs/new        → BlogFormPage (mode=add)
/blog-management/blogs/:id/edit   → BlogFormPage (mode=edit)
```

---

## Decision 5: Category Deletion Guard

**Decision**: Block deletion of a category that has one or more blogs referencing it. Show an inline error message in the confirmation dialog.

**Rationale**: Matches the assumption documented in spec.md. Orphaned blog records (category_id pointing to a deleted category) would require nullable FK or cascade — both need schema decisions better deferred. Blocking is safest without schema change.

**Implementation**: Before delete, call `blogRepository.countByCategory(categoryId)`. If count > 0, show error. No delete proceeds.

---

## Decision 6: updated_at Handling

**Decision**: Rely on a Supabase PostgreSQL trigger (`moddatetime` extension or manual trigger) to auto-update `updated_at` on every row update. No application-layer timestamp management.

**Rationale**: Database-managed timestamps are authoritative and avoid clock skew from client-side Date.now(). The spec states "updated_at auto-updates on every save" — this is naturally handled at the DB level.

**SQL trigger** (to include in migration/quickstart):
```sql
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger blogs_updated_at
before update on blogs
for each row execute function update_updated_at();
```

---

## Decision 7: React Table for Listing Tables

**Decision**: Use `react-table` v7 (already in the locked stack) for both the Categories table and Blogs table.

**Rationale**: Already used in user management. Constitution locks the stack — no alternative table library needed.

---

## Decision 8: i18n Key Namespace

**Decision**: Prefix all translation keys with `BLOG_MANAGEMENT.` for blog-related strings and `CATEGORY_MANAGEMENT.` for category-related strings.

**Rationale**: Consistent with existing `USER_MANAGEMENT.` namespace pattern. Keys go in `src/_metronic/i18n/messages/en.json` (and all other locale files).
