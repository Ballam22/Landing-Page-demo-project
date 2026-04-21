# Implementation Plan: User Management MVC Refactor

**Branch**: `004-user-management-mvc` | **Date**: 2026-04-21 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/004-user-management-mvc/spec.md`

## Summary

Reorganise the existing User Management module from a flat, mixed-concern layout into five explicit layers — Model, Repository, Service, Controller, and Views — without changing any user-visible behaviour. All Supabase calls move exclusively into the repository; business logic (avatar validation, ID generation, storage) moves into the service; React Query mutation/query hooks move into the controller hook; components remain in `components/` and import only from the controller hook.

## Technical Context

**Language/Version**: TypeScript ^5.3.3  
**Primary Dependencies**: React ^18.2.0, React Query 3.38.0, Formik 2.2.9, Yup ^1.0.0, Supabase JS ^2.104.0  
**Storage**: Supabase (PostgreSQL) via `src/app/lib/supabaseClient.ts` | Files: Supabase Storage (`avatars` bucket)  
**Testing**: Manual browser verification (no automated tests required per constitution)  
**Target Platform**: Web (SPA, Vite + SWC build)  
**Project Type**: Web application (React SPA)  
**Performance Goals**: No change from baseline — this is a structural refactor only  
**Constraints**: Zero behavioural regression; constitution compliance except where documented below  
**Scale/Scope**: Single feature module (~12 files affected)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Technology Stack | ✅ PASS | No new dependencies introduced |
| II. Project Structure | ✅ PASS | New folders are inside `src/app/modules/user-management/` |
| III. TypeScript Rules | ✅ PASS | Strict types maintained; `DbRow` stays internal to repository |
| IV. Component & Styling Rules | ✅ PASS | No component markup changes |
| V. Routing Rules | ✅ PASS | No route changes |
| VI. Data Fetching Rules | ⚠️ VIOLATION | Constitution requires service functions in `_requests.ts`; this feature replaces that with `repository/` + `service/` (see Complexity Tracking) |
| VII. Forms Rules | ✅ PASS | Formik/Yup usage unchanged |
| VIII. Internationalisation | ✅ PASS | No string changes |
| IX. Code Quality Rules | ⚠️ VIOLATION | Constitution requires hooks in `hooks/` folder; `useUserController.ts` lives in `controller/` (see Complexity Tracking) |
| X. Storage Rules | ✅ PASS | Avatar upload stays in Supabase Storage `avatars` bucket; only the code location moves (from `_requests.ts` to service layer) |

> **Supabase gate**: Supabase client used only in `userRepository.ts` — single point of access. ✅

## Project Structure

### Documentation (this feature)

```text
specs/004-user-management-mvc/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks — not created here)
```

### Source Code — Before (current layout)

```text
src/app/modules/user-management/
├── _models.ts                        # Types: User, UserFormValues, SocialLinks, etc.
├── _requests.ts                      # All Supabase calls + avatar upload logic
├── UserManagementContext.tsx         # Context + direct supabase import (currentUserId lookup)
├── UserManagementPage.tsx            # Page component
├── hooks/
│   ├── useUserManagement.ts          # Context consumer hook
│   └── useUsers.ts                   # React Query hooks (useUserList, useAddUser, …)
└── components/
    ├── UsersTable.tsx
    ├── UserModal.tsx
    ├── UserModalForm.tsx
    ├── RoleBadge.tsx
    ├── DeleteConfirmDialog.tsx
    └── guards/
        └── RoleGuard.tsx
```

### Source Code — After (target layout)

```text
src/app/modules/user-management/
├── model/
│   └── User.ts                       # All TypeScript types (migrated from _models.ts)
├── repository/
│   └── userRepository.ts             # Sole Supabase consumer; methods: getAll, getById, getByEmail, create, update, delete
├── service/
│   └── userService.ts                # Business logic: avatar validation, ID generation, storage path, rules
├── controller/
│   └── useUserController.ts          # React Query hooks + controller; replaces hooks/useUsers.ts
├── UserManagementContext.tsx         # Updated: no direct supabase import; uses service for currentUserId lookup
├── UserManagementPage.tsx            # Unchanged (imports from model/ and hooks/useUserManagement)
├── hooks/
│   └── useUserManagement.ts          # Unchanged context consumer hook
└── components/                       # Unchanged — no Supabase imports
    ├── UsersTable.tsx
    ├── UserModal.tsx
    ├── UserModalForm.tsx
    ├── RoleBadge.tsx
    ├── DeleteConfirmDialog.tsx
    └── guards/
        └── RoleGuard.tsx

# Deleted files:
#   src/app/modules/user-management/_models.ts
#   src/app/modules/user-management/_requests.ts
#   src/app/modules/user-management/hooks/useUsers.ts
```

**Structure Decision**: Single-project SPA. The target layout introduces `model/`, `repository/`, `service/`, and `controller/` sub-folders within the existing module. No changes outside `src/app/modules/user-management/`.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| Principle VI: `_requests.ts` naming convention | The explicit goal of this feature is to replace the flat `_requests.ts` pattern with a layered repository + service split. Using `_requests.ts` would make the architectural boundary invisible. | Keeping `_requests.ts` defeats the entire purpose of the refactor — the layering requires the new file names to signal responsibility to developers. |
| Principle IX: hooks in `controller/` not `hooks/` | The user's spec explicitly places the controller hook at `controller/useUserController.ts` to signal it is an architectural controller, not a generic utility hook. | Moving it to `hooks/useUserController.ts` would technically comply but obscure the controller-layer concept. The folder name carries meaning in the MVC pattern. |
