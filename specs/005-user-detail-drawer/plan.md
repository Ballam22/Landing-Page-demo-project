# Implementation Plan: User Detail Drawer

**Branch**: `005-user-detail-drawer` | **Date**: 2026-04-21 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/005-user-detail-drawer/spec.md`

## Summary

Add a right-side detail drawer to the User Management page. Clicking any row in the Users table sets the selected user in local component state and opens a slide-in panel displaying that user's avatar (with initials fallback), name, email, role, status, and social media links. The drawer is read-only, closable by button or Escape key, and updates in place when a different row is clicked. No new database tables or Supabase calls are required — the user record already contains all needed data.

## Technical Context

**Language/Version**: TypeScript ^5.3.3  
**Primary Dependencies**: React ^18.2.0, React Query 3.38.0, Bootstrap 5 + Metronic SCSS  
**Storage**: No new storage — reads existing `users` table data via the existing layered architecture (controller → service → repository)  
**Testing**: Manual browser verification per project constitution  
**Target Platform**: Web SPA (Vite + SWC)  
**Project Type**: Web application (React SPA)  
**Performance Goals**: Drawer opens in under 2 seconds from row click (spec SC-001)  
**Constraints**: Read-only; no Supabase calls in components; Metronic SCSS conventions; no hardcoded strings  
**Scale/Scope**: Single component addition + two existing-file edits

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Technology Stack | ✅ PASS | No new dependencies — Bootstrap 5 + Metronic SCSS already present |
| II. Project Structure | ✅ PASS | New component in `components/`; new hook in `controller/` |
| III. TypeScript Rules | ✅ PASS | Strict types; no `any` |
| IV. Component & Styling Rules | ✅ PASS | Uses Metronic utility classes; Keenicons for close button; CSS variables for colours |
| V. Routing Rules | ✅ PASS | No route changes — in-page drawer only |
| VI. Data Fetching Rules | ✅ PASS | Data comes from existing `useUserController` — no new Supabase calls in components |
| VII. Forms Rules | ✅ PASS | No forms involved |
| VIII. Internationalisation | ✅ PASS | All new strings must use React Intl keys |
| IX. Code Quality Rules | ✅ PASS | New hook `useUserDetailDrawer` in `controller/`; component PascalCase |
| X. Storage Rules | ✅ PASS | No file uploads or storage changes |

> **Supabase gate**: No new Supabase client calls introduced. Existing `useUserController` supplies all data. ✅

## Project Structure

### Documentation (this feature)

```text
specs/005-user-detail-drawer/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code Changes

```text
# New files
src/app/modules/user-management/
├── controller/
│   └── useUserDetailDrawer.ts        # State hook: selectedUser, openDrawer, closeDrawer
└── components/
    └── UserDetailDrawer.tsx          # Drawer component — read-only profile panel

# Modified files
src/app/modules/user-management/
├── UserManagementPage.tsx            # Wire selectedUser state + drawer open/close
└── components/
    └── UsersTable.tsx                # Add onViewDetails prop + row click + active-row highlight

# New i18n keys (all supported locales under src/_metronic/i18n/messages/)
# USER_DETAIL.TITLE, USER_DETAIL.NO_SOCIAL_ACCOUNTS,
# USER_DETAIL.SOCIAL_LINKEDIN, USER_DETAIL.SOCIAL_INSTAGRAM, USER_DETAIL.SOCIAL_X,
# USER_DETAIL.CLOSE, USER_DETAIL.LOADING, USER_DETAIL.ERROR
```

**Structure Decision**: Single-project SPA. The drawer is a pure presentational component inside `components/`; its open/close state lives in a dedicated `useUserDetailDrawer` hook in `controller/`. `UserManagementPage.tsx` owns the wiring between row clicks and drawer state.

## Complexity Tracking

> No constitution violations — no justification table required.
