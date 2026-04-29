# Implementation Plan: Course Management Module

**Branch**: `008-course-management` | **Date**: 2026-04-28 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/008-course-management/spec.md`

## Summary

Build a full Course Management module for the Metronic Demo1 admin panel, covering four sub-sections: Course CRUD with thumbnail upload, Section/Lesson authoring with private video upload and signed URL playback, and Enrollment Management with per-lesson progress tracking. All data is backed by Supabase (PostgreSQL) via the shared client. Architecture follows the established MVC pattern (model → repository → service → controller → page components).

## Technical Context

**Language/Version**: TypeScript ^5.3.3  
**Primary Dependencies**: React ^18.2.0, React Query 3.38.0, Formik 2.2.9, Yup ^1.0.0, React Table ^7.7.0, React Intl ^6.4.4, React Router DOM 6.30.3, Bootstrap 5 + Metronic SCSS  
**Storage**: Database: Supabase (PostgreSQL) via `src/app/lib/supabaseClient.ts` | Files: Supabase Storage — `course-thumbnails` (public), `course-videos` (private, signed URLs)  
**Testing**: Manual browser verification (per project constraints)  
**Target Platform**: Web browser, Demo1 Metronic layout  
**Project Type**: Web application — admin panel feature module  
**Performance Goals**: Table load ≤2s, thumbnail upload ≤5s for files up to 5MB, signed URL generation + playback start ≤3s  
**Constraints**: No new major npm dependencies; all video URLs must be signed (never raw); no mock data for Supabase-backed features  
**Scale/Scope**: Admin-only module; learner-facing views out of scope

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| I. Technology Stack | ✅ PASS | All dependencies already in package.json |
| II. Project Structure | ✅ PASS | Module in `src/app/modules/course-management/`; routes in PrivateRoutes.tsx |
| III. TypeScript Rules | ✅ PASS | Strict mode, no `any`, explicit interfaces in contracts/types.md |
| IV. Component & Styling | ✅ PASS | Metronic classes, Keenicons, no inline styles |
| V. Routing Rules | ✅ PASS | Protected routes, React.lazy + Suspense, kebab-case paths |
| VI. Data Fetching | ✅ PASS | All DB via supabaseClient.ts; React Query; no raw useEffect+useState |
| VII. Forms Rules | ✅ PASS | Formik + Yup for all forms |
| VIII. Internationalisation | ✅ PASS | All strings via React Intl; new keys added to i18n files |
| IX. Code Quality | ✅ PASS | ESLint must pass; PascalCase components, camelCase hooks |
| X. Storage Rules | ✅ PASS* | `course-thumbnails` (public) and `course-videos` (private) — reviewed per feature as required by Principle X. Justified: thumbnails are intentionally public; videos require access control. |

**Post-design re-check**: All gates still PASS. No complexity violations.

## Project Structure

### Documentation (this feature)

```text
specs/008-course-management/
├── plan.md          ← this file
├── research.md      ← Phase 0 decisions
├── data-model.md    ← Phase 1 entity definitions
├── contracts/
│   └── types.md     ← TypeScript interface contracts
├── quickstart.md    ← Setup guide
└── tasks.md         ← Phase 2 output (/speckit.tasks — not yet created)
```

### Source Code

```text
src/app/modules/course-management/
├── model/
│   ├── Course.ts
│   ├── Section.ts
│   ├── Lesson.ts
│   ├── Enrollment.ts
│   └── LessonProgress.ts
├── repository/
│   ├── courseRepository.ts
│   ├── sectionRepository.ts
│   ├── lessonRepository.ts
│   └── enrollmentRepository.ts
├── service/
│   ├── courseService.ts       # slug generation, deletion guard, progress calc
│   ├── sectionService.ts
│   ├── lessonService.ts       # video duration detection, signed URL generation
│   └── enrollmentService.ts
├── controller/
│   ├── useCourseController.ts
│   ├── useSectionController.ts
│   ├── useLessonController.ts
│   └── useEnrollmentController.ts
├── course-list/
│   ├── CourseListPage.tsx
│   └── components/
│       ├── CoursesTable.tsx
│       └── DeleteCourseDialog.tsx
├── course-form/
│   ├── CourseFormPage.tsx
│   └── components/
│       ├── CourseFormFields.tsx
│       └── ThumbnailUpload.tsx
├── section-lesson/
│   └── components/
│       ├── SectionList.tsx
│       ├── SectionForm.tsx
│       ├── LessonList.tsx
│       ├── LessonForm.tsx
│       └── VideoPlayer.tsx
├── enrollment/
│   ├── EnrollmentPage.tsx
│   └── components/
│       ├── EnrollmentsTable.tsx
│       └── EnrollUserModal.tsx
├── CourseManagementPage.tsx    # Router + sub-route definitions
└── CourseManagement.css

