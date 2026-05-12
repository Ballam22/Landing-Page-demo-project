# Tasks: Courses — Udemy-Style Curriculum, Pricing & Reviews

**Input**: Design documents from `/specs/009-courses-udemy-style/`
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/types.md ✅ quickstart.md ✅

**Tests**: Not requested — manual browser verification per project constraints.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

---

## Phase 1: Setup (DB Verification)

**Purpose**: Confirm pre-existing schema changes are in place before writing any code.

- [X] T001 Verify `price` column exists on `courses` table in Supabase (run `SELECT price FROM courses LIMIT 1;`); if missing, run `ALTER TABLE public.courses ADD COLUMN price numeric NOT NULL DEFAULT 0;`
- [X] T002 Verify `reviews` table exists in Supabase with columns `(id, course_id, user_id, rating, comment, created_at)` and unique constraint on `(course_id, user_id)`; if missing, run: `CREATE TABLE public.reviews (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE, user_id uuid NOT NULL REFERENCES public.users(id), rating int2 NOT NULL CHECK (rating >= 1 AND rating <= 5), comment text, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(course_id, user_id));`
- [X] T003 Apply RLS policies for `reviews` table in Supabase SQL Editor: `ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY; CREATE POLICY "reviews_read" ON public.reviews FOR SELECT TO authenticated USING (true); CREATE POLICY "reviews_insert" ON public.reviews FOR INSERT TO authenticated WITH CHECK (true);`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared models and i18n keys that all three user stories depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T004 [P] Update `src/app/modules/course-management/model/Course.ts` — add `price: number` to `Course` type; add `avgRating?: number` and `reviewCount?: number` optional fields; add `price: number` to `CourseFormValues`; set `price: 0` in `COURSE_FORM_DEFAULTS`
- [X] T005 [P] Create `src/app/modules/course-management/model/Review.ts` — export `Review` type (id, courseId, userId, rating, comment, createdAt, user?: {id, fullName, avatarUrl}); export `ReviewFormValues` (rating: number, comment: string); export `CourseRatingSummary` (avgRating: number, reviewCount: number); export `REVIEW_FORM_DEFAULTS = {rating: 0, comment: ''}`
- [X] T006 [P] Add all `COURSE_DETAIL.*` i18n keys to `src/_metronic/i18n/messages/en.json`: `COURSE_DETAIL.CURRICULUM_TITLE` ("Course Content"), `COURSE_DETAIL.NO_CURRICULUM` ("No curriculum available yet."), `COURSE_DETAIL.LESSONS_COUNT` ("{count} lessons"), `COURSE_DETAIL.ENROLL_NOW` ("Enroll Now"), `COURSE_DETAIL.CONTINUE_LEARNING` ("Continue Learning"), `COURSE_DETAIL.FREE` ("Free"), `COURSE_DETAIL.PRICE_FORMAT` ("€{price}"), `COURSE_DETAIL.REVIEWS_TITLE` ("Student Reviews"), `COURSE_DETAIL.NO_REVIEWS` ("No reviews yet. Be the first to review this course."), `COURSE_DETAIL.REVIEW_PLACEHOLDER` ("Share your experience with this course…"), `COURSE_DETAIL.SUBMIT_REVIEW` ("Submit Review"), `COURSE_DETAIL.THANK_YOU_REVIEW` ("Thank you for your review!"), `COURSE_DETAIL.AGGREGATE_LABEL` ("{avg} · {count} reviews"), `COURSE_DETAIL.FEATURED_COURSES_TITLE` ("Browse by Category"), `COURSE_DETAIL.NO_COURSES_CATEGORY` ("No courses available yet"), `COURSE_DETAIL.AVG_RATING_COLUMN` ("Avg Rating")
- [X] T007 Add matching `COURSE_DETAIL.*` German translations to `src/_metronic/i18n/messages/de.ts` for all 16 keys added in T006

**Checkpoint**: Models typed, i18n keys present — user story implementation can begin.

---

## Phase 3: User Story 1 — Course Curriculum Accordion (Priority: P1) 🎯 MVP

