# Tasks: Blog Management Module

**Input**: Design documents from `/specs/007-blog-management/`  
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/ui-contracts.md ✅ quickstart.md ✅

**Tests**: No automated test tasks — manual browser verification is the acceptance criterion per the project constitution.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no unresolved dependencies on earlier tasks in same phase)
- **[Story]**: User story this task belongs to (US1–US5)
- Paths are relative to `src/app/modules/blog-management/` unless otherwise stated

---

## Phase 1: Setup (Dependencies & Project Scaffold)

**Purpose**: Install new dependencies and scaffold the module directory structure. Must be done before any code is written.

- [ ] T001 Install TinyMCE packages: run `npm install tinymce @tinymce/tinymce-react` in project root
- [ ] T002 Copy TinyMCE self-hosted assets: `cp -r node_modules/tinymce public/tinymce` (or equivalent on Windows)
- [ ] T003 Add `public/tinymce/` to `.gitignore` in project root
- [ ] T004 [P] Create module folder skeleton: `src/app/modules/blog-management/category-management/{model,repository,service,controller,hooks,components}/` and `src/app/modules/blog-management/blog-posts/{model,repository,service,controller,hooks,components}/`
- [ ] T005 [P] Create `src/app/modules/blog-management/BlogManagementPage.tsx` — parent route component that renders `<Outlet />` and redirects index to `/blog-management/categories`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database schema, storage bucket, routing scaffold, shared utilities, and i18n namespace. Must be complete before any user story begins.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T006 Run the `categories` table SQL from `specs/007-blog-management/quickstart.md` in Supabase SQL Editor (creates table, indexes, RLS policy)
- [ ] T007 Run the `blogs` table SQL from `specs/007-blog-management/quickstart.md` in Supabase SQL Editor (creates table, indexes, `updated_at` trigger, RLS policy)
- [ ] T008 Create `blog-images` Supabase Storage bucket (public, MIME restrictions, 5 MB limit) using SQL or Dashboard per `specs/007-blog-management/quickstart.md`
- [ ] T009 [P] Create shared slug utility `toSlug(input: string): string` in `src/app/modules/blog-management/utils/slugUtils.ts` — lowercase, trim, replace non-alphanumeric with hyphens, collapse/strip leading-trailing hyphens
- [ ] T010 [P] Add blog-management nested routes to `src/app/routing/PrivateRoutes.tsx`: parent route `blog-management` wrapping `BlogManagementPage`, child routes for `categories`, `blogs`, `blogs/new`, `blogs/:id/edit` — all wrapped in `SuspensedView`
- [ ] T011 [P] Add `CATEGORY_MANAGEMENT` and `BLOG_MANAGEMENT` i18n namespace stubs to `src/_metronic/i18n/messages/en.json` (title keys only for now; each phase will add its own keys)
- [ ] T012 Add sidebar menu entries for "Category Management" and "Blog Management" in the Metronic aside menu config (typically `src/_metronic/layout/components/aside/AsideMenuMain.tsx` or equivalent)

**Checkpoint**: Supabase tables exist, bucket exists, routes load without 404, lint passes. User story work can now begin.

---

## Phase 3: User Story 1 — Manage Blog Categories (Priority: P1) 🎯 MVP

**Goal**: Full CRUD for blog categories via a modal form. Admin can create, edit, and delete categories. Deletion is blocked when blogs reference the category.

**Independent Test**: Navigate to `/blog-management/categories`. Create a category — it appears in the table. Edit it — change reflects immediately. Attempt to delete a category that has a blog assigned — error message appears. Delete a category with no blogs — it is removed. Slug auto-generates from name but is not overwritten by later name changes.

### Implementation for User Story 1

