# Feature Specification: Course Management Module

**Feature Branch**: `008-course-management`  
**Created**: 2026-04-28  
**Status**: Draft  
**Input**: User description: "A Course Management module following the existing MVC layered architecture pattern. Uses Supabase as the backend."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Course Catalogue Administration (Priority: P1)

An administrator needs to view, create, edit, and delete courses from a central listing page. Each course entry shows its thumbnail, title, slug, category, publication status, sort order, and creation date. The admin can open a full-page form to add a new course or edit an existing one, upload a thumbnail image, and choose a publication status. Courses can be deleted with a confirmation step to prevent accidental loss.

**Why this priority**: Courses are the top-level content unit. All other sub-features (sections, lessons, enrollments) depend on courses existing first.

**Independent Test**: Can be fully tested by navigating to the Course Management page, creating a course, editing it, and deleting it — no sections or lessons are required.

**Acceptance Scenarios**:

1. **Given** the admin is on the Course List page, **When** they click "Add Course", **Then** a full-page form opens with fields for title, slug, description, category, thumbnail, status, and sort order.
2. **Given** the admin fills in the form and uploads a thumbnail, **When** they save, **Then** the new course appears in the listing table with the correct status badge.
3. **Given** a course exists, **When** the admin clicks Edit, **Then** the form pre-populates with existing values and can be updated.
4. **Given** a course exists, **When** the admin clicks Delete and confirms the dialog, **Then** the course is removed from the listing.
5. **Given** a course title is entered, **When** the title field loses focus, **Then** the slug field is auto-populated from the title (URL-safe, lowercase, hyphenated).
6. **Given** a course has status "Draft", **When** displayed in the table, **Then** the status badge is grey; "Published" = green; "Archived" = dark.

---

### User Story 2 - Section and Lesson Authoring (Priority: P2)

An administrator editing a course can manage its sections (chapters) inline on the course edit page. Within each section, they can add, edit, delete, and reorder lessons. Each lesson supports a title, description, a video upload to private storage, duration entry, sort order, and a free-preview toggle.

**Why this priority**: Sections and lessons are the content of a course. Without them a course is an empty shell, but the course record must exist first (P1).

**Independent Test**: Can be fully tested by editing an existing course, adding sections and lessons, uploading a video, and verifying playback — no enrollment feature is needed.

**Acceptance Scenarios**:

1. **Given** the admin is on the course edit page, **When** they add a section, **Then** the section appears in the ordered list with edit and delete controls.
2. **Given** sections exist, **When** the admin drags or uses reorder controls, **Then** the new order is persisted.
3. **Given** a section exists, **When** the admin adds a lesson, **Then** the lesson form requests title, description, video file, duration, sort order, and free-preview toggle.
4. **Given** the admin uploads a video, **When** the lesson is saved, **Then** the video is stored in the private bucket and a signed URL is generated for playback (expires after 1 hour).
5. **Given** a lesson video is played, **Then** the player has download disabled and picture-in-picture disabled.
6. **Given** a lesson has the free-preview toggle enabled, **Then** it is visually marked as a free preview lesson in the listing.

---

### User Story 3 - Enrollment Management (Priority: P3)

An administrator can view all course enrollments on a dedicated page showing the learner name, course name, enrollment date, completion date, and progress percentage. They can manually enroll a user in a course and remove an enrollment. Lesson-level progress (completed/not completed per lesson per user) is tracked automatically as users complete lessons.

**Why this priority**: Enrollments depend on both courses and users existing. Tracking progress is secondary to content authoring.

**Independent Test**: Can be fully tested by opening the Enrollment page, manually enrolling a user, verifying the row appears, then removing the enrollment.

**Acceptance Scenarios**:

1. **Given** the admin is on the Enrollment page, **When** it loads, **Then** a table lists all enrollments with user name, course name, enrolled_at, completed_at, and progress %.
2. **Given** the admin clicks "Enroll User", **When** they select a user and a course and confirm, **Then** a new enrollment row appears.
3. **Given** an enrollment exists, **When** the admin removes it, **Then** the row is deleted and associated lesson progress records are also removed.
4. **Given** a learner completes a lesson, **When** the admin views the enrollment, **Then** progress % reflects the ratio of completed lessons to total lessons.

---

### Edge Cases

- What happens when a course that has active enrollments is deleted?
- What happens when a video upload fails mid-transfer?
- What happens when the signed URL for a lesson video expires while a learner is watching?
- What happens if a slug collision occurs when auto-generating from the title?
- What happens when a section is deleted that still contains lessons?
- What happens when sort order values conflict or have gaps after reordering?

## Requirements *(mandatory)*

### Functional Requirements

**Course Management**

