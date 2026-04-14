# Feature Specification: User Management Module

**Feature Branch**: `002-user-management`  
**Created**: 2026-04-14  
**Status**: Draft  
**Input**: User description: "A User Management module for admins and managers. Full-page table listing all users with columns: avatar, full name, email, role, status, actions. Role column displays one of: Admin, Manager, User as a colored badge. Actions column has Edit and Delete buttons per row. Add User button opens a modal form. Edit user opens the same modal pre-filled. Delete shows a confirmation dialog. Profile pictures stored in public/uploads/avatars/. Mock data only. Uses Demo1 layout."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View All Users (Priority: P1)

An admin or manager navigates to the User Management page and sees a full-page table listing every user in the system. Each row shows the user's avatar, full name, email, role badge, and status alongside action buttons.

**Why this priority**: This is the entry point to all other user management actions. Without it, no other feature is accessible. Delivers immediate value by giving administrators a clear, scannable view of their user base.

**Independent Test**: Can be fully tested by navigating to the User Management route and verifying all mock users are rendered in the table with correct columns.

**Acceptance Scenarios**:

1. **Given** the admin is on the User Management page, **When** the page loads, **Then** a table is displayed with columns: avatar, full name, email, role, status, and actions.
2. **Given** there are mock users in the data store, **When** the table renders, **Then** every user appears as a row with correct data in each column.
3. **Given** a user has an assigned role, **When** viewing the role column, **Then** the role is shown as a colored badge (Admin, Manager, or User — each with a distinct color).
4. **Given** a user has a profile picture, **When** viewing the avatar column, **Then** the profile picture is displayed as a small circular image; if no picture exists, a default placeholder is shown.

---

### User Story 2 - Add a New User (Priority: P2)

An admin or manager clicks the "Add User" button, fills out a modal form with the new user's details (full name, email, role, status, and an optional profile picture), and saves. The new user immediately appears in the table.

**Why this priority**: Creating users is the core write operation and the second most critical workflow after viewing. Without it the user list would be read-only.

**Independent Test**: Can be fully tested by clicking "Add User", completing the form, saving, and verifying the new row appears in the table.

**Acceptance Scenarios**:

1. **Given** the admin clicks "Add User", **When** the modal opens, **Then** it contains fields for full name, email, role (dropdown with Admin/Manager/User), status (Active/Inactive), and profile picture upload.
2. **Given** the form is fully and correctly filled, **When** the admin clicks Save, **Then** the modal closes and the new user appears as a row in the table.
3. **Given** the admin leaves a required field empty (full name or email), **When** they attempt to save, **Then** an inline validation message is shown and the form is not submitted.
4. **Given** the admin uploads a profile picture, **When** they save the user, **Then** the image is stored under `public/uploads/avatars/` and displayed in the avatar column.
5. **Given** the admin clicks Cancel or closes the modal, **When** no data was saved, **Then** the table remains unchanged.

---

### User Story 3 - Edit an Existing User (Priority: P3)

An admin or manager clicks the Edit button on a user row. The same modal used for adding opens, pre-populated with that user's current data. After making changes and saving, the table row reflects the updated values.

**Why this priority**: Keeping user records accurate is essential for role and access management. Pre-filling the form reduces friction and error risk.

**Independent Test**: Can be fully tested by clicking Edit on any row, modifying one field, saving, and confirming the row updates in the table.

**Acceptance Scenarios**:

1. **Given** the admin clicks Edit on a user row, **When** the modal opens, **Then** all fields are pre-populated with that user's current data.
2. **Given** the admin changes the role dropdown and clicks Save, **When** the modal closes, **Then** the table row shows the updated role badge.
3. **Given** the admin replaces the profile picture and saves, **When** the table reloads, **Then** the new avatar is shown in the row.
4. **Given** the admin clears a required field and attempts to save, **When** validation runs, **Then** an error message is shown and changes are not persisted.

---

### User Story 4 - Delete a User (Priority: P4)

An admin or manager clicks the Delete button on a user row. A confirmation dialog appears asking them to confirm. Upon confirmation the user is removed from the table.

**Why this priority**: Irreversible operations require a safety gate. This story protects against accidental deletion and completes the full CRUD surface.

**Independent Test**: Can be fully tested by clicking Delete, confirming the dialog, and verifying the row disappears from the table.

**Acceptance Scenarios**:

