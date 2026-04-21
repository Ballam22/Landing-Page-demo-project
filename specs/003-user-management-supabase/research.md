# Research: User Management — Supabase Migration

## Finding 1: Existing module is complete as a mock-backed UI

**Decision**: Keep all existing UI components intact. Migration targets data layer only.

**Rationale**: `src/app/modules/user-management/` already has a working table, modal form,
delete dialog, role badge, and i18n strings. All UI acceptance criteria from the spec are
already satisfied. Replacing the mock context with a Supabase-backed service is the only
scope.

**Files that change**: `UserManagementContext.tsx`, `UserModalForm.tsx`
**New files**: `_requests.ts`, `hooks/useUsers.ts`, SQL migration

**Alternatives considered**: Rebuild using the Metronic `apps/user-management` module already
in the codebase. Rejected — that module uses Axios against a phantom API and adds complexity
(QueryRequestProvider, QueryResponseProvider) without adding value for this backend.

---

## Finding 2: React Query pattern for Supabase data fetching

**Decision**: Wrap Supabase calls in React Query (`useQuery` / `useMutation`) accessed via a
dedicated `hooks/useUsers.ts`. Replace `UserManagementContext` state management with React
Query cache.

**Rationale**: Constitution Principle VI requires React Query for server state — no raw
`useEffect`+`useState` for data calls. React Query gives loading/error states, cache
invalidation, and optimistic updates for free.

**Pattern**:
```
_requests.ts          → raw Supabase calls (fetchUsers, insertUser, upsertUser, removeUser, uploadAvatar)
hooks/useUsers.ts     → useQuery + useMutation wrappers, query key constants
UserManagementContext → forwards mutations to useUsers; keeps UI interaction state (modal open/closed)
```

**Alternatives considered**: Remove context entirely and call useUsers inside each component.
Rejected — context is useful to avoid prop-drilling modal-open state and to expose a single
`currentUserId` guard without re-querying auth in multiple components.

---

## Finding 3: Supabase Storage — avatar upload flow

**Decision**: Upload file before saving user record. Store the returned public URL in
`avatar_url`. Replace the existing `FileReader` / Base64 approach entirely.

**Upload flow**:
1. Validate file client-side (type: jpg/jpeg/png/webp, size ≤ 5 MB)
2. Generate deterministic path: `avatars/{userId}.{ext}` (upsert on edit)
3. Call `supabase.storage.from('avatars').upload(path, file, { upsert: true })`
4. Retrieve URL via `supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl`
5. Save URL to `avatar_url` column in the `users` table

**Rationale**: Constitution Principle X mandates Supabase Storage for all file uploads.
Base64 / FileReader is explicitly retired. Public URLs are acceptable for profile avatars
since the bucket should be configured as public for this use case.

**Alternatives considered**: Upload after saving the user record. Rejected — if upload fails
after insert the record has a null avatar with no clean recovery. Upload-first lets us abort
on failure before any DB write.

---

## Finding 4: Role guard for the route

**Decision**: Read the logged-in user's role from the `users` table (by Supabase auth UID)
and redirect non-Admin/non-Manager visitors from `/user-management`.

**Rationale**: The existing `UserModel` in `auth/core/_models.ts` does not carry a `role`
field for user-management access control. Supabase auth UID is always available from
`supabase.auth.getUser()` and can be joined to the `users` table to fetch the role.

**Implementation approach**: Add a `useCurrentUserRole` hook that queries the `users` table
with `eq('id', authUser.id)`. Wrap the route with a `<RoleGuard allowedRoles={['Admin','Manager']}>`
component that calls this hook and renders `<Navigate to='/dashboard' />` if the role is
not permitted.

**Alternatives considered**:
- Store role in Supabase JWT `app_metadata`. More robust long-term but requires a Supabase
  Edge Function or dashboard configuration outside this feature scope.
- Trust the existing `UserModel.roles` array. Rejected — it's a mock-auth artefact with no
  Supabase backing.

---

## Finding 5: Own-account delete guard

**Decision**: In `UsersTable`, compare each row's `id` against the current Supabase auth
UID. Disable the Delete button when they match.

**Rationale**: Spec FR-014 requires this. Supabase auth UID is the canonical identifier;
it maps directly to the `id` column in the `users` table.

**Implementation**: Expose `currentUserId` (from `supabase.auth.getUser()`) through
`UserManagementContext` and thread it into `UsersTable` → `onDelete` guard.

---

## Finding 6: Supabase table schema

**Decision**: Single `users` table. Column names align with the existing TypeScript model.

```sql
CREATE TABLE IF NOT EXISTS public.users (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name   text                NOT NULL,
  email       text    UNIQUE      NOT NULL,
  role        text                NOT NULL DEFAULT 'User'
                CHECK (role IN ('Admin', 'Manager', 'User')),
  status      text                NOT NULL DEFAULT 'Active'
                CHECK (status IN ('Active', 'Inactive')),
  avatar_url  text,
  created_at  timestamptz         NOT NULL DEFAULT now()
);
```

**Rationale**: Matches the spec's User entity exactly. `id` is UUID so it aligns with
Supabase auth UIDs for the logged-in user guard. Simple RLS: anon read blocked;
authenticated users with Admin/Manager role can read/write (enforced at app layer for
this phase).

**Alternatives considered**: Separate `profiles` table linked to Supabase auth users.
Deferred — not required by this spec and adds JOIN complexity without benefit at this scale.

---

## All NEEDS CLARIFICATION items resolved

| Item | Resolution |
|------|------------ |
| Role guard source | Users table lookup via Supabase auth UID |
| Avatar bucket visibility | Public (profile pictures are not sensitive) |
| Email uniqueness check on edit | Exclude current user's email from duplicate check (already in existing form logic) |
| Supabase RLS policy | App-layer role guard for this phase; RLS hardening is out of scope |