**Goal**: Learner-facing course detail page at `/courses/:id` with a Bootstrap accordion showing all sections and lessons; each lesson shows a lock/play/checkmark icon based on enrollment and lesson_progress state.

**Independent Test**: Navigate to `/courses/<id>`. Verify accordion shows all sections with lesson counts and durations. Expand a section — confirm lock icons for non-enrolled user, play/checkmark icons for enrolled user per lesson_progress. No pricing or review UI required.

### Implementation

- [X] T008 [US1] Update `src/app/modules/course-management/repository/lessonRepository.ts` — add `getLessonProgressByUserAndLessons(userId: string, lessonIds: string[]): Promise<LessonProgress[]>` that selects from `lesson_progress` WHERE `user_id = userId AND lesson_id IN (lessonIds)`; returns empty array if `lessonIds` is empty; map rows to `LessonProgress` type
- [X] T009 [US1] Update `src/app/modules/course-management/repository/courseRepository.ts` — (a) add `price: number | null` to `CourseDbRow` and map it as `price: row.price ?? 0` in `rowToCourse`; (b) add `getCourseWithSections(courseId: string): Promise<Course & {sections: (Section & {lessons: Lesson[]})[]}>` that selects course + nested sections (ordered sort_order asc) + nested lessons per section (ordered sort_order asc) using Supabase nested select; (c) update `createCourse` insert payload and `updateCourse` update payload to include `price: values.price`
- [X] T010 [US1] Update `src/app/modules/course-management/service/courseService.ts` — export `fetchCourseWithSections(courseId: string)` wrapping the new repository function; update `addCourse` and `editCourse` to pass `price: values.price` through to the repository
- [X] T011 [US1] Create `src/app/modules/course-management/controller/useCourseDetailController.ts` — `useCourseDetail(courseId: string)` hook returning: `course` (with nested sections+lessons), `isLoading`, `error`, `isEnrolled: boolean` (queries `enrollments` for current user + course via `enrollmentExists`), `lessonProgressMap: Record<lessonId, boolean>` (built from `getLessonProgressByUserAndLessons` for the current user), `enroll(): Promise<void>` (calls `createEnrollment`), `enrolling: boolean`; cache keys: `['course-detail', courseId]`, `['course-enrollment', courseId, userId]`, `['course-lesson-progress', courseId, userId]`; `currentUser` obtained from `useAuth()`
- [X] T012 [P] [US1] Create `src/app/modules/course-management/section-lesson/components/StarRating.tsx` — renders 1–5 star icons using `ki-duotone ki-star` Keenicons; props: `value: number` (0 = none), `max?: number` (default 5), `interactive?: boolean` (default false), `onChange?: (n: number) => void`; filled stars use `text-warning` class; empty stars use `text-muted`; when `interactive=true` renders clickable buttons; when `interactive=false` renders read-only spans
- [X] T013 [P] [US1] Create `src/app/modules/course-management/course-detail/components/CourseAccordion.tsx` — Bootstrap 5 accordion (React state controls `show` class on `.accordion-collapse`); props: `sections: (Section & {lessons: Lesson[]})[]`, `lessonProgressMap: Record<string, boolean>`, `isEnrolled: boolean`; each `.accordion-header` shows section title + lesson count (e.g. "4 lessons") + total duration (sum of lesson.duration, formatted as "Xh Ym" or "Y min"); each lesson row shows title, duration ("—" if null/undefined), and icon: `ki-lock` (not enrolled), `ki-play` (enrolled, not completed), `ki-check-circle` (completed); empty state: paragraph with `COURSE_DETAIL.NO_CURRICULUM` i18n key
- [X] T014 [US1] Create `src/app/modules/course-management/course-detail/CourseDetailPage.tsx` — uses `useCourseDetail(id)` from `useParams`; renders `PageTitle` with course title; loading spinner while `isLoading`; error alert on `error`; layout: course title + description on left/top, `{/* CoursePricingCTA placeholder */}` on right, then `CourseAccordion`, then `{/* CourseReviews placeholder */}`; export default; the placeholders become real components in T019 and T027
- [X] T015 [US1] Add lazy-loaded route for `CourseDetailPage` in `src/app/routing/PrivateRoutes.tsx` — add `const CourseDetailPage = lazy(() => import('../modules/course-management/course-detail/CourseDetailPage'))` and `<Route path='courses/:id' element={<SuspensedView><CourseDetailPage /></SuspensedView>} />` inside `<Route element={<BannerLayout />}>` but OUTSIDE any `RoleGuard` wrapper so all authenticated users can access it

