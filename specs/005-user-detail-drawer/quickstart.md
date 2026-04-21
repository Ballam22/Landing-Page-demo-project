# Quickstart: User Detail Drawer

**Branch**: `005-user-detail-drawer` | **Date**: 2026-04-21

## What this feature adds

A right-side slide-in panel on the User Management page. Clicking any row opens the panel showing that user's full profile (avatar, name, email, role, status, social links). No editing. No new Supabase calls. Purely presentational.

---

## Files touched

| File | Change type |
|------|-------------|
| `src/app/modules/user-management/controller/useUserDetailDrawer.ts` | **New** — hook owning drawer open/close state |
| `src/app/modules/user-management/components/UserDetailDrawer.tsx` | **New** — drawer UI component |
| `src/app/modules/user-management/UserManagementPage.tsx` | **Updated** — wire hook + render drawer |
| `src/app/modules/user-management/components/UsersTable.tsx` | **Updated** — row click + active row highlight |
| `src/_metronic/i18n/messages/en.json` | **Updated** — new USER_DETAIL.* keys |
| `src/_metronic/i18n/messages/de.ts` | **Updated** — new USER_DETAIL.* keys |

---

## How it works

### 1. `useUserDetailDrawer` hook

```ts
// controller/useUserDetailDrawer.ts
import {useState, useEffect} from 'react'
import {User} from '../model/User'

export function useUserDetailDrawer() {
  const [selectedDetailUser, setSelectedDetailUser] = useState<User | null>(null)
  const isOpen = selectedDetailUser !== null

  // Escape key closes the drawer (unless a modal is open on top)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !document.body.classList.contains('modal-open')) {
        setSelectedDetailUser(null)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen])

  return {
    selectedDetailUser,
    isOpen,
    openDrawer: (user: User) => setSelectedDetailUser(user),
    closeDrawer: () => setSelectedDetailUser(null),
  }
}
```

### 2. `UserDetailDrawer` component

```tsx
// components/UserDetailDrawer.tsx
// Props: { user: User | null, isOpen: boolean, onClose: () => void }
// Structure:
//   <div ref={drawerRef} className={`bg-body ${isOpen ? 'drawer-on' : ''}`} style={drawerStyle}>
//     header: title + close button (KTIcon 'cross')
//     body:
//       avatar circle (img or initials)
//       name (fw-bold fs-3)
//       email (text-muted)
//       RoleBadge + status badge
//       separator
//       social links section (platform icon + link or empty state)
//   </div>
//   {isOpen && <div className="drawer-overlay" onClick={onClose} />}
```

### 3. Drawer CSS (inline style on the drawer div)

```ts
const drawerStyle: CSSProperties = {
  position: 'fixed',
  top: 0,
  right: 0,
  height: '100vh',
  width: 'min(400px, 100vw)',
  zIndex: 110,
  transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
  transition: 'transform 0.3s ease',
  overflowY: 'auto',
}
```

### 4. Wiring in `UserManagementPage.tsx`

```tsx
const {selectedDetailUser, isOpen, openDrawer, closeDrawer} = useUserDetailDrawer()

// Pass to UsersTable:
<UsersTable
  currentUserId={currentUserId}
  selectedDetailUserId={selectedDetailUser?.id ?? null}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onViewDetails={openDrawer}
/>

// Render drawer (always mounted):
<UserDetailDrawer user={selectedDetailUser} isOpen={isOpen} onClose={closeDrawer} />
```

### 5. Row click in `UsersTable.tsx`

```tsx
// Add to row <tr>:
onClick={() => onViewDetails(row.original)}
style={{cursor: 'pointer'}}
className={row.original.id === selectedDetailUserId ? 'table-active' : ''}
```

---

## i18n keys to add

**`en.json`** (add under existing USER_MANAGEMENT keys):
```json
"USER_DETAIL.TITLE": "User Profile",
"USER_DETAIL.CLOSE": "Close",
"USER_DETAIL.NO_SOCIAL_ACCOUNTS": "No social accounts connected",
"USER_DETAIL.SOCIAL_LINKEDIN": "LinkedIn",
"USER_DETAIL.SOCIAL_INSTAGRAM": "Instagram",
"USER_DETAIL.SOCIAL_X": "X"
```

**`de.ts`** (add matching keys):
```ts
'USER_DETAIL.TITLE': 'Benutzerprofil',
'USER_DETAIL.CLOSE': 'Schließen',
'USER_DETAIL.NO_SOCIAL_ACCOUNTS': 'Keine sozialen Konten verbunden',
'USER_DETAIL.SOCIAL_LINKEDIN': 'LinkedIn',
'USER_DETAIL.SOCIAL_INSTAGRAM': 'Instagram',
'USER_DETAIL.SOCIAL_X': 'X',
```

---

## Verification checklist (manual, post-implementation)

- [ ] `npx tsc --noEmit` — zero errors
- [ ] `npm run lint` — zero warnings
- [ ] Click a user row → drawer slides in from right with correct profile data
- [ ] User with no avatar → initials shown in coloured circle
- [ ] User with avatar → photo shown correctly
- [ ] User with social links → each shows as a clickable link (opens new tab)
- [ ] User with no social links → "No social accounts connected" message shown
- [ ] Click close button → drawer slides out
- [ ] Press Escape → drawer slides out
- [ ] Click a different row while drawer is open → content updates without close/reopen
- [ ] Active row highlighted while drawer is open; highlight moves on row switch
- [ ] Open edit modal while drawer is open → Escape closes modal, not drawer
- [ ] On narrow screen → drawer overlays table at full width
