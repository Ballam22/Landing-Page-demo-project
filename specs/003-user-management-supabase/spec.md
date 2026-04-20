# Feature Specification: User Management Module

**Feature Branch**: `003-user-management-supabase`
**Created**: 2026-04-20
**Status**: Draft
**Input**: User description: "A User Management module for admins and managers. Uses Supabase (PostgreSQL) as the real backend — no mock data."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — View and Browse All Users (Priority: P1)

An admin or manager navigates to the User Management page and sees a full-page table listing every
user in the system. Each row shows the user's avatar, full name, email address, role badge, and
status. The list loads automatically on page entry.

**Why this priority**: This is the foundation of the module. Every other action (add, edit, delete)
is initiated from this view. Without it the feature is inaccessible.

**Independent Test**: Navigate to `/user-management`. The table loads and displays at least one
row per seeded user, with all five columns populated correctly.

**Acceptance Scenarios**:

1. **Given** the user is logged in as Admin or Manager, **When** they navigate to User Management,
   **Then** a table renders with columns: Avatar, Full Name, Email, Role, Status, Actions.
2. **Given** the table has loaded, **When** a user row is visible, **Then** the Role column shows
   a coloured badge — blue for Admin, green for Manager, grey for User.
3. **Given** the table has loaded, **When** a user row is visible, **Then** the Status column shows
   "Active" (green indicator) or "Inactive" (red indicator) for each user.
4. **Given** no users exist in the system, **When** the table loads, **Then** an empty-state
   message is shown instead of a blank table.

---

### User Story 2 — Add a New User (Priority: P1)

An admin clicks "Add User", fills in full name, email, role, status, and optionally uploads a
profile picture, then saves. The new user appears immediately in the table.

**Why this priority**: Core write operation. Without it the module has no creation capability.

**Independent Test**: Click "Add User", complete the form with valid data, submit. The modal
closes and the new row appears in the table with correct values.

**Acceptance Scenarios**:

1. **Given** the User Management page is open, **When** the admin clicks "Add User",
   **Then** a modal opens with fields: Full Name, Email, Role (dropdown), Status
   (active/inactive), Profile Picture (file upload, optional).
2. **Given** the modal is open and all required fields are filled, **When** the admin clicks Save,
   **Then** the modal closes and the new user appears in the table.
3. **Given** the modal is open and required fields are missing, **When** the admin clicks Save,
   **Then** validation errors appear next to each empty required field and the modal stays open.
4. **Given** the admin uploads a profile picture, **When** they save the user,
   **Then** the avatar thumbnail displays the uploaded image in the table row.
5. **Given** the admin provides an email already registered in the system, **When** they save,
   **Then** an error message states the email is already in use.

---

### User Story 3 — Edit an Existing User (Priority: P2)

An admin or manager clicks the Edit button on a user row. The same Add User modal opens,
pre-filled with the user's current data. They update one or more fields and save. The table
row reflects the changes immediately.

**Why this priority**: Required for ongoing user administration; lower than creation only because
users can be re-created as a workaround in the short term.

**Independent Test**: Click Edit on an existing row, change the role, save. The table row
shows the updated role badge without a full page reload.

**Acceptance Scenarios**:

1. **Given** the table is loaded, **When** the admin clicks Edit on a row,
   **Then** the modal opens pre-populated with that user's full name, email, role, status,
   and existing avatar thumbnail.
2. **Given** the modal is open with pre-filled data, **When** the admin changes the role and saves,
   **Then** the modal closes and the table row shows the new role badge.
3. **Given** the admin clears a required field and saves, **When** validation runs,
   **Then** an error is shown and the record is not updated.
4. **Given** the admin uploads a new profile picture during edit, **When** they save,
   **Then** the old picture is replaced by the new one in the table row.

---

### User Story 4 — Delete a User (Priority: P2)

An admin clicks the Delete button on a user row. A confirmation dialog appears. The admin
confirms and the user is permanently removed from the table.

**Why this priority**: Necessary for full user lifecycle management; lower risk than Create/Edit
since deactivating status is an interim alternative.

**Independent Test**: Click Delete on a row, confirm in the dialog. The row disappears and
does not reappear on page refresh.

**Acceptance Scenarios**:

1. **Given** the table is loaded, **When** the admin clicks Delete on a row,
   **Then** a confirmation dialog appears asking them to confirm the deletion.
2. **Given** the confirmation dialog is open, **When** the admin clicks Cancel,
   **Then** the dialog closes and the user remains in the table unchanged.
