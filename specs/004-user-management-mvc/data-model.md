# Data Model: User Management MVC Refactor

**Branch**: `004-user-management-mvc` | **Date**: 2026-04-21

> This document describes the TypeScript types that will live in `model/User.ts` and the internal `DbRow` type that stays private to the repository. No schema changes are made to Supabase.

---

## Supabase Table: `users`

The table schema is unchanged. Documented here as the authoritative source for the repository's `DbRow` type.

| Column               | Supabase Type   | Nullable | Notes                                  |
|----------------------|-----------------|----------|----------------------------------------|
| `id`                 | `uuid`          | No       | Primary key, set client-side via `crypto.randomUUID()` |
| `full_name`          | `text`          | No       |                                        |
| `email`              | `text`          | No       | Unique                                 |
| `role`               | `text`          | No       | Enum: `Admin`, `Manager`, `User`       |
| `status`             | `text`          | No       | Enum: `Active`, `Inactive`             |
| `avatar_url`         | `text`          | Yes      | Public URL from Supabase Storage       |
| `linkedin_username`  | `text`          | Yes      |                                        |
| `linkedin_url`       | `text`          | Yes      |                                        |
| `instagram_username` | `text`          | Yes      |                                        |
| `instagram_url`      | `text`          | Yes      |                                        |
| `x_username`         | `text`          | Yes      |                                        |
| `x_url`              | `text`          | Yes      |                                        |
| `created_at`         | `timestamptz`   | No       | Set by Supabase default                |

---

## Domain Types — `model/User.ts`

These are the types visible to the service, controller, and components. They are identical to the current `_models.ts` content — this is a rename/move only.

```ts
// Discriminated union types
type Role = 'Admin' | 'Manager' | 'User'
type Status = 'Active' | 'Inactive'
type SocialPlatform = 'linkedin' | 'instagram' | 'x'

// Social link structure
type SocialLink = { username: string; url: string }
type SocialLinks = Record<SocialPlatform, SocialLink>

// Sentinel for empty social links
const EMPTY_SOCIAL_LINKS: SocialLinks = {
  linkedin: { username: '', url: '' },
  instagram: { username: '', url: '' },
  x: { username: '', url: '' },
}

// Core domain entity — the shape components and services work with
type User = {
  id: string
  fullName: string
  email: string
  role: Role
  status: Status
  avatarUrl?: string
  socialLinks: SocialLinks
}

// Form-layer type — includes file attachment, used by Formik
type UserFormValues = {
  fullName: string
  email: string
  role: Role
  status: Status
  avatarFile: File | null
  avatarUrl?: string
  socialLinks: SocialLinks
}
```

---

## Repository-Internal Type — `DbRow`

Private to `userRepository.ts`. Never exported. Maps the Supabase snake_case schema to camelCase domain types.

```ts
// Internal only — not exported from the repository
type DbRow = {
  id: string
  full_name: string
  email: string
  role: Role
  status: Status
  avatar_url: string | null
  linkedin_username: string | null
  linkedin_url: string | null
  instagram_username: string | null
  instagram_url: string | null
  x_username: string | null
  x_url: string | null
  created_at: string
}
```

---

## Layer Responsibility Map

| Layer | File | Types it exports | Types it imports |
|-------|------|-----------------|-----------------|
| Model | `model/User.ts` | `User`, `UserFormValues`, `Role`, `Status`, `SocialPlatform`, `SocialLink`, `SocialLinks`, `EMPTY_SOCIAL_LINKS` | — |
| Repository | `repository/userRepository.ts` | — (no type exports) | `User`, `SocialLinks` from model; `supabase` from lib |
| Service | `service/userService.ts` | — (no type exports) | `User`, `UserFormValues` from model; repository functions |
| Controller | `controller/useUserController.ts` | `UseUserControllerResult` (the hook return shape) | `User` from model; service functions |
| Components | `components/*.tsx` | — | `User`, `UserFormValues` from model; controller hook |

---

## State Transitions

**User Status**
```
Active ↔ Inactive   (toggled via edit form, no automatic transitions)
```

**Avatar**
```
No avatar → Uploaded (create/edit with file selected)
Existing avatar → Replaced (edit with new file selected; old file overwritten via upsert)
```

**Validation Rules (service layer)**

| Rule | Detail |
|------|--------|
| Avatar file type | Must be `image/jpeg`, `image/png`, or `image/webp` — throws `INVALID_FILE_TYPE` |
| Avatar file size | Must be ≤ 5 MB (5 × 1024 × 1024 bytes) — throws `FILE_TOO_LARGE` |
| Storage path | `{userId}.{ext}` — deterministic, upserted on update |
| ID generation | `crypto.randomUUID()` in service at create time |
