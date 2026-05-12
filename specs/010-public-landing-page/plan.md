# Implementation Plan: Public Landing Page

**Branch**: `010-public-landing-page` | **Date**: 2026-05-12 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/010-public-landing-page/spec.md`

## Summary

A public-facing marketing landing page at the root route `/`, accessible to unauthenticated visitors. Displays 7 sections (Hero, Featured Courses, Categories, Platform Stats, Latest Blog Posts, Testimonials, Footer) all backed by live Supabase data via anonymous RLS reads. The existing auth flow and all protected routes remain unchanged. `AppRoutes.tsx` is modified to serve the landing page at `/` before the auth-conditional catch-all.

## Technical Context

**Language/Version**: TypeScript ^5.3.3 + React ^18.2.0
**Primary Dependencies**: React Query 3.38.0, React Router DOM 6.30.3, Bootstrap 5 + Metronic SCSS, React Intl ^6.4.4, Keenicons (star ratings)
**Storage**: Supabase (PostgreSQL) via `src/app/lib/supabaseClient.ts` | Files: Supabase Storage `course-thumbnails` (public) and `blog-images` (public) — read only, no uploads
**Testing**: Manual browser verification per project constraints
**Target Platform**: Web (SPA, Vite + SWC)
**Performance Goals**: Above-the-fold content visible within 3 seconds (SC-001)
**Constraints**: No new npm dependencies; no auth required; Supabase anonymous RLS must be enabled for 6 tables; all strings i18n'd
**Scale/Scope**: Single-tenant SPA; public marketing page serving tens of courses and posts

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Technology Stack | ✅ PASS | No new dependencies; React Query, React Router, Bootstrap, Intl all in use |
| II. Project Structure | ✅ PASS | New page in `src/app/pages/landing/`; `AppRoutes.tsx` lightly modified; `_metronic/` untouched |
| III. TypeScript Rules | ✅ PASS | All new types in `model.ts`; no `any` |
| IV. Component & Styling | ✅ PASS | Bootstrap grid/cards/badges; Keenicons stars; colocated CSS for hero gradient; no hardcoded colors |
| V. Routing Rules | ✅ PASS | Public route added to `AppRoutes.tsx`; `LandingPage` lazy-loaded; kebab-case path `/` |
| VI. Data Fetching | ✅ PASS | All queries via `supabaseClient.ts`; React Query for caching; no raw useEffect data fetching |
| VII. Forms Rules | ✅ PASS | No forms on landing page |
| VIII. Internationalisation | ✅ PASS | 23 new `LANDING.*` i18n keys; all strings via intl |
| IX. Code Quality | ✅ PASS | PascalCase components, camelCase hooks; no commented-out code |
| X. Storage Rules | ✅ PASS | No uploads; existing thumbnail/image URLs read via `getPublicUrl`; no local writes |

**Supabase gate**: ✅ All DB reads via `src/app/lib/supabaseClient.ts`. Anonymous RLS policies required on 6 tables — listed as setup tasks. No writes.

**Post-design re-check**: All constraints met. No violations.

## Project Structure

### Documentation (this feature)

```text
specs/010-public-landing-page/
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
src/app/routing/
└── AppRoutes.tsx                    UPDATE — add public `/` route before auth conditional

src/app/pages/landing/
├── LandingPage.tsx                  NEW — main page component, composes all sections
├── LandingPage.css                  NEW — hero gradient + section spacing
├── model.ts                         NEW — PublicCourse, PublicCategory, PublicReview, PublicBlogPost, LandingStats types
├── landingRepository.ts             NEW — 5 Supabase query functions (anon reads)
└── components/
    ├── LandingTopBar.tsx            NEW — logo + Sign In link
    ├── LandingHero.tsx              NEW — headline, subheadline, 2 CTA buttons
    ├── LandingCourseCard.tsx        NEW — single course card (thumbnail, title, badges, stars)
    ├── LandingCategoryCard.tsx      NEW — single category card (name, course count)
    ├── LandingStatsBar.tsx          NEW — 4 stat counters
    ├── LandingBlogCard.tsx          NEW — single blog post card
    ├── LandingReviewCard.tsx        NEW — single testimonial card
    └── LandingFooter.tsx            NEW — footer with links and copyright

src/_metronic/i18n/messages/
├── en.json                          UPDATE — 23 new LANDING.* keys
└── de.ts                            UPDATE — matching German translations
```

### New i18n Keys

```
LANDING.PLATFORM_NAME          "LearnHub"
LANDING.TAGLINE                "Expand your skills, advance your career."
LANDING.HERO_HEADLINE          "Learn Without Limits"
LANDING.HERO_SUBHEADLINE       "Explore hundreds of courses taught by industry experts."
LANDING.BROWSE_COURSES         "Browse Courses"
LANDING.SIGN_IN                "Sign In"
LANDING.FEATURED_COURSES       "Featured Courses"
LANDING.VIEW_ALL_COURSES       "View All Courses"
LANDING.NO_COURSES             "No courses available yet."
LANDING.CATEGORIES_TITLE       "Browse by Category"
LANDING.COURSES_COUNT          "{count} courses"
LANDING.STATS_TOTAL_COURSES    "Total Courses"
LANDING.STATS_STUDENTS         "Students Enrolled"
LANDING.STATS_REVIEWS          "Reviews"
LANDING.STATS_BLOGS            "Blog Posts"
LANDING.LATEST_BLOGS           "Latest from the Blog"
LANDING.NO_BLOGS               "No posts available yet."
LANDING.READ_MORE              "Read More"
LANDING.TESTIMONIALS_TITLE     "What Our Students Say"
LANDING.FOOTER_TAGLINE         "Expand your skills, advance your career."
LANDING.FOOTER_HOME            "Home"
LANDING.FOOTER_SIGN_IN         "Sign In"
LANDING.FOOTER_COPYRIGHT       "© {year} LearnHub. All rights reserved."
LANDING.FREE                   "Free"
LANDING.PRICE_FORMAT           "€{price}"
```

## Complexity Tracking

No constitution violations. No complexity justification required.
