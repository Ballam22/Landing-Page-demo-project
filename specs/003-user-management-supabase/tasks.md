---
description: "Task list for User Management — Supabase Migration"
---

# Tasks: User Management — Supabase Migration

**Input**: Design documents from `/specs/003-user-management-supabase/`
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/ ✅

**Tests**: Not requested — manual browser verification per constitution.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US4)
- All paths relative to `src/app/modules/user-management/` unless noted

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Environment verification and SQL schema — unblocks all user stories.

- [x] T001 Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in `.env` and that `src/app/lib/supabaseClient.ts` exports a working client
- [x] T002 Run the `users` table migration in Supabase SQL editor (SQL from `specs/003-user-management-supabase/data-model.md`)
- [x] T003 Create the `avatars` Storage bucket in Supabase Dashboard (public visibility)
- [x] T004 Seed at least one Admin user row in `public.users` matching the Supabase auth UID (see `specs/003-user-management-supabase/quickstart.md` Step 3)

**Checkpoint**: Supabase table exists, bucket exists, env vars set — implementation can begin.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Data-access layer and React Query hooks shared by all user stories.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T005 Create `src/app/modules/user-management/_requests.ts` — implement `fetchUsers()` selecting all rows from `public.users`, mapping `full_name→fullName` and `avatar_url→avatarUrl`
- [x] T006 [P] Add `fetchUserById(id: string)` to `src/app/modules/user-management/_requests.ts` — SELECT single row by id, same column mapping
- [x] T007 [P] Add `uploadAvatar(userId: string, file: File): Promise<string>` to `src/app/modules/user-management/_requests.ts` — validate type (jpg/jpeg/png/webp) and size (≤5 MB), upload to `avatars/{userId}.{ext}` with upsert:true, return public URL
- [x] T008 Add `insertUser(payload: Omit<User,'id'>, avatarFile?: File): Promise<User>` to `src/app/modules/user-management/_requests.ts` — generate UUID, call `uploadAvatar` if file provided, INSERT into `public.users`, return mapped User
- [x] T009 Add `updateUser(id: string, payload: Partial<Omit<User,'id'>>, avatarFile?: File): Promise<User>` to `src/app/modules/user-management/_requests.ts` — call `uploadAvatar` if file provided, UPDATE row, return mapped User
- [x] T010 Add `removeUser(id: string): Promise<void>` to `src/app/modules/user-management/_requests.ts` — DELETE row; best-effort delete storage file `avatars/{id}.*`
- [x] T011 Create `src/app/modules/user-management/hooks/useUsers.ts` — export `useUserList` (useQuery key `['users']`, fn `fetchUsers`), `useAddUser` (useMutation → insertUser, onSuccess invalidates `['users']`), `useUpdateUser` (useMutation → updateUser, onSuccess invalidates `['users']`), `useRemoveUser` (useMutation → removeUser, onSuccess invalidates `['users']`)
- [x] T012 Rewrite `src/app/modules/user-management/UserManagementContext.tsx` — remove MOCK_USERS import and useState; read current Supabase auth UID via `supabase.auth.getUser()`; expose `currentUserId`, `addUser`, `updateUser`, `deleteUser` that delegate to useAddUser/useUpdateUser/useRemoveUser mutations from useUsers.ts
- [x] T013 Delete `src/app/modules/user-management/_mockData.ts` after confirming no remaining imports

**Checkpoint**: Foundation complete — data layer is Supabase-backed. User story work can now begin.

---

## Phase 3: User Story 1 — View and Browse All Users (Priority: P1) 🎯 MVP

**Goal**: Table loads real users from Supabase; avatars, role badges, and status indicators render correctly.

**Independent Test**: Navigate to `/user-management` — table displays rows from `public.users` with Avatar, Full Name, Email, Role badge, Status badge, and Actions columns. Empty state shown when table has no rows.

### Implementation for User Story 1

- [x] T014 [US1] Update `src/app/modules/user-management/components/UsersTable.tsx` — replace `const {users} = useUserManagement()` with `const {data: users = [], isLoading, isError} = useUserList()` from useUsers.ts; add loading skeleton row (spinner or skeleton cells) when `isLoading`; add error row when `isError`
- [x] T015 [US1] Update `src/app/modules/user-management/components/UsersTable.tsx` — receive `currentUserId: string | null` as prop; in the Actions column cell, disable the Delete button (`disabled` + reduced opacity) when `row.original.id === currentUserId`
- [x] T016 [P] [US1] Verify `src/app/modules/user-management/components/RoleBadge.tsx` renders correct badge colours (blue/`badge-light-primary` for Admin, green/`badge-light-success` for Manager, grey/`badge-light-secondary` for User) — update colour mapping if needed
- [x] T017 [US1] Update `src/app/modules/user-management/UserManagementPage.tsx` — pass `currentUserId` from `useUserManagement()` context down to `<UsersTable currentUserId={currentUserId} />`

