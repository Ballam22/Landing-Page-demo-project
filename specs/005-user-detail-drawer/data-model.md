# Data Model: User Detail Drawer

**Branch**: `005-user-detail-drawer` | **Date**: 2026-04-21

> This feature introduces no new data entities and no Supabase schema changes. It is a read-only projection of the existing `User` type.

---

## Existing Entity Used: `User` (from `model/User.ts`)

All fields required by the drawer already exist in the `User` type. No extensions needed.

| Field | Type | Used in drawer |
|-------|------|----------------|
| `id` | `string` | Row highlight comparison |
| `fullName` | `string` | Header name display |
| `email` | `string` | Profile email line |
| `role` | `Role` | Role badge |
| `status` | `Status` | Status badge |
| `avatarUrl` | `string \| undefined` | Avatar image; fallback to initials if absent |
| `socialLinks.linkedin` | `SocialLink` | LinkedIn link (shown only if `url` is non-empty) |
| `socialLinks.instagram` | `SocialLink` | Instagram link (shown only if `url` is non-empty) |
| `socialLinks.x` | `SocialLink` | X link (shown only if `url` is non-empty) |

---

## New Derived Type: `UseUserDetailDrawerResult`

The `useUserDetailDrawer` hook return shape — not persisted, pure UI state.

```ts
type UseUserDetailDrawerResult = {
  selectedDetailUser: User | null   // null = drawer closed
  isOpen: boolean                   // derived: selectedDetailUser !== null
  openDrawer: (user: User) => void  // called on row click
  closeDrawer: () => void           // called on close button / Escape
}
```

---

## Component Props

### `UserDetailDrawer`

```ts
type UserDetailDrawerProps = {
  user: User | null      // null renders nothing visible (drawer stays mounted but invisible)
  isOpen: boolean
  onClose: () => void
}
```

### `UsersTable` (updated)

Added props:
```ts
selectedDetailUserId: string | null   // for row highlight
onViewDetails: (user: User) => void   // called on row click
```

---

## Social Link Display Rules

| Condition | Display |
|-----------|---------|
| `url` is non-empty | Platform icon + platform name as `<a href={url} target="_blank" rel="noopener noreferrer">` |
| `url` is empty | Platform row is hidden (not shown at all) |
| All three platforms have empty URLs | Show `USER_DETAIL.NO_SOCIAL_ACCOUNTS` message |

---

## State Transitions

```
Drawer closed (selectedDetailUser = null)
  │
  │ user clicks row
  ▼
Drawer open (selectedDetailUser = User)
  │                          │
  │ user clicks another row  │ user clicks close / presses Escape
  ▼                          ▼
Drawer open (selectedDetailUser = different User)    Drawer closed
```

---

## i18n Key Map

| Key | Usage |
|-----|-------|
| `USER_DETAIL.TITLE` | Drawer header title |
| `USER_DETAIL.CLOSE` | Close button aria-label |
| `USER_DETAIL.NO_SOCIAL_ACCOUNTS` | Empty state when no social links |
| `USER_DETAIL.SOCIAL_LINKEDIN` | LinkedIn platform label |
| `USER_DETAIL.SOCIAL_INSTAGRAM` | Instagram platform label |
| `USER_DETAIL.SOCIAL_X` | X platform label |
| `USER_DETAIL.LOADING` | Loading state text (if needed) |
| `USER_DETAIL.ERROR` | Error state text (if needed) |
