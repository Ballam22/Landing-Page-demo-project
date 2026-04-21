# Implementation Plan: User Management — Supabase Migration

**Branch**: `003-user-management-supabase` | **Date**: 2026-04-20 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/003-user-management-supabase/spec.md`

## Summary

Migrate the existing User Management module from in-memory mock data to Supabase (PostgreSQL)
as the real backend. All UI components are already built and working; the migration targets the
data layer exclusively: replace `UserManagementContext` mock state with React Query + Supabase,
replace FileReader/Base64 avatar handling with Supabase Storage uploads, add a role-based route
guard (Admin/Manager only), and disable the Delete button on the logged-in user's own row.

## Technical Context

**Language/Version**: TypeScript ^5.3.3 + React ^18.2.0
**Primary Dependencies**: Supabase JS ^2.104.0, React Query 3.38.0, Formik 2.2.9, Yup ^1.0.0,
React Table ^7.7.0, React Intl ^6.4.4, React Router DOM 6.30.3
**Storage**: Database: Supabase (PostgreSQL) via `src/app/lib/supabaseClient.ts` | Files:
Supabase Storage (`avatars` bucket, public) — no local `public/uploads/`
**Testing**: Manual browser verification (no automated tests required per constitution)
**Target Platform**: Web browser, Demo1 layout, route `/user-management`
**Project Type**: Single-page web application (Vite + React)
**Performance Goals**: Table loads within 3 seconds; CRUD operations reflected without page reload
**Constraints**: Avatar: JPG/PNG/WebP, ≤ 5 MB; Role guard: Admin/Manager only; No own-account
delete
**Scale/Scope**: Single `users` table; single scrollable list (no pagination in v1)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status |
|-----------|------|--------|
| I. Technology Stack | No new major deps introduced — Supabase already in package.json | ✅ PASS |
| II. Project Structure | Code in `src/app/modules/user-management/` + `src/app/lib/` | ✅ PASS |
| III. TypeScript Rules | Strict TS maintained; no `any` without comment | ✅ PASS |
| IV. Component & Styling | Existing Metronic components reused; no new ones built | ✅ PASS |
| V. Routing Rules | Route at `/user-management`, lazy-loaded, inside Demo1 layout | ✅ PASS |
| VI. Data Fetching | React Query + Supabase client for all DB operations; no mock data | ✅ PASS |
| VII. Forms | Formik + Yup validation unchanged | ✅ PASS |
| VIII. i18n | All strings via React Intl (already done in existing components) | ✅ PASS |
| IX. Code Quality | ESLint must pass with zero warnings after changes | ✅ GATE |
| X. Storage Rules | Supabase Storage `avatars` bucket; no local files; public URL via SDK | ✅ PASS |
| Prohibited Actions | No fetch(); no inline Supabase instantiation; no public/uploads/ writes | ✅ PASS |

> **Supabase gate**: All DB reads/writes route through `src/app/lib/supabaseClient.ts`. File
> uploads use the `avatars` bucket. Mock data retired for all DB-backed operations.

**Post-design re-check**: All gates pass. No violations requiring justification.

## Project Structure

### Documentation (this feature)

```text
specs/003-user-management-supabase/
├── plan.md           ← this file
├── spec.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── data-access.md
├── checklists/
│   └── requirements.md
└── tasks.md          ← created by /speckit.tasks
```

### Source Code (affected files only)

```text
src/app/
├── lib/
│   └── supabaseClient.ts           [EXISTING — no change]
└── modules/
    └── user-management/
        ├── _models.ts               [EXISTING — no change]
        ├── _mockData.ts             [DELETE after migration]
        ├── _requests.ts             [NEW — Supabase CRUD + Storage upload]
        ├── UserManagementContext.tsx [REWRITE — swap mock state for React Query mutations]
        ├── UserManagementPage.tsx   [MINOR — thread currentUserId to DeleteConfirmDialog guard]
        ├── hooks/
        │   ├── useUserManagement.ts [EXISTING — no change]
        │   └── useUsers.ts          [NEW — React Query hooks: useUserList, useAddUser, etc.]
        ├── components/
        │   ├── UsersTable.tsx       [MINOR — consume useUserList; disable Delete for own row]
        │   ├── UserModalForm.tsx    [REWRITE avatar handler — replace FileReader with Storage upload]
        │   ├── UserModal.tsx        [MINOR — load existingEmails from useUserList instead of context]
        │   ├── RoleBadge.tsx        [EXISTING — no change]
        │   └── DeleteConfirmDialog.tsx [EXISTING — no change]
        └── components/guards/
            └── RoleGuard.tsx        [NEW — redirects non-Admin/Manager roles]

src/app/routing/
└── PrivateRoutes.tsx                [MINOR — wrap user-management route with RoleGuard]
```

**Structure Decision**: Single project, existing Metronic module structure. New files follow
the established module pattern (hooks/, components/, core files at module root).

## Complexity Tracking

No constitution violations. No complexity justification required.