3. **Given** the confirmation dialog is open, **When** the admin clicks Confirm,
   **Then** the dialog closes, the row is removed, and a success notification is shown.
4. **Given** a deletion fails due to a connectivity problem, **When** the admin confirms,
   **Then** an error notification is shown and the row remains in the table.

---

### Edge Cases

- What happens when the profile picture file is too large or in an unsupported format?
  → The upload is rejected before submission with a clear field-level error message; the
  rest of the form remains intact.
- What happens when the table is loading and the network is slow?
  → A loading skeleton or spinner is shown; action buttons are disabled until data arrives.
- What happens if an admin tries to delete their own account?
  → The Delete button is disabled for the row matching the currently logged-in user.
- What happens with very long names or email addresses in the table?
  → Cells truncate with an ellipsis; the full value is shown in a tooltip on hover.
- What happens when the page is accessed by a non-Admin, non-Manager user?
  → The user is redirected away from the route; the table is never rendered.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST display all users in a table with columns: Avatar, Full Name,
  Email, Role, Status, Actions.
- **FR-002**: The Role column MUST render a coloured badge: blue for Admin, green for Manager,
  grey for User.
- **FR-003**: The Status column MUST render "Active" (green indicator) or "Inactive"
  (red indicator) per user.
- **FR-004**: Each table row MUST include an Edit button and a Delete button in the Actions column.
- **FR-005**: The page MUST include an "Add User" button that opens a modal form.
- **FR-006**: The modal form MUST include: Full Name (required), Email (required), Role dropdown
  (Admin / Manager / User, required), Status selector (active / inactive, required), Profile
  Picture file upload (optional).
- **FR-007**: The Edit action MUST open the modal pre-filled with the selected user's current data.
- **FR-008**: The Delete action MUST show a confirmation dialog before permanently removing the
  user record.
- **FR-009**: Profile pictures MUST be uploaded to the `avatars` storage bucket; the resulting
  public URL MUST be persisted against the user record.
- **FR-010**: All user data reads and writes MUST be persisted in the real backend store —
  no in-memory or static fixtures.
- **FR-011**: Form validation MUST prevent submission when required fields are empty or contain
  invalid data, displaying field-level error messages.
- **FR-012**: After any successful create, update, or delete operation, the table MUST refresh
  to reflect the latest state without a full page reload.
- **FR-013**: The module MUST be accessible only to Admin and Manager roles; all other roles
  MUST be redirected.
- **FR-014**: An admin MUST NOT be able to delete their own account from this interface (Delete
  button disabled for the logged-in user's own row).

### Key Entities

- **User**: A system account. Attributes: id, full_name, email, role (admin | manager | user),
  status (active | inactive), avatar_url (nullable), created_at.
- **Role**: Enumeration — Admin, Manager, User. Controls badge colour and module access.
- **Avatar**: A profile image stored remotely and linked to a User via the `avatar_url` field.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An admin can add a new user, including uploading an avatar, in under 60 seconds
  from clicking "Add User" to seeing the new row appear in the table.
- **SC-002**: The user table loads and displays all records within 3 seconds under normal
  network conditions.
- **SC-003**: 100% of create, update, and delete operations are immediately reflected in the
  table without a full page reload.
- **SC-004**: Form validation catches 100% of missing-required-field and invalid-format
  submissions before they reach the backend.
- **SC-005**: Unauthorised users (non-Admin, non-Manager) are blocked from accessing the module
  100% of the time.
- **SC-006**: Every delete operation requires explicit confirmation — zero accidental
  single-click deletions are possible.

---

## Assumptions

- Only **Admin** and **Manager** roles may access this module; the authenticated user's role is
  available in the existing app auth context.
- The `users` table already exists in Supabase with columns matching the User entity above;
  schema creation or migration is out of scope for this spec.
- Profile picture upload is **optional** — a default avatar placeholder is shown when no image
  is set.
- Accepted image formats: JPG, PNG, WebP; maximum file size: 5 MB. Files outside these
  constraints are rejected client-side before any upload is attempted.
- Pagination is not required for the initial version — a single scrollable list is acceptable
  (pagination can be added later if user counts grow significantly).
- No email invitation or password-setup flow is in scope — the admin sets user data directly;
  authentication credential provisioning is handled outside this module.
- The module lives at the route `/user-management` inside the Demo1 authenticated layout,
  guarded by a protected route that checks the user's role.
- Hard-delete (permanent removal) is in scope; soft-delete (status deactivation) is handled
  via the Edit flow and is a separate concern.
