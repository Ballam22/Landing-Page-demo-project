# Feature Specification: Courses — Udemy-Style Curriculum, Pricing & Reviews

**Feature Branch**: `009-courses-udemy-style`
**Created**: 2026-04-29
**Status**: Draft
**Input**: User description: "Course curriculum UI (Udemy-style chapters), Course pricing, and Reviews & ratings on top of existing courses/sections/lessons/enrollments schema"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Course Curriculum Accordion (Priority: P1)

A visitor or enrolled learner opens a course detail page and sees the full course outline — all sections listed as collapsible rows, with lesson titles, durations, and their personal progress (locked / in progress / completed) visible at a glance, without needing to enroll first to preview the structure.

**Why this priority**: This is the foundational discovery feature. It makes course content visible before purchase, directly supporting enrolment conversion, and gives enrolled learners a navigation map. It has no dependency on pricing or reviews.

**Independent Test**: Navigate to any course detail page. Verify the "Course Content" accordion renders all sections with lesson counts and total duration. Expand a section and confirm lessons show title, duration, and the correct status icon based on the current user's enrolment/progress state. Can be tested with zero reviews and no pricing logic.

**Acceptance Scenarios**:

1. **Given** a course has 3 sections and 12 lessons, **When** a visitor opens the course detail page, **Then** all 3 sections appear as collapsed accordion rows showing section title, lesson count (e.g. "4 lessons"), and total section duration (e.g. "32 min").
2. **Given** a section accordion row is clicked, **When** it expands, **Then** each lesson row shows the lesson title, duration, and a lock icon (visitor not enrolled), play icon (enrolled, not yet started), or checkmark (enrolled and completed).
3. **Given** an enrolled learner has completed 2 of 4 lessons in a section, **When** they view that section expanded, **Then** 2 lessons show checkmarks and 2 show play icons.
4. **Given** a course has no sections, **When** the detail page loads, **Then** the "Course Content" panel shows an empty-state message such as "No curriculum available yet."

---

### User Story 2 — Course Pricing & Enrolment CTA (Priority: P2)

An admin sets a price on each course. On the course detail page, the price is shown prominently alongside an "Enroll Now" button. Free courses (price = 0.00) skip any payment step and enrol the user immediately on click. Paid courses display the price as a CTA; no payment gateway is in scope. On the homepage, the category section shows one featured course card per category with the thumbnail, title, price badge, and star rating.

**Why this priority**: Pricing gives courses commercial visibility and the homepage card directly drives conversion from browsing to the course detail page. Depends on P1 (course detail page exists); homepage cards can display "0 ratings" gracefully without P3.

**Independent Test**: Set one course price to 0.00 and another to 49.00. On the detail page, verify the free course shows "Free" and clicking "Enroll Now" immediately creates an enrolment. Verify the paid course shows "€49.00" and the CTA does not trigger a payment flow. On the homepage, verify each category shows one featured course card with price and rating.

**Acceptance Scenarios**:

1. **Given** a course has `price = 0.00`, **When** a logged-in non-enrolled user opens the course detail page, **Then** the price area displays "Free" and the CTA button reads "Enroll Now"; clicking it immediately creates an enrolment record.
2. **Given** a course has `price = 49.00`, **When** a user opens the course detail page, **Then** the price displays as "€49.00" and the CTA reads "Enroll Now"; clicking it creates an enrolment record (no payment gateway in this scope).
3. **Given** a user is already enrolled in a course, **When** they view that course detail page, **Then** the CTA area shows "Continue Learning" instead of the price and enrol button.
4. **Given** a category has at least one published course, **When** the homepage loads, **Then** a featured course card appears for that category showing: thumbnail (or placeholder), title, price badge, and average star rating.
5. **Given** a category has no published courses, **When** the homepage loads, **Then** a placeholder card is shown for that category with a neutral message.

---

### User Story 3 — Reviews & Star Ratings (Priority: P3)

Enrolled learners can leave a star rating (1–5) and optional written comment on any course they are enrolled in. The course detail page shows the aggregate average rating, total review count, and a list of individual reviews with the reviewer's avatar, name, star display, comment, and date. The admin course list gains an average rating column.

**Why this priority**: Social proof increases enrolment conversion and complements the pricing CTA. It depends on enrolments being in place (P2 establishes that flow) and does not block P1 or P2.

**Independent Test**: Enrol a user in a course. Submit a 4-star review with a comment. Verify the review appears in the list, the aggregate shows "4.0 ★ · 1 review", and the admin course list shows "4.0". Attempt a second submission as the same user — verify the form is hidden. View the page as a non-enrolled user — verify no form is shown.

**Acceptance Scenarios**:

1. **Given** a logged-in enrolled user has not yet reviewed a course, **When** they open the course detail page, **Then** a review form is displayed with a 1–5 star selector and an optional comment textarea.
2. **Given** the user submits a valid review, **When** submission succeeds, **Then** the form is replaced by a "Thank you" confirmation, and the new review appears at the top of the review list with correct star count, comment text, and date.
3. **Given** a user has already reviewed a course, **When** they revisit the course detail page, **Then** no review form is shown; their existing review is visible in the list.
4. **Given** a user is not enrolled in a course, **When** they view the course detail page, **Then** no review submission form is shown (the existing review list remains read-only).
5. **Given** a course has 10 reviews with varying ratings, **When** any user views the detail page, **Then** the aggregate section shows the correct average rounded to one decimal place and the total count (e.g. "4.2 ★ · 10 reviews").
6. **Given** the admin opens the course list, **When** the table renders, **Then** each course row has an "Avg Rating" column showing the average to one decimal or "—" for courses with no reviews.

