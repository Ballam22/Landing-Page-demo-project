# Implementation Plan: Blog Management Module

**Branch**: `007-blog-management` | **Date**: 2026-04-27 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/007-blog-management/spec.md`

---

## Summary

Implement a Blog Management admin module with two sub-sections: Category Management (modal-based CRUD) and Blog Management (full-page form CRUD with TinyMCE rich text and Supabase Storage image uploads). The module follows the same MVC layered architecture as the existing User Management module — model → repository → service → controller hook → context → page components — and is wired into the Demo1 layout via nested React Router routes.

---

## Technical Context

**Language/Version**: TypeScript ^5.3.3 + React ^18.2.0  
**Primary Dependencies**: React Query 3.38.0, Formik 2.2.9, Yup ^1.0.0, React Table ^7.7.0, React Intl ^6.4.4, React Router DOM 6.30.3, Bootstrap 5 + Metronic SCSS  
**New Dependency**: `tinymce` + `@tinymce/tinymce-react` (self-hosted; no API key needed)  
**Storage**: Database: Supabase (PostgreSQL) via `src/app/lib/supabaseClient.ts` | Files: Supabase Storage `blog-images` bucket (public)  
**Testing**: Manual browser verification (no automated tests required per constitution)  
**Target Platform**: Web (Demo1 Metronic layout, auth-protected routes)  
**Project Type**: Web application — admin module  
**Performance Goals**: Table renders ≤ 2 seconds for up to 500 rows; lazy-loaded route bundles  
**Constraints**: No new Supabase client instantiation; no mock data; no inline styles; zero ESLint warnings  
**Scale/Scope**: Admin-only; single-tenant; ~500 blog posts expected

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked post-design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Technology Stack | ✅ PASS (with justified exception) | All locked deps used. TinyMCE is a justified new dependency — no rich-text editor exists in the current stack and the spec explicitly mandates it. |
| II. Project Structure | ✅ PASS | Module under `src/app/modules/blog-management/`; routes in `PrivateRoutes.tsx`; Metronic core untouched. |
| III. TypeScript Rules | ✅ PASS | Strict mode, no `any`, path aliases, `.ts`/`.tsx` only. |
| IV. Component & Styling | ✅ PASS | Keenicons, Bootstrap utilities, Metronic classes; no inline styles; SCSS colocated. |
| V. Routing Rules | ✅ PASS | Protected nested routes; kebab-case paths; `React.lazy()` + `Suspense`. |
| VI. Data Fetching | ✅ PASS | All DB calls via `src/app/lib/supabaseClient.ts`; React Query for state; no raw `useEffect` data loops. |
| VII. Forms Rules | ✅ PASS | Formik + Yup; visible validation errors; loading state on submit. |
| VIII. Internationalisation | ✅ PASS | All user-facing strings via React Intl; keys in `en.json` and all locale files. |
| IX. Code Quality | ✅ PASS | ESLint zero-warnings target; PascalCase components; camelCase hooks; no commented-out code. |
| X. Storage Rules | ⚠️ AMENDED | Constitution says `avatars` bucket; blog images require a separate `blog-images` bucket. Amendment justified: asset types are distinct and bucket policies differ. The pattern (shared Supabase client, `getPublicUrl`, client-side validation) remains identical. |

**Storage Gate Amendment**: The `blog-images` bucket is a justified extension of Principle X, not a violation. All other storage rules (client path, URL retrieval, client-side MIME/size validation) are followed exactly.

---

## Project Structure

### Documentation (this feature)

```text
specs/007-blog-management/
├── plan.md              ← this file
├── spec.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-contracts.md
├── checklists/
│   └── requirements.md
└── tasks.md             ← created by /speckit.tasks
```

### Source Code

```text
src/
├── app/
│   ├── lib/
│   │   └── supabaseClient.ts          ← existing; unchanged
│   ├── routing/
│   │   └── PrivateRoutes.tsx          ← add blog-management nested routes
│   └── modules/
│       └── blog-management/
│           ├── BlogManagementPage.tsx                   ← parent router; redirects to /categories
│           ├── category-management/
│           │   ├── CategoryManagementPage.tsx
│           │   ├── CategoryManagementContext.tsx
│           │   ├── model/
│           │   │   └── Category.ts
│           │   ├── repository/
│           │   │   └── categoryRepository.ts
│           │   ├── service/
│           │   │   └── categoryService.ts
│           │   ├── controller/
│           │   │   └── useCategoryController.ts
│           │   ├── hooks/
│           │   │   └── useCategoryManagement.ts
│           │   └── components/
│           │       ├── CategoriesTable.tsx
│           │       ├── CategoryModal.tsx
│           │       ├── CategoryModalForm.tsx
│           │       └── DeleteConfirmDialog.tsx
│           └── blog-posts/
│               ├── BlogListPage.tsx
│               ├── BlogFormPage.tsx
│               ├── BlogManagementContext.tsx
│               ├── model/
│               │   └── Blog.ts
│               ├── repository/
│               │   └── blogRepository.ts
│               ├── service/
│               │   └── blogService.ts
│               ├── controller/
│               │   └── useBlogController.ts
│               ├── hooks/
│               │   └── useBlogManagement.ts
│               └── components/
│                   ├── BlogsTable.tsx
│                   ├── BlogForm.tsx
│                   ├── StatusBadge.tsx
│                   └── DeleteConfirmDialog.tsx
├── _metronic/
│   └── i18n/
│       └── messages/
│           └── en.json                ← add CATEGORY_MANAGEMENT.* and BLOG_MANAGEMENT.* keys
└── index.tsx                          ← unchanged

