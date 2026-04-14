# Tasks: User Management Module

**Input**: Design documents from `/specs/002-user-management/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅  
**Tests**: Not included — demo project; manual browser verification is the acceptance criterion (constitution §Demo Project Constraints)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each increment.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no incomplete dependencies)
- **[Story]**: Maps to user story from spec.md (US1–US4)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the module skeleton and all translation strings before any component work begins.

- [x] T001 Create folder structure `src/app/modules/user-management/components/` and `src/app/modules/user-management/hooks/` (empty placeholder files optional)
- [x] T002 [P] Add all `USER_MANAGEMENT.*` i18n keys to `src/_metronic/i18n/messages/en.json` (full key list in `specs/002-user-management/data-model.md`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core types, mock data, shared context, and routing — must be complete before any user story component can function.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T003 Create `src/app/modules/user-management/_models.ts` — define `Role` union (`'Admin' | 'Manager' | 'User'`), `Status` union (`'Active' | 'Inactive'`), `User` type (id, fullName, email, role, status, avatarUrl), `UserFormValues` type (fullName, email, role, status, avatarFile, avatarUrl)
- [x] T004 [P] Create `src/app/modules/user-management/_mockData.ts` — export `MOCK_USERS: User[]` with 6 seed users (2 Admin, 2 Manager, 2 User; mix of Active/Inactive; at least 2 with a defined `avatarUrl` placeholder)
- [x] T005 Create `src/app/modules/user-management/UserManagementPage.tsx` — define `UserManagementContext` (users array, addUser, updateUser, deleteUser) and `UserManagementProvider` wrapper using `useState<User[]>` initialized from `MOCK_USERS`; export a basic page shell that wraps children in the provider
- [x] T006 [P] Create `src/app/modules/user-management/hooks/useUserManagement.ts` — thin hook that calls `useContext(UserManagementContext)` and throws if used outside the provider
- [x] T007 Register the lazy-loaded `UserManagementPage` route at path `/user-management` inside the `<BannerLayout>` block of `src/app/routing/PrivateRoutes.tsx` (follow the existing `ProfilePage` pattern with `React.lazy()` + `<SuspensedView>`)

**Checkpoint**: Foundation ready — navigating to `/user-management` renders the page shell; context is available to all child components.

---

## Phase 3: User Story 1 — View All Users (Priority: P1) 🎯 MVP

**Goal**: Render the full-page users table with all six columns (avatar, full name, email, role badge, status, actions) populated from mock data.

**Independent Test**: Navigate to `/user-management` — the table shows all 6 seed users with correct data in every column; role badges are visually distinct; users without an avatar show a placeholder; the empty-state message appears when the array is cleared.

### Implementation

- [x] T008 [P] [US1] Create `src/app/modules/user-management/components/RoleBadge.tsx` — accepts a `role: Role` prop; renders a `<span>` with the appropriate Metronic badge class: `badge-light-danger` (Admin), `badge-light-warning` (Manager), `badge-light-primary` (User); label text from `intl.formatMessage()`
- [x] T009 [US1] Create `src/app/modules/user-management/components/UsersTable.tsx` — use React Table v7 `useTable` hook; define columns: avatar (circular `<img>` or initial-based placeholder), fullName, email, role (`<RoleBadge />`), status, actions (Edit button with `ki-pencil` Keenicon, Delete button with `ki-trash` Keenicon); render empty-state row with `USER_MANAGEMENT.EMPTY_STATE` message when `users.length === 0`; consume users from `useUserManagement()`; accept `onEdit(user: User)` and `onDelete(user: User)` callback props
- [x] T010 [US1] Complete `src/app/modules/user-management/UserManagementPage.tsx` — add page title (`USER_MANAGEMENT.TITLE`), "Add User" button (stub `onClick` for now), and render `<UsersTable onEdit={...} onDelete={...} />`; wrap everything in `<UserManagementProvider>`

**Checkpoint**: User Story 1 is fully functional — table displays all mock users with role badges, avatars, and placeholder action buttons.

---

## Phase 4: User Story 2 — Add a New User (Priority: P2)

**Goal**: "Add User" button opens a modal form; submitting a valid form appends a new user to the table immediately.

**Independent Test**: Click "Add User" — modal opens with all fields empty; fill in all required fields, upload a profile picture, click Save — modal closes and the new user row appears in the table with the correct avatar; leave a required field empty and click Save — inline validation error is shown; enter a duplicate email — duplicate error is shown.

### Implementation

- [x] T011 [P] [US2] Create `src/app/modules/user-management/components/UserModalForm.tsx` — Formik form using `useFormik` with a Yup schema: `fullName` required, `email` required + valid format + unique check against existing users (accept `existingEmails: string[]` prop, exclude current user's email in edit mode), `role` required, `status` required; file input for `avatarFile` uses `FileReader.readAsDataURL()` to set `avatarUrl` preview; all errors displayed inline below their field using `intl.formatMessage()`; submit button disabled + shows spinner class while `isSubmitting`; all field labels from `intl.formatMessage()`
- [x] T012 [US2] Create `src/app/modules/user-management/components/UserModal.tsx` — in-DOM modal shell following the `UserEditModal.tsx` pattern (`modal fade show d-block` + `modal-backdrop fade show`; `document.body.classList.add('modal-open')` on mount); accepts `isOpen: boolean`, `onClose: () => void`, `initialValues: UserFormValues`, `mode: 'add' | 'edit'`, `userId?: string` props; renders modal header (title from `USER_MANAGEMENT.ADD_USER` or `USER_MANAGEMENT.EDIT_USER`), `<UserModalForm />` in the body; only mounts when `isOpen` is true
- [x] T013 [US2] Wire Add User flow in `src/app/modules/user-management/UserManagementPage.tsx` — add `isModalOpen` and `selectedUser` state; "Add User" button sets `isModalOpen=true` with empty `initialValues`; `UserModal` `onClose` resets state; `UserModalForm` `onSubmit` calls `addUser({ ...values, id: uuid() })` from context then calls `onClose`

**Checkpoint**: User Stories 1 and 2 both work — table shows all users; new users can be added via modal; validation prevents bad data.

---

## Phase 5: User Story 3 — Edit an Existing User (Priority: P3)

**Goal**: Edit button on a row opens the same modal pre-filled with that user's data; saving updates the row in the table.

**Independent Test**: Click Edit on any row — modal opens with all fields pre-populated from that user's data; change the role and save — the row's role badge updates immediately; change the profile picture and save — the new avatar appears in the row; clear the full name field and save — validation error shown, data not changed.

### Implementation

- [x] T014 [US3] Add edit state tracking in `src/app/modules/user-management/UserManagementPage.tsx` — when `onEdit(user)` callback fires from `UsersTable`, set `selectedUser = user` and `isModalOpen = true`; pass `mode='edit'` and `userId={selectedUser.id}` to `UserModal`
- [x] T015 [US3] Wire `onEdit` callback from `src/app/modules/user-management/components/UsersTable.tsx` — Edit button calls `onEdit(row.original)` (already accepted as a prop from T009; confirm it passes the full `User` object)
- [x] T016 [US3] Connect `updateUser` in the `UserModalForm` submit path — when `mode === 'edit'`, `onSubmit` calls `updateUser(userId, { ...values })` from `useUserManagement()` then `onClose`; ensure `initialValues` are correctly mapped from the selected `User` to `UserFormValues` (including existing `avatarUrl` so the current picture is shown)

**Checkpoint**: User Stories 1, 2, and 3 all work — view, add, and edit are fully functional with live table updates.

---

## Phase 6: User Story 4 — Delete a User (Priority: P4)

**Goal**: Delete button shows a confirmation dialog naming the user; confirming removes the row; cancelling does nothing.

**Independent Test**: Click Delete on any row — confirmation dialog appears with the user's full name and Confirm/Cancel buttons; click Cancel — dialog closes, row remains; click Delete again, then Confirm — dialog closes, row disappears from the table.

### Implementation

- [x] T017 [P] [US4] Create `src/app/modules/user-management/components/DeleteConfirmDialog.tsx` — in-DOM modal (same pattern as `UserModal`); accepts `isOpen: boolean`, `onClose: () => void`, `onConfirm: () => void`, `userName: string` props; body displays `USER_MANAGEMENT.DELETE_CONFIRM` with the user's name interpolated; footer has Cancel (`USER_MANAGEMENT.CANCEL`) and Confirm (`USER_MANAGEMENT.CONFIRM`) buttons; Confirm is styled `btn-danger`
- [x] T018 [US4] Wire Delete flow in `src/app/modules/user-management/UserManagementPage.tsx` — add `isDeleteDialogOpen` and `userToDelete` state; `onDelete(user)` callback from `UsersTable` sets both; `DeleteConfirmDialog` `onConfirm` calls `deleteUser(userToDelete.id)` from context then resets state; `onClose` just resets state

**Checkpoint**: Full CRUD is complete — all four user stories are independently functional.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Compliance checks and manual validation across all stories.

- [x] T019 [P] Audit all components in `src/app/modules/user-management/` — verify every user-facing string uses `intl.formatMessage()` or `<FormattedMessage />`; no hardcoded English strings remain
- [x] T020 [P] Run `npx tsc --noEmit` from repo root — resolve all TypeScript errors; confirm no `any` types are present without an explanatory inline comment
- [x] T021 [P] Run `npx eslint src/app/modules/user-management/ --max-warnings 0` — resolve all lint warnings to zero
- [x] T022 Manual browser verification — exercise the full flow: (1) table loads with 6 seed users showing all columns and role badges; (2) Add User form validates required fields and duplicate email; (3) uploaded avatar displays after save; (4) Edit pre-fills form and updates row on save; (5) Delete requires confirmation and removes row; (6) empty state message shown when all users deleted

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — **blocks all user story phases**
- **Phase 3 (US1)**: Depends on Phase 2 completion
- **Phase 4 (US2)**: Depends on Phase 3 completion (modal reuses context wiring from page)
- **Phase 5 (US3)**: Depends on Phase 4 completion (`UserModal` and `UserModalForm` must exist)
- **Phase 6 (US4)**: Depends on Phase 3 completion (only needs `UsersTable` callbacks and context)
- **Phase 7 (Polish)**: Depends on all user story phases being complete

### User Story Dependencies

- **US1 (P1)**: Depends on Foundational (Phase 2) only — no story dependencies
- **US2 (P2)**: Depends on US1 (`UserManagementPage.tsx` structure and context already in place)
- **US3 (P3)**: Depends on US2 (`UserModal` + `UserModalForm` components must exist)
- **US4 (P4)**: Depends on US1 only (`UsersTable` callback props must exist) — can run in parallel with US2/US3

### Within Each Phase

- [P]-marked tasks target different files and can be done simultaneously
- Foundation tasks (T003–T007) should be done in order: types → data → context → hook → route
- US2 tasks (T011–T013): form first, then modal shell, then wire-up

### Parallel Opportunities

- T002 (i18n keys) can run alongside T003–T006 in Phase 2
- T008 (RoleBadge) can run in parallel with T009 start (different files)
- T011 (UserModalForm) can be built concurrently with T008/T009 if two people are working
- T017 (DeleteConfirmDialog) can run in parallel with US2/US3 work (independent component)
- T019, T020, T021 (Polish checks) can all run in parallel in Phase 7

---

## Parallel Example: Phase 2

```text
# These four tasks target different files and can run simultaneously:
T002 — add i18n keys to en.json
T003 — create _models.ts
T004 — create _mockData.ts
T006 — create useUserManagement.ts hook