- [ ] T013 [P] [US1] Create `src/app/modules/blog-management/category-management/model/Category.ts` — `Category` type, `CategoryFormValues` type, `CATEGORY_FORM_DEFAULTS` constant (see `data-model.md`)
- [ ] T014 [P] [US1] Create `src/app/modules/blog-management/category-management/repository/categoryRepository.ts` — functions: `getAll(): Promise<Category[]>`, `create(payload)`, `update(id, payload)`, `remove(id)`, `isSlugTaken(slug, excludeId?)`, `countByCategory(categoryId)` — all via shared `supabaseClient`; include `CategoryDbRow` type and `rowToCategory` mapper
- [ ] T015 [US1] Create `src/app/modules/blog-management/category-management/service/categoryService.ts` — `createCategory`, `updateCategory`, `deleteCategory` (calls `countByCategory` first; throws if referenced blogs exist); imports `toSlug` from `slugUtils`
- [ ] T016 [US1] Create `src/app/modules/blog-management/category-management/controller/useCategoryController.ts` — `CATEGORY_QUERY_KEY = ['categories']`, `useQuery` for list, `useMutation` for add/update/delete, each mutation invalidates `CATEGORY_QUERY_KEY`; returns `UseCategoryControllerResult` (see `contracts/ui-contracts.md`)
- [ ] T017 [P] [US1] Create `src/app/modules/blog-management/category-management/hooks/useCategoryManagement.ts` — context consumer hook that calls `useContext(CategoryManagementContext)` and throws if used outside provider
- [ ] T018 [US1] Create `src/app/modules/blog-management/category-management/CategoryManagementContext.tsx` — `CategoryManagementProvider` wraps `useCategoryController`; exposes `addCategory`, `updateCategory`, `deleteCategory`, `categories`, `isLoading`, `error`
- [ ] T019 [P] [US1] Create `src/app/modules/blog-management/category-management/components/CategoriesTable.tsx` — react-table with columns: name, slug, description, sort_order, is_active (badge), created_at (formatted), actions (Edit / Delete buttons); props: `onEdit: (category) => void`, `onDelete: (category) => void`; reads categories via `useCategoryManagement()`
- [ ] T020 [P] [US1] Create `src/app/modules/blog-management/category-management/components/CategoryModalForm.tsx` — Formik form with Yup schema; fields: name (text), slug (text — auto-derived via `toSlug` when name changes and slug is pristine, locked once manually edited), description (textarea), sort_order (number), is_active (toggle); calls `addCategory` or `updateCategory` from context on submit; shows field-level Yup errors; disables submit button while submitting
- [ ] T021 [US1] Create `src/app/modules/blog-management/category-management/components/CategoryModal.tsx` — Bootstrap modal shell; props: `isOpen`, `mode`, `initialValues`, `categoryId`, `onClose`; renders `CategoryModalForm` inside
- [ ] T022 [P] [US1] Create `src/app/modules/blog-management/category-management/components/DeleteConfirmDialog.tsx` — Bootstrap modal confirmation; props: `isOpen`, `category: Category | null`, `onConfirm`, `onCancel`, `errorMessage: string | null` (shows inline error when deletion is blocked); confirm button disabled while `errorMessage` is non-null
- [ ] T023 [US1] Create `src/app/modules/blog-management/category-management/CategoryManagementPage.tsx` — assembles `CategoryManagementProvider`, `CategoriesTable`, `CategoryModal`, `DeleteConfirmDialog`; manages `isModalOpen`, `selectedCategory`, `isDeleteDialogOpen`, `deletionError` state; handles `handleAdd`, `handleEdit`, `handleDeleteRequest`, `handleDeleteConfirm` callbacks
- [ ] T024 [US1] Add `CATEGORY_MANAGEMENT.*` i18n keys to `src/_metronic/i18n/messages/en.json`: title, column headers, add/edit/delete button labels, form field labels, validation messages, deletion-blocked error message

**Checkpoint**: `/blog-management/categories` is fully functional. All category CRUD operations work. Slug auto-generation works. Deletion guard works. ESLint passes.

---

## Phase 4: User Story 2 — View Blog Post Listing (Priority: P2)

**Goal**: A full-page table showing all blogs with correct columns and color-coded status badges. "Add Blog" button navigates to the create form.