---

### Edge Cases

- A section with 0 lessons still renders in the accordion showing "0 lessons" and "0 min".
- A lesson with no stored duration displays "—" rather than "0:00".
- If the `price` column is null (legacy course), treat it as 0.00 and display "Free".
- A review with no comment (rating only) is valid; comment is optional.
- Deleting an enrolment via admin does not delete the user's existing review (reviews are retained).
- If a user has no avatar, their initials are shown as an avatar fallback in the review list.
- The featured course per category on the homepage is the published course with the lowest `sort_order` in that category; if none exist, a placeholder is shown.
- The "Enroll Now" button for a paid course must not create a duplicate enrolment if clicked twice; the second click is a no-op (or shows "Already enrolled").

## Requirements *(mandatory)*

### Functional Requirements

**Curriculum Accordion**

- **FR-001**: The course detail page MUST display a "Course Content" accordion panel listing all sections and their lessons.
- **FR-002**: Each section row MUST show the section title, lesson count, and total duration of all lessons in that section.
- **FR-003**: Each expanded lesson row MUST show the lesson title, duration, and one of three status icons: lock (not enrolled), play (enrolled, not yet completed), or checkmark (enrolled and completed).
- **FR-004**: The curriculum accordion MUST be viewable by unauthenticated visitors and non-enrolled users; all lessons appear with lock icons.
- **FR-005**: Lesson completion state MUST be derived from the `lesson_progress` table for the currently authenticated user; a missing record is treated as "not started."

**Pricing & Enrolment CTA**

- **FR-006**: The course detail page MUST display the course price; a price of 0.00 or null MUST display as "Free."
- **FR-007**: Clicking "Enroll Now" on a free course MUST immediately create an enrolment record for the logged-in user.
- **FR-008**: Clicking "Enroll Now" on a paid course MUST create an enrolment record (no payment gateway in this scope).
- **FR-009**: If the current user is already enrolled, the price/CTA area MUST display "Continue Learning" instead of the enrol button.
- **FR-010**: The homepage category section MUST show one featured course card per category containing: thumbnail, title, price badge, and average star rating.
- **FR-011**: Categories with no published courses MUST show a placeholder card in the homepage category section.

**Reviews & Ratings**

- **FR-012**: Only users with an active enrolment in a course MAY see and submit the review form for that course.
- **FR-013**: Each user MAY submit at most one review per course; the form MUST be hidden once they have already submitted.
- **FR-014**: A review MUST include a star rating (integer 1–5); a text comment is optional.
- **FR-015**: The course detail page MUST display the aggregate average rating (one decimal place) and total review count.
- **FR-016**: The course detail page MUST list all reviews showing reviewer name, avatar or initials fallback, star display, comment (if present), and submission date.
- **FR-017**: The admin course list MUST include an "Avg Rating" column showing the per-course average to one decimal, or "—" for courses with no reviews.

### Key Entities

- **Course**: Extended with `price` (numeric, default 0.00). Has sections, enrolments, and reviews.
- **Section**: Existing. Aggregates lesson count and total duration for the accordion header.
- **Lesson**: Existing. Has a duration and a per-user progress state derived from `lesson_progress`.
- **LessonProgress**: Existing (`user_id`, `lesson_id`, `completed`). Drives the accordion status icon.
- **Enrollment**: Existing (`user_id`, `course_id`). Gates the review form and the free/paid enrol CTA.
- **Review**: New (`id`, `course_id`, `user_id`, `rating` 1–5, `comment` optional text, `created_at`). Unique constraint on `(course_id, user_id)`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A learner can scan the full course curriculum (all sections and lessons) without enrolling, within 3 seconds of the course detail page loading.
- **SC-002**: A logged-in user can enrol in a free course in 2 clicks or fewer from arriving on the course detail page.
- **SC-003**: An enrolled user can submit a star rating and optional review comment in under 60 seconds from opening the course detail page.
- **SC-004**: 100% of courses with at least one review display an aggregate rating that matches the arithmetic mean of all stored ratings, rounded to one decimal place.
- **SC-005**: The homepage category section loads all featured course cards in a single page load with no additional user interaction required.
- **SC-006**: The admin course list correctly shows average ratings for all courses; "—" is shown for courses with zero reviews.
- **SC-007**: No enrolled user is ever shown the review submission form after they have already submitted a review for that course.

## Assumptions

- The current authenticated user's identity is accessible to the frontend via the existing auth context.
- The `price` column has already been added to `courses` via SQL — no migration is required for that column.
- The `reviews` table has already been created via SQL with a unique constraint on `(course_id, user_id)` — no migration is required.
- Payment processing is out of scope: all "Enroll Now" clicks create an enrolment immediately (admin/demo context).
- The currency symbol is hardcoded as € for this scope; multi-currency support is not required.
- The featured course per category on the homepage is the published course with the lowest `sort_order` in that category.
- User avatar falls back to initials if no avatar URL is stored.
- Admin-only views (course list rating column) are protected by the existing role guard (Admin / Manager roles only).
- RLS policies allowing authenticated users to read and insert rows in the `reviews` table will be applied alongside this feature.
- A lesson with no `lesson_progress` row for the current user is treated as "not started" (play icon if enrolled, lock icon if not enrolled).
