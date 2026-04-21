# Research: User Management MVC Refactor

**Branch**: `004-user-management-mvc` | **Date**: 2026-04-21

## Scope

This is a pure code-organisation refactor in a well-understood, running codebase. All technology choices are already locked by the project constitution. No new libraries, no new Supabase tables, no new routes. Research focuses on three questions that arose from reading the current code:

---

## Decision 1: Where does the `currentUserId` lookup live?

**Context**: `UserManagementContext.tsx` currently imports `supabase` directly to resolve the logged-in user's record ID by email (`supabase.from('users').select('id').eq('email', email).single()`). After the refactor, no file outside the repository may import the Supabase client.

**Decision**: Add a `getByEmail(email: string): Promise<string | null>` method to `userRepository.ts`. The service exposes it as `resolveCurrentUserId(email: string): Promise<string | null>`. `UserManagementContext.tsx` calls the service method instead of the Supabase client directly.

**Rationale**: The lookup is a data-access operation (a filtered read from the `users` table). It belongs in the repository. The service wraps it in case caller-level null handling is needed. This removes the last direct Supabase import from `UserManagementContext.tsx`.

**Alternatives considered**:
- Keep the lookup in `UserManagementContext.tsx` as a one-off exception → rejected: defeats the architectural constraint (FR-007).
- Use `getAll()` and filter in memory → rejected: unnecessary data load; `getByEmail` is a targeted query.

---

## Decision 2: Does `uploadAvatar` belong in repository or service?

**Context**: The current `_requests.ts` contains `uploadAvatar`, which talks to Supabase Storage. It is called by `insertUser` and `updateUser` within the same file. In the new architecture, the repository is the sole Supabase consumer — but `uploadAvatar` involves storage, not the `users` table.

**Decision**: `uploadAvatar` (including file-type validation and size check) moves to the **service layer** (`userService.ts`), and the service calls it internally before delegating the URL to the repository's `create` / `update` methods. However, because `uploadAvatar` must call `supabase.storage`, it needs access to the Supabase client — which means it actually belongs in the **repository** as a storage method alongside the table methods.

**Final ruling**: `uploadAvatar` lives in `userRepository.ts` as a private storage helper. The **service** performs the business-rule validation (file type whitelist, max size) and then calls the repository's upload helper. This respects the boundary: only the repository touches Supabase; only the service knows business rules.

**Rationale**: Supabase Storage is still Supabase — any direct `supabase.*` call must be in the repository. Business-rule validation (what types are allowed, what size is too large) is service territory.

**Alternatives considered**:
- File validation in repository → rejected: validation rules are business logic, not data-access.
- `uploadAvatar` in service calling `supabase.storage` directly → rejected: violates the single-Supabase-consumer rule.

---

## Decision 3: What is the public interface of `useUserController`?

**Context**: The current `hooks/useUsers.ts` exports four separate hooks (`useUserList`, `useAddUser`, `useUpdateUser`, `useRemoveUser`). Components import whichever they need. After the refactor, the controller is the single entry point.

**Decision**: `useUserController` is a single hook that returns a unified object:

```ts
{
  users: User[]
  isLoading: boolean
  error: Error | null
  addUser: (payload: Omit<User, 'id'>, avatarFile?: File) => Promise<User>
  updateUser: (id: string, payload: Partial<Omit<User, 'id'>>, avatarFile?: File) => Promise<User>
  deleteUser: (id: string) => Promise<void>
}
```

Internally it composes `useQuery` and `useQueryClient` (same React Query 3.x API). No breaking change to `UserManagementContext.tsx` — it already destructures `addUser`, `updateUser`, `deleteUser` from the existing mutation hooks; it will now get those from the controller.

**Rationale**: A single hook is simpler for consumers and makes the controller boundary clear. Components that currently import multiple hooks will import one hook instead. `isLoading` and `error` from the query are surfaced so the table component can render loading/error states without knowing about React Query.

**Alternatives considered**:
- Keep four separate hooks, just move them to `controller/` → rejected: still exposes React Query internals to consumers; the controller abstraction is incomplete.

---

## Summary: No NEEDS CLARIFICATION items remain

All architectural decisions are resolved. Implementation can proceed directly to Phase 1.
