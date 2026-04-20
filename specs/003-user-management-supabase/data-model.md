# Data Model: User Management Module

## Entity: User

**Table**: `public.users`
**Source of truth**: Supabase (PostgreSQL)

| Column      | Type        | Constraints                                  | Description                        |
|-------------|-------------|----------------------------------------------|------------------------------------|
| id          | uuid        | PRIMARY KEY, DEFAULT gen_random_uuid()       | Unique identifier; maps to auth UID|
| full_name   | text        | NOT NULL                                     | Display name                       |
| email       | text        | UNIQUE, NOT NULL                             | Login / contact address            |
| role        | text        | NOT NULL, DEFAULT 'User', CHECK enum         | Access tier: Admin, Manager, User  |
| status      | text        | NOT NULL, DEFAULT 'Active', CHECK enum       | Account state: Active, Inactive    |
| avatar_url  | text        | NULLABLE                                     | Public URL from Supabase Storage   |
| created_at  | timestamptz | NOT NULL, DEFAULT now()                      | Record creation timestamp          |

**Role enum values**: `'Admin'`, `'Manager'`, `'User'`
**Status enum values**: `'Active'`, `'Inactive'`

### SQL Migration

```sql
CREATE TABLE IF NOT EXISTS public.users (
  id          uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name   text         NOT NULL,
  email       text         UNIQUE NOT NULL,
  role        text         NOT NULL DEFAULT 'User'
                CHECK (role IN ('Admin', 'Manager', 'User')),
  status      text         NOT NULL DEFAULT 'Active'
                CHECK (status IN ('Active', 'Inactive')),
  avatar_url  text,
  created_at  timestamptz  NOT NULL DEFAULT now()
);
```

---

## TypeScript Types (existing — no change required)

File: `src/app/modules/user-management/_models.ts`

```ts
export type Role   = 'Admin' | 'Manager' | 'User'
export type Status = 'Active' | 'Inactive'

export type User = {
  id:         string
  fullName:   string
  email:      string
  role:       Role
  status:     Status
  avatarUrl?: string
}

export type UserFormValues = {
  fullName:   string
  email:      string
  role:       Role
  status:     Status
  avatarFile: File | null
  avatarUrl?: string
}
```

> **Note**: Column name mapping — `full_name` (DB) ↔ `fullName` (TS), `avatar_url` (DB) ↔
> `avatarUrl` (TS). Transform happens in `_requests.ts`.

---

## Supabase Storage: Avatars Bucket

**Bucket name**: `avatars`
**Visibility**: Public
**File path convention**: `{userId}.{ext}` (e.g., `abc123.jpg`)
**Upload mode**: Upsert (overwrites on edit — same path reused)
**Accepted types**: image/jpeg, image/png, image/webp
**Max size**: 5 MB (enforced client-side before upload)

### URL pattern

```
https://<project>.supabase.co/storage/v1/object/public/avatars/{userId}.{ext}
```

Retrieved via: `supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl`

---

## State Transitions

### User Status

```
Active ──── deactivate ──→ Inactive
Inactive ── reactivate ──→ Active
```

Changed via the Edit modal's Status dropdown. No automated transitions.

### User Role

```
User ──→ Manager ──→ Admin
 ↑__________↑__________↓
```

Any role can be set to any other role via the Edit modal. No role escalation restrictions
enforced at the UI level for this phase.

---

## Validation Rules

| Field     | Rule                                                         |
|-----------|--------------------------------------------------------------|
| full_name | Required, non-empty string                                   |
| email     | Required, valid email format, unique across all users        |
| role      | Required, must be one of: Admin, Manager, User               |
| status    | Required, must be one of: Active, Inactive                   |
| avatar    | Optional; if provided: JPEG/PNG/WebP, max 5 MB               |

Email uniqueness on edit: the current user's own email is excluded from the duplicate check.