public/
└── tinymce/                           ← copied from node_modules/tinymce (gitignored)
```

**Structure Decision**: Single React application with feature module under `src/app/modules/blog-management/`. Follows the established Metronic project layout exactly. Two sub-modules (category-management, blog-posts) are sibling folders within the parent module, each with their own MVC layers.

---

## Complexity Tracking

| Item | Why Needed | Simpler Alternative Rejected Because |
|------|------------|-------------------------------------|
| TinyMCE (`tinymce` + `@tinymce/tinymce-react`) | Spec explicitly mandates TinyMCE for rich-text content editing | No equivalent editor exists in the current locked stack; textarea would not satisfy the rich-text requirement |
| `blog-images` storage bucket (not `avatars`) | Blog featured images are a distinct asset class with a public bucket policy; avatars are private | Mixing blog images into the avatars bucket would conflate access-control policies and make future lifecycle management harder |
| Full-page route for blog form (not modal) | Spec explicitly states "full-page form (not a modal)"; TinyMCE embedded in a Bootstrap modal has z-index and focus conflicts | Modal approach would require significant workarounds for TinyMCE toolbar/dialogs |
| Nested routes under `/blog-management` | Two sub-sections (categories, blogs) + two blog sub-routes (list, form) require route nesting | Flat routes would break the hierarchical URL structure and make navigation state harder to manage |

---

## Implementation Phases

### Phase F (Foundation)
*Database, storage, and dependency setup. Must be done before any code.*

1. Run Supabase SQL from `quickstart.md` to create `categories` and `blogs` tables with RLS and the `updated_at` trigger.
2. Create `blog-images` storage bucket (public) with MIME type restrictions and 5 MB limit.
3. `npm install tinymce @tinymce/tinymce-react` and copy TinyMCE assets to `public/tinymce/`.

### Phase C (Category Management)
*Full CRUD for categories. Delivers independently testable P1 story.*

1. `model/Category.ts` — types, form values, defaults.
2. `repository/categoryRepository.ts` — `getAll`, `create`, `update`, `remove`, `isSlugTaken`, `countByCategory` (for deletion guard).
3. `service/categoryService.ts` — slug generation utility `toSlug()`, `createCategory`, `updateCategory`, `deleteCategory` (with deletion guard).
4. `controller/useCategoryController.ts` — React Query `useQuery` + `useMutation`; query key `['categories']`.
5. `hooks/useCategoryManagement.ts` — context consumer hook.
6. `CategoryManagementContext.tsx` — provider wrapping controller.
7. `components/CategoriesTable.tsx` — react-table, all required columns, Edit/Delete callbacks.
8. `components/CategoryModalForm.tsx` — Formik + Yup, slug auto-derivation from name, i18n strings.
9. `components/CategoryModal.tsx` — Bootstrap modal wrapper.
10. `components/DeleteConfirmDialog.tsx` — confirmation dialog with error message slot for deletion-guard case.
11. `CategoryManagementPage.tsx` — assembles table, modal, dialog; Add Category button.
12. i18n keys: `CATEGORY_MANAGEMENT.*` in `en.json`.
13. Route: add `/blog-management/categories` to `PrivateRoutes.tsx`.
14. Sidebar link for Category Management (Metronic aside menu).

### Phase B (Blog Management)
*Full CRUD for blogs. Depends on Phase C for category dropdown.*

1. `model/Blog.ts` — types, `BlogStatus` union, `STATUS_BADGE_CLASS` map, form values, defaults.
2. `repository/blogRepository.ts` — `getAll` (JOIN categories for name), `getById`, `create`, `update`, `remove`, `isSlugTaken(slug, excludeId?)`, `uploadImage`, `deleteImage`.
3. `service/blogService.ts` — `toSlug()` utility (shared or duplicated), image validation (MIME, size), `createBlog`, `updateBlog`, `deleteBlog`.
4. `controller/useBlogController.ts` — React Query; query keys `['blogs']` and `['blogs', id]`.
5. `hooks/useBlogManagement.ts` — context consumer hook.
6. `BlogManagementContext.tsx` — provider wrapping blog controller + category controller (for dropdown).
7. `components/StatusBadge.tsx` — pure presentational badge component.
8. `components/BlogsTable.tsx` — react-table; featured image thumbnail, all columns, StatusBadge, Edit/Delete callbacks.
9. `components/BlogForm.tsx` — Formik + Yup; all fields; TinyMCE integration; slug auto-derivation from title; image upload preview; category dropdown from context.
10. `components/DeleteConfirmDialog.tsx` — confirmation dialog (can reuse/adapt from category sub-module).
11. `BlogListPage.tsx` — assembles table, dialog; "Add Blog" button navigates to `/blog-management/blogs/new`.
12. `BlogFormPage.tsx` — reads `:id` param; fetches blog in edit mode; renders `BlogForm`; navigates back on success/cancel.
13. `BlogManagementPage.tsx` — parent route component; redirects index to `/categories`.
14. i18n keys: `BLOG_MANAGEMENT.*` in `en.json`.
15. Routes: add nested blog routes to `PrivateRoutes.tsx`.
16. Sidebar link for Blog Management.

### Phase V (Verification)
*Manual browser smoke tests against all acceptance scenarios.*

1. Category CRUD — create, edit, delete, deletion guard (category with blogs cannot be deleted).
2. Blog listing — all columns visible, status badge colors correct.
3. Blog create — slug auto-generation, image upload, TinyMCE content, all statuses.
4. Blog edit — pre-filled form, updated_at reflects save time.
5. Blog delete — confirmation required, post removed from table.
6. Slug uniqueness — duplicate slug rejected with clear error on both categories and blogs.
7. `npm run lint` — zero warnings.
8. Dark mode visual check — no hardcoded colors broken.
