# Tasks: User Detail Drawer

**Input**: Design documents from `/specs/005-user-detail-drawer/`  
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | quickstart.md ✅

**Tests**: Not requested — manual browser verification per project constitution.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add the i18n keys that all three stories depend on. Without these, any component using `intl.formatMessage` will throw at runtime.

- [x] T001 [P] Add `USER_DETAIL.*` keys to `src/_metronic/i18n/messages/en.json` — add keys: `USER_DETAIL.TITLE`, `USER_DETAIL.CLOSE`, `USER_DETAIL.NO_SOCIAL_ACCOUNTS`, `USER_DETAIL.SOCIAL_LINKEDIN`, `USER_DETAIL.SOCIAL_INSTAGRAM`, `USER_DETAIL.SOCIAL_X`
- [x] T002 [P] Add matching `USER_DETAIL.*` keys to `src/_metronic/i18n/messages/de.ts` — German translations: `USER_DETAIL.TITLE: 'Benutzerprofil'`, `USER_DETAIL.CLOSE: 'Schließen'`, `USER_DETAIL.NO_SOCIAL_ACCOUNTS: 'Keine sozialen Konten verbunden'`, and the three platform labels

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The `useUserDetailDrawer` hook is imported by `UserManagementPage.tsx` and must exist before the page and table wiring can be written. The drawer component is imported by the page and must exist before page wiring.

**⚠️ CRITICAL**: T003 and T004 must complete before any US1 page/table changes can be applied.

- [x] T003 Create `src/app/modules/user-management/controller/useUserDetailDrawer.ts` — export `useUserDetailDrawer()` returning `{ selectedDetailUser: User | null, isOpen: boolean, openDrawer: (user: User) => void, closeDrawer: () => void }`; manage state with `useState<User | null>(null)`; derive `isOpen = selectedDetailUser !== null`; attach a `keydown` listener in `useEffect` that calls `closeDrawer()` when `key === 'Escape'` AND `isOpen` AND `!document.body.classList.contains('modal-open')`; import `User` from `../model/User`
- [x] T004 Create `src/app/modules/user-management/components/UserDetailDrawer.tsx` — accepts props `{ user: User | null, isOpen: boolean, onClose: () => void }`; renders a fixed-position right-side panel using inline style `{ position: 'fixed', top: 0, right: 0, height: '100vh', width: 'min(400px, 100vw)', zIndex: 110, transform: isOpen ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.3s ease', overflowY: 'auto' }` and `className='bg-body'`; when `isOpen` also renders a backdrop `<div className='drawer-overlay' onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 109, background: 'rgba(0,0,0,0.4)' }} />`; header contains `intl.formatMessage({id: 'USER_DETAIL.TITLE'})` and a close button using `<KTIcon iconName='cross' className='fs-2' />` with `onClick={onClose}` and `aria-label={intl.formatMessage({id: 'USER_DETAIL.CLOSE'})}`; when `user` is null renders nothing inside the panel; body section displays: avatar circle (60px symbol, shows `<img>` if `user.avatarUrl` else initials derived from `user.fullName`), full name (`fs-3 fw-bold`), email (`text-muted`), `<RoleBadge role={user.role} />`, status badge (`badge-light-success` for Active, `badge-light-secondary` for Inactive), a `separator separator-dashed`, and a social links section — for each platform (linkedin, instagram, x) show a row with platform label and `<a href={url} target='_blank' rel='noopener noreferrer'>` only when `url` is non-empty; if all three URLs are empty show `intl.formatMessage({id: 'USER_DETAIL.NO_SOCIAL_ACCOUNTS'})` in `text-muted`; import `User` from `../model/User`, `RoleBadge` from `./RoleBadge`, `KTIcon` from `../../../_metronic/helpers`, `useIntl` from `react-intl`

**Checkpoint**: Both new files exist and compile with zero TypeScript errors. The drawer component can be rendered standalone and shows a placeholder panel.

---

## Phase 3: User Story 1 — View another user's full profile from the table (Priority: P1) 🎯 MVP

**Goal**: Clicking a row in the Users table opens the detail drawer showing the correct user's profile with all data fields visible and social links clickable.

**Independent Test**: Click any row in the Users table; verify the drawer slides in from the right with the correct user's photo/initials, name, email, role badge, status badge, and social links (or empty-state message). Click the close button; verify the drawer closes.

### Implementation for User Story 1

- [x] T005 [US1] Update `src/app/modules/user-management/components/UsersTable.tsx` — add two new props to the `Props` type: `selectedDetailUserId: string | null` and `onViewDetails: (user: User) => void`; in the row `<tr>`, add `onClick={() => onViewDetails(row.original)}`, `style={{ cursor: 'pointer' }}`, and do NOT interfere with existing Edit/Delete button clicks (those buttons should call `e.stopPropagation()` to prevent row-level click from firing); the `className` on the `<tr>` should conditionally add `'table-active'` when `row.original.id === selectedDetailUserId` (US3 highlight — implement now since it costs one line and the prop is already being added)
- [x] T006 [US1] Update `src/app/modules/user-management/UserManagementPage.tsx` — import `useUserDetailDrawer` from `./controller/useUserDetailDrawer`; import `UserDetailDrawer` from `./components/UserDetailDrawer`; call `useUserDetailDrawer()` and destructure `{ selectedDetailUser, isOpen, openDrawer, closeDrawer }`; pass `selectedDetailUserId={selectedDetailUser?.id ?? null}` and `onViewDetails={openDrawer}` to `<UsersTable>`; render `<UserDetailDrawer user={selectedDetailUser} isOpen={isOpen} onClose={closeDrawer} />` after `<DeleteConfirmDialog>` (always mounted, never conditionally rendered) — depends on T003, T004, T005

