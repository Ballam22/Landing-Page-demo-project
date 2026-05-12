# Feature Specification: Public Landing Page

**Feature Branch**: `010-public-landing-page`
**Created**: 2026-05-12
**Status**: Draft
**Input**: User description: "Create a public-facing landing page for a course platform (no login required)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Hero & Navigation (Priority: P1)

A visitor arrives at the platform's root URL for the first time. They see a compelling hero section with a clear headline, subheadline, and two action buttons: one to browse courses (redirects to sign-in if not authenticated) and one to sign in directly. The page loads quickly and looks polished without requiring any login.

**Why this priority**: The hero is the first impression — it must exist and work before any other section matters. It is the minimal viable landing page on its own.

**Independent Test**: Navigate to `/` without being logged in. Verify the hero section renders with headline, subheadline, and both CTA buttons. Click "Sign In" — verify navigation to the login page. Click "Browse Courses" — verify navigation to the login page (since auth is required for the dashboard).

**Acceptance Scenarios**:

1. **Given** an unauthenticated visitor, **When** they navigate to `/`, **Then** the landing page renders fully without redirecting to login.
2. **Given** the hero section is visible, **When** the visitor clicks "Sign In", **Then** they are taken to the sign-in page.
3. **Given** the hero section is visible, **When** the visitor clicks "Browse Courses", **Then** they are taken to the sign-in page.
4. **Given** an already authenticated user, **When** they navigate to `/`, **Then** the landing page still renders (no forced redirect away).

---

### User Story 2 - Course & Category Discovery (Priority: P2)

A prospective student wants to explore what courses are available before committing to sign up. They can scroll down to see a grid of up to 6 published courses — each showing the thumbnail, title, category, price, and star rating — as well as a category strip showing all categories with their course counts.

**Why this priority**: This is the primary conversion driver — visitors decide to sign up based on seeing the course catalogue.

**Independent Test**: With at least one published course in the database, navigate to `/`. Verify the Featured Courses section shows the course card with correct title, price, and category. Verify the Categories section shows at least one category with a course count.

**Acceptance Scenarios**:

1. **Given** published courses exist, **When** the visitor views the landing page, **Then** up to 6 published courses are displayed in a grid, ordered by sort order.
2. **Given** a course card is visible, **When** the visitor reads it, **Then** they can see: thumbnail or placeholder, title, category badge, price badge ("Free" or "€X.XX"), and star rating.
3. **Given** categories with courses exist, **When** the visitor views the Categories section, **Then** each category card shows the category name and the number of published courses in it.
4. **Given** no published courses exist, **When** the visitor views the landing page, **Then** the Featured Courses section shows a neutral empty-state message instead of an empty grid.
5. **Given** a category has zero published courses, **When** the visitor views it, **Then** the course count shows "0 courses".

---

### User Story 3 - Platform Credibility (Priority: P3)

A visitor wants to gauge the platform's size and quality before signing up. They see a stats bar showing total courses, total enrolled students, total reviews, and published blog posts — all live numbers from the database. Below that, they see the 3 highest-rated reviews from real students with names, star ratings, and comments.

**Why this priority**: Social proof and stats build trust and increase conversion, but the page is still useful without them.

**Independent Test**: Navigate to `/`. Verify the stats bar shows 4 counters with numeric values. If at least one review exists, verify it appears in the Testimonials section.

**Acceptance Scenarios**:

1. **Given** the stats section is visible, **When** the visitor reads it, **Then** they see four counters: Total Courses, Total Students, Total Reviews, Published Blog Posts — all showing live numeric values.
2. **Given** 3 or more reviews exist, **When** the visitor views the Testimonials section, **Then** exactly 3 reviews are shown, ordered by rating descending.
3. **Given** fewer than 3 reviews exist, **When** the visitor views the Testimonials section, **Then** however many reviews exist are shown (1 or 2).
4. **Given** no reviews exist, **When** the visitor views the landing page, **Then** the Testimonials section is hidden entirely.
5. **Given** a review is visible, **When** the visitor reads it, **Then** they see: user avatar or initials, full name, star rating, comment text, and the course title being reviewed.

---

### User Story 4 - Blog & Footer (Priority: P4)

A visitor wants to see what content the platform produces. They see the 3 most recent published blog posts with image, title, excerpt, and category. At the bottom of the page, a footer provides navigation links and a copyright line.

**Why this priority**: Adds depth and SEO value, but is the least critical to conversion.

**Independent Test**: Navigate to `/`. If published blog posts exist, verify the Latest Posts section shows up to 3 cards. Verify the footer is visible with at least the platform name and a sign-in link.

**Acceptance Scenarios**:

