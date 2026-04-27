# Feature Specification: Blog Management Module

**Feature Branch**: `007-blog-management`  
**Created**: 2026-04-27  
**Status**: Draft  
**Input**: User description: "A Blog Management module following the existing MVC layered architecture pattern used in the User Management module, with Category Management and Blog Management sub-sections."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Manage Blog Categories (Priority: P1)

A content administrator needs to create, edit, and delete blog categories so that blogs can be organized and filtered by topic.

**Why this priority**: Categories are a prerequisite for creating blogs — without at least one category the blog form cannot be completed. Delivering category management first enables the rest of the module.

**Independent Test**: Can be fully tested by navigating to the Category Management page, creating a category, editing it, and deleting it — delivering a complete CRUD workflow independently of blogs.

**Acceptance Scenarios**:

1. **Given** the admin is on the Category Management page, **When** they click "Add Category" and submit a valid form (name, optional description, sort order, active toggle), **Then** the new category appears in the table with correct values.
2. **Given** an existing category row, **When** the admin clicks Edit and updates the name, **Then** the table reflects the updated name immediately.
3. **Given** an existing category row, **When** the admin clicks Delete and confirms the dialog, **Then** the category is removed from the table.
4. **Given** the admin types a category name, **When** the slug field has not been manually edited, **Then** the slug auto-populates from the name (lowercase, hyphens replacing spaces).
5. **Given** the admin manually edits the slug field, **When** they subsequently change the name, **Then** the slug is NOT overwritten.

---

### User Story 2 - View Blog Post Listing (Priority: P2)

A content administrator needs a table of all blog posts showing key metadata so they can quickly assess the state of the content library.

**Why this priority**: The blog listing page is the central hub for all blog operations; it must exist before add/edit/delete flows can be reached.

**Independent Test**: Can be fully tested by navigating to the Blog Management page and verifying the table columns (thumbnail, title, slug, category name, status badge, reading time, created_at, updated_at, actions) render correctly with seeded data.

**Acceptance Scenarios**:

1. **Given** blogs exist in the system, **When** the admin visits the Blog Management page, **Then** each row shows: featured image thumbnail, title, slug, category name, status badge, reading time, created_at, updated_at, and action buttons.
2. **Given** a blog with status "Draft", **When** it appears in the table, **Then** its status badge is grey.
3. **Given** blogs with statuses Review, Scheduled, Published, Archived, **When** they appear in the table, **Then** badges are blue, orange, green, and dark respectively.

---

### User Story 3 - Create a New Blog Post (Priority: P2)

A content author needs to compose a new blog post with a rich-text body, featured image, and metadata so that it can be saved and eventually published.

**Why this priority**: Core content-creation flow; depends on P1 categories being available.

**Independent Test**: Can be fully tested by clicking "Add Blog", filling all fields, submitting, and verifying the new post appears in the blog table with correct metadata.

**Acceptance Scenarios**:

1. **Given** the author clicks "Add Blog", **When** the full-page form opens, **Then** it displays: title, slug (auto-generated from title), excerpt, category dropdown, featured image upload, rich-text content editor, reading time, and status dropdown.
2. **Given** the author types a title, **When** the slug has not been manually edited, **Then** the slug auto-populates from the title (lowercase, hyphens replacing spaces).
3. **Given** the author uploads a featured image, **When** the form is submitted successfully, **Then** the image is stored in the blog-images bucket and the post record references its public URL, with a thumbnail visible in the listing table.
4. **Given** the author submits a blog with status "Draft", **When** the save succeeds, **Then** the blog appears in the table with a grey "Draft" badge and a valid created_at timestamp.
5. **Given** the author attempts to submit with a slug that already exists, **When** the form is validated, **Then** an error message indicates the slug must be unique and the form is not submitted.

---

### User Story 4 - Edit an Existing Blog Post (Priority: P3)

A content editor needs to update an existing blog post's content, metadata, or status so that corrections and status transitions can be made over time.

**Why this priority**: Editing is essential for ongoing content management but depends on the create flow being functional first.

**Independent Test**: Can be fully tested by clicking Edit on an existing blog, modifying fields, saving, and verifying the table reflects the changes including an updated updated_at timestamp.

**Acceptance Scenarios**:

1. **Given** the editor clicks Edit on a blog row, **When** the full-page form opens, **Then** all fields are pre-filled with the current values of that blog post.
2. **Given** the editor modifies the content and clicks Save, **When** the save succeeds, **Then** the blog's updated_at timestamp reflects the time of the save.
3. **Given** the editor changes the status from "Draft" to "Published", **When** the save succeeds, **Then** the status badge in the table changes to green.

---

### User Story 5 - Delete a Blog Post (Priority: P3)

A content administrator needs to permanently delete a blog post after confirming intent so that outdated content can be removed safely.

**Why this priority**: Deletion is a low-frequency but necessary action; a confirmation dialog prevents accidental data loss.