# T005 and T007 depend on T003, so sequence them after:
T005 — UserManagementPage context (needs User type from T003)
T007 — PrivateRoutes registration (needs UserManagementPage from T005)
```

## Parallel Example: Phase 3 (US1)

```text
# T008 and T009 start are independent:
T008 — create RoleBadge.tsx
T009 — create UsersTable.tsx (imports RoleBadge when ready)

# T010 depends on T009:
T010 — complete UserManagementPage.tsx (imports UsersTable)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T002)
2. Complete Phase 2: Foundational (T003–T007)
3. Complete Phase 3: US1 — View All Users (T008–T010)
4. **STOP and VALIDATE**: Navigate to `/user-management` — table shows all seed users with correct badges, avatars, status
5. Demo if ready; proceed to US2 when approved

### Incremental Delivery

1. Setup + Foundational → page skeleton accessible
2. US1 → read-only table with role badges — **MVP demo ready**
3. US2 → add new users via modal
4. US3 → edit existing users (reuses modal)
5. US4 → delete with confirmation
6. Polish → TypeScript, lint, i18n audit, manual test sign-off

---

## Notes

- [P] tasks target different files; no incomplete-task dependencies — safe to run simultaneously
- [Story] labels enable traceability back to spec.md acceptance scenarios
- Each user story phase produces a working, independently testable increment
- No automated tests — manual browser verification per Phase 7 (T022) is the acceptance gate
- Commit after each phase checkpoint to preserve incremental progress
- `public/uploads/` directory already exists — no directory creation needed for avatar storage
