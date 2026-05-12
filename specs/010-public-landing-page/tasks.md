# Tasks: Public Landing Page

**Input**: Design documents from `/specs/010-public-landing-page/`
**Prerequisites**: plan.md âœ… spec.md âœ… research.md âœ… data-model.md âœ… contracts/types.md âœ… quickstart.md âœ…

**Tests**: Not requested â€” manual browser verification per project constraints.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)

---

## Phase 1: Setup (Supabase RLS for Anonymous Reads)

**Purpose**: Enable unauthenticated Supabase reads on all tables the landing page queries. Run each statement in Supabase SQL Editor. Check for duplicate policy names before running.

- [ ] T001 In Supabase SQL Editor, enable anonymous read on `courses`: `CREATE POLICY "landing_courses_read" ON public.courses FOR SELECT TO anon USING (true);`
- [ ] T002 In Supabase SQL Editor, enable anonymous read on `categories`: `CREATE POLICY "landing_categories_read" ON public.categories FOR SELECT TO anon USING (true);`
- [ ] T003 In Supabase SQL Editor, enable anonymous read on `reviews`: `CREATE POLICY "landing_reviews_read" ON public.reviews FOR SELECT TO anon USING (true);`
- [ ] T004 In Supabase SQL Editor, enable anonymous read on `enrollments`: `CREATE POLICY "landing_enrollments_read" ON public.enrollments FOR SELECT TO anon USING (true);`
- [ ] T005 In Supabase SQL Editor, enable anonymous read on `blog_posts`: `CREATE POLICY "landing_blog_posts_read" ON public.blog_posts FOR SELECT TO anon USING (true);`
- [ ] T006 In Supabase SQL Editor, enable anonymous read on `users`: `CREATE POLICY "landing_users_read" ON public.users FOR SELECT TO anon USING (true);`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Types, repository, i18n, and CSS that all four user stories depend on.

**âš ï¸ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T007 [P] Create `src/app/pages/landing/model.ts` â€” export `PublicCourse` type (id, title, thumbnailUrl, categoryId, categoryName, price, avgRating); export `PublicCategory` (id, name, courseCount); export `PublicReview` (id, courseId, courseTitle, rating, comment, createdAt, user?: {fullName, avatarUrl}); export `PublicBlogPost` (id, title, excerpt, featuredImageUrl, categoryName, publishedAt); export `LandingStats` (totalCourses, totalStudents, totalReviews, publishedBlogs)
- [X] T008 Create `src/app/pages/landing/landingRepository.ts` â€” implement all 5 functions using `supabase` from `src/app/lib/supabaseClient.ts`: (a) `getPublicCourses()`: SELECT published courses + categories join, order sort_order ASC, limit 6, compute avgRating by fetching all reviews and aggregating per courseId client-side; (b) `getPublicCategories()`: SELECT all categories, for each count published courses; (c) `getLandingStats()`: count published courses, count distinct user_id from enrollments (fetch all, deduplicate in JS), count reviews, count published blog_posts; (d) `getTopReviews()`: SELECT top 3 reviews ORDER BY rating DESC, created_at DESC, join users(full_name, avatar_url) and courses(title); (e) `getLatestBlogPosts()`: SELECT 3 most recent published blog_posts ORDER BY published_at DESC, join categories(name), map featured_image_path â†’ public URL via `supabase.storage.from('blog-images').getPublicUrl(path)`
- [X] T009 [P] Add all 25 `LANDING.*` keys to `src/_metronic/i18n/messages/en.json` (append before closing brace): `LANDING.PLATFORM_NAME` ("LearnHub"), `LANDING.TAGLINE` ("Expand your skills, advance your career."), `LANDING.HERO_HEADLINE` ("Learn Without Limits"), `LANDING.HERO_SUBHEADLINE` ("Explore hundreds of courses taught by industry experts."), `LANDING.BROWSE_COURSES` ("Browse Courses"), `LANDING.SIGN_IN` ("Sign In"), `LANDING.FEATURED_COURSES` ("Featured Courses"), `LANDING.VIEW_ALL_COURSES` ("View All Courses"), `LANDING.NO_COURSES` ("No courses available yet."), `LANDING.CATEGORIES_TITLE` ("Browse by Category"), `LANDING.COURSES_COUNT` ("{count} courses"), `LANDING.STATS_TOTAL_COURSES` ("Total Courses"), `LANDING.STATS_STUDENTS` ("Students Enrolled"), `LANDING.STATS_REVIEWS` ("Reviews"), `LANDING.STATS_BLOGS` ("Blog Posts"), `LANDING.LATEST_BLOGS` ("Latest from the Blog"), `LANDING.NO_BLOGS` ("No posts available yet."), `LANDING.READ_MORE` ("Read More"), `LANDING.TESTIMONIALS_TITLE` ("What Our Students Say"), `LANDING.FOOTER_HOME` ("Home"), `LANDING.FOOTER_SIGN_IN` ("Sign In"), `LANDING.FOOTER_COPYRIGHT` ("Â© {year} LearnHub. All rights reserved."), `LANDING.FREE` ("Free"), `LANDING.PRICE_FORMAT` ("â‚¬{price}"), `LANDING.LOADING` ("Loadingâ€¦")
- [X] T010 [P] Add matching German translations for all 25 `LANDING.*` keys to `src/_metronic/i18n/messages/de.ts`
- [X] T011 [P] Create `src/app/pages/landing/LandingPage.css` â€” define: `.landing-hero` (background linear-gradient using `var(--bs-primary)` and `var(--bs-info)`, min-height 480px, display flex, align-items center, color white); `.landing-section` (padding 60px 0); `.landing-section-alt` (background `var(--bs-light)`, padding 60px 0); `.landing-topbar` (background white, border-bottom, padding 12px 0); `.landing-stat-value` (font-size 2.5rem, font-weight 700, color `var(--bs-primary)`); `.landing-course-thumbnail` (height 160px, object-fit cover, width 100%); `.landing-blog-thumbnail` (height 180px, object-fit cover, width 100%)