**Independent Test**: Navigate to `/blog-management/blogs`. Seed at least one blog directly in Supabase. The table shows: featured image thumbnail, title, slug, category name, status badge (correct color), reading time, created_at, updated_at, and action buttons. The "Add Blog" button navigates to `/blog-management/blogs/new`.

### Implementation for User Story 2

- [ ] T025 [P] [US2] Create `src/app/modules/blog-management/blog-posts/model/Blog.ts` — `BlogStatus` union type, `BLOG_STATUSES` array, `STATUS_BADGE_CLASS` map (Draft=badge-secondary, Review=badge-primary, Scheduled=badge-warning, Published=badge-success, Archived=badge-dark), `Blog` type (includes `categoryName` from JOIN), `BlogFormValues` type, `BLOG_FORM_DEFAULTS` constant (see `data-model.md`)
- [ ] T026 [P] [US2] Create `src/app/modules/blog-management/blog-posts/repository/blogRepository.ts` — initial scope: `getAll(): Promise<Blog[]>` using `.select('*, categories(name)')` JOIN and `BlogDbRow` type with `rowToBlog` mapper; imports `supabaseClient`
- [ ] T027 [P] [US2] Create `src/app/modules/blog-management/blog-posts/components/StatusBadge.tsx` — pure presentational component; props: `status: BlogStatus`; renders `<span className={`badge ${STATUS_BADGE_CLASS[status]}`}>{status}</span>`
- [ ] T028 [US2] Create `src/app/modules/blog-management/blog-posts/controller/useBlogController.ts` — initial scope: `BLOG_QUERY_KEY = ['blogs']`, `useQuery` for list; returns `{blogs, isLoading, error}`
- [ ] T029 [P] [US2] Create `src/app/modules/blog-management/blog-posts/hooks/useBlogManagement.ts` — context consumer hook
- [ ] T030 [US2] Create `src/app/modules/blog-management/blog-posts/BlogManagementContext.tsx` — `BlogManagementProvider` wrapping `useBlogController` and `useCategoryController` (for categories dropdown in later phases); exposes blogs, categories, isLoading, error
- [ ] T031 [US2] Create `src/app/modules/blog-management/blog-posts/components/BlogsTable.tsx` — react-table with columns: featured_image (`<img className='w-50px h-50px object-fit-cover rounded'` with fallback placeholder), title, slug, category name, status (`<StatusBadge />`), reading_time (with "min" suffix), created_at (formatted), updated_at (formatted), actions (Edit / Delete buttons); props: `onEdit: (blog) => void`, `onDelete: (blog) => void`; reads blogs via `useBlogManagement()`
- [ ] T032 [US2] Create `src/app/modules/blog-management/blog-posts/BlogListPage.tsx` — assembles `BlogManagementProvider`, `BlogsTable`, "Add Blog" button (navigates to `/blog-management/blogs/new` via `useNavigate`); loading and error states handled
- [ ] T033 [US2] Add `BLOG_MANAGEMENT.*` i18n keys to `src/_metronic/i18n/messages/en.json`: page title, all table column headers, "Add Blog" label, status label strings, loading/error messages

**Checkpoint**: `/blog-management/blogs` loads the listing table. Status badge colors are correct. "Add Blog" button navigates. ESLint passes.

---

## Phase 5: User Story 3 — Create a New Blog Post (Priority: P2)

**Goal**: Full-page form for composing a new blog post with TinyMCE content, featured image upload, slug auto-generation, category dropdown, and all metadata fields. Saved blog appears in listing table.

**Independent Test**: Click "Add Blog". Form opens at `/blog-management/blogs/new` with all fields. Type a title — slug auto-generates. Upload an image — preview appears. Select a category from dropdown (must have at least one active category from Phase 3). Enter TinyMCE content. Submit — blog appears in listing table with correct status badge and thumbnail.

### Implementation for User Story 3

