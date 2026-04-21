# Research: User Detail Drawer

**Branch**: `005-user-detail-drawer` | **Date**: 2026-04-21

## Scope

This is a net-new UI component with no new backend work. Research focuses on three implementation questions about the Metronic drawer pattern, programmatic open/close in React, and row highlight state.

---

## Decision 1: Drawer implementation strategy — KTDrawer plugin vs React-controlled CSS

**Context**: Metronic provides a `KTDrawer` JavaScript plugin (initialised via `data-kt-drawer="true"` attributes) used by `DrawerMessenger`. The plugin handles show/hide by toggling a `drawer-on` CSS class. In React, initialisation timing and imperative DOM control can conflict with React's rendering model.

**Decision**: Use a **React-controlled drawer** without relying on the KTDrawer plugin for show/hide. Concretely:

- The drawer `div` is always rendered in the DOM (no conditional unmounting, which would lose scroll state and cause flash-of-no-content on reopen).
- Visibility is controlled by adding/removing the Metronic `drawer-on` class via a React state boolean (`isOpen`), using `useEffect` to apply the class to the drawer element ref.
- A semi-transparent backdrop overlay is rendered conditionally when `isOpen` is true, matching `DrawerMessenger`'s `data-kt-drawer-overlay='true'` behaviour.
- Width: `400px` on desktop; `100vw` on mobile — set via `data-kt-drawer-width` equivalent inline or SCSS override.

**Rationale**: Avoids race conditions between KTDrawer's MutationObserver-based init and React's mount lifecycle. The visual result is identical — same CSS classes, same animation — but state is owned by React. `DrawerMessenger` is the only other drawer in the app and it works because it is toggled by a persistent navbar button, not by programmatic React state.

**Alternatives considered**:
- `KTDrawer.getInstance(el)?.show()` in `useEffect` → rejected: requires timing guarantees on plugin init that are fragile during HMR and test.
- Conditional rendering (`isOpen && <UserDetailDrawer />`) → rejected: causes flicker and loses the CSS slide-in transition on the first open.

---

## Decision 2: Where does drawer state live?

**Context**: The selected user state needs to be shared between `UsersTable` (which sets it) and `UserDetailDrawer` (which reads it). Options: lift to `UserManagementPage`, put in `UserManagementContext`, or create a dedicated hook.

**Decision**: Lift to `UserManagementPage.tsx` as `selectedDetailUser: User | null` local state, managed via a `useUserDetailDrawer` hook that returns `{selectedDetailUser, openDrawer, closeDrawer}`.

- `openDrawer(user: User)` → sets `selectedDetailUser = user`
- `closeDrawer()` → sets `selectedDetailUser = null`
- `isOpen` is derived: `selectedDetailUser !== null`

**Rationale**: The drawer state is page-scoped — it only matters on the User Management page, not across the whole app. A dedicated hook keeps `UserManagementPage.tsx` readable. Using the existing `UserManagementContext` would couple a transient UI state (which row is "selected for viewing") to the persistent data context, which is an inappropriate concern boundary.

**Alternatives considered**:
- Store in `UserManagementContext` → rejected: UI navigation state doesn't belong in a data context.
- Global state (Zustand, Redux) → rejected: overkill for page-local state; no other part of the app needs it.

---

## Decision 3: Row highlight implementation

**Context**: FR-009 requires the active row to be visually distinct from others while the drawer is open. `UsersTable` uses `react-table` v7; row rendering is inside a `rows.map()` loop.

**Decision**: Pass `selectedDetailUserId: string | null` as a prop to `UsersTable`. Inside the row render, conditionally add a `table-active` class (Bootstrap/Metronic utility) to the `<tr>` element when `row.original.id === selectedDetailUserId`.

**Rationale**: `table-active` is the Bootstrap standard for highlighted table rows and is already in the project's Bootstrap 5 dependency. No custom SCSS needed. The prop flows cleanly from `UserManagementPage` → `UsersTable` without any context changes.

**Alternatives considered**:
- CSS `:focus` or `:hover` only → rejected: these are transient states; the highlight must persist while the drawer is open.
- Custom SCSS class → rejected: `table-active` is already the right semantic class; adding a custom class would duplicate it.

---

## Decision 4: Escape key handling

**Context**: FR-007 requires the drawer to close on Escape key. The spec also notes (in Assumptions) that if an edit modal is open on top, Escape should close the modal first, not the drawer.

**Decision**: Attach a `keydown` event listener inside `useUserDetailDrawer` that calls `closeDrawer()` only when `isOpen` is true. The existing edit/delete modals use `modal-open` on `document.body` — check for that class before closing the drawer, so the modal's own Escape handler takes priority.

**Rationale**: Simple, zero-dependency solution. Does not require a focus-trap library.

---

## Summary: No NEEDS CLARIFICATION items

All implementation decisions are resolved. No new dependencies, no schema changes. Implementation can proceed to Phase 1.
