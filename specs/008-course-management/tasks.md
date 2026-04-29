# Tasks: Course Management Module

**Input**: Design documents from `/specs/008-course-management/`
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/types.md ✅ quickstart.md ✅

**Tests**: Not requested — manual browser verification per project constraints.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the module folder structure and database migration.

- [X] T001 Create module folder structure: `src/app/modules/course-management/` with subfolders `model/`, `repository/`, `service/`, `controller/`, `course-list/components/`, `course-form/components/`, `section-lesson/components/`, `enrollment/components/`
- [X] T002 Create `migrations/013_course_management.sql` with CREATE TABLE statements for `courses`, `sections`, `lessons`, `enrollments`, `lesson_progress` — include all indexes, unique constraints, FK cascade rules, and `updated_at` triggers as specified in `data-model.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Infrastructure that must be complete before any user story begins.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T003 Run `migrations/013_course_management.sql` in the Supabase SQL Editor and verify all five tables appear in the Supabase dashboard
- [ ] T004 [P] Create the `course-thumbnails` storage bucket in Supabase Storage — set access to **Public**
- [ ] T005 [P] Create the `course-videos` storage bucket in Supabase Storage — set access to **Private**
- [X] T006 [P] Add all `COURSE_MANAGEMENT.*` i18n keys to every locale file under `src/_metronic/i18n/` — keys: `COURSE_MANAGEMENT.TITLE`, `COURSE_MANAGEMENT.COURSES.LIST_TITLE`, `COURSE_MANAGEMENT.COURSES.ADD`, `COURSE_MANAGEMENT.COURSES.EDIT`, `COURSE_MANAGEMENT.COURSES.DELETE_CONFIRM`, `COURSE_MANAGEMENT.SECTIONS.TITLE`, `COURSE_MANAGEMENT.LESSONS.TITLE`, `COURSE_MANAGEMENT.ENROLLMENTS.TITLE`, `COURSE_MANAGEMENT.ENROLLMENTS.ENROLL_USER`
- [X] T007 [P] Create `src/app/modules/course-management/model/Course.ts` — export `CourseStatus`, `Course`, and `CourseFormValues` types as defined in `contracts/types.md`
- [X] T008 [P] Create `src/app/modules/course-management/model/Section.ts` — export `Section` and `SectionFormValues` types
- [X] T009 [P] Create `src/app/modules/course-management/model/Lesson.ts` — export `Lesson` and `LessonFormValues` types
- [X] T010 [P] Create `src/app/modules/course-management/model/Enrollment.ts` — export `Enrollment` and `EnrollUserFormValues` types
- [X] T011 [P] Create `src/app/modules/course-management/model/LessonProgress.ts` — export `LessonProgress` type

**Checkpoint**: Migration complete, both storage buckets exist, all five model files created, i18n keys added. User story work can now begin.

---

## Phase 3: User Story 1 — Course Catalogue Administration (Priority: P1) 🎯 MVP

**Goal**: Full-page course list with status badges, Add/Edit full-page form with thumbnail upload, and Delete with confirmation dialog.

**Independent Test**: Navigate to `/course-management`, create a course with a thumbnail, verify the row appears with the correct status badge, edit it, delete it with confirmation. No sections or lessons needed.

### Implementation

- [X] - [X] T012 [US1] Create `src/app/modules/course-management/repository/courseRepository.ts` — implement `getCourses`, `getCourseById`, `createCourse`, `updateCourse`, `deleteCourse`, `slugExists`, `uploadThumbnail`, and `getPublicThumbnailUrl` using `supabaseClient`; join `categories` on fetch
- [X] - [X] T013 [US1] Create `src/app/modules/course-management/service/courseService.ts` — implement slug auto-generation (lowercase, hyphenated, collision suffix), deletion guard (check enrollment count before delete, throw user-facing error if > 0), and thumbnail upload orchestration; call repository methods
- [X] - [X] T014 [US1] Create `src/app/modules/course-management/controller/useCourseController.ts` — implement `useCourses`, `useCourse`, `useCreateCourse`, `useUpdateCourse`, `useDeleteCourse` as React Query hooks wrapping courseService; invalidate `['courses']` query on mutations
- [X] T015 [P] [US1] Create `src/app/modules/course-management/course-list/components/CoursesTable.tsx` — React Table instance displaying columns: thumbnail (img), title, slug, category name, status badge (grey/green/dark per status), sort_order, created_at (formatted), actions (Edit / Delete buttons); use Metronic table classes
- [X] T016 [P] [US1] Create `src/app/modules/course-management/course-list/components/DeleteCourseDialog.tsx` — Bootstrap modal confirmation dialog; on confirm call `useDeleteCourse`; show inline error if deletion blocked by enrollments
- [X] T017 [P] [US1] Create `src/app/modules/course-management/course-form/components/ThumbnailUpload.tsx` — file input that validates MIME type (image/*) and size (≤5 MB) client-side; shows image preview; auto-detects and displays existing thumbnail URL in edit mode
- [X] - [X] T018 [US1] Create `src/app/modules/course-management/course-form/components/CourseFormFields.tsx` — Formik field set: title (text), slug (text, auto-filled from title onChange), description (textarea), category_id (select from Supabase categories), status (select: Draft/Published/Archived), sort_order (number); Yup validation schema; all labels via React Intl
- [X] - [X] T019 [US1] Create `src/app/modules/course-management/course-form/CourseFormPage.tsx` — full-page Formik form combining `CourseFormFields` and `ThumbnailUpload`; handles both create and edit modes (pre-populate from `useCourse` in edit); submit calls `useCreateCourse` or `useUpdateCourse`; submit button disabled + spinner while submitting; navigate back to list on success
- [X] - [X] T020 [US1] Create `src/app/modules/course-management/course-list/CourseListPage.tsx` — page header with "Add Course" button, `CoursesTable` displaying data from `useCourses`, loading skeleton while fetching, empty state when no courses; opens `DeleteCourseDialog` on delete action
- [X] - [X] T021 [US1] Create `src/app/modules/course-management/CourseManagementPage.tsx` — React Router sub-router with routes: `/course-management` → `CourseListPage`, `/course-management/add` → `CourseFormPage` (create mode), `/course-management/:id/edit` → `CourseFormPage` (edit mode)
- [X] - [X] T022 [US1] Add lazy-loaded route for `CourseManagementPage` in `src/app/routing/PrivateRoutes.tsx` (`path='course-management/*'`); add sidebar menu entry in `src/_metronic/layout/components/sidebar/sidebar-menu/SidebarMenuMain.tsx` pointing to `/course-management`

**Checkpoint**: Course CRUD fully functional. User Story 1 independently testable.

---

## Phase 4: User Story 2 — Section & Lesson Authoring (Priority: P2)

**Goal**: Inline section panel on the course edit page; within each section, a lesson list with video upload, signed URL playback (no-download player), duration auto-detection, sort order, and free-preview toggle.

**Independent Test**: Open an existing course's edit page, add two sections, reorder them, add a lesson with a video to a section, verify signed URL playback works with download and PiP disabled, toggle is_free.

### Implementation

- [X] T02X [P] [US2] Create `src/app/modules/course-management/repository/sectionRepository.ts` — implement `getSectionsByCourse`, `createSection`, `updateSection`, `deleteSection`, `reorderSections` (batch-update sort_order for all siblings) using `supabaseClient`
- [X] T02X [P] [US2] Create `src/app/modules/course-management/repository/lessonRepository.ts` — implement `getLessonsBySection`, `createLesson`, `updateLesson`, `deleteLesson`, `reorderLessons`, `uploadVideo` (upload to `course-videos` bucket, return storage path), `getSignedVideoUrl` (call `createSignedUrl(path, 3600)`) using `supabaseClient`
- [X] T02X [US2] Create `src/app/modules/course-management/service/sectionService.ts` — wraps sectionRepository; reorder logic recalculates sort_order values for all siblings before batch update
- [X] T02X [US2] Create `src/app/modules/course-management/service/lessonService.ts` — wraps lessonRepository; implements video duration auto-detection via HTML5 `loadedmetadata` event on a temporary `<video>` element; generates signed URL on lesson load (never stores signed URL in DB); reorder logic
- [X] T02X [US2] Create `src/app/modules/course-management/controller/useSectionController.ts` — implement `useSections`, `useCreateSection`, `useUpdateSection`, `useDeleteSection`, `useReorderSections` as React Query hooks; invalidate `['sections', courseId]` on mutations
- [X] T02X [US2] Create `src/app/modules/course-management/controller/useLessonController.ts` — implement `useLessons`, `useCreateLesson`, `useUpdateLesson`, `useDeleteLesson`, `useReorderLessons` as React Query hooks; invalidate `['lessons', sectionId]` on mutations
- [X] T02X [P] [US2] Create `src/app/modules/course-management/section-lesson/components/SectionForm.tsx` — inline Formik form (title field) for creating or editing a section; Yup validation; all labels via React Intl; used in both add and edit modes within `SectionList`
- [X] T030 [P] [US2] Create `src/app/modules/course-management/section-lesson/components/LessonForm.tsx` — Formik form with fields: title, description, video file input (validates MIME video/*, size ≤500 MB), duration (number, auto-filled from `loadedmetadata` on file select, user-editable), sort_order, is_free toggle; Yup validation; all labels via React Intl
- [X] T031 [US2] Create `src/app/modules/course-management/section-lesson/components/VideoPlayer.tsx` — renders `<video>` element with `src={signedUrl}` (generated by `lessonService.getSignedVideoUrl` on mount), `controls`, `controlsList="nodownload"`, `disablePictureInPicture`; shows loading state while URL is being fetched; never exposes raw `video_path`
- [X] T032 [US2] Create `src/app/modules/course-management/section-lesson/components/LessonList.tsx` — displays lessons for a section; each row shows title, duration, is_free badge, sort order controls (up/down buttons calling `useReorderLessons`), edit and delete actions; clicking edit opens `LessonForm` inline; delete requires confirmation
- [X] T033 [US2] Create `src/app/modules/course-management/section-lesson/components/SectionList.tsx` — displays all sections for a course; each section row has title, up/down sort controls (calling `useReorderSections`), edit (`SectionForm` inline), delete (with confirmation); each section is collapsible/expandable and embeds `LessonList` + an "Add Lesson" button
- [X] T034 [US2] Integrate `SectionList` into `src/app/modules/course-management/course-form/CourseFormPage.tsx` — render `SectionList` below the course fields panel (only visible in edit mode when course `id` is available); pass `courseId` as prop

**Checkpoint**: Section and lesson authoring fully functional on the course edit page. User Story 2 independently testable.

---

## Phase 5: User Story 3 — Enrollment Management (Priority: P3)

**Goal**: Dedicated enrollment page listing all enrollments with user name, course name, enrolled_at, completed_at, and progress %; admin can manually enroll a user and remove an enrollment.

**Independent Test**: Navigate to the Enrollment Management page, verify the table loads, click "Enroll User", pick a user and course, confirm, verify the row appears with 0% progress, then remove the enrollment.

### Implementation

- [X] T035 [US3] Create `src/app/modules/course-management/repository/enrollmentRepository.ts` — implement `getEnrollments` (join users + courses, compute progress_percent via COUNT of completed lesson_progress records / COUNT of lessons in course × 100), `enrollUser`, `removeEnrollment` (also deletes associated lesson_progress rows) using `supabaseClient`
- [X] T036 [US3] Create `src/app/modules/course-management/service/enrollmentService.ts` — wraps enrollmentRepository; validates that a user is not already enrolled before creating (throw user-facing error on duplicate); progress calculation delegated to repository join query
- [X] T037 [US3] Create `src/app/modules/course-management/controller/useEnrollmentController.ts` — implement `useEnrollments`, `useEnrollUser`, `useRemoveEnrollment` as React Query hooks; invalidate `['enrollments']` on mutations
- [X] T038 [P] [US3] Create `src/app/modules/course-management/enrollment/components/EnrollmentsTable.tsx` — React Table instance with columns: user name, course name, enrolled_at (formatted), completed_at (formatted or "—"), progress % (numeric with % sign), actions (Remove button with confirmation); use Metronic table classes
- [X] T039 [P] [US3] Create `src/app/modules/course-management/enrollment/components/EnrollUserModal.tsx` — Bootstrap modal with two Formik select fields: user (from `users` table) and course (from `courses` table, status = Published); Yup validation; submit calls `useEnrollUser`; shows inline error on duplicate enrollment; all labels via React Intl
- [X] T040 [US3] Create `src/app/modules/course-management/enrollment/EnrollmentPage.tsx` — page header with "Enroll User" button that opens `EnrollUserModal`; `EnrollmentsTable` displaying data from `useEnrollments`; loading skeleton; empty state; handles remove action (inline confirmation)
- [X] T041 [US3] Add `/course-management/enrollments` route to `src/app/modules/course-management/CourseManagementPage.tsx` pointing to `EnrollmentPage`; add a sidebar sub-entry (or tab) for Enrollment Management

**Checkpoint**: All three user stories fully functional and independently testable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final quality pass across all stories.

- [ ] T042 [P] Create `src/app/modules/course-management/CourseManagement.css` — add any module-specific styles (status badge colour overrides, thumbnail preview sizing, video player container); keep minimal; prefer Metronic utility classes
- [ ] T043 Run `eslint --max-warnings 0` across all new files; fix every warning before marking complete
- [ ] T044 [P] Verify end-to-end flow against `quickstart.md`: migration ran, both buckets exist, routes accessible, thumbnail upload works, video signed URL playback works with no download button, enrollment table shows correct progress %
- [ ] T045 [P] Review all new files for hardcoded English strings — replace any found with React Intl `formatMessage()` calls and add missing i18n keys

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — BLOCKS all user stories
- **Phase 3 (US1 — Course CRUD)**: Depends on Phase 2 completion
- **Phase 4 (US2 — Section/Lesson)**: Depends on Phase 2; integrates with Phase 3 (needs a course to exist)
- **Phase 5 (US3 — Enrollment)**: Depends on Phase 2; reads courses and users (needs Phase 3 data)
- **Phase 6 (Polish)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: Can start immediately after Phase 2 — no other story dependencies
- **US2 (P2)**: Can start after Phase 2; T034 integrates into `CourseFormPage.tsx` from US1, so T021 (US1) should be done first
- **US3 (P3)**: Can start after Phase 2; `EnrollUserModal` loads courses so US1 data must exist at runtime, but US3 code is independently buildable

### Within Each User Story

- Models (Phase 2) → Repository → Service → Controller → Components → Page → Routes
- Parallelisable tasks within a story ([P] marked) can run simultaneously

### Parallel Opportunities

- T004, T005, T006, T007–T011 — all Phase 2 tasks marked [P] can run simultaneously
- T015, T016, T017 — US1 components, no inter-dependency
- T023, T024 — US2 repositories can run in parallel
- T029, T030 — US2 form components can run in parallel
- T038, T039 — US3 table and modal can run in parallel
- T042, T044, T045 — Polish tasks can run in parallel

---

## Parallel Example: Phase 2 Foundational

```
Simultaneously:
  T004 — Create course-thumbnails bucket
  T005 — Create course-videos bucket
  T006 — Add i18n keys to locale files
  T007 — Course.ts model
  T008 — Section.ts model
  T009 — Lesson.ts model
  T010 — Enrollment.ts model
  T011 — LessonProgress.ts model