- [ ] T034 [P] [US3] Extend `src/app/modules/blog-management/blog-posts/repository/blogRepository.ts` — add: `getById(id): Promise<Blog>`, `create(payload): Promise<Blog>`, `isSlugTaken(slug, excludeId?): Promise<boolean>`, `uploadImage(blogId, file): Promise<string>` (uploads to `blog-images` bucket, returns public URL), `deleteImage(path): Promise<void>`
- [ ] T035 [US3] Create `src/app/modules/blog-management/blog-posts/service/blogService.ts` — `validateImage(file)` (MIME type + 5 MB size check, throws on fail), `createBlog(payload, imageFile?)` (generates id, validates + uploads image if provided, calls `isSlugTaken` and throws on conflict, calls `blogRepository.create`); imports `toSlug` from `slugUtils`
- [ ] T036 [US3] Extend `src/app/modules/blog-management/blog-posts/controller/useBlogController.ts` — add `addBlog` mutation (calls `blogService.createBlog`, invalidates `BLOG_QUERY_KEY` on success); extend returned interface with `addBlog`; extend context to expose it
- [ ] T037 [US3] Create `src/app/modules/blog-management/blog-posts/components/BlogForm.tsx` — Formik form with Yup schema; fields: title (text), slug (text — auto-derived via `toSlug` when title changes and slug pristine, locked once manually edited), excerpt (textarea, optional), categoryId (select — populated from `useBlogManagement().categories`), featuredImage (file input with image preview; MIME/size validated client-side), content (TinyMCE `<Editor tinymceScriptSrc='/tinymce/tinymce.min.js'` with `onEditorChange` → `formik.setFieldValue('content', val)`), readingTime (number, optional), status (select with all `BLOG_STATUSES`); props: `mode`, `initialValues`, `blogId`, `categories`, `onSuccess`, `onCancel`; submit calls `addBlog` or `updateBlog`; disables submit while submitting; shows field-level Yup errors
- [ ] T038 [US3] Create `src/app/modules/blog-management/blog-posts/BlogFormPage.tsx` — reads `id` from `useParams`; in add mode (`id` undefined): renders `BlogForm` with `BLOG_FORM_DEFAULTS`; wraps in `BlogManagementProvider`; `onSuccess`/`onCancel` both navigate to `/blog-management/blogs`
- [ ] T039 [US3] Add `BLOG_MANAGEMENT.FORM.*` i18n keys to `src/_metronic/i18n/messages/en.json`: all form field labels, placeholder texts, validation error messages, submit/cancel button labels

**Checkpoint**: Creating a blog via `/blog-management/blogs/new` works end-to-end. Image uploads to `blog-images` bucket. Blog appears in table. Slug uniqueness validation catches duplicates. ESLint passes.

---

## Phase 6: User Story 4 — Edit an Existing Blog Post (Priority: P3)

**Goal**: Clicking Edit on a blog row opens the same full-page form pre-filled with current values. On save, updated_at reflects the save time and all changes appear in the listing table.

**Independent Test**: Click Edit on an existing blog. Form opens at `/blog-management/blogs/:id/edit` with all fields pre-filled. Change the status from "Draft" to "Published". Save. Listing table shows green "Published" badge and updated updated_at timestamp.

### Implementation for User Story 4