**Checkpoint**: Course curriculum accordion fully functional and independently testable at `/courses/:id`.

---

## Phase 4: User Story 2 — Course Pricing & Enrolment CTA (Priority: P2)

**Goal**: Price displayed on course detail page with "Enroll Now" / "Continue Learning" CTA; free courses enrol immediately on click; featured course cards per category on the dashboard.

**Independent Test**: Set one course `price = 0.00` and another to `49.00`. On `/courses/<id>`, verify "Free" or "€49.00" displayed and CTA works. Navigate to `/dashboard` — verify one course card per category with price badge and star rating.

### Implementation

- [X] T016 [P] [US2] Update `src/app/modules/course-management/repository/courseRepository.ts` — add `getFeaturedCoursesByCategory(): Promise<{category: {id: string; name: string}; course: Course | null}[]>` that: (1) fetches all categories; (2) for each category, queries the first published course ordered by sort_order ASC; returns array of `{category, course|null}` for all categories
- [X] T017 [P] [US2] Update `src/app/modules/course-management/service/courseService.ts` — export `fetchFeaturedCoursesByCategory()` wrapping the repository function; export `fetchAverageRatingsByCourse(): Promise<{courseId: string; avgRating: number; reviewCount: number}[]>` that fetches all reviews from Supabase (select course_id, rating) and aggregates client-side using `reduce`
- [X] T018 [P] [US2] Update `src/app/modules/course-management/course-form/components/CourseFormFields.tsx` — add a "Price (€)" `<Field>` of `type='number'`, `name='price'`, `min={0}`, `step={0.01}`; add to Yup schema in `CourseFormPage.tsx`: `price: Yup.number().min(0).required('Price is required')`; pre-populate from `course.price` in edit mode (already handled by `enableReinitialize`)
- [X] T019 [P] [US2] Create `src/app/modules/course-management/course-detail/components/CoursePricingCTA.tsx` — props: `price: number`, `isEnrolled: boolean`, `onEnroll: () => Promise<void>`, `enrolling: boolean`; if `isEnrolled`: render a "Continue Learning" `badge badge-light-success` with a Keenicon check; else: render the price label ("Free" if `price === 0`, "€{price.toFixed(2)}" otherwise) and an "Enroll Now" `btn btn-primary` button that calls `onEnroll` and shows spinner while `enrolling`; button disabled during enrollment
- [X] T020 [US2] Update `src/app/modules/course-management/course-detail/CourseDetailPage.tsx` — replace the `{/* CoursePricingCTA placeholder */}` comment with `<CoursePricingCTA price={course.price} isEnrolled={isEnrolled} onEnroll={enroll} enrolling={enrolling} />`
- [X] T021 [P] [US2] Create `src/app/modules/course-management/course-detail/components/FeaturedCategoryCard.tsx` — props: `category: {id: string; name: string}`, `course: Course | null`; if `course` is null: render a Bootstrap card with category name as header and `COURSE_DETAIL.NO_COURSES_CATEGORY` message; if `course`: render card with thumbnail `<img>` (or placeholder div with category initial), course title as a `<Link to={/courses/${course.id}}>`, price badge (`badge badge-light-success` for "Free", `badge badge-light-primary` for paid), and `StarRating` display-only with `value={course.avgRating ?? 0}`
- [X] T022 [US2] Update `src/app/pages/dashboard/DashboardWrapper.tsx` — add a "Browse by Category" section below existing content cards; fetch data with `useQuery(['featured-courses-by-category'], fetchFeaturedCoursesByCategory, {staleTime: 0})` and `useQuery(['course-avg-ratings'], fetchAverageRatingsByCourse, {staleTime: 0})`; merge `avgRating` onto each course before passing to `FeaturedCategoryCard`; render a `row g-5` grid of `FeaturedCategoryCard` components (col-xl-3 col-md-4 col-sm-6); show loading spinner while fetching; show `COURSE_DETAIL.FEATURED_COURSES_TITLE` as section heading

