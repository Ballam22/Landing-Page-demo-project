# Quickstart & Integration Scenarios

**Branch**: `009-courses-udemy-style` | **Date**: 2026-04-29

---

## Prerequisites

1. Supabase `reviews` table created with `(course_id, user_id)` unique constraint and RLS policies for read/insert by authenticated users.
2. `price` column exists on `courses` table (numeric, default 0.00).
3. At least one published course with sections and lessons in the DB.
4. At least one enrolled user (via the Enrollment admin page).

---

## Scenario 1: Course Curriculum Accordion (US1)

**Goal**: Verify the accordion renders correctly for enrolled and non-enrolled states.

**Steps**:
1. Log in as any user. Navigate to `/courses/<course-id>`.
2. Verify "Course Content" section shows all sections as collapsed Bootstrap accordion rows.
3. Each collapsed row header shows: section title, lesson count, total duration.
4. Expand a section — confirm lessons list with title, duration, and lock icons (not enrolled).
5. Log in as a user enrolled in this course. Revisit the same URL.
6. Expand the same section — lock icons become play icons (not started) or checkmarks (completed).
7. Navigate to a course with 0 sections — confirm empty-state message: "No curriculum available yet."

**Pass criteria**:
- Accordion renders without errors.
- Section headers display correct lesson count and duration sum.
- Status icons reflect actual enrollment/progress state.

---

## Scenario 2: Course Pricing & Enrolment CTA (US2)

**Goal**: Verify price display, free-course enrolment, paid-course enrolment, and "Continue Learning" state.

**Steps — Free course**:
1. Ensure a course exists with `price = 0.00`. Navigate to `/courses/<free-course-id>`.
2. Verify price area shows "Free" and CTA reads "Enroll Now".
3. Click "Enroll Now". Verify an enrolment record is created (check Supabase `enrollments` table or navigate to `/course-management/enrollments`).
4. Revisit the same course detail page — CTA should now show "Continue Learning".

**Steps — Paid course**:
1. Ensure a course exists with `price = 49.00`. Navigate to `/courses/<paid-course-id>`.
2. Verify price area shows "€49.00" and CTA reads "Enroll Now".
3. Click "Enroll Now". Verify enrolment is created (no payment flow shown).

**Steps — Homepage category cards**:
1. Navigate to `/dashboard`.
2. Scroll to the "Browse by Category" section.
3. Verify one card per category with: thumbnail (or placeholder), title, price badge, and star rating.
4. For a category with no published courses, verify placeholder card with neutral message.
5. Click a course card — verify navigation to `/courses/<course-id>`.

**Pass criteria**:
- Free course: "Free" label shown, enrolment created on click.
- Paid course: "€49.00" shown, enrolment created, no payment flow.
- Already enrolled: "Continue Learning" replaces the CTA.
- Dashboard: one card per category, correct price and rating shown.

---

## Scenario 3: Reviews & Star Ratings (US3)

**Goal**: Verify review submission gating, form visibility, display, and admin list column.

**Steps — Submit a review**:
1. Log in as a user enrolled in a course. Navigate to `/courses/<course-id>`.
2. Scroll to the "Reviews" section — verify the review form is shown (star selector + comment textarea).
3. Select 4 stars, type a comment, and submit.
4. Verify the form is replaced by a "Thank you" message.
5. Verify the new review appears at the top of the review list with: name, avatar/initials, 4 stars, comment, today's date.
6. Verify the aggregate updates to "4.0 ★ · 1 review" (or correct values if other reviews exist).

**Steps — Already reviewed**:
1. Reload the same course detail page.
2. Verify the review form is NOT shown — only the existing review is in the list.

**Steps — Non-enrolled user**:
1. Log in as a user NOT enrolled in this course.
2. Navigate to the course detail page.
3. Verify the review section shows the list read-only — no form is visible.

**Steps — Admin course list**:
1. Navigate to `/course-management/courses`.
2. Verify an "Avg Rating" column is present.
3. For a course with the review submitted above, verify the column shows "4.0".
4. For a course with no reviews, verify the column shows "—".

**Pass criteria**:
- Review form shown only to enrolled, non-reviewed users.
- Aggregate rating correct after submission.
- Admin list column present and accurate.

---

## Scenario 4: Edge Cases

**Price null legacy course**: Set `price = null` in DB for an existing course. Verify it displays "Free" on the detail page and card.

**Section with 0 lessons**: Create a section with no lessons. Verify accordion row shows "0 lessons" and "0 min" without crashing.

**Duplicate enrolment**: As an enrolled user, inspect the "Enroll Now" button — it should be replaced by "Continue Learning". If accessed via direct API/DB, a second enrolment attempt should fail gracefully (unique constraint on enrollments).

**Rating-only review**: Submit a review with 5 stars and empty comment. Verify the review appears with stars and no comment text (not "undefined" or blank placeholder).