Then sequentially:
  T003 — Run migration (needs T002 from Phase 1)
```

## Parallel Example: User Story 1

```
After T014 (useCourseController) is done, simultaneously:
  T015 — CoursesTable.tsx
  T016 — DeleteCourseDialog.tsx
  T017 — ThumbnailUpload.tsx

Then:
  T018 — CourseFormFields.tsx (needs T017)
  T019 — CourseFormPage.tsx (needs T018)
  T020 — CourseListPage.tsx (needs T015, T016)
  T021 — CourseManagementPage.tsx (needs T019, T020)
  T022 — Routes + sidebar (needs T021)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T002)
2. Complete Phase 2: Foundational (T003–T011)
3. Complete Phase 3: User Story 1 (T012–T022)
4. **STOP AND VALIDATE**: Course CRUD, thumbnail upload, status badges, delete confirmation — all working in browser
5. Deploy / demo the course admin table

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. **US1** → Course CRUD working → Demo MVP
3. **US2** → Sections and lessons with video → Demo content authoring
4. **US3** → Enrollment tracking → Demo full module
5. Polish → ESLint clean, i18n complete

### Task Count Summary

| Phase | Tasks | Parallelisable |
|---|---|---|
| Phase 1: Setup | 2 | 0 |
| Phase 2: Foundational | 9 | 8 |
| Phase 3: US1 Course CRUD | 11 | 3 |
| Phase 4: US2 Sections/Lessons | 12 | 5 |
| Phase 5: US3 Enrollment | 7 | 2 |
| Phase 6: Polish | 4 | 3 |
| **Total** | **45** | **21** |

---

## Notes

- [P] tasks operate on different files with no incomplete-task dependencies — safe to run in parallel
- [Story] label maps each task to a user story for traceability
- No automated tests — manual browser verification is the acceptance criterion per project constraints
- Commit after each logical group (e.g., after each phase checkpoint)
- Never expose `video_path` raw — always route through `getSignedVideoUrl` before rendering
- Never call `supabase` directly in components — always go through controller hooks
