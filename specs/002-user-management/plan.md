# Implementation Plan: User Management Module

**Branch**: `002-user-management` | **Date**: 2026-04-14 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/002-user-management/spec.md`

---

## Summary

Build a full-page User Management module within the Demo1 (MasterLayout) layout that lets admins and managers view, add, edit, and delete users from a mock in-memory data store. The module uses React Table v7 for the table, Formik + Yup for the modal form, Bootstrap/Metronic modal patterns for dialogs, React Intl for all strings, and React Context for shared state — entirely from the locked technology stack with zero new dependencies.

---

## Technical Context

**Language/Version**: TypeScript 5.3.3  
**Primary Dependencies**: React 18.2, React Router DOM 6.30.3, Formik 2.2.9, Yup 1.0, React Table 7.7.0, React Intl 6.4.4, Bootstrap 5 + Metronic SCSS  
**Storage**: In-memory mock array initialized from `_mockData.ts`; profile pictures stored as Base64 data URLs via `FileReader`  
**Testing**: Manual browser verification (no automated tests — demo project constraint)  
**Target Platform**: Web SPA, desktop-first (1280px+), Demo1 layout (MasterLayout)  
**Project Type**: Web application (SPA module)  
**Performance Goals**: Standard SPA — table renders without perceptible lag for mock dataset (~10–20 rows); lazy-loaded route  
**Constraints**: Mock data only (no backend), no new npm dependencies, strict TypeScript (no `any`), React Intl for all strings  
**Scale/Scope**: Single-page module, ~10 source files, mock dataset of 6–10 seed users

---

## Constitution Check

*GATE: Must pass before implementation begins.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Technology Stack | ✅ PASS | No new dependencies; React Table, Formik, Yup, Bootstrap, Keenicons, React Intl all already in `package.json` |
| II. Project Structure | ✅ PASS | New code in `src/app/modules/user-management/`; no `_metronic/` core changes |
| III. TypeScript Rules | ✅ PASS | Strict types throughout; all props typed; no `any`; path alias `@/` used |
| IV. Component & Styling | ✅ PASS | Bootstrap 5 + Metronic utilities; Keenicons for Edit/Delete; no inline `style={{}}` objects; SCSS colocated |
| V. Routing Rules | ✅ PASS | Protected route in `PrivateRoutes.tsx`; `React.lazy()` + `Suspense`; kebab-case path `/user-management` |
| VI. Data Fetching | ✅ PASS | No server calls; React Query not needed for in-memory mock; no raw `useEffect` + `useState` API patterns |
| VII. Forms Rules | ✅ PASS | Formik + Yup; all errors displayed inline; submit button disabled + spinner while "saving" |
| VIII. Internationalisation | ✅ PASS | All strings via `intl.formatMessage()`; keys added to `en.json` |
| IX. Code Quality | ✅ PASS | PascalCase components, camelCase hooks, kebab-case folder; no commented-out code; hooks in `hooks/` folder |

**No violations. No Complexity Tracking required.**

---

## Project Structure

### Documentation (this feature)

```text
specs/002-user-management/
├── plan.md              ← This file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
└── tasks.md             ← Phase 2 output (/speckit.tasks — not yet created)
```

### Source Code

```text
src/app/modules/user-management/
├── UserManagementPage.tsx          # Lazy-loaded page; renders layout + context provider
├── _models.ts                      # User, UserFormValues types; Role/Status enums
├── _mockData.ts                    # Seed data array (6–10 users, all 3 roles represented)
├── components/
│   ├── UsersTable.tsx              # React Table v7 table; columns defined inline
│   ├── UserModal.tsx               # Add/Edit modal shell (open/close, backdrop)
│   ├── UserModalForm.tsx           # Formik form inside the modal
│   ├── DeleteConfirmDialog.tsx     # Confirmation modal for delete action
│   └── RoleBadge.tsx               # Badge component — maps role → Bootstrap class
└── hooks/
    └── useUserManagement.ts        # Consumes UserManagementContext; exposes CRUD helpers

