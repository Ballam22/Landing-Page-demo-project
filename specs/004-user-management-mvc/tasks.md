# Tasks: User Management MVC Refactor

**Input**: Design documents from `/specs/004-user-management-mvc/`  
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | quickstart.md ✅

**Tests**: Not requested — manual browser verification is the acceptance criterion per project constitution.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

---

## Phase 1: Setup (Folder Structure)

**Purpose**: Create the four new directories so later tasks can write files into them.

- [x] T001 Create directories `model/`, `repository/`, `service/`, `controller/` inside `src/app/modules/user-management/`

---

## Phase 2: Foundational (Blocking Prerequisite)

**Purpose**: The model layer is imported by every other layer. It must exist before any other file can be written.

**⚠️ CRITICAL**: T002 must complete before US1 tasks can begin — all layers import from the model.

- [x] T002 Create `src/app/modules/user-management/model/User.ts` — copy all type and const exports from `_models.ts` verbatim (`Role`, `Status`, `SocialPlatform`, `SocialLink`, `SocialLinks`, `EMPTY_SOCIAL_LINKS`, `User`, `UserFormValues`); do NOT delete `_models.ts` yet

**Checkpoint**: Model file exists and compiles — all layers can now be implemented.

---

## Phase 3: User Story 1 — Developer reads and writes user data through clean layers (Priority: P1) 🎯 MVP

**Goal**: Create the three new implementation layers — repository, service, controller — so the architectural boundary exists in code and every data operation has a single, correct home.

**Independent Test**: Open each new file, search for prohibited cross-layer imports (`supabase` in service/controller, `_requests` anywhere), and confirm none exist. Run `npx tsc --noEmit` — zero errors.

### Implementation for User Story 1

- [x] T003 [P] [US1] Create `src/app/modules/user-management/repository/userRepository.ts` — implement `getAll`, `getById`, `getByEmail`, `create`, `update`, `delete`, and private `uploadAvatar` helper; import `supabase` from `src/app/lib/supabaseClient.ts`; keep `DbRow`, `rowToUser`, `rowToSocialLinks` private (not exported); mirror all logic from current `_requests.ts`
- [x] T004 [US1] Create `src/app/modules/user-management/service/userService.ts` — implement `getAllUsers`, `createUser`, `updateUser`, `deleteUser`, `resolveCurrentUserId`; import only from `../repository/userRepository` and `../model/User`; business rules here: avatar file-type whitelist (`image/jpeg`, `image/png`, `image/webp`), max-size check (5 MB), `crypto.randomUUID()` for new IDs, call repository `uploadAvatar` before `create`/`update` when a file is present — depends on T003
- [x] T005 [US1] Create `src/app/modules/user-management/controller/useUserController.ts` — single hook `useUserController` returning `{ users, isLoading, error, addUser, updateUser, deleteUser }`; wrap `userService.getAllUsers` in `useQuery(['users'], ...)` (staleTime: 0); wrap `createUser`, `updateUser`, `deleteUser` in `useMutation` with `onSuccess: () => queryClient.invalidateQueries(['users'])`; export `USERS_QUERY_KEY = ['users'] as const`; import only from `../service/userService` and `../model/User` — depends on T004

**Checkpoint**: Three new layer files exist, compile with zero errors, and contain no cross-layer Supabase imports.

---

## Phase 4: User Story 2 — End users experience identical behavior after the refactor (Priority: P2)

**Goal**: Wire all existing consumer files (context, page, components) to import from the new layers instead of the deleted flat files, so the UI continues to work identically.

**Independent Test**: Open the app in the browser, complete the full CRUD flow (list users → create with avatar → edit → delete), and confirm every step behaves identically to before the refactor.

### Implementation for User Story 2

- [x] T006 [US2] Update `src/app/modules/user-management/UserManagementContext.tsx` — (a) remove `import {supabase} from '../../lib/supabaseClient'`; (b) replace the `useEffect` Supabase call with `userService.resolveCurrentUserId(email).then(setCurrentUserId)`; (c) replace `import {useAddUser, useRemoveUser, useUpdateUser} from './hooks/useUsers'` with `import {useUserController} from './controller/useUserController'`; (d) derive `addUser`, `updateUser`, `deleteUser` from the controller hook; update `import {User} from './_models'` to `import {User} from './model/User'` — depends on T005
- [x] T007 [P] [US2] Update `src/app/modules/user-management/UserManagementPage.tsx` — change `import {EMPTY_SOCIAL_LINKS, User, UserFormValues} from './_models'` to `import {EMPTY_SOCIAL_LINKS, User, UserFormValues} from './model/User'`; no other changes needed
- [x] T008 [P] [US2] Update `src/app/modules/user-management/components/UsersTable.tsx` — replace any `import ... from '../_models'` with `import ... from '../model/User'`; confirm no Supabase or `_requests` imports exist
- [x] T009 [P] [US2] Update `src/app/modules/user-management/components/UserModal.tsx` — replace any `import ... from '../_models'` with `import ... from '../model/User'`; confirm no Supabase or `_requests` imports exist
- [x] T010 [P] [US2] Update `src/app/modules/user-management/components/UserModalForm.tsx` — replace any `import ... from '../_models'` with `import ... from '../model/User'`; confirm no Supabase or `_requests` imports exist
- [x] T011 [P] [US2] Update `src/app/modules/user-management/components/DeleteConfirmDialog.tsx` — replace any `import ... from '../_models'` with `import ... from '../model/User'` (if applicable); confirm no Supabase or `_requests` imports exist
- [x] T012 [P] [US2] Update `src/app/modules/user-management/components/RoleBadge.tsx` — replace any `import ... from '../_models'` with `import ... from '../model/User'` (if applicable)
- [x] T013 [P] [US2] Update `src/app/modules/user-management/components/guards/RoleGuard.tsx` — replace any `import ... from '../../_models'` with `import ... from '../../model/User'` (if applicable)
- [x] T014 [US2] Run `npx tsc --noEmit` from the repo root — fix every type error before proceeding; all errors must resolve to zero — depends on T006–T013