**Checkpoint**: Full row-click → drawer open → show profile → close drawer flow works in the browser. US1 is independently testable and complete.

---

## Phase 4: User Story 2 — Switch between profiles without closing the drawer (Priority: P2)

**Goal**: With the drawer open, clicking a different row updates the drawer content in place — no visible close/reopen animation, content switches immediately.

**Independent Test**: Open drawer for User A → click User B's row → confirm drawer stays open and content updates to User B without a close/reopen flash.

### Implementation for User Story 2

- [x] T007 [US2] Verify `src/app/modules/user-management/controller/useUserDetailDrawer.ts` — `openDrawer(user)` simply calls `setSelectedDetailUser(user)`; because the drawer is always mounted and `isOpen` stays `true` when switching from one non-null user to another, the content update is already in-place with no extra code; confirm this works by reading the hook — if `openDrawer` only sets state and the drawer is never unmounted between calls, US2 is satisfied by the existing T003 implementation; if any issue is found, fix it in this task
- [x] T008 [US2] Update `src/app/modules/user-management/components/UserDetailDrawer.tsx` — ensure that when `user` prop changes while `isOpen` remains `true`, the panel body re-renders with the new user's data without any closing/opening transition; verify there is no `useEffect` that resets or animates based on `user` identity changes; the `transform` CSS only changes when `isOpen` changes (boolean), not when `user` changes — confirm this separation is clean in the component

**Checkpoint**: Click User A row, then User B row — drawer stays open and content switches. Zero close/reopen animation between switches.

---

## Phase 5: User Story 3 — Highlighted row indicates which profile is currently shown (Priority: P3)

**Goal**: The row for the currently displayed user is visually distinct from all other rows at all times while the drawer is open.

**Independent Test**: Open drawer for any user — that user's row has a distinct background via `table-active` class. Click a different row — highlight moves to the new row instantly.

### Implementation for User Story 3

- [x] T009 [US3] Verify `src/app/modules/user-management/components/UsersTable.tsx` — the `table-active` class conditional added in T005 already implements US3; open the file and confirm the `<tr>` has `className={row.original.id === selectedDetailUserId ? 'table-active' : ''}` (or merged with any existing className); if the Edit/Delete button click handlers lack `e.stopPropagation()`, add it now so clicking those buttons does not also trigger `onViewDetails`

**Checkpoint**: Row highlight follows selection; Edit and Delete buttons still work without accidentally opening the drawer.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Type safety, lint, and final manual verification.

- [x] T010 [P] Run `npx tsc --noEmit` from the repo root — fix every type error before marking complete; common issues to watch: `Props` type on `UsersTable` missing new fields, `UserDetailDrawer` props mismatch, missing imports
- [x] T011 [P] Run `npm run lint` from the repo root — fix every ESLint warning until `--max-warnings 0` passes; watch for unused imports in `UserManagementPage.tsx` and `UserDetailDrawer.tsx`
- [x] T012 Run manual verification checklist from `specs/005-user-detail-drawer/quickstart.md` — all 12 checklist items must pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — T001 and T002 can run in parallel immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — T003 and T004 can run in parallel with each other
- **US1 (Phase 3)**: Depends on Phase 2 — T005 before T006 (table props must exist before page wires them)
- **US2 (Phase 4)**: Depends on US1 — drawer must be open and working before in-place switching can be tested
- **US3 (Phase 5)**: Mostly done in T005; T009 is just a verification step
- **Polish (Phase 6)**: Depends on all story phases complete

### User Story Dependencies

- **US1 (P1)**: Depends on Phase 2 — all foundational files must exist
- **US2 (P2)**: Functionally satisfied by T003's `openDrawer` implementation; T007–T008 verify and confirm
- **US3 (P3)**: Satisfied by the one-liner in T005; T009 verifies and adds button stopPropagation

### Within US1

- T005 before T006 (table props must exist before page imports and passes them)
- T003 and T004 before T006 (page imports both)

---

## Parallel Opportunities

```
Phase 1 (can run simultaneously):
  T001: Add i18n keys to en.json
  T002: Add i18n keys to de.ts

Phase 2 (can run simultaneously after Phase 1):
  T003: Create useUserDetailDrawer.ts hook
  T004: Create UserDetailDrawer.tsx component

Phase 6 (can run simultaneously after all stories):
  T010: TypeScript check
  T011: Lint check
```

---

## Implementation Strategy

### MVP First (User Story 1 Only — T001–T006)

1. T001 + T002: i18n keys (parallel)
2. T003 + T004: Hook and component (parallel)
3. T005: Update UsersTable props + row click + highlight
4. T006: Wire page with hook and drawer
5. **STOP and VALIDATE**: Full drawer open/close flow in browser

### Incremental Delivery

1. T001–T004 → Foundation ready (hook + component compile)
2. T005–T006 → US1 complete: drawer opens on row click (**MVP shippable**)
3. T007–T008 → US2 complete: in-place profile switching verified
4. T009 → US3 complete: row highlight verified
5. T010–T012 → Polish: types + lint + manual QA

---

## Notes

- Edit and Delete buttons in `UsersTable` must call `e.stopPropagation()` on their `onClick` handlers to prevent the row-level `onViewDetails` from firing when the user clicks those buttons
- The drawer is always mounted (never conditionally rendered) to preserve the CSS slide-in animation on every open
- `isOpen` is derived from `selectedDetailUser !== null` — do not maintain a separate boolean state
- US2 and US3 are largely free once US1 is implemented — they validate behaviour that the US1 implementation already provides
- The backdrop `div` uses `zIndex: 109`; the drawer panel uses `zIndex: 110` — these sit above Bootstrap modals (`z-index: 1050`) only if needed, or below — check if the edit modal appears above the drawer when both are open and adjust if necessary