migrations/
└── 013_course_management.sql

src/_metronic/i18n/
└── [all locale files]          # New COURSE_MANAGEMENT.* keys
```

**Structure Decision**: Single React SPA module under `src/app/modules/course-management/`. Follows the established pattern from `004-user-management-mvc` and `006-direct-messages` (model/repository/service/controller layers, colocated components).

## Implementation Sequence

### Group 1 — Foundation (do first, unblocks everything)
1. Migration `013_course_management.sql` — creates all tables and indexes
2. Storage buckets created in Supabase dashboard (`course-thumbnails` public, `course-videos` private)
3. Models: `Course.ts`, `Section.ts`, `Lesson.ts`, `Enrollment.ts`, `LessonProgress.ts`
4. i18n keys added to all locale files

### Group 2 — Course CRUD (P1 — independent value)
5. `courseRepository.ts` + `courseService.ts` + `useCourseController.ts`
6. `CoursesTable.tsx` + `CourseListPage.tsx`
7. `CourseFormPage.tsx` + `CourseFormFields.tsx` + `ThumbnailUpload.tsx`
8. `DeleteCourseDialog.tsx`
9. Routes wired in `PrivateRoutes.tsx`; sidebar entry added

### Group 3 — Section & Lesson Authoring (P2 — builds on Group 2)
10. `sectionRepository.ts` + `sectionService.ts` + `useSectionController.ts`
11. `lessonRepository.ts` + `lessonService.ts` + `useLessonController.ts`
12. `SectionList.tsx` + `SectionForm.tsx` (inline on course edit page)
13. `LessonList.tsx` + `LessonForm.tsx` (with video upload + duration detection)
14. `VideoPlayer.tsx` (signed URL, controlsList="nodownload", disablePictureInPicture)

### Group 4 — Enrollment Management (P3 — parallel to Group 3)
15. `enrollmentRepository.ts` + `enrollmentService.ts` + `useEnrollmentController.ts`
16. `EnrollmentsTable.tsx` + `EnrollmentPage.tsx`
17. `EnrollUserModal.tsx`

## Key Technical Decisions (from research.md)

| Decision | Choice | Rationale |
|---|---|---|
| Video signed URLs | Generated fresh on load via Supabase Storage API (1h expiry) | Security; no caching risk |
| Video player | Native HTML5 `<video>` element | No new dependency needed |
| Reordering | Up/down arrow buttons | No drag-and-drop library needed |
| Slug generation | Inline string transform + collision suffix | No slugify library needed |
| Thumbnail bucket | `course-thumbnails` (public) | Thumbnails are intentionally public |
| Video bucket | `course-videos` (private) | Access control required |
| Duration detection | HTML5 `loadedmetadata` event on file select | No ffmpeg/WASM needed |
| Enrollment deletion guard | Service-layer count check before DELETE | Prevent accidental data loss |
| Progress calculation | Client-side on display | Sufficient at this scale |