**Independent Test**: Can be fully tested by clicking Delete on a blog row, confirming the dialog, and verifying the post no longer appears in the table.

**Acceptance Scenarios**:

1. **Given** the admin clicks Delete on a blog row, **When** the confirmation dialog appears, **Then** the blog is NOT deleted until the admin explicitly confirms.
2. **Given** the admin confirms deletion, **When** the operation succeeds, **Then** the blog row is removed from the table.
3. **Given** the admin clicks Cancel in the confirmation dialog, **When** the dialog closes, **Then** the blog remains in the table unchanged.

---

### Edge Cases

- What happens when the featured image upload fails mid-submission (e.g., network error)?
- How does the system handle a category that is referenced by existing blogs when that category is deleted?
- What if no active categories exist when a user opens the "Add Blog" form?
- How does slug uniqueness validation behave when editing a blog (the existing slug should not conflict with itself)?
- What happens when a user navigates away from the blog form without saving?

## Requirements *(mandatory)*

### Functional Requirements

**Category Management**

- **FR-001**: The system MUST display all categories in a full-page table with columns: name, slug, description, sort order, active status, created_at, and actions.
- **FR-002**: The system MUST provide an "Add Category" button that opens a modal form with fields: name, slug (auto-generated from name, manually editable), description (optional), sort order (integer), and is_active toggle.
- **FR-003**: The category slug MUST be automatically generated from the category name (lowercase, spaces replaced with hyphens); manual edits to the slug MUST NOT be overwritten by subsequent name changes.
- **FR-004**: The system MUST allow editing any category row via an Edit action that opens the same modal form pre-filled with the category's current values.
- **FR-005**: The system MUST allow deleting a category via a Delete action that shows a confirmation dialog before proceeding; deletion MUST be blocked if blogs currently reference that category.

**Blog Management**

- **FR-006**: The system MUST display all blogs in a full-page table with columns: featured image thumbnail, title, slug, category name, status badge, reading time, created_at, updated_at, and actions.
- **FR-007**: Status badges MUST be color-coded: Draft = grey, Review = blue, Scheduled = orange, Published = green, Archived = dark.
- **FR-008**: The system MUST provide an "Add Blog" button that navigates to a dedicated full-page form (not a modal).
- **FR-009**: The blog form MUST include: title, slug (auto-generated from title, manually editable), excerpt (optional short summary), category dropdown (populated from active categories), featured image upload (stored in the blog-images storage bucket), rich-text content editor, reading time (optional integer, minutes), and status dropdown (Draft / Review / Scheduled / Published / Archived).
- **FR-010**: The blog slug MUST be unique across all blog records; the system MUST validate uniqueness before submission and display a clear error message if the slug is already in use.
- **FR-011**: The system MUST allow editing any blog via an Edit action that opens the same full-page form pre-filled with the blog's current values.
- **FR-012**: The system MUST automatically update the blog's updated_at timestamp on every successful save (create or edit).
- **FR-013**: The system MUST allow deleting a blog via a Delete action that shows a confirmation dialog before proceeding.

### Key Entities

- **Category**: Represents a classification group for blog posts. Key attributes: id, name, slug (unique), description, sort_order, is_active, created_at.
- **Blog**: Represents a content article. Key attributes: id, title, slug (unique), excerpt, category (FK → Category), featured_image_url, content (rich text), reading_time, status (Draft | Review | Scheduled | Published | Archived), created_at, updated_at.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Administrators can create, edit, or delete a category in under 60 seconds per operation.
- **SC-002**: Administrators can compose and save a complete blog post (including image upload and rich-text content) in under 5 minutes under normal network conditions.
- **SC-003**: The blog and category listing tables render all records within 2 seconds for libraries of up to 500 entries.
- **SC-004**: Every blog status change is reflected in the listing table immediately after saving, without a full page reload.
- **SC-005**: Slug uniqueness validation prevents duplicate slugs in 100% of submission attempts, with a clear error message shown to the user before any data is saved.
- **SC-006**: Accidental deletions are eliminated — every delete action for both categories and blogs requires explicit confirmation before data is removed.

## Assumptions

- Only authenticated administrators can access the Blog Management module; no public-facing authoring interface is in scope for this feature.
- The category dropdown on the blog form shows only active categories (is_active = true).
- Deleting a category that is referenced by one or more blogs is blocked with an informative error message; blogs must be reassigned or deleted before the category can be removed.
- The blog-images storage bucket is created as part of this feature's setup.
- The rich-text editor stores content as HTML; the system is responsible for rendering it safely wherever it is displayed.
- Pagination and search/filter on the listing tables are out of scope for the initial delivery; all records are loaded in a single request.
- No public blog reader or front-end display is in scope — this module is admin-only content management.
- The updated_at timestamp is managed automatically at the database level on every row update.
- Reading time is a manually entered integer (minutes); no automatic calculation from content length is required.