**Checkpoint**: Price and CTA visible on course detail; free enrolment works; dashboard shows featured course cards.

---

## Phase 5: User Story 3 — Reviews & Star Ratings (Priority: P3)

**Goal**: Enrolled users can submit a 1–5 star review with optional comment; course detail page shows aggregate rating and review list; admin course list gains an average rating column.

**Independent Test**: Enrol a user in a course. Submit a 4-star review. Verify aggregate shows "4.0 · 1 reviews". Resubmit — form hidden. View as non-enrolled — form hidden. Admin list shows "4.0" in the Avg Rating column.

### Implementation

- [X] T023 [P] [US3] Create `src/app/modules/course-management/repository/reviewRepository.ts` — `getReviewsByCourse(courseId)`: select all reviews for a course joining `users(id, full_name, avatar_url)`, ordered by `created_at DESC`; `createReview(courseId, userId, values)`: insert then select with user join; `getUserReviewForCourse(courseId, userId)`: single select returning `Review | null` (null if not found, no error throw); all rows mapped via `rowToReview()` function; follows existing `type ReviewDbRow` + mapper pattern
- [X] T024 [P] [US3] Create `src/app/modules/course-management/service/reviewService.ts` — `fetchReviews(courseId)`: wraps `getReviewsByCourse`; `fetchUserReview(courseId, userId)`: wraps `getUserReviewForCourse`; `submitReview(courseId, userId, values)`: wraps `createReview`; `computeRatingSummary(reviews: Review[]): CourseRatingSummary`: computes `avgRating = round(sum(rating)/count, 1)` and `reviewCount = count`, returns `{avgRating: 0, reviewCount: 0}` for empty array
- [X] T025 [US3] Create `src/app/modules/course-management/controller/useReviewController.ts` — `useReviewController(courseId: string, currentUserId: string | undefined)` returns: `reviews`, `ratingSummary: CourseRatingSummary`, `userReview: Review | null`, `isLoading`, `error`, `submitReview(values: ReviewFormValues): Promise<void>` mutation, `submitting: boolean`; cache keys `['reviews', courseId]` and `['user-review', courseId, currentUserId]`; on submit success invalidate both query keys; `enabled` only when `courseId` is truthy
- [X] T026 [P] [US3] Create `src/app/modules/course-management/course-detail/components/ReviewForm.tsx` — Formik form; `StarRating` with `interactive=true` and `onChange={(n) => setFieldValue('rating', n)}`; optional textarea `name='comment'` with `COURSE_DETAIL.REVIEW_PLACEHOLDER` placeholder; Yup schema: `rating: Yup.number().min(1, 'Please select a rating').max(5).required()`; submit button disabled + spinner while `isSubmitting`; label uses `COURSE_DETAIL.SUBMIT_REVIEW` i18n key
- [X] T027 [P] [US3] Create `src/app/modules/course-management/course-detail/components/CourseReviews.tsx` — props: `courseId: string`, `currentUserId: string | undefined`, `isEnrolled: boolean`; uses `useReviewController(courseId, currentUserId)`; top section: aggregate display with `StarRating` display + `COURSE_DETAIL.AGGREGATE_LABEL` formatted message (hidden if `reviewCount === 0`); middle: if `isEnrolled && !userReview` render `ReviewForm` with `onSubmit={submitReview}`; if `userReview` render `COURSE_DETAIL.THANK_YOU_REVIEW` confirmation card; list: for each review render `symbol symbol-circle symbol-35px` avatar (img if `user.avatarUrl`, else initials `bg-light-primary`), reviewer name, `StarRating` display with `value={review.rating}`, comment paragraph (omit if undefined), date formatted via `toLocaleDateString`; empty state: `COURSE_DETAIL.NO_REVIEWS` if `reviewCount === 0`
- [X] T028 [US3] Update `src/app/modules/course-management/course-detail/CourseDetailPage.tsx` — replace the `{/* CourseReviews placeholder */}` comment with `<CourseReviews courseId={id} currentUserId={currentUser?.id} isEnrolled={isEnrolled} />`; import `useAuth` at the top
- [X] T029 [US3] Update `src/app/modules/course-management/course-list/components/CoursesTable.tsx` — fetch average ratings with `useQuery(['course-avg-ratings'], fetchAverageRatingsByCourse, {staleTime: 0})`; add "Avg Rating" column to the React Table column definitions after the status column; cell renders `{avg} ★` formatted to 1 decimal, or "—" if no reviews; column header uses `COURSE_DETAIL.AVG_RATING_COLUMN` i18n key

