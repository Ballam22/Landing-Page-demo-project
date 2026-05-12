# Research: Public Landing Page

**Branch**: `010-public-landing-page` | **Date**: 2026-05-12

---

## Decision 1: Public Route Placement in AppRoutes.tsx

**Decision**: Add the landing page route explicitly in `AppRoutes.tsx` *before* the auth-conditional block, making it accessible regardless of authentication state.

**Current behaviour**: `AppRoutes.tsx` uses a conditional block — when `!currentUser`, every unmatched path (`*`) redirects to `/auth`. This means a bare `/` visit by an unauthenticated user hits the catch-all and redirects to login.

**Solution**: Add `<Route path='/' element={<LandingPage />} />` inside `<Route element={<App />}>` before the `{currentUser ? ... : ...}` conditional. React Router matches routes in order — the explicit `/` path resolves before the catch-all `*`.

**Alternatives considered**:
- Separate layout wrapper outside `<App />` — rejected; complicates shared context (theme, intl).
- Modify the unauthenticated catch-all to check path — rejected; coupling routing logic.
- Serve landing at `/home` — rejected; spec requires root `/`.

---

## Decision 2: Supabase Anonymous Reads (RLS)

**Decision**: Add `FOR SELECT TO anon` RLS policies on `courses`, `categories`, `reviews`, `blog_posts`, and `enrollments` (for student count) tables. These are the only tables the landing page reads.

**Rationale**: The Supabase JS client used without an auth session uses the `anon` role. Without explicit RLS policies allowing anonymous SELECT, all queries will return empty results (RLS blocks by default). Since the landing page must show live data to non-logged-in visitors, anonymous read access is required.

**Sensitive fields**: Reviews expose `user_id`, `full_name`. This is intentional for testimonials — same data visible in the existing enrolled-user view.

**Alternatives considered**:
- Use a server-side function (Edge Function) to fetch public data — rejected; no new dependencies, overkill for this use case.
- Hardcode/mock landing page data — rejected; spec requires live Supabase data.

---

## Decision 3: No Navbar / Metronic MasterLayout

**Decision**: The landing page uses a minimal standalone layout (no Metronic sidebar, no MasterLayout). It renders its own top bar with logo + Sign In link, page sections, and footer.

**Rationale**: MasterLayout is designed for authenticated app screens — it includes the sidebar, header toolbar, and auth-required hooks. Wrapping the public landing page in it would either require bypassing auth checks or revealing the full admin UI to guests.

**Approach**: `LandingPage.tsx` is a self-contained page component with its own top bar. Metronic Bootstrap utilities (cards, badges, grid, buttons) are still used throughout for visual consistency.

**Alternatives considered**:
- Use Metronic's `Auth` layout — rejected; that layout is styled for login/register forms, not a marketing page.
- Create a new custom layout in `src/_metronic/layout/` — rejected; violates "prefer extending over overriding" and is more complex than a self-contained page.

---

## Decision 4: React Query Without Auth

**Decision**: React Query hooks on the landing page use the Supabase client directly (via repository functions) without needing an auth session. The `useQuery` calls work identically — the anon key permits the SELECT if RLS is configured.

**Rationale**: The existing `supabaseClient.ts` is initialised with the `VITE_SUPABASE_ANON_KEY` which is valid for anonymous requests. No additional setup is needed beyond enabling the RLS policies.

---

## Decision 5: Landing Page Data Repository

**Decision**: Create a single `landingRepository.ts` in `src/app/pages/landing/` that contains all data-fetching functions specific to the landing page (public course list, categories with counts, stats, top reviews, latest blogs).

**Rationale**: The landing page is not a module — it lives in `src/app/pages/`. Colocating its repository keeps the code self-contained and avoids coupling to the course-management or blog-management module internals. Functions are simple SELECT queries.

**Alternatives considered**:
- Re-use existing module repositories — partially valid, but those are under `modules/` and some return more data than needed; mixing concerns.
- Inline queries in the page component — rejected; violates the service/repository pattern used throughout the project.

---

## Decision 6: i18n Keys

**Decision**: All landing page strings use new `LANDING.*` i18n keys in `en.json` and `de.ts`. Platform name and tagline are i18n keys (`LANDING.PLATFORM_NAME`, `LANDING.TAGLINE`) using placeholders that can be updated without code changes.

---

## Decision 7: CSS / Styling

**Decision**: Landing page uses a colocated `LandingPage.css` (or `Landing.css`) file in `src/app/pages/landing/` for any page-specific styles (hero gradient, section spacing). Metronic Bootstrap utilities handle all standard layout, grid, cards, badges, and buttons.

**Hero background**: A CSS linear-gradient using Metronic CSS variables (`--bs-primary`, `--bs-info`) for the hero, ensuring dark-mode token compatibility.

---

## Decision 8: Top Reviews Query

**Decision**: Top 3 reviews fetched by `ORDER BY rating DESC, created_at DESC LIMIT 3`. Join to `courses` table to retrieve the course title for each review.

**No RPC needed**: Client-side sorting of a 3-row result set is trivial. Direct Supabase query is sufficient.

---

## Decision 9: Student Count (Stats)

**Decision**: "Total Students" stat = `SELECT COUNT(DISTINCT user_id) FROM enrollments`. Uses Supabase `select('user_id', {count: 'exact'})` with a workaround — fetch distinct via a group-by approach. In practice for a small dataset, fetching all `user_id` values and deduplicating client-side is acceptable given the scale constraint (tens of courses → hundreds of enrollments).

---

## Decision 10: Empty State Handling

**Decision**:
- Featured Courses: 0 results → show "No courses available yet" message.
- Categories: always shown (categories exist independent of courses); "0 courses" label for empty ones.
- Testimonials: 0 reviews → entire section hidden (as per FR-008).
- Latest Blogs: 0 published posts → show "No posts available yet" message.
- Stats: counters show `0` — never blank/dash.
