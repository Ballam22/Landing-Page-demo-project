# Data Access Contracts: User Management

This is a frontend-only module. There is no REST API. Contracts here define the TypeScript
function signatures in `_requests.ts` and the React Query hook interfaces in `useUsers.ts`.

---

## _requests.ts — Supabase Data Access Layer

File: `src/app/modules/user-management/_requests.ts`

All functions import the shared client: `import { supabase } from '@/app/lib/supabaseClient'`

### fetchUsers

```ts
fetchUsers(): Promise<User[]>
```

- SELECT * FROM users ORDER BY created_at DESC
- Maps snake_case columns to camelCase TypeScript type
- Throws on Supabase error

### fetchUserById

```ts
fetchUserById(id: string): Promise<User>
```

- SELECT * FROM users WHERE id = $1
- Throws if not found or on error

### insertUser

```ts
insertUser(payload: Omit<User, 'id'>, avatarFile?: File): Promise<User>
```

- If `avatarFile` provided: upload to Storage first, set `avatar_url` to public URL
- INSERT INTO users (...) VALUES (...) RETURNING *
- Avatar path: `{newId}.{ext}` — generate UUID client-side before insert
- Throws on duplicate email (Supabase error code `23505`) or storage error

### updateUser

```ts
updateUser(id: string, payload: Partial<Omit<User, 'id'>>, avatarFile?: File): Promise<User>
```

- If `avatarFile` provided: upload/upsert to Storage path `{id}.{ext}`, update `avatar_url`
- UPDATE users SET ... WHERE id = $1 RETURNING *
- Throws on error

### removeUser

```ts
removeUser(id: string): Promise<void>
```

- DELETE FROM users WHERE id = $1
- Also deletes storage file at `avatars/{id}.*` if it exists (best-effort, not blocking)
- Throws on error

### uploadAvatar

```ts
uploadAvatar(userId: string, file: File): Promise<string>
```

- Validates type (image/jpeg | image/png | image/webp) and size (≤ 5 MB)
- Throws `Error('INVALID_FILE_TYPE')` or `Error('FILE_TOO_LARGE')` if validation fails
- Uploads to `avatars/{userId}.{ext}` with `{ upsert: true }`
- Returns public URL string

---

## hooks/useUsers.ts — React Query Interface

File: `src/app/modules/user-management/hooks/useUsers.ts`

### useUserList

```ts
useUserList(): UseQueryResult<User[], Error>
```

- queryKey: `['users']`
- queryFn: `fetchUsers`
- staleTime: 0 (always refetch on mount)

### useAddUser

```ts
useAddUser(): UseMutationResult<User, Error, { payload: Omit<User,'id'>, avatarFile?: File }>
```

- mutationFn: `insertUser`
- onSuccess: `queryClient.invalidateQueries(['users'])`

### useUpdateUser

```ts
useUpdateUser(): UseMutationResult<User, Error, { id: string, payload: Partial<Omit<User,'id'>>, avatarFile?: File }>
```

- mutationFn: `updateUser`
- onSuccess: `queryClient.invalidateQueries(['users'])`

### useRemoveUser

```ts
useRemoveUser(): UseMutationResult<void, Error, string>
```

- mutationFn: `removeUser(id)`
- onSuccess: `queryClient.invalidateQueries(['users'])`

---

## UserManagementContext — Updated Interface

File: `src/app/modules/user-management/UserManagementContext.tsx`

```ts
type UserManagementContextType = {
  currentUserId: string | null          // Supabase auth UID of logged-in user
  addUser:    (payload: Omit<User,'id'>, avatarFile?: File) => Promise<void>
  updateUser: (id: string, payload: Partial<Omit<User,'id'>>, avatarFile?: File) => Promise<void>
  deleteUser: (id: string) => Promise<void>
}
```

> `users` and loading/error state are consumed directly from `useUserList()` inside
> `UsersTable` and `UserModal` — not stored in context. Context only exposes mutations
> and the current user's ID.