**Checkpoint**: All three user stories fully functional and independently testable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Quality pass and end-to-end validation.

- [ ] T030 [P] Run end-to-end verification against all 4 scenarios in `specs/009-courses-udemy-style/quickstart.md`: accordion icons, free enrolment, paid enrolment, homepage cards, review submit, already-reviewed gate, non-enrolled gate, admin rating column
- [ ] T031 [P] Review all new and modified files for hardcoded English strings; replace any found with `intl.formatMessage()` calls and add missing i18n keys to both `en.json` and `de.ts`
- [ ] T032 [P] Run `eslint --max-warnings 0` across all new and modified files; fix every warning before marking complete

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — run immediately in Supabase SQL Editor
- **Phase 2 (Foundational)**: Depends on Phase 1 confirmation — BLOCKS all user stories
- **Phase 3 (US1 — Curriculum)**: Depends on Phase 2 completion
- **Phase 4 (US2 — Pricing)**: Depends on Phase 2; T020 integrates into CourseDetailPage from US1, so T014 (US1) should be done first; T022 can be done in parallel with US1
- **Phase 5 (US3 — Reviews)**: Depends on Phase 2; T028 integrates into CourseDetailPage, so T014 (US1) should be done first
- **Phase 6 (Polish)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: Starts after Phase 2 — no other story dependencies
- **US2 (P2)**: Starts after Phase 2; `CourseDetailPage` integration (T020) needs T014 from US1 done first; dashboard (T022) can start after Phase 2 independently
- **US3 (P3)**: Starts after Phase 2; `CourseDetailPage` integration (T028) needs T014 from US1 done first

### Within Each User Story

- Repository → Service → Controller → Components → Page integration → Route

### Parallel Opportunities

- T004, T005, T006, T007 — all foundational (different files), run together
- T012, T013 — US1 components (StarRating, CourseAccordion), no dependency
- T016, T017, T018, T019, T021 — US2 (different files), run together
- T023, T024, T026, T027 — US3 (different files), run together
- T030, T031, T032 — polish tasks, run together

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (verify DB)
2. Complete Phase 2: Foundational (models + i18n)
3. Complete Phase 3: US1 (accordion + detail page route)
4. **STOP and VALIDATE**: Navigate to `/courses/<id>`, test accordion icons in enrolled/non-enrolled states
5. Proceed to US2 + US3 once MVP is confirmed

### Incremental Delivery

1. Setup + Foundational → Phase 1 & 2 complete
2. US1 → `/courses/:id` with curriculum accordion ← **MVP checkpoint**
3. US2 → Price CTA on detail page + dashboard category cards
4. US3 → Reviews on detail page + admin rating column
5. Polish → ESLint + quickstart validation

---

## Notes

- `getCourseWithSections` uses Supabase nested select syntax: `.select('*, sections(*, lessons(*))')`  with order applied via `.order('sort_order', {referencedTable: 'sections'}).order('sort_order', {referencedTable: 'sections.lessons'})`
- Bootstrap accordion open/close: React state `openSectionId: string | null`; toggle by comparing id; apply `show` class to `.accordion-collapse` conditionally
- Duration formatting helper: `formatDuration(seconds)` → "Xh Ym" if ≥ 60 min, "Y min" otherwise; "—" if `seconds` is null/undefined/0
- `getInitials(fullName)` — already exists in DashboardWrapper.tsx; extract to a shared utility or duplicate inline in CourseReviews.tsx
- `ki-lock`, `ki-media` (play), `ki-check-circle` are the Keenicons for the lesson status icons