**Checkpoint**: Types, data layer, i18n, and CSS ready â€” user story implementation can begin.

---

## Phase 3: User Story 1 â€” Hero & Navigation (Priority: P1) ðŸŽ¯ MVP

**Goal**: A fully rendered landing page at `/` accessible to unauthenticated users with a working top bar, hero section, and footer. No data fetching required for this story.

**Independent Test**: Open `/` in an incognito window. Verify page renders (not redirected to `/auth`). Verify hero headline, both CTA buttons, and footer are visible. Click "Sign In" â€” verify redirect to `/auth`.

### Implementation

- [X] T012 [P] [US1] Create `src/app/pages/landing/components/LandingTopBar.tsx` â€” renders a Bootstrap `navbar navbar-light bg-white border-bottom`; left side: platform name from `LANDING.PLATFORM_NAME` i18n key as bold text; right side: `<Link to='/auth/login'>` with `btn btn-sm btn-primary` styled as "Sign In" (`LANDING.SIGN_IN` key); import `useIntl` and `Link` from `react-router-dom`
- [X] T013 [P] [US1] Create `src/app/pages/landing/components/LandingHero.tsx` â€” full-width `div` with className `landing-hero`; centered container with: `h1` heading from `LANDING.HERO_HEADLINE`, `p` subheadline from `LANDING.HERO_SUBHEADLINE`, two `<Link>` buttons: `btn btn-light btn-lg me-3` for "Browse Courses" â†’ `/auth/login` and `btn btn-outline-light btn-lg` for "Sign In" â†’ `/auth/login`; both use i18n keys
- [X] T014 [P] [US1] Create `src/app/pages/landing/components/LandingFooter.tsx` â€” `footer` element with `bg-dark text-light py-5`; top row: platform name + tagline (`LANDING.TAGLINE`); nav links row: `<Link to='/'>` ("Home"), `<Link to='/auth/login'>` ("Sign In"); bottom row: copyright line using `LANDING.FOOTER_COPYRIGHT` with `{year: new Date().getFullYear()}`; all strings via `useIntl`
- [X] T015 [US1] Create `src/app/pages/landing/LandingPage.tsx` â€” imports `LandingTopBar`, `LandingHero`, `LandingFooter` and `LandingPage.css`; renders them in order inside a `<div>` wrapper; export default; no data fetching yet â€” placeholders with `{/* FEATURED_COURSES section â€” added in T019 */}` and other section comments between hero and footer
- [X] T016 [US1] Update `src/app/routing/AppRoutes.tsx` â€” add `const LandingPage = lazy(() => import('../pages/landing/LandingPage'))` at the top of the component; add `<Route path='/' element={<Suspense fallback={<div />}><LandingPage /></Suspense>} />` as the FIRST child of `<Route element={<App />}>`, before the `{currentUser ? ... : ...}` conditional block; add necessary imports (`lazy`, `Suspense` already imported â€” verify)