- [ ] T040 [US4] Extend `src/app/modules/blog-management/blog-posts/repository/blogRepository.ts` — add `update(id, payload): Promise<Blog>` (PATCH via Supabase; excludes `updated_at` — trigger handles it); optionally add `replaceImage(blogId, oldPath, file): Promise<string>` for image replacement
- [ ] T041 [US4] Extend `src/app/modules/blog-management/blog-posts/service/blogService.ts` — add `updateBlog(id, payload, imageFile?)` (validates + uploads new image if provided, checks slug uniqueness excluding self via `isSlugTaken(slug, id)`, calls `blogRepository.update`)
- [ ] T042 [US4] Extend `src/app/modules/blog-management/blog-posts/controller/useBlogController.ts` — add `updateBlog` mutation (invalidates `BLOG_QUERY_KEY` and `['blogs', id]` on success); add `getBlogById(id)` using `useQuery(['blogs', id], ...)` or a direct async call; extend context to expose both
- [ ] T043 [US4] Extend `src/app/modules/blog-management/blog-posts/BlogFormPage.tsx` for edit mode — when `id` param is present: fetch blog via `getBlogById(id)`, map `Blog` to `BlogFormValues` as `initialValues`, pass `blogId` to `BlogForm`; show loading spinner while fetching; handle fetch error state
- [ ] T044 [US4] Wire Edit action in `src/app/modules/blog-management/blog-posts/BlogListPage.tsx` — `handleEdit(blog)` navigates to `/blog-management/blogs/${blog.id}/edit`

**Checkpoint**: Editing a blog works end-to-end. Form is pre-filled. Saving reflects changes in table including updated_at. Slug uniqueness validation excludes self. ESLint passes.

---

## Phase 7: User Story 5 — Delete a Blog Post (Priority: P3)

**Goal**: Delete action on a blog row shows a confirmation dialog. Confirming removes the blog from the table. Cancelling leaves it unchanged.

**Independent Test**: Click Delete on a blog row. Confirmation dialog appears. Click Cancel — blog remains. Click Delete again, confirm — blog disappears from table.

### Implementation for User Story 5

- [ ] T045 [P] [US5] Create `src/app/modules/blog-management/blog-posts/components/DeleteConfirmDialog.tsx` — Bootstrap modal confirmation; props: `isOpen`, `blog: Blog | null`, `onConfirm`, `onCancel`; confirm button shows loading state while mutation is in progress
- [ ] T046 [US5] Extend `src/app/modules/blog-management/blog-posts/repository/blogRepository.ts` — add `remove(id): Promise<void>` (deletes blog row via Supabase)
- [ ] T047 [US5] Extend `src/app/modules/blog-management/blog-posts/service/blogService.ts` — add `deleteBlog(id, featuredImageUrl?)` (calls `blogRepository.remove(id)`; if `featuredImageUrl` is set, also calls `blogRepository.deleteImage` to clean up storage)
- [ ] T048 [US5] Extend `src/app/modules/blog-management/blog-posts/controller/useBlogController.ts` — add `deleteBlog` mutation (invalidates `BLOG_QUERY_KEY` on success); extend context to expose it
- [ ] T049 [US5] Wire Delete action in `src/app/modules/blog-management/blog-posts/BlogListPage.tsx` — manage `blogToDelete: Blog | null` and `isDeleteDialogOpen` state; `handleDeleteRequest(blog)` opens dialog; `handleDeleteConfirm()` calls `deleteBlog`; `handleDeleteCancel()` closes dialog

**Checkpoint**: All five user stories are independently functional. Full CRUD works for both categories and blogs. ESLint passes.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Lint, smoke tests, i18n completeness, dark mode check, and final integration verification.