**Checkpoint**: `npx tsc --noEmit` passes, dev server starts, the Users page loads, and the full CRUD flow works in the browser.

---

## Phase 5: User Story 3 — Developer can replace the data layer without touching components (Priority: P3)

**Goal**: Remove the now-unused flat files (`_models.ts`, `_requests.ts`, `hooks/useUsers.ts`) and verify that no prohibited cross-layer imports remain anywhere in the module.

**Independent Test**: Run `grep -r "supabaseClient" src/app/modules/user-management/` — only `repository/userRepository.ts` appears. Run `grep -r "_requests\|_models\|hooks/useUsers" src/app/modules/user-management/` — zero results.

### Implementation for User Story 3

- [x] T015 [P] [US3] Delete `src/app/modules/user-management/hooks/useUsers.ts` — verify no file still imports from it (T006 must be done first)
- [x] T016 [P] [US3] Delete `src/app/modules/user-management/_requests.ts` — verify no file still imports from it
- [x] T017 [US3] Delete `src/app/modules/user-management/_models.ts` — verify no file still imports from it (all T007–T013 must be done first) — depends on T014
- [x] T018 [US3] Verify architectural boundaries: run `grep -r "supabaseClient" src/app/modules/user-management/` and confirm only `repository/userRepository.ts` appears; if any other file appears, fix the import before marking complete
- [x] T019 [US3] Verify no dead references: run `npx tsc --noEmit` one final time and confirm zero errors after file deletions — depends on T015, T016, T017

**Checkpoint**: All three user stories are complete. The three deleted files are gone, grep confirms clean boundaries, TypeScript compiles with zero errors.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final quality gate before the feature is considered done.

- [x] T020 [P] Run `npm run lint` from repo root — fix every ESLint warning until `--max-warnings 0` passes (per constitution Principle IX)
- [ ] T021 Complete the manual verification checklist from `specs/004-user-management-mvc/quickstart.md` — load users table, create user with avatar, edit user, delete user — confirm all work in the browser — load users table, create user with avatar, edit user, delete user — confirm all work in the browser

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — **BLOCKS all user stories**
- **User Story 1 (Phase 3)**: Depends on Phase 2 (model must exist)
- **User Story 2 (Phase 4)**: Depends on Phase 3 (controller must exist before context update)
- **User Story 3 (Phase 5)**: Depends on Phase 4 (all imports must be updated before deletions)
- **Polish (Phase 6)**: Depends on all phases complete

### User Story Dependencies

- **US1 (P1)**: Depends only on Foundational — repository, service, controller are net-new files
- **US2 (P2)**: Depends on US1 — consumer files updated to use new layers
- **US3 (P3)**: Depends on US2 — old files deleted only after all consumers updated

### Within Each User Story

- T003 and T004 are sequential (service imports repository)
- T004 and T005 are sequential (controller imports service)
- T006 is sequential (context imports controller)
- T007–T013 are all parallel (different component files, no inter-dependency)
- T014 is sequential (tsc after all imports updated)
- T015, T016 are parallel (deleting two independent files)
- T017 depends on T014 (need zero tsc errors first)

---

## Parallel Example: User Story 2 (largest parallel opportunity)

```
After T006 (context updated), these can all run simultaneously:

Task T007: Update UserManagementPage.tsx imports
Task T008: Update components/UsersTable.tsx imports
Task T009: Update components/UserModal.tsx imports
Task T010: Update components/UserModalForm.tsx imports
Task T011: Update components/DeleteConfirmDialog.tsx imports
Task T012: Update components/RoleBadge.tsx imports
Task T013: Update components/guards/RoleGuard.tsx imports
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Create directories (T001)
2. Complete Phase 2: Create model (T002)
3. Complete Phase 3: Create repository, service, controller (T003–T005)
4. **STOP and VALIDATE**: `npx tsc --noEmit` passes on new files
5. Proceed to Phase 4 to wire into existing consumers

### Incremental Delivery

1. T001–T002 → Foundation (model exists)
2. T003–T005 → New layers exist and compile (US1 complete)
3. T006–T014 → All consumers updated, app works (US2 complete)
4. T015–T019 → Old files deleted, boundaries verified (US3 complete)
5. T020–T021 → Lint passes, manual QA signed off (Polish complete)

---

## Notes

- `_models.ts` must NOT be deleted until T007–T013 are all done — deleting it prematurely breaks the build
- `hooks/useUsers.ts` must NOT be deleted until T006 (context update) is done
- T003 and T004 can be written bottom-up in one sitting since they are new files with no existing consumers
- The `getByEmail` method in the repository is new — it does not exist in `_requests.ts`; implement it as `supabase.from('users').select('id').eq('email', email).single()`
- `uploadAvatar` stays in the repository (touches `supabase.storage`) but its validation logic (file type, size) moves to the service — ensure the split is clean in T003 and T004