**Checkpoint**: Navigate to `/` in incognito â€” landing page renders, CTAs navigate to auth, existing `/dashboard` and `/auth` routes unaffected.

---

## Phase 4: User Story 2 â€” Course & Category Discovery (Priority: P2)

**Goal**: Featured Courses grid (up to 6 published courses) and Categories strip visible on the landing page with live Supabase data.

**Independent Test**: With at least one published course, open `/` without login. Verify course card shows title, category badge, price badge, and star rating. Verify categories section shows category names with course counts.

### Implementation

- [X] T017 [P] [US2] Create `src/app/pages/landing/components/LandingCourseCard.tsx` â€” props: `course: PublicCourse`; renders a Bootstrap `card h-100`; thumbnail `<img className='landing-course-thumbnail'>` or placeholder `div` with category initial if no `thumbnailUrl`; card body: category badge (`badge badge-light-secondary`), title as `<h6 className='fw-bold'>`, bottom row: `StarRating` from `../../modules/course-management/section-lesson/components/StarRating` (display-only, `value={Math.round(course.avgRating)}`) + price badge (`badge badge-light-success` for Free, `badge badge-light-primary` for paid); price label uses `LANDING.FREE` / `LANDING.PRICE_FORMAT` i18n keys
- [X] T018 [P] [US2] Create `src/app/pages/landing/components/LandingCategoryCard.tsx` â€” props: `category: PublicCategory`; renders a Bootstrap `card text-center p-4`; large letter avatar div (`fs-1 fw-bolder text-primary bg-light-primary rounded-circle mx-auto mb-3`, 64Ã—64px) showing first letter of category name; category name in `fw-bold`; course count as `text-muted fs-7` using `LANDING.COURSES_COUNT` i18n key with `{count: category.courseCount}`
- [X] T019 [US2] Update `src/app/pages/landing/LandingPage.tsx` â€” add `useQuery(['public-courses'], getPublicCourses, {staleTime: 0})` import and call; add Featured Courses section between hero and first comment: `<section className='landing-section'>` with container, heading from `LANDING.FEATURED_COURSES`, loading spinner while loading, `row g-5` grid of `col-xl-4 col-md-6` columns each rendering `<LandingCourseCard>`; empty state paragraph when 0 results; `<Link to='/auth/login'>` "View All Courses" below grid
- [X] T020 [US2] Update `src/app/pages/landing/LandingPage.tsx` â€” add `useQuery(['public-categories'], getPublicCategories, {staleTime: 0})`; add Categories section `<section className='landing-section-alt'>` below Featured Courses: heading from `LANDING.CATEGORIES_TITLE`, `row g-4` grid of `col-xl-2 col-md-3 col-sm-4 col-6` columns each rendering `<LandingCategoryCard>`; show loading spinner while loading

**Checkpoint**: Featured courses and categories visible with live data; empty states work.

---

## Phase 5: User Story 3 â€” Platform Credibility (Priority: P3)

**Goal**: Stats bar (4 counters) and Testimonials section (top 3 reviews) visible below categories. Testimonials hidden when no reviews exist.

