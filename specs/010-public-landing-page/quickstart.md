# Quickstart & Integration Scenarios

**Branch**: `010-public-landing-page` | **Date**: 2026-05-12

---

## Prerequisites

1. Supabase RLS `anon` read policies applied to `courses`, `categories`, `reviews`, `enrollments`, `blog_posts`, `users`.
2. At least one published course with a category assigned.
3. At least one published blog post.
4. Dev server running (`npm run dev`).

---

## Scenario 1: Unauthenticated Visitor Browses the Landing Page

**Goal**: Verify the landing page is publicly accessible and displays all sections.

**Steps**:
1. Open a private/incognito browser window (no active session).
2. Navigate to `http://localhost:5173/` (or your dev URL).
3. Verify the landing page renders — NOT redirected to `/auth/login`.
4. Verify the top bar shows the platform name and a "Sign In" button.
5. Scroll down through all sections:
   - Hero: headline, subheadline, "Browse Courses" and "Sign In" CTAs visible.
   - Featured Courses: up to 6 course cards with thumbnail/placeholder, title, category badge, price badge, star rating.
   - Categories: cards for each category with name and course count.
   - Stats: 4 counters (Total Courses, Students Enrolled, Reviews, Blog Posts) with numeric values.
   - Latest Blogs: up to 3 blog post cards with image/placeholder, title, excerpt, category, "Read More" button.
   - Testimonials: up to 3 review cards (hidden if no reviews exist).
   - Footer: platform name, tagline, navigation links, copyright.

**Pass criteria**:
- Page renders at `/` without redirect.
- All sections display without console errors.
- Data in each section matches what is in Supabase.

---

## Scenario 2: CTA Navigation

**Goal**: Verify both CTA buttons and all links lead to the correct destinations.

**Steps**:
1. On the landing page (unauthenticated), click "Browse Courses" in the hero.
2. Verify navigation to `/auth/login` (or `/auth`).
3. Go back. Click "Sign In" in the hero.
4. Verify navigation to `/auth/login`.
5. Click "Sign In" in the top bar.
6. Verify navigation to `/auth/login`.
7. Click "View All Courses" link below the course grid.
8. Verify navigation to `/auth/login`.
9. Click "Read More" on a blog card.
10. Verify navigation to `/auth/login`.
11. Click "Sign In" in the footer.
12. Verify navigation to `/auth/login`.

**Pass criteria**: All CTAs and links navigate to the sign-in page for unauthenticated visitors.

---

## Scenario 3: Authenticated User Visits `/`

**Goal**: Verify that an already-logged-in user is NOT force-redirected away from the landing page.

**Steps**:
1. Log in to the app normally.
2. Navigate directly to `/` in the address bar.
3. Verify the landing page renders (not redirected to `/dashboard`).
4. Verify all sections display the same data as for unauthenticated users.

**Pass criteria**: Landing page accessible to authenticated users — no unwanted redirect.

---

## Scenario 4: Empty States

**Goal**: Verify graceful empty states when data is absent.

**Steps**:
1. In Supabase, unpublish all courses (or use a test DB with no published courses).
2. Navigate to `/`.
3. Verify the Featured Courses section shows the "No courses available yet." message — not an empty grid or crash.
4. Verify the Categories section still renders (with "0 courses" counts).
5. In Supabase, verify no reviews exist (delete or use empty DB).
6. Navigate to `/`.
7. Verify the Testimonials section is completely hidden — no empty card grid or heading.
8. Verify all other sections still render normally.

**Pass criteria**:
- Featured Courses: empty-state message shown, no crash.
- Testimonials: hidden when no reviews.
- Stats: show `0` counts, not blank.

---

## Scenario 5: Mobile Responsiveness

**Goal**: Verify the landing page is usable on small screens.

**Steps**:
1. Open browser DevTools, set viewport to 375 × 812 (iPhone SE).
2. Navigate to `/`.
3. Verify:
   - Top bar: platform name and Sign In button visible, no overflow.
   - Hero: headline and buttons stacked vertically, readable.
   - Featured Courses: single-column card layout.
   - Categories: wraps to 1–2 columns.
   - Stats bar: wraps to 2×2 grid or single column.
   - Blog cards: single-column layout.
   - Footer: stacks vertically, all links visible.

**Pass criteria**: No horizontal scroll, no text overflow, all CTAs tappable.