**Checkpoint**: User Story 1 complete. Table shows live Supabase data. Own-account Delete is disabled.

---

## Phase 4: User Story 2 — Add a New User (Priority: P1) 🎯 MVP

**Goal**: "Add User" modal creates a real row in Supabase; avatar uploads to Storage; new row appears in table immediately on success.

**Independent Test**: Click "Add User", fill all fields, optionally upload a JPG/PNG/WebP image under 5 MB, click Save — modal closes, new row appears in table, avatar thumbnail shows uploaded image. Oversized or wrong-format file is rejected with an error message.

### Implementation for User Story 2

- [x] T018 [US2] Rewrite the avatar handler in `src/app/modules/user-management/components/UserModalForm.tsx` — replace `FileReader` / Base64 logic with: store the selected `File` object in `formik.values.avatarFile`; show a local `URL.createObjectURL(file)` preview only (do NOT upload here); remove `reader.readAsDataURL` call entirely
- [x] T019 [US2] Add client-side file validation in `src/app/modules/user-management/components/UserModalForm.tsx` `handleAvatarChange` — reject files where `file.type` not in `['image/jpeg','image/png','image/webp']` OR `file.size > 5 * 1024 * 1024`; set a `avatarError` local state string and display it below the upload input; clear the error on valid file selection
- [x] T020 [US2] Update `onSubmit` in `src/app/modules/user-management/components/UserModalForm.tsx` — call `addUser({ fullName, email, role, status }, values.avatarFile ?? undefined)` from `useUserManagement()` context (which delegates to `useAddUser` mutation); await the promise; show spinner during submission; call `onClose()` on success; display a toast/alert on error
- [x] T021 [US2] Update `src/app/modules/user-management/components/UserModal.tsx` — load `existingEmails` from `useUserList().data` instead of `useUserManagement().users` (users list now comes from React Query, not context)

**Checkpoint**: User Story 2 complete. Create flow persists to Supabase and refreshes the table.

---

## Phase 5: User Story 3 — Edit an Existing User (Priority: P2)

**Goal**: Edit modal opens pre-filled with current Supabase data; changes persist to database; new avatar replaces old one in Storage.

**Independent Test**: Click Edit on any row — modal opens pre-filled with current values. Change the role and save — modal closes, row shows updated role badge. Upload a new avatar and save — new image appears in the table row.

### Implementation for User Story 3

- [x] T022 [US3] Update `onSubmit` in `src/app/modules/user-management/components/UserModalForm.tsx` — in the `mode === 'edit'` branch, call `updateUser(userId, { fullName, email, role, status }, values.avatarFile ?? undefined)` from context; await; spinner during submission; `onClose()` on success; error alert on failure
- [x] T023 [US3] Verify `src/app/modules/user-management/components/UserModal.tsx` passes correct `initialValues` when `mode === 'edit'` — `avatarUrl` from the existing user row should populate the preview thumbnail; `avatarFile` starts as `null` (no re-upload required unless user selects a new file)

**Checkpoint**: User Story 3 complete. Edit flow updates Supabase row and optionally replaces avatar.

---

## Phase 6: User Story 4 — Delete a User (Priority: P2)

**Goal**: Confirming deletion permanently removes the row from Supabase and updates the table; Cancel leaves the row intact.

**Independent Test**: Click Delete on a row that is NOT the logged-in user — confirmation dialog appears. Click Cancel — row stays. Click Delete again, then Confirm — row disappears and does not return on refresh.

### Implementation for User Story 4

- [x] T024 [US4] Update `handleDeleteConfirm` in `src/app/modules/user-management/UserManagementPage.tsx` — replace synchronous `deleteUser(userToDelete.id)` with `await deleteUser(userToDelete.id)` (mutation is now async); show an error notification if the promise rejects; call `handleDeleteClose()` in the finally block
- [x] T025 [US4] Confirm `src/app/modules/user-management/components/DeleteConfirmDialog.tsx` shows the user's full name in the confirmation message (already implemented — verify `userName` prop is wired correctly from `userToDelete?.fullName`)

**Checkpoint**: User Story 4 complete. All four CRUD operations are Supabase-backed.

---

## Phase 7: Role Guard — Access Control

**Purpose**: Admin/Manager-only route enforcement (cross-cutting, depends on all stories being functional first).

