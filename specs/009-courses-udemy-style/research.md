# Research: Courses — Udemy-Style Curriculum, Pricing & Reviews

**Branch**: `009-courses-udemy-style` | **Date**: 2026-04-29

---

## Decision 1: Course Detail Page Route

**Decision**: New learner-facing course detail page at `/courses/:id` (top-level, no role guard), separate from the existing admin edit page at `/course-management/edit/:id`.

**Rationale**: The spec describes a page visible to any authenticated user (enrolled learners, visitors) — not only Admin/Manager. The existing `course-management/*` routes are behind `RoleGuard allowedRoles=['Admin', 'Manager']`, so the detail page must live outside that guard. A top-level `/courses/:id` route in `PrivateRoutes.tsx` (but outside the role guard block) is the cleanest fit within the existing routing conventions.

**Alternatives considered**:
- Removing the role guard from course-management entirely — rejected; admin CRUD should remain protected.
- Placing it at `/course-management/detail/:id` inside the role guard — rejected; learners cannot access it.

---

## Decision 2: Price Field Integration

**Decision**: Add `price` field to the existing `Course` model, `CourseDbRow` type, `rowToCourse` mapper, and the Formik form. Default null → 0.00 in the mapper.

**Rationale**: The `price` column already exists in the DB (added by the user via SQL). The existing `courseRepository.ts`, `Course.ts` model, and `CourseFormFields.tsx` do not yet include `price`. Updating them in-place keeps the MVC layer clean and follows the established pattern for column additions (e.g., `thumbnail_path` was added the same way).

**Alternatives considered**:
- Separate `courseDetailRepository.ts` — rejected; unnecessary duplication of the select query.

---

## Decision 3: Review Aggregate Computation

**Decision**: Compute average rating and count in the repository using a Supabase aggregation approach: fetch all reviews for a course in a single query, then derive avg/count client-side in the service layer. No DB-level RPC required.

**Rationale**: Supabase JS v2 supports `select('rating')` to fetch all ratings; computing `avg` and `count` in JS over a small dataset (reviews per course) is negligible. This avoids creating a Supabase RPC function and keeps the code self-contained.

**Alternatives considered**:
- Supabase `rpc('get_course_avg_rating')` — avoided; adds schema dependency and migration complexity.
- Supabase aggregation via `select('rating.avg(), count()')` — the JS client v2 does not support aggregate functions in this form without PostgREST v12+; client-side is safer.

---

## Decision 4: Admin Course List — Avg Rating Column

**Decision**: Fetch average ratings for all courses in a single supplementary query (all reviews grouped by course_id), then merge with the course list client-side in the controller.

**Rationale**: The courses table query already joins categories; adding a sub-select for avg rating per course would produce a more complex query. A separate `getAverageRatingsByCourse()` call returns `{courseId, avg, count}[]` and is merged in the controller. React Query caches both independently.

**Alternatives considered**:
- Single JOIN query — requires PostgREST aggregation support; not reliably available in Supabase JS v2.

---

## Decision 5: Homepage Category Cards — Dashboard Integration

**Decision**: Add a "Browse by Category" section directly to the existing `DashboardWrapper.tsx`, querying one published course per category (lowest `sort_order`). Data is fetched via a new `getFeaturedCoursesByCategory()` repository function.

**Rationale**: The dashboard is the "homepage" for this admin panel. Adding a new card section below the existing stats/blog rows follows the established dashboard pattern. No new page or route needed.

**Alternatives considered**:
- New standalone `/course-catalog` page — rejected; spec explicitly says "homepage / dashboard".
- Modifying the toolbar — rejected; wrong UI placement.

---

## Decision 6: Enrollment from Course Detail CTA

**Decision**: Reuse the existing `createEnrollment` from `enrollmentRepository.ts` and the `enrollmentExists` guard. Expose them via a lightweight `useCourseDetailController` hook that bundles: course fetch, enrollment status check, and enroll mutation.

**Rationale**: The enrollment logic is already built and tested in Phase 5. Reusing it avoids duplication. A dedicated controller for the detail page keeps concerns separate from the admin enrollment controller.

**Alternatives considered**:
- Calling repository directly from the page component — rejected; violates MVC layer pattern.

---

## Decision 7: Bootstrap Accordion for Curriculum

**Decision**: Use Bootstrap 5's native accordion markup (`accordion`, `accordion-item`, `accordion-header`, `accordion-button`, `accordion-collapse`) with React state for controlled open/close. No `data-bs-*` attributes (those require Bootstrap JS bundle); use React-controlled `show` class toggling instead.

**Rationale**: The project uses Bootstrap 5 CSS via Metronic SCSS but relies on React for behaviour — not Bootstrap's JS bundle (`data-bs-toggle` etc.). React-controlled class toggling (`show` on `.accordion-collapse`) is the established pattern in this codebase (e.g., modals use `d-block` + state).

**Alternatives considered**:
- `data-bs-toggle="collapse"` — rejected; Bootstrap JS may not be loaded or conflicts with React rendering.
- Custom accordion component from scratch — rejected; Bootstrap CSS already handles all visual styling.

---

## Decision 8: Star Rating UI Component

**Decision**: Build a lightweight `StarRating` component using Unicode stars (★/☆) styled with CSS, or Keenicons if a suitable star icon exists. No external star-rating library (constitution: no new major dependencies).

**Rationale**: A simple 1–5 star display and interactive selector can be built with 5 icon buttons and basic CSS. Keenicons includes `ki-star` (duotone) for filled/empty states. This avoids any new npm dependency.

**Alternatives considered**:
- `react-rating-stars-component` or similar — rejected; constitution prohibits new major dependencies without justification.

---

## Decision 9: User Identity for Reviews / Progress

**Decision**: Use `useAuth().currentUser?.id` as the `userId` for all enrollment checks, lesson progress lookups, and review submission. The `UserModel.id` is a string (Supabase auth UUID).

**Rationale**: `useAuth` is already used in `DashboardWrapper.tsx` and is the established pattern for reading the current user. The `id` field aligns with the `user_id` foreign key in all tables.

**Alternatives considered**:
- Reading from Supabase session directly — avoided; `useAuth` abstracts this and is already in the codebase.