- **FR-001**: System MUST display all courses in a table with columns: thumbnail, title, slug, category, status badge, sort order, created_at, and actions.
- **FR-002**: System MUST show status badges colour-coded by status: Draft = grey, Published = green, Archived = dark.
- **FR-003**: System MUST provide an "Add Course" button that opens a full-page creation form.
- **FR-004**: The creation/edit form MUST include: title, slug (auto-generated from title, user-editable), description, category dropdown (from categories table), thumbnail upload, status selector, and sort order.
- **FR-005**: Thumbnails MUST be uploaded to the `course-thumbnails` public storage bucket.
- **FR-006**: System MUST allow editing an existing course via a pre-populated full-page form.
- **FR-007**: System MUST allow deleting a course only after the admin confirms a deletion dialog.
- **FR-008**: Slug MUST be auto-generated from the title as a URL-safe, lowercase, hyphen-separated string and updated whenever the title changes, remaining user-editable.

**Section Management**

- **FR-009**: The course edit page MUST include an inline section panel listing all sections for that course in sort order.
- **FR-010**: Admin MUST be able to add, edit, delete, and reorder sections within a course.
- **FR-011**: Section reorder changes MUST be persisted to the database immediately.

**Lesson Management**

- **FR-012**: Each section MUST display its lessons with controls to add, edit, delete, and reorder.
- **FR-013**: Lesson form MUST include: title, description, video upload, duration (auto-detected from video metadata or manually entered), sort order, and is_free toggle.
- **FR-014**: Lesson videos MUST be uploaded to the `course-videos` private storage bucket.
- **FR-015**: Video playback MUST use signed URLs generated fresh on each page load, expiring after 1 hour; raw storage URLs MUST NOT be exposed to the client.
- **FR-016**: The video player element MUST have download controls disabled and picture-in-picture disabled.
- **FR-017**: Lessons with the free-preview flag enabled MUST be visually distinguished in the lesson listing.

**Enrollment Management**

- **FR-018**: System MUST provide a dedicated Enrollment Management page listing all enrollments with: user name, course name, enrolled_at, completed_at, and progress percentage.
- **FR-019**: Admin MUST be able to manually enroll a user in a course via a selection form.
- **FR-020**: Admin MUST be able to remove an enrollment with confirmation.
- **FR-021**: Progress percentage MUST be computed as (count of completed lessons / total lessons in course) × 100, displayed as a whole number.
- **FR-022**: Lesson completion state MUST be stored per user per lesson as a boolean completed flag.

### Key Entities

- **Course**: A learning course with title, slug, description, category reference, thumbnail URL, status (Draft/Published/Archived), sort order, and timestamps.
- **Section**: A chapter belonging to one course, with title and sort order.
- **Lesson**: A learning unit belonging to one section, with title, description, video storage reference, duration, sort order, and a free-preview flag.
- **Enrollment**: A record of a user registered in a course, with enrolled_at, completed_at (nullable), and derived progress percentage.
- **LessonProgress**: A per-user per-lesson record tracking whether the lesson has been completed (boolean) with a timestamp.
- **Category**: A lookup entity used to categorise courses; referenced by courses.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An administrator can create a complete course with at least one section and one lesson in under 10 minutes from first click to saved.
- **SC-002**: The course listing table loads and renders all course rows within 2 seconds under typical data volumes.
- **SC-003**: Thumbnail uploads complete and the image appears in the form preview within 5 seconds for files up to 5 MB.
- **SC-004**: A signed video URL is generated and playback begins within 3 seconds of a lesson being opened.
- **SC-005**: Progress percentage displayed on the enrollment page accurately reflects the learner's completed lessons at all times with no stale data shown.
- **SC-006**: 100% of lesson videos are inaccessible via direct URL — no raw storage path is ever rendered in the UI.
- **SC-007**: An administrator can locate, enroll, and verify a user in a course in under 2 minutes.

## Assumptions

- Only administrators (users with the admin role) can access this module; learner-facing course views are out of scope for this feature.
- The `categories` table already exists in Supabase and is pre-populated; category creation is out of scope.
- The `users` table already exists and is managed by the User Management module.
- Deleting a course that has active enrollments is blocked with a user-facing error; the admin must remove enrollments first.
- Deleting a section cascade-deletes its lessons and all associated lesson_progress records.
- Video duration auto-detection uses HTML5 media metadata on upload; manual entry is always available as a fallback.
- If a slug collision occurs during auto-generation, a numeric suffix is appended (e.g., `my-course-2`).
- Reordering updates sort_order values of all affected records; gaps in sort order are acceptable.
- All pages in this module use the Demo1 Metronic layout (sidebar + top header).
- Signed URLs for lesson videos are generated on each page load; they are not cached on the client side.
- Mobile responsiveness follows the existing Metronic Bootstrap 5 grid; no custom mobile layouts are required beyond that.