**Independent Test**: Navigate to `/`. Verify 4 stat counters show numeric values. If reviews exist, verify up to 3 review cards appear with user name, stars, comment, and course title. Delete all reviews in Supabase â€” reload page â€” verify Testimonials section disappears entirely.

### Implementation

- [X] T021 [P] [US3] Create `src/app/pages/landing/components/LandingStatsBar.tsx` â€” props: `stats: LandingStats`, `isLoading: boolean`; renders a `<section className='landing-section bg-primary text-white'>` with a `row g-5 text-center` of 4 `col-md-3` counters; each counter: large number (`landing-stat-value` class, override color to white) + label below; labels use `LANDING.STATS_TOTAL_COURSES`, `LANDING.STATS_STUDENTS`, `LANDING.STATS_REVIEWS`, `LANDING.STATS_BLOGS`; while `isLoading`: show `â€”` placeholder in number position
- [X] T022 [P] [US3] Create `src/app/pages/landing/components/LandingReviewCard.tsx` â€” props: `review: PublicReview`; renders a Bootstrap `card h-100 p-4`; top row: `symbol symbol-circle symbol-40px` avatar (img if `review.user?.avatarUrl`, else initials `bg-light-primary text-primary`) + reviewer name `fw-bold` + `StarRating` display-only; course title as `text-muted fs-7 mb-3` (e.g. "on {courseTitle}"); comment paragraph (omitted if undefined); date `text-muted fs-7` via `toLocaleDateString()`; reuse `StarRating` from `../../modules/course-management/section-lesson/components/StarRating`
- [X] T023 [US3] Update `src/app/pages/landing/LandingPage.tsx` â€” add `useQuery(['landing-stats'], getLandingStats, {staleTime: 0})`; add `<LandingStatsBar stats={stats} isLoading={statsLoading} />` below the Categories section
- [X] T024 [US3] Update `src/app/pages/landing/LandingPage.tsx` â€” add `useQuery(['top-reviews'], getTopReviews, {staleTime: 0})`; add Testimonials section `<section className='landing-section'>` below Stats: render ONLY if `reviews.length > 0` (hidden entirely when empty); heading from `LANDING.TESTIMONIALS_TITLE`; `row g-5` grid of `col-md-4` columns each rendering `<LandingReviewCard>`

**Checkpoint**: Stats show live counts; testimonials appear for courses with reviews; section disappears when no reviews.

---

## Phase 6: User Story 4 â€” Blog & Footer (Priority: P4)

**Goal**: Latest Blog Posts section (up to 3 cards) visible above the footer.

**Independent Test**: With at least one published blog post, open `/`. Verify blog card shows image/placeholder, title, excerpt/preview, category badge, and "Read More" button linking to `/auth/login`. With no published posts, verify empty-state message shows.

### Implementation

- [X] T025 [P] [US4] Create `src/app/pages/landing/components/LandingBlogCard.tsx` â€” props: `post: PublicBlogPost`; renders a Bootstrap `card h-100`; featured image `<img className='landing-blog-thumbnail'>` or placeholder div with `bg-light` and camera icon (`ki-duotone ki-picture`) if no `featuredImageUrl`; card body: category badge (`badge badge-light-primary mb-2`), `<h6 className='fw-bold'>` title, `<p className='text-muted fs-7'>` excerpt (truncated to 120 chars with "â€¦" if longer); footer: `<Link to='/auth/login' className='btn btn-sm btn-light-primary'>` using `LANDING.READ_MORE` i18n key
- [X] T026 [US4] Update `src/app/pages/landing/LandingPage.tsx` â€” add `useQuery(['latest-blogs'], getLatestBlogPosts, {staleTime: 0})`; add Latest Blogs section `<section className='landing-section-alt'>` between Testimonials and Footer: heading from `LANDING.LATEST_BLOGS`; loading spinner while fetching; `row g-5` grid of `col-md-4` columns each rendering `<LandingBlogCard>`; if 0 posts: paragraph with `LANDING.NO_BLOGS`

