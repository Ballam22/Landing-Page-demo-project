# Implementation Plan: Courses — Udemy-Style Curriculum, Pricing & Reviews

**Branch**: `009-courses-udemy-style` | **Date**: 2026-04-29 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/009-courses-udemy-style/spec.md`

## Summary

Three interconnected features layered on top of the existing courses/sections/lessons/enrollments schema: (1) a Bootstrap accordion-based curriculum panel on a new learner-facing course detail page, with per-lesson lock/play/checkmark icons based on enrollment and progress; (2) price display and an "Enroll Now" CTA on the detail page plus a featured course card per category on the dashboard; (3) a reviews and star-rating system gated to enrolled users, displayed on the detail page and surfaced as an average-rating column in the admin course list. All reads/writes go through Supabase via the existing `supabaseClient.ts`. No new dependencies.

## Technical Context

**Language/Version**: TypeScript ^5.3.3 + React ^18.2.0
**Primary Dependencies**: React Query 3.38.0, Formik 2.2.9, Yup ^1.0.0, React Router DOM 6.30.3, Bootstrap 5 + Metronic SCSS, React Intl ^6.4.4, Keenicons (star icon for ratings)
**Storage**: Supabase (PostgreSQL) via `src/app/lib/supabaseClient.ts` | Files: Supabase Storage `course-thumbnails` (public) for thumbnail display — no new uploads in this feature
**Testing**: Manual browser verification per project constraints
**Target Platform**: Web (SPA, Vite + SWC)
**Project Type**: Admin panel web application
**Performance Goals**: Course detail page loads curriculum accordion within 3 seconds (SC-001)
**Constraints**: No new npm dependencies; no payment gateway; currency hardcoded to €; Bootstrap JS not relied upon for accordion (React-controlled state)
**Scale/Scope**: Single-tenant admin panel; course catalog expected to be tens of courses

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Technology Stack | ✅ PASS | No new major dependencies; all existing stack used |
| II. Project Structure | ✅ PASS | New code in `src/app/modules/course-management/` and `src/app/pages/dashboard/`; `src/_metronic/` not modified |
| III. TypeScript Rules | ✅ PASS | All new types defined in contracts/types.md; no `any` |
| IV. Component & Styling | ✅ PASS | Bootstrap accordion, Metronic cards/badges; Keenicons for stars; no inline hardcoded colors |
| V. Routing Rules | ✅ PASS | New `/courses/:id` route in PrivateRoutes.tsx using `React.lazy` + Suspense; kebab-case path |
| VI. Data Fetching | ✅ PASS | All queries through `supabaseClient.ts`; React Query for caching; no raw `useEffect` data fetching |
| VII. Forms Rules | ✅ PASS | Review form via Formik + Yup; submit button disabled + spinner during submission |
| VIII. Internationalisation | ✅ PASS | New i18n keys planned for all new user-facing strings |
| IX. Code Quality | ✅ PASS | PascalCase components, camelCase hooks; no commented-out code |
| X. Storage Rules | ✅ PASS | No new uploads; existing thumbnail URLs read via `getPublicUrl`; no local writes |

**Supabase gate**: ✅ All DB reads/writes use `src/app/lib/supabaseClient.ts`. `reviews` table read/insert; no new storage bucket needed.

**Post-design re-check**: All constraints met. No violations.

## Project Structure

### Documentation (this feature)

```text
specs/009-courses-udemy-style/
├── plan.md              ← this file
├── research.md          ← Phase 0 complete
├── data-model.md        ← Phase 1 complete
├── contracts/
│   └── types.md         ← Phase 1 complete
├── quickstart.md        ← Phase 1 complete
├── checklists/
│   └── requirements.md
└── tasks.md             ← Phase 2 (/speckit.tasks)
```

### Source Code Changes

```text
src/app/modules/course-management/
├── model/
│   ├── Course.ts                    UPDATE — add price, avgRating?, reviewCount?
│   └── Review.ts                    NEW
├── repository/
│   ├── courseRepository.ts          UPDATE — add price to DbRow/mapper, getCourseWithSections, getFeaturedCoursesByCategory, getAverageRatingsByCourse
│   └── reviewRepository.ts          NEW
├── service/
│   ├── courseService.ts             UPDATE — pass price in create/edit
│   └── reviewService.ts             NEW
├── controller/
│   ├── useCourseController.ts       UPDATE — add price to form values; add useCourseDetail hook
│   └── useReviewController.ts       NEW
├── course-detail/                   NEW folder
│   ├── CourseDetailPage.tsx         NEW
│   └── components/
│       ├── CourseAccordion.tsx      NEW
│       ├── CoursePricingCTA.tsx     NEW
│       ├── CourseReviews.tsx        NEW
│       ├── ReviewForm.tsx           NEW
│       └── StarRating.tsx           NEW
└── course-list/
    └── components/
        └── CoursesTable.tsx         UPDATE — add Avg Rating column

src/app/pages/dashboard/
└── DashboardWrapper.tsx             UPDATE — add "Browse by Category" section with FeaturedCategoryCard

src/app/routing/
└── PrivateRoutes.tsx                UPDATE — add /courses/:id route (no role guard)

src/_metronic/i18n/messages/
├── en.json                          UPDATE — new COURSE_DETAIL.* and REVIEWS.* keys
└── de.ts                            UPDATE — matching German translations
```

### New i18n Keys

```
COURSE_DETAIL.CURRICULUM_TITLE        "Course Content"
COURSE_DETAIL.NO_CURRICULUM           "No curriculum available yet."
COURSE_DETAIL.LESSONS_COUNT           "{count} lessons"
COURSE_DETAIL.ENROLL_NOW              "Enroll Now"
COURSE_DETAIL.CONTINUE_LEARNING       "Continue Learning"
COURSE_DETAIL.FREE                    "Free"
COURSE_DETAIL.PRICE_FORMAT            "€{price}"
COURSE_DETAIL.REVIEWS_TITLE           "Student Reviews"
COURSE_DETAIL.NO_REVIEWS              "No reviews yet. Be the first to review this course."
COURSE_DETAIL.REVIEW_PLACEHOLDER      "Share your experience with this course…"
COURSE_DETAIL.SUBMIT_REVIEW           "Submit Review"
COURSE_DETAIL.THANK_YOU_REVIEW        "Thank you for your review!"
COURSE_DETAIL.AGGREGATE_LABEL         "{avg} · {count} reviews"
COURSE_DETAIL.FEATURED_COURSES_TITLE  "Browse by Category"
COURSE_DETAIL.NO_COURSES_CATEGORY     "No courses available yet"
COURSE_DETAIL.AVG_RATING_COLUMN       "Avg Rating"
```

## Complexity Tracking

No constitution violations. No complexity justification required.