- [ ] T050 Run `npm run lint` from project root and resolve all ESLint warnings to reach zero-warning state
- [ ] T051 [P] Add missing i18n keys to all non-English locale files under `src/_metronic/i18n/messages/` — duplicate all `CATEGORY_MANAGEMENT.*` and `BLOG_MANAGEMENT.*` keys from `en.json` into each locale file (values can remain English until translated)
- [ ] T052 Manual smoke test — Category Management: create category, edit name (verify slug unchanged), attempt delete with assigned blog (verify error), delete category with no blogs
- [ ] T053 Manual smoke test — Blog listing: verify all column values, all five status badge colors render correctly, thumbnail shows for posts with images
- [ ] T054 Manual smoke test — Blog create: slug auto-generate, image upload + preview, TinyMCE content, all status options, submit → appears in table
- [ ] T055 Manual smoke test — Blog edit: pre-filled form, status change reflects in table, updated_at changes, slug uniqueness excludes self
- [ ] T056 Manual smoke test — Blog delete: confirmation dialog, cancel leaves blog, confirm removes blog
- [ ] T057 [P] Dark mode visual check — switch to dark mode in Metronic theme toggle; verify no hardcoded colors break in table, badges, form, or modal
- [ ] T058 [P] Verify `public/tinymce/` is in `.gitignore` and is NOT committed to the repository

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — BLOCKS all user stories
- **Phase 3 (US1 — Categories)**: Depends on Phase 2; no dependency on other stories
- **Phase 4 (US2 — Blog Listing)**: Depends on Phase 2; blog listing can be built independently but requires at least one category to show category names (seed data or US1 completion recommended first)
- **Phase 5 (US3 — Create Blog)**: Depends on Phase 2 + Phase 3 (category dropdown) + Phase 4 (listing page exists to see results)
- **Phase 6 (US4 — Edit Blog)**: Depends on Phase 5 (reuses BlogForm; edit route extends create route)
- **Phase 7 (US5 — Delete Blog)**: Depends on Phase 4 (listing table has the Delete action button)
- **Phase 8 (Polish)**: Depends on all prior phases complete

### User Story Dependencies

- **US1 (P1)**: No story dependencies — can start as soon as Foundation is done
- **US2 (P2)**: No hard story dependency but benefits from US1 data; can develop in parallel with US1
- **US3 (P2)**: Requires US1 (categories for dropdown) and US2 (listing page to verify results)
- **US4 (P3)**: Requires US3 (shares BlogForm component; extends BlogFormPage)
- **US5 (P3)**: Requires US2 (Delete action is on the listing table); can be done in parallel with US4

### Within Each Phase

- Tasks marked `[P]` can run in parallel (different files, no intra-phase dependencies)
- Model/repository tasks before service tasks
- Service tasks before controller tasks
- Controller tasks before context/page tasks
- All layer tasks before page assembly tasks

### Parallel Opportunities

```bash
# Phase 3 (US1) — run together:
T013  Create Category.ts model
T014  Create categoryRepository.ts
T017  Create useCategoryManagement.ts hook

# Then in parallel:
T019  Create CategoriesTable.tsx
T020  Create CategoryModalForm.tsx
T022  Create DeleteConfirmDialog.tsx (categories)

# Phase 4 (US2) — run together:
T025  Create Blog.ts model
T026  Create blogRepository.ts (getAll only)
T027  Create StatusBadge.tsx

# Phase 5 (US3) — in parallel with T035:
T034  Extend blogRepository.ts (create, isSlugTaken, uploadImage)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: US1 — Category Management
4. **STOP and VALIDATE**: Create, edit, delete categories. Deletion guard works.
5. Demo to stakeholders if needed

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Phase 3 (US1) → Category CRUD working → testable MVP
3. Phase 4 (US2) → Blog listing table → visible blog inventory
4. Phase 5 (US3) → Blog create → content authors can start writing
5. Phase 6 (US4) → Blog edit → content can be corrected
6. Phase 7 (US5) → Blog delete → full lifecycle management
7. Phase 8 (Polish) → production-ready

### Parallel Team Strategy

With two developers after Foundation:

- **Developer A**: Phase 3 (US1 — Categories) → Phase 5 (US3 — Create Blog)
- **Developer B**: Phase 4 (US2 — Blog Listing) → Phase 7 (US5 — Delete Blog)
- Phase 6 (US4 — Edit Blog) assigned to whoever finishes first

---

## Notes

- `[P]` tasks operate on different files — no conflicts if run in parallel
- `[Story]` labels map tasks to spec.md user stories for traceability
- Each user story phase ends with a **Checkpoint** — validate before proceeding
- `npm run lint` must pass at each checkpoint, not just at the end
- TinyMCE self-hosted assets (`public/tinymce/`) are large — never commit them
- The `blog-images` storage bucket must be public — blog featured images are intentionally public-facing
- `updated_at` is handled by the Supabase database trigger — never set it in application code