src/app/routing/PrivateRoutes.tsx   # Add lazy import + Route for /user-management

src/_metronic/i18n/messages/en.json # Add USER_MANAGEMENT.* keys (see data-model.md)
```

**Structure Decision**: Single React SPA project, module-per-feature layout under `src/app/modules/`. No backend directory needed — all data is in-memory mock. New module is deliberately kept separate from the existing Metronic demo `apps/user-management/` to avoid entangling with its backend-wired infrastructure.

---

## Design Decisions (from research.md)

| Decision | Choice | Key Reason |
|----------|--------|------------|
| State | React Context + `useState` | Mock data is local; React Query adds no value without a server |
| Modal | Metronic in-DOM pattern | Matches existing codebase; zero new dependencies |
| Profile picture | `FileReader` → data URL | Browser-only; no server write needed for demo; image displays correctly |
| Role badge | `badge badge-light-*` | Metronic tokens; dark-mode-safe; distinct colors per role |
| Route | `/user-management` in `PrivateRoutes.tsx` | Matches existing `ProfilePage` pattern exactly |
| i18n namespace | `USER_MANAGEMENT.*` in `en.json` | Only `en.json` exists; prefix avoids key collisions |

---

## Implementation Phases

### Phase A — Foundation (no visible UI yet)

1. Create `_models.ts` — `User` type, `UserFormValues` type, `Role` and `Status` union types
2. Create `_mockData.ts` — 6 seed users (2 Admin, 2 Manager, 2 User; mix of Active/Inactive; 2 with placeholder avatarUrl)
3. Create `UserManagementContext` inline in `UserManagementPage.tsx` — `useState<User[]>`, expose `addUser`, `updateUser`, `deleteUser`
4. Create `hooks/useUserManagement.ts` — thin wrapper around `useContext(UserManagementContext)`
5. Add `USER_MANAGEMENT.*` keys to `en.json`

### Phase B — Table View (P1 user story)

6. Create `RoleBadge.tsx` — maps `role` prop to `badge badge-light-*` class + renders label
7. Create `UsersTable.tsx` — React Table v7 `useTable`; columns: avatar, fullName, email, role (RoleBadge), status, actions (Edit/Delete buttons with Keenicons); empty-state row when `users.length === 0`
8. Create `UserManagementPage.tsx` — wraps context provider, renders page title + "Add User" button + `UsersTable`
9. Register `/user-management` route in `PrivateRoutes.tsx` with `React.lazy()` + `SuspensedView`

### Phase C — Add/Edit Modal (P2 + P3 user stories)

10. Create `UserModal.tsx` — in-DOM modal shell (same pattern as `UserEditModal.tsx`); receives `isOpen`, `onClose`, `initialValues` props; renders `UserModalForm` inside
11. Create `UserModalForm.tsx` — Formik form: fullName text input, email input, role select, status select, avatar file input (FileReader → preview); Yup schema validates required fields + email format + duplicate email check (receives existing users list for uniqueness); submit calls `addUser` or `updateUser` then `onClose`
12. Wire "Add User" button and row Edit button in `UserManagementPage.tsx` to open `UserModal` with correct `initialValues`

### Phase D — Delete Confirmation (P4 user story)

13. Create `DeleteConfirmDialog.tsx` — confirmation modal; shows user's name; Confirm calls `deleteUser(id)` then `onClose`; Cancel just closes
14. Wire row Delete button in `UsersTable.tsx` to open `DeleteConfirmDialog` with selected user

### Phase E — Polish & Compliance

15. Verify all strings use `intl.formatMessage()` — no hardcoded English
16. Verify no `any` types; run `tsc --noEmit`
17. Verify `eslint --max-warnings 0` passes
18. Manual browser test: add user, edit user, delete user, upload avatar, empty state, duplicate email error