1. **Given** published blog posts exist, **When** the visitor views the Latest Posts section, **Then** up to 3 posts are shown, ordered by publish date descending.
2. **Given** a blog card is visible, **When** the visitor reads it, **Then** they see: featured image or placeholder, title, excerpt or plain-text preview, category badge, and a "Read More" button.
3. **Given** the visitor clicks "Read More", **Then** they are taken to the sign-in page.
4. **Given** no published blog posts exist, **When** the visitor views the landing page, **Then** the Latest Posts section shows a neutral empty-state message.
5. **Given** the footer is visible, **When** the visitor reads it, **Then** they see the platform name, tagline, navigation links (Home, Sign In), and a copyright line.

---

### Edge Cases

- What happens when all Supabase queries are slow? Each section loads independently — a spinner shows per section, others are not blocked.
- What happens if the `courses` table has no published courses? The Featured Courses section shows an empty-state message; the Categories section still lists categories with "0 courses".
- What happens if an authenticated user visits `/`? The landing page renders normally — no forced redirect.
- What happens if a review has no comment? The review card shows the star rating and user info only, no empty comment placeholder.
- What happens if a course has no thumbnail? A placeholder with the category initial or a generic icon is shown.
- What happens if a blog post has no featured image? A neutral placeholder div is shown in its place.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The landing page MUST be accessible at the root route `/` without requiring authentication.
- **FR-002**: The existing authenticated app routes MUST remain protected — the landing page does not weaken any auth guards.
- **FR-003**: The hero section MUST display a headline, subheadline, and two CTA buttons ("Browse Courses" and "Sign In"), both leading to the sign-in page for unauthenticated visitors.
- **FR-004**: The Featured Courses section MUST display up to 6 published courses ordered by sort order, each showing thumbnail or placeholder, title, category badge, price label, and average star rating.
- **FR-005**: The Categories section MUST display all categories with a count of published courses in each.
- **FR-006**: The Platform Stats section MUST display four live counters: total published courses, total enrolled students (distinct users), total reviews, published blog posts.
- **FR-007**: The Latest Blog Posts section MUST display up to 3 most recent published blog posts, each showing featured image or placeholder, title, excerpt, category badge, and a "Read More" button linking to the sign-in page.
- **FR-008**: The Testimonials section MUST display the top 3 reviews by rating; if no reviews exist, the section MUST be hidden.
- **FR-009**: Each review card MUST show: user avatar or initials, full name, star rating, comment (if present), and the title of the reviewed course.
- **FR-010**: The footer MUST show the platform name, a tagline, navigation links (Home, Sign In), and a copyright line.
- **FR-011**: All data MUST be readable without an authenticated session — Supabase RLS policies for `courses`, `categories`, `reviews`, `enrollments`, and `blog_posts` must permit anonymous SELECT.
- **FR-012**: The page MUST be fully responsive and usable on mobile, tablet, and desktop screen sizes.
- **FR-013**: Each section that fetches remote data MUST show a loading indicator while data is being fetched.

### Key Entities

- **Course** (read-only): title, thumbnail, category, price, average rating, status (Published only shown)
- **Category**: name, published course count
- **Review**: rating, comment, created_at, reviewer name and avatar, course title
- **Blog Post** (read-only): title, excerpt, featured image, category, status (Published only shown)
- **Platform Stats**: aggregated counts derived from courses, enrollments, reviews, blog_posts tables

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The landing page renders all above-the-fold content (Hero + top of Featured Courses) within 3 seconds on a standard broadband connection.
- **SC-002**: A visitor can reach the sign-in page from the landing page in a single click from any CTA button.
- **SC-003**: All 7 sections render without visual errors or layout breakage on screen widths from 375px (mobile) to 1440px (desktop).
- **SC-004**: A visitor with no prior knowledge of the platform can understand what it offers within 30 seconds of viewing the landing page (Hero + Featured Courses sections sufficient).
- **SC-005**: Stats counters show accurate live counts — a course added in the admin panel appears in the Total Courses counter on the next page load without a code change.
- **SC-006**: The landing page loads and renders correctly even when the database has zero courses, zero reviews, and zero blog posts (empty-state messages shown, no crashes).

---

## Assumptions

- The platform name and tagline are not yet defined — the implementation will use a placeholder ("LearnHub" / "Expand your skills, advance your career") that can be changed later via i18n keys.
- "Browse Courses" for unauthenticated users redirects to sign-in (not a public course catalogue) since the course detail page currently requires auth; this is acceptable for v1.
- Supabase RLS policies for anonymous reads on `courses`, `categories`, `reviews`, and `blog_posts` will need to be added as part of this feature's setup tasks — they do not currently exist.
- The `enrollments` table count (for "Total Students") will be a distinct count of `user_id` values — not total enrollment records.
- Reviews shown in Testimonials are the highest-rated ones globally (not per course); ties broken by most recent `created_at`.
- No pagination is required on the landing page — all sections show a fixed maximum number of items (6 courses, 3 posts, 3 reviews).
- The landing page does not have its own navigation bar — a minimal top bar with the platform logo/name and a "Sign In" button is sufficient.
- Authenticated users visiting `/` see the landing page as-is; a separate task (inside-app phase) will handle redirecting logged-in users to the dashboard if desired.