**Checkpoint**: All 7 sections (TopBar, Hero, Featured Courses, Categories, Stats, Testimonials, Blogs, Footer) rendered and independently testable.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Quality pass and end-to-end validation.

- [ ] T027 [P] Run all 5 scenarios from `specs/010-public-landing-page/quickstart.md`: unauthenticated access, CTA navigation, authenticated user visit, empty states, mobile responsiveness at 375px viewport
- [ ] T028 [P] Audit all new and modified files for hardcoded English strings; replace with `intl.formatMessage()` calls and add any missing keys to both `en.json` and `de.ts`
- [ ] T029 [P] Run `eslint --max-warnings 0` across all files in `src/app/pages/landing/` and the modified `src/app/routing/AppRoutes.tsx`; fix every warning before marking complete

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No code dependencies â€” run SQL statements in Supabase immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 confirmation â€” BLOCKS all user stories
- **Phase 3 (US1)**: Depends on Phase 2 â€” **MVP checkpoint** after completion
- **Phase 4 (US2)**: Depends on Phase 2; T019/T020 modify `LandingPage.tsx` created in T015 (US1) â€” complete US1 first
- **Phase 5 (US3)**: Depends on Phase 2; T023/T024 modify `LandingPage.tsx` â€” complete US1 first
- **Phase 6 (US4)**: Depends on Phase 2; T026 modifies `LandingPage.tsx` â€” complete US1 first
- **Phase 7 (Polish)**: Depends on all desired stories complete

### User Story Dependencies

- **US1 (P1)**: After Phase 2 â€” no other story dependency; delivers standalone MVP
- **US2 (P2)**: After Phase 2; `LandingPage.tsx` integration tasks (T019, T020) require T015 done
- **US3 (P3)**: After Phase 2; integration tasks (T023, T024) require T015 done
- **US4 (P4)**: After Phase 2; integration task (T026) requires T015 done

### Within Each User Story

- Repository/model â†’ Components â†’ Page integration â†’ Route

### Parallel Opportunities

- T007, T009, T010, T011 â€” foundational (different files), run together
- T012, T013, T014 â€” US1 components (different files), run together
- T017, T018 â€” US2 components (different files), run together
- T021, T022 â€” US3 components (different files), run together
- T027, T028, T029 â€” polish tasks, run together

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (Supabase RLS â€” can be done in parallel with coding)
2. Complete Phase 2: Foundational (types + repo + i18n + CSS)
3. Complete Phase 3: US1 (TopBar + Hero + Footer + route)
4. **STOP and VALIDATE**: Open `/` in incognito â€” page renders, CTAs work, auth unaffected
5. Proceed to US2â€“US4 once MVP is confirmed

### Incremental Delivery

1. Phase 1 + 2 â†’ Foundation ready
2. US1 â†’ Public route with Hero/Footer â† **MVP checkpoint**
3. US2 â†’ Featured Courses + Categories grids
4. US3 â†’ Stats + Testimonials
5. US4 â†’ Latest Blogs
6. Polish â†’ ESLint + quickstart verification

---

## Notes

- `StarRating` component already exists at `src/app/modules/course-management/section-lesson/components/StarRating.tsx` â€” reuse it in `LandingCourseCard` and `LandingReviewCard`
- `AppRoutes.tsx` change: the new `<Route path='/' â€¦>` must be placed BEFORE the `{currentUser ? ... : ...}` block â€” React Router matches in order, so the explicit `/` resolves first
- `getPublicCourses()` fetches all reviews to compute `avgRating` per course client-side â€” acceptable at this scale (tens of courses)
- `getLandingStats()` fetches all `enrollments` rows to count distinct `user_id` â€” acceptable at this scale; replace with a COUNT(DISTINCT) RPC if scale grows
- Blog `featured_image_path` â†’ public URL: use `supabase.storage.from('blog-images').getPublicUrl(path).data.publicUrl`
- Review `users` join: Supabase nested select `users(full_name, avatar_url)` â€” same pattern as `reviewRepository.ts` in feature 009
