# Quickstart: User Management MVC Refactor

**Branch**: `004-user-management-mvc` | **Date**: 2026-04-21

## What this refactor does

Reorganises `src/app/modules/user-management/` into five explicit layers without changing any UI or behaviour:

| Layer | File | Responsibility |
|-------|------|----------------|
| Model | `model/User.ts` | TypeScript types only |
| Repository | `repository/userRepository.ts` | Sole Supabase consumer — CRUD + avatar storage |
| Service | `service/userService.ts` | Business rules — validation, ID generation, orchestration |
| Controller | `controller/useUserController.ts` | React hook — React Query wiring, loading/error state |
| Views | `components/*.tsx` | UI only — no data-access imports |

---

## Prerequisites

- Node 18+, `npm install` already run
- `.env` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` configured
- Supabase `users` table and `avatars` storage bucket already exist (no schema changes needed)

---

## Development setup

```bash
# Start the dev server
npm run dev

# Type-check only (no emit)
npx tsc --noEmit

# Lint
npm run lint
```

---

## Import path guide

After the refactor, use these import paths in components:

```ts
// Types
import type { User, UserFormValues, Role, Status } from '../model/User'
import { EMPTY_SOCIAL_LINKS } from '../model/User'

// Controller hook (the only data-access import components need)
import { useUserController } from '../controller/useUserController'

// Context consumer (unchanged)
import { useUserManagement } from '../hooks/useUserManagement'
```

**Never import these in components:**
```ts
// ❌ Prohibited in components after this refactor
import { supabase } from '../../lib/supabaseClient'
import { fetchUsers } from '../_requests'           // deleted
import { userRepository } from '../repository/...'  // repository layer only
import { userService } from '../service/...'         // service layer only
```

---

## Layer-by-layer walkthrough

### 1. Model (`model/User.ts`)

Exact copy of current `_models.ts`. Contains only `type` and `const` declarations — no logic, no imports.

### 2. Repository (`repository/userRepository.ts`)

- Imports `supabase` from `src/app/lib/supabaseClient.ts` — the **only** file in the module that does this.
- Exports: `getAll()`, `getById(id)`, `getByEmail(email)`, `create(payload, avatarUrl?)`, `update(id, patch, avatarUrl?)`, `delete(id)`.
- Exports private helper: `uploadAvatar(userId, file)` — called only from the service via re-export or by keeping it internal and exposing it as a storage method.
- `DbRow` type is private (not exported).
- `rowToUser` and `rowToSocialLinks` mapping functions are private.

### 3. Service (`service/userService.ts`)

- Imports from `../repository/userRepository` only — no Supabase import.
- `createUser(payload, avatarFile?)`: validates avatar (type + size), calls `uploadAvatar`, generates UUID, calls `repository.create`.
- `updateUser(id, patch, avatarFile?)`: validates avatar if file present, calls `uploadAvatar`, calls `repository.update`.
- `deleteUser(id)`: calls `repository.delete` (avatar cleanup is a best-effort operation inside the repository).
- `getAllUsers()`: delegates to `repository.getAll`.
- `resolveCurrentUserId(email)`: delegates to `repository.getByEmail` — used by `UserManagementContext`.

### 4. Controller (`controller/useUserController.ts`)

- Imports from `../service/userService` only.
- Wraps `userService.getAllUsers` in `useQuery(USERS_QUERY_KEY, ...)`.
- Wraps `userService.createUser`, `updateUser`, `deleteUser` in `useMutation(...)` with `onSuccess: () => queryClient.invalidateQueries(USERS_QUERY_KEY)`.
- Returns: `{ users, isLoading, error, addUser, updateUser, deleteUser }`.
- `USERS_QUERY_KEY = ['users'] as const` — exported for callers that need to invalidate manually.

### 5. Context (`UserManagementContext.tsx`)

- Remove direct `supabase` import.
- Import `resolveCurrentUserId` from `../service/userService`.
- Replace the `useEffect` Supabase call with `resolveCurrentUserId(email)` — same async pattern.
- Import mutation wrappers from `../controller/useUserController` instead of `../hooks/useUsers`.

### 6. Deleted files

| File | Replacement |
|------|-------------|
| `_models.ts` | `model/User.ts` |
| `_requests.ts` | `repository/userRepository.ts` + `service/userService.ts` |
| `hooks/useUsers.ts` | `controller/useUserController.ts` |

---

## Verification checklist (manual, post-implementation)

- [ ] `npx tsc --noEmit` — zero errors
- [ ] `npm run lint` — zero warnings
- [ ] `grep -r "supabaseClient" src/app/modules/user-management/` — only `repository/userRepository.ts` appears
- [ ] `grep -r "_requests" src/app/modules/user-management/` — no results (file deleted)
- [ ] Users table loads correctly in the browser
- [ ] Create user with avatar — user appears in list with avatar
- [ ] Edit user — changes persist
- [ ] Delete user — user removed from list
- [ ] Delete own account attempt — blocked by role guard (unchanged)
