# Data Model: User Management Module (002)

**Phase**: 1 — Design  
**Date**: 2026-04-14  
**Branch**: `002-user-management`

---

## Entities

### User

Represents a system account managed through the User Management UI.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | `string` | Yes | UUID, generated on creation |
| `fullName` | `string` | Yes | Display name — non-empty |
| `email` | `string` | Yes | Must be unique, valid email format |
| `role` | `'Admin' \| 'Manager' \| 'User'` | Yes | Drives role badge color |
| `status` | `'Active' \| 'Inactive'` | Yes | Controls status display |
| `avatarUrl` | `string \| undefined` | No | Base64 data URL from FileReader; undefined if no picture uploaded |

#### Validation Rules

- `fullName`: non-empty string
- `email`: valid email format (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`); unique across all users
- `role`: one of the three enum values exactly
- `status`: one of the two enum values exactly
- `avatarUrl`: optional; if present must be a `data:image/*` URL

#### State Transitions

```
User record
├── Created  (Add User form submitted)
├── Updated  (Edit User form submitted)
└── Deleted  (Delete confirmation confirmed)
```

No soft-delete; deletion is permanent within the session.

---

### UserFormValues

Represents the shape of data inside the Add/Edit modal form (Formik's `values` object).

| Field | Type | Notes |
|-------|------|-------|
| `fullName` | `string` | Bound to text input |
| `email` | `string` | Bound to email input |
| `role` | `'Admin' \| 'Manager' \| 'User'` | Bound to select dropdown |
| `status` | `'Active' \| 'Inactive'` | Bound to select dropdown |
| `avatarFile` | `File \| null` | The raw file object from the file input; `null` if not changed |
| `avatarUrl` | `string \| undefined` | Current preview URL — carries existing avatar in edit mode |

---

## Mock Data Structure

Initial seed data is defined in `_mockData.ts` as a plain array of `User` objects. The array is copied into React state on mount; changes persist in-memory for the session.

### Example seed record

```ts
{
  id: '1',
  fullName: 'Alice Johnson',
  email: 'alice@example.com',
  role: 'Admin',
  status: 'Active',
  avatarUrl: undefined,
}
```

Seed data must include at least one user of each role (Admin, Manager, User) to demonstrate all badge colors on first load.

---

## Context Shape

`UserManagementContext` exposes the following interface to all child components:

| Member | Type | Description |
|--------|------|-------------|
| `users` | `User[]` | Current list of all users |
| `addUser` | `(data: Omit<User, 'id'>) => void` | Appends a new user with a generated id |
| `updateUser` | `(id: string, data: Partial<User>) => void` | Replaces matching user fields |
| `deleteUser` | `(id: string) => void` | Removes user by id |

---

## Role Badge Mapping

| Role | Badge Class | Hex (approximate) |
|------|-------------|-------------------|
| Admin | `badge badge-light-danger` | Red / `var(--bs-danger)` |
| Manager | `badge badge-light-warning` | Amber / `var(--bs-warning)` |
| User | `badge badge-light-primary` | Blue / `var(--bs-primary)` |

Colors are CSS-variable-driven; dark mode and RTL are inherited automatically.

---

## i18n Keys

All new keys are added to `src/_metronic/i18n/messages/en.json` under the `USER_MANAGEMENT` namespace.

| Key | Default (English) |
|-----|-------------------|
| `USER_MANAGEMENT.TITLE` | `User Management` |
| `USER_MANAGEMENT.ADD_USER` | `Add User` |
| `USER_MANAGEMENT.EDIT_USER` | `Edit User` |
| `USER_MANAGEMENT.DELETE_USER` | `Delete User` |
| `USER_MANAGEMENT.DELETE_CONFIRM` | `Are you sure you want to delete {name}? This action cannot be undone.` |
| `USER_MANAGEMENT.CONFIRM` | `Confirm` |
| `USER_MANAGEMENT.CANCEL` | `Cancel` |
| `USER_MANAGEMENT.SAVE` | `Save` |
| `USER_MANAGEMENT.EMPTY_STATE` | `No users found` |
| `USER_MANAGEMENT.COL_AVATAR` | `Avatar` |
| `USER_MANAGEMENT.COL_FULL_NAME` | `Full Name` |
| `USER_MANAGEMENT.COL_EMAIL` | `Email` |
| `USER_MANAGEMENT.COL_ROLE` | `Role` |
| `USER_MANAGEMENT.COL_STATUS` | `Status` |
| `USER_MANAGEMENT.COL_ACTIONS` | `Actions` |
| `USER_MANAGEMENT.FIELD_FULL_NAME` | `Full Name` |
| `USER_MANAGEMENT.FIELD_EMAIL` | `Email` |
| `USER_MANAGEMENT.FIELD_ROLE` | `Role` |
| `USER_MANAGEMENT.FIELD_STATUS` | `Status` |
| `USER_MANAGEMENT.FIELD_AVATAR` | `Profile Picture` |
| `USER_MANAGEMENT.STATUS_ACTIVE` | `Active` |
| `USER_MANAGEMENT.STATUS_INACTIVE` | `Inactive` |
| `USER_MANAGEMENT.VALIDATION_NAME_REQUIRED` | `Full name is required` |
| `USER_MANAGEMENT.VALIDATION_EMAIL_REQUIRED` | `Email is required` |
| `USER_MANAGEMENT.VALIDATION_EMAIL_INVALID` | `Please enter a valid email address` |
| `USER_MANAGEMENT.VALIDATION_EMAIL_DUPLICATE` | `This email address is already in use` |
| `USER_MANAGEMENT.VALIDATION_ROLE_REQUIRED` | `Role is required` |
| `USER_MANAGEMENT.VALIDATION_STATUS_REQUIRED` | `Status is required` |
| `USER_MANAGEMENT.UPLOAD_HINT` | `JPEG, PNG, GIF or WebP accepted` |
