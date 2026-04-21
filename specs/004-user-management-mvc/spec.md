# Feature Specification: User Management MVC Refactor

**Feature Branch**: `004-user-management-mvc`  
**Created**: 2026-04-21  
**Status**: Draft  
**Input**: User description: "Refactor the User Management module to follow a layered architecture pattern (MVC). The current implementation has database calls and business logic mixed into components. Restructure it into Model, Repository, Service, Controller, and View layers."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Developer reads and writes user data through clean layers (Priority: P1)

A developer working on the User Management module finds all database interactions isolated in the repository layer, all business rules in the service layer, and UI state management in the controller hook — with no data access code appearing in component files.

**Why this priority**: This is the core architectural outcome. All other stories depend on this separation being correct and complete.

**Independent Test**: Open every file under `components/` and verify none import from `supabaseClient` or contain direct database calls. Verify the repository is the only file importing `supabaseClient`.

**Acceptance Scenarios**:

1. **Given** a developer opens any component file, **When** they search for Supabase imports or data-access calls, **Then** none are found — all data access goes through the controller hook.
2. **Given** a developer opens `userRepository.ts`, **When** they search for business logic (validation, role checks, error formatting), **Then** none is found — the file contains only data-source query calls.
3. **Given** a developer opens `userService.ts`, **When** they search for direct data-source imports, **Then** none is found — the service calls only the repository.

---

### User Story 2 - End users experience identical behavior after the refactor (Priority: P2)

Users who interact with the User Management UI (list, create, edit, delete, avatar upload) notice no change in behavior, data displayed, loading states, or error messages compared to before the refactor.

**Why this priority**: The refactor is purely structural. Any behavioral regression is a defect, not a trade-off.

**Independent Test**: Perform the full CRUD flow (list users, create a user with avatar, edit a user, delete a user) and confirm all outcomes match the pre-refactor baseline.

**Acceptance Scenarios**:

1. **Given** the refactored module is running, **When** a user loads the Users table, **Then** all users are displayed in the same order and with the same data as before.
2. **Given** an admin creates a new user with an avatar file, **When** they submit the form, **Then** the user is saved and the avatar appears — identical to the previous behavior.
3. **Given** an admin deletes a user, **When** the action completes, **Then** the user is removed from the list and the associated avatar files are cleaned up from storage — identical to the previous behavior.
4. **Given** a network error occurs during any operation, **When** the error propagates, **Then** the UI shows the same error feedback as before.

---

### User Story 3 - Developer can replace the data layer without touching components (Priority: P3)

A developer can swap out the repository implementation (e.g., for a test double or a different backend) without touching service or component files, because the repository is the only layer with a direct dependency on the external data source.

**Why this priority**: This validates that the dependency direction is correct and the layering delivers real testability benefits.

**Independent Test**: Create a mock repository that returns hardcoded data, pass it to the service, and confirm the service methods return the expected transformed results without any live database connection.

**Acceptance Scenarios**:

1. **Given** a test double replaces the real repository, **When** the service's `getAllUsers` is called, **Then** it returns the mocked data without contacting the database.
2. **Given** a new column is added to the data source, **When** a developer updates the repository to handle it, **Then** no component or service file requires changes — impact is contained to the repository and model.

---

### Edge Cases

- What happens when a repository method throws an unexpected error — does the service re-throw as-is or wrap it in a domain error?
- How does the controller handle simultaneous in-flight mutations (e.g., two rapid delete calls)?
- What happens if the model type diverges from the actual data schema (new column added) — is the impact contained to the repository?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The codebase MUST have a `model/User.ts` file containing all TypeScript type definitions for the User entity, with fields matching the stored user record (id, fullName, email, role, status, avatarUrl, socialLinks).
- **FR-002**: The codebase MUST have a `repository/userRepository.ts` file that is the **sole** location where the external data client is imported within the user management module.
- **FR-003**: The repository MUST expose methods: `getAll`, `getById`, `create`, `update`, `delete` — covering the complete CRUD surface for users.
- **FR-004**: The codebase MUST have a `service/userService.ts` file that imports only from the repository (not from the data client directly) and contains all business rules: avatar validation (file type, size), ID generation, and storage path conventions.
- **FR-005**: The service MUST expose methods: `getAllUsers`, `createUser`, `updateUser`, `deleteUser`.
- **FR-006**: The codebase MUST have a `controller/useUserController.ts` React hook that imports only from the service layer, manages loading and error state, and is the sole entry point for component-level data operations.
- **FR-007**: All files under `components/` MUST NOT import from the data client or from the repository directly — they MUST obtain data and trigger actions exclusively through the controller hook.
- **FR-008**: The data client configuration file MUST remain unchanged in its current location.
- **FR-009**: All existing user-facing functionality MUST continue to work identically: listing users, creating users (with avatar), editing users, deleting users (with avatar cleanup), role badges, delete confirmation dialog, and role-based access guards.
- **FR-010**: The existing `_models.ts` and `_requests.ts` files MUST be removed or superseded by the new layered files, with no dead imports or orphaned references remaining in the codebase.

### Key Entities

- **User**: Represents a managed user record — identified by a unique ID, with a full name, email address, role (Admin, Manager, or User), status (Active or Inactive), optional avatar image, and social media profile links (LinkedIn, Instagram, X).
- **UserFormValues**: Represents the data collected by the create/edit form — mirrors the User fields but includes a file attachment field for the avatar image instead of a stored URL.
- **SocialLinks**: Represents a set of social media handles and profile URLs for a user, keyed by platform.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Zero data-client imports exist in any file under `components/` after the refactor — verifiable by static code search.
- **SC-002**: The repository file is the only file in the user management module that imports the data client — verifiable by static code search.
- **SC-003**: All five layer files exist at their specified paths with no type errors reported by the compiler.
- **SC-004**: The complete CRUD user flow (list, create with avatar, edit, delete) produces identical outcomes before and after the refactor — verifiable by manual walkthrough.
- **SC-005**: No previously working component, hook, or page file has broken imports or missing type references after the refactor.

## Assumptions

- The underlying data schema (users table, avatar storage bucket) is unchanged — the refactor reorganises code only.
- Existing type definitions (User, UserFormValues, Role, Status, SocialLinks) are migrated into `model/User.ts` with identical definitions; no new fields are introduced.
- Avatar upload logic (file type validation, size limit, storage path, public URL retrieval) moves to the service layer, since it is business logic rather than a raw data query.
- The existing React Query hooks in `hooks/useUsers.ts` are migrated into `controller/useUserController.ts`; the `hooks/` folder is retired as part of this refactor.
- `UserManagementContext.tsx` continues to exist and uses the controller hook internally — no changes to the context API surface visible to consumers.
- No new automated tests are required by this ticket; the refactor is structural with no new behavior introduced.