- [x] T026 Create `src/app/modules/user-management/components/guards/RoleGuard.tsx` — component that calls `supabase.auth.getUser()` to get auth UID, queries `public.users` for the row with matching id, checks `role` against `allowedRoles: Role[]` prop, renders `children` if allowed or `<Navigate to='/dashboard' />` if not; show a loading spinner while the role is being fetched
- [x] T027 Update `src/app/routing/PrivateRoutes.tsx` — wrap the `/user-management` route element in `<RoleGuard allowedRoles={['Admin', 'Manager']}>...</RoleGuard>`

**Checkpoint**: Non-Admin/Manager users are redirected from `/user-management`.

---

## Phase 8: Polish & Cross-Cutting Concerns

- [x] T028 [P] Run `npm run lint` and fix any TypeScript or ESLint errors introduced by the migration — target: zero warnings
- [x] T029 [P] Remove any remaining references to `MOCK_USERS` or `_mockData` across the codebase (search with `grep -r "_mockData\|MOCK_USERS" src/`)
- [x] T030 [P] Add `avatarUrl` cache-busting: append `?t={Date.now()}` to avatar URLs displayed in `UsersTable.tsx` to prevent stale browser cache after avatar replacement on edit
- [ ] T031 Run the full quickstart validation checklist from `specs/003-user-management-supabase/quickstart.md` — mark all 10 items ✅ before considering the feature complete

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — **BLOCKS all user stories**
- **US1 (Phase 3)**: Depends on Phase 2 — no dependency on US2/3/4
- **US2 (Phase 4)**: Depends on Phase 2 — no dependency on US1/3/4 (but tests best after US1 so the table refresh is visible)
- **US3 (Phase 5)**: Depends on Phase 2 — no dependency on US1/2/4
- **US4 (Phase 6)**: Depends on Phase 2 — no dependency on US1/2/3
- **Role Guard (Phase 7)**: Depends on Phase 2 — can start after Foundational; best validated after all stories work
- **Polish (Phase 8)**: Depends on all stories being complete

### User Story Dependencies

- **US1 (P1)**: Independent after Foundation
- **US2 (P1)**: Independent after Foundation (shares UserModalForm with US3)
- **US3 (P2)**: Shares `UserModalForm.tsx` edits with US2 — implement US2 first to avoid conflicts
- **US4 (P2)**: Independent after Foundation

### Within Each User Story

- `_requests.ts` functions → `useUsers.ts` hooks → component updates
- US2 and US3 both touch `UserModalForm.tsx` — complete T018–T021 before starting T022

### Parallel Opportunities

- T006 and T007 can run in parallel (both add to `_requests.ts` but in separate functions — coordinate to avoid conflicts)
- T016 can run in parallel with any other US1 task (read-only check)
- T028, T029, T030 (Polish phase) can all run in parallel

---

## Parallel Example: Phase 2 (Foundational)

```
Sequential (order matters — each builds on the previous):
  T005 → create _requests.ts with fetchUsers
  T006 → add fetchUserById  (can overlap with T007 if different developers)
  T007 → add uploadAvatar   (can overlap with T006)
  T008 → add insertUser     (depends on T007 for uploadAvatar call)
  T009 → add updateUser     (depends on T007 for uploadAvatar call)
  T010 → add removeUser     (independent of T008/T009)
  T011 → create useUsers.ts (depends on T005–T010 all being in _requests.ts)
  T012 → rewrite Context    (depends on T011)
  T013 → delete _mockData   (depends on T012 confirming no imports remain)
```

---

## Implementation Strategy

### MVP First (US1 + US2 only — read + create)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks everything)
3. Complete Phase 3: US1 (view table)
4. Complete Phase 4: US2 (add user)
5. **STOP and VALIDATE**: Table loads from Supabase, new users persist, avatars upload ✅
6. Demo if needed

### Full Incremental Delivery

1. Setup + Foundational → data layer ready
2. US1 → table renders live data (MVP read)
3. US2 → create works end-to-end (MVP write)
4. US3 → edit works
5. US4 → delete works
6. Role Guard → access control enforced
7. Polish → lint clean, cache-bust, full quickstart pass

---

## Notes

- [P] tasks = different files or independent functions, no blocking dependency
- [Story] label maps each task to a specific user story for traceability
- US2 and US3 both modify `UserModalForm.tsx` — do US2 tasks first (T018–T021), then US3 (T022–T023)
- Commit after each phase checkpoint or logical task group
- Run `npm run lint` frequently — TypeScript strict mode will catch mapping errors early
- The `supabase.auth.getUser()` call is async — handle loading state in RoleGuard and Context