1. **Given** the admin clicks Delete on a user row, **When** the action is triggered, **Then** a confirmation dialog appears with a clear warning and Confirm/Cancel options.
2. **Given** the confirmation dialog is open, **When** the admin clicks Confirm, **Then** the dialog closes and the user is removed from the table.
3. **Given** the confirmation dialog is open, **When** the admin clicks Cancel, **Then** the dialog closes and the user remains in the table.

---

### Edge Cases

- What happens when the user list is empty? — An empty-state message ("No users found") is displayed instead of a blank table body.
- What happens when a profile picture upload fails or the file is an unsupported type? — An inline error is shown; the form stays open with other fields intact.
- What if the uploaded image file is very large? — The system accepts JPEG, PNG, GIF, and WebP; oversized files show a validation error before saving.
- How does the table handle a very long full name or email? — Text truncates with an ellipsis; a tooltip reveals the full value on hover.
- What if two users share the same email? — Email uniqueness is enforced; a validation error prevents saving a duplicate.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST display a full-page table of all users within the Demo1 layout, accessible to admins and managers.
- **FR-002**: The table MUST include the following columns in order: avatar, full name, email, role, status, and actions.
- **FR-003**: The role column MUST render the user's role (Admin, Manager, or User) as a distinctly colored badge.
- **FR-004**: The actions column MUST provide an Edit button and a Delete button for each user row.
- **FR-005**: The page MUST include an "Add User" button that opens a modal form.
- **FR-006**: The modal form MUST contain: full name (text, required), email (text, required), role (dropdown: Admin/Manager/User, required), status (Active/Inactive, required), and profile picture (file upload, optional).
- **FR-007**: On save, the system MUST validate that full name and email are non-empty and that email follows a valid format.
- **FR-008**: The system MUST prevent saving a user with a duplicate email address and display an appropriate inline error.
- **FR-009**: On successful save (add or edit), the modal MUST close and the table MUST immediately reflect the change without a full page reload.
- **FR-010**: The Edit action MUST open the same modal form with all existing user data pre-populated.
- **FR-011**: The Delete action MUST display a confirmation dialog before removing the user; cancelling MUST leave the user unchanged.
- **FR-012**: Profile pictures MUST be stored under `public/uploads/avatars/`; the system MUST accept JPEG, PNG, GIF, and WebP formats.
- **FR-013**: Users without a profile picture MUST display a default avatar placeholder in the table.
- **FR-014**: All user data MUST be sourced from mock data only — no real backend calls are made.
- **FR-015**: The empty state (no users) MUST display a descriptive message in place of the table body.

### Key Entities

- **User**: Represents a system account with attributes — id, full name, email, role (Admin | Manager | User), status (Active | Inactive), and avatar image path.
- **Role Badge**: A visual indicator tied to a user's role; each role maps to a distinct color for quick identification.
- **Avatar**: A profile picture associated with a user, stored as an image file under `public/uploads/avatars/`; absent users show a default placeholder.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An admin can view the complete user list without horizontal scrolling on a standard desktop viewport (1280px wide or wider).
- **SC-002**: An admin can add a new user — from clicking "Add User" to seeing the new row in the table — in under 60 seconds.
- **SC-003**: An admin can edit an existing user's details and save in under 30 seconds, with the table reflecting the change immediately on close.
- **SC-004**: 100% of delete operations require explicit confirmation; no user record is removed without the confirmation step being completed.
- **SC-005**: Role badges for all three roles (Admin, Manager, User) are visually distinguishable from each other; distinction does not rely on color alone (the role label is always visible in the badge).
- **SC-006**: All required field validation errors are surfaced inline within the modal form; no silent failures occur on save.
- **SC-007**: An uploaded profile picture is correctly displayed in the avatar column after the user record is saved.

---

## Assumptions

- Only users with the Admin or Manager role can access the User Management page; regular Users cannot. Access control enforcement is handled by the existing routing/auth layer and is out of scope here.
- The Demo1 layout (sidebar, header, content area) is already implemented and reusable; this module integrates as a new page route within it.
- Mock data is initialized in a local data file or in-memory store; persistence across hard page refreshes is not required for the mock implementation.
- The `public/uploads/avatars/` directory already exists and is writable (confirmed by project structure showing `public/uploads/` is the shared storage location).
- No pagination, search, or filter functionality is required for v1; the table shows all users at once.
- No bulk actions (e.g., bulk delete or bulk role change) are in scope for this version.
- This module does not integrate with or modify the existing authentication system (001-user-auth feature).
- Email validation follows standard format rules; no live deliverability check is performed.
