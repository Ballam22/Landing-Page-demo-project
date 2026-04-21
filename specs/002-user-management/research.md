# Research: User Management Module (002)

**Phase**: 0 — Pre-Design Research  
**Date**: 2026-04-14  
**Branch**: `002-user-management`

---

## Decision Log

### 1. Module Location

**Decision**: New module lives at `src/app/modules/user-management/` (not under `apps/`).  
**Rationale**: The Metronic demo already ships a backend-wired `apps/user-management/` module. Creating a separate `modules/user-management/` folder avoids collisions and clearly identifies this as the project's own implementation.  
**Alternatives considered**: Extending/overriding the existing `apps/user-management/` module — rejected because it ships with React Query providers, a server request layer, and complex filter/pagination infrastructure that would all need to be stripped out.

---

### 2. State Management for Mock Data

**Decision**: React Context (`UserManagementContext`) wrapping the page, backed by a `useState` array initialized from a `_mockData.ts` file.  
**Rationale**: Mock data is local — React Query is purpose-built for server state and adds unnecessary overhead (query keys, cache, refetch logic) for an in-memory array. A single context with `useState` is the simplest solution that still allows all child components (table, modal, delete dialog) to read and update the shared user list without prop drilling.  
**Alternatives considered**: React Query with a fake query function — rejected (overkill for static mock data). Module-level mutable variable without context — rejected (doesn't integrate cleanly with React re-rendering).

---

### 3. Modal Pattern

**Decision**: Use the Metronic in-DOM modal pattern: a `div` with `className='modal fade show d-block'` plus a `div className='modal-backdrop fade show'`, plus `document.body.classList.add('modal-open')` on mount.  
**Rationale**: This is the pattern already used in the existing `apps/user-management/users-list/user-edit-modal/UserEditModal.tsx`. It avoids introducing `react-bootstrap` or any new dependency. It also follows the constitution rule to prefer what is already in `package.json`.  
**Alternatives considered**: `react-bootstrap` Modal — rejected (adds a new dependency). Headless UI / Radix — rejected (not in the locked stack).

---

### 4. Profile Picture Handling (Mock)

**Decision**: On file selection, use the browser `FileReader.readAsDataURL()` API to convert the image to a Base64 data URL. Store this data URL in the user object's `avatarUrl` field. Display it with an `<img src={user.avatarUrl} />`. The spec path `public/uploads/avatars/` is referenced in comments and the spec but is not actually written to disk in the mock — the image lives in memory as a data URL for the session.  
**Rationale**: Writing to `public/uploads/avatars/` from the browser is not possible without a server. A data URL gives a visually complete demo experience without backend involvement.  
**Alternatives considered**: A fake path string like `public/uploads/avatars/filename.jpg` stored in state — rejected (would not display the image). Using a placeholder for all uploads — rejected (spec explicitly says uploaded pictures should display in the avatar column after saving).

---

### 5. Table Implementation

**Decision**: React Table v7 `useTable` hook — same approach used in the existing `apps/user-management/users-list/table/UsersTable.tsx`.  
**Rationale**: React Table v7 is already in `package.json` (locked by constitution). Reusing the same pattern ensures consistency and avoids introducing new state management for table behavior.  
**Alternatives considered**: Plain HTML `<table>` without React Table — acceptable but misses the project's established pattern. React Table v8 — rejected (different API, not in the stack).

---

### 6. Role Badge Styling

**Decision**: Bootstrap badge classes with Metronic semantic color tokens:
- **Admin** → `badge badge-light-danger` (red)
- **Manager** → `badge badge-light-warning` (yellow/amber)
- **User** → `badge badge-light-primary` (blue)

**Rationale**: Metronic already ships `badge-light-*` classes that use CSS variables — they support dark mode and RTL automatically. All three roles get distinct colors and the label is always visible in the badge text, satisfying SC-005.  
**Alternatives considered**: Custom colored `<span>` elements — rejected (hardcoded colors would break dark mode). Bootstrap `bg-*` badges without Metronic tokens — rejected (same dark mode issue).

---

### 7. Delete Confirmation

**Decision**: A separate `DeleteConfirmDialog` component rendered conditionally, using the same in-DOM modal pattern (modal + backdrop). The dialog shows the user's name and a Confirm/Cancel button pair.  
**Rationale**: Keeps the delete guard self-contained and consistent with the modal pattern already decided above. No external dialog library needed.  
**Alternatives considered**: Browser `window.confirm()` — rejected (cannot be styled, breaks UI consistency). Inline confirmation row in the table — rejected (adds complexity and visual noise).

---

### 8. i18n Key Namespace

**Decision**: All new translation keys are prefixed `USER_MANAGEMENT.*` and added to `src/_metronic/i18n/messages/en.json`. Only `en.json` exists (de, es, fr, ja, zh were removed in a prior commit).  
**Rationale**: The constitution mandates React Intl with keys in the locale files. Since only `en.json` remains, we add keys there only. The `USER_MANAGEMENT.` prefix namespaces our keys and avoids collisions with existing keys.  
**Alternatives considered**: Hardcoded strings — prohibited by constitution (§ VIII). Adding keys to other locale files — N/A, they do not exist.

---

### 9. Routing

**Decision**: Add a lazy-loaded `UserManagementPage` route at path `/user-management` inside the `<BannerLayout>` block of `PrivateRoutes.tsx`, wrapped in `<SuspensedView>`.  
**Rationale**: This matches the exact pattern used for `ProfilePage` in the same file. It ensures the page is protected, uses the `MasterLayout` (Demo1), and is code-split.  
**Alternatives considered**: Adding the route outside `<BannerLayout>` — rejected (would skip the email verification banner that all authenticated pages currently include). A dedicated layout wrapper — rejected (unnecessary for this module).

---

## Summary: No Blockers

All technical decisions are resolved. The entire feature can be implemented using the locked stack with zero new dependencies. The primary pattern references are:

| Pattern | Reference File |
|---------|---------------|
| Modal | `src/app/modules/apps/user-management/users-list/user-edit-modal/UserEditModal.tsx` |
| Table | `src/app/modules/apps/user-management/users-list/table/UsersTable.tsx` |
| Form (Formik+Yup) | `src/app/modules/apps/user-management/users-list/user-edit-modal/UserEditModalForm.tsx` |
| i18n usage | `src/app/modules/auth/components/EmailVerificationBanner.tsx` |
| Route registration | `src/app/routing/PrivateRoutes.tsx` |
