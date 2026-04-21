# Feature Specification: User Detail Drawer

**Feature Branch**: `005-user-detail-drawer`  
**Created**: 2026-04-21  
**Status**: Draft  
**Input**: User description: "Add a User Detail View to the User Management module. When a user clicks on any row in the users table, a side drawer opens showing that user's full profile: profile picture (or initials fallback), full name, email, role, status, and any connected social media accounts (LinkedIn, Instagram, X) with clickable links. The view is read-only. Any logged-in user should be able to view any other user's profile this way."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View another user's full profile from the table (Priority: P1)

A logged-in user is browsing the Users table and wants to learn more about a colleague. They click anywhere on that person's row and a panel slides in from the right side of the screen, showing the full profile: photo (or initials if no photo), name, email address, role, status, and any social media accounts the user has connected, each displayed as a clickable link opening in a new tab.

**Why this priority**: This is the entire feature — without it nothing else has value. All other stories are enhancements to this core flow.

**Independent Test**: Click any row in the Users table and confirm the detail panel opens with the correct person's data, including a working social media link if one exists. No editing should be possible.

**Acceptance Scenarios**:

1. **Given** a logged-in user is on the Users page, **When** they click on any row in the table, **Then** a side panel slides in from the right showing the selected user's profile picture (or initials), full name, email, role badge, status badge, and social media links for any connected accounts.
2. **Given** the detail panel is open, **When** the user clicks a social media link, **Then** the linked profile opens in a new browser tab without closing the panel.
3. **Given** the detail panel is open, **When** the user has not connected any social accounts, **Then** the social section shows a clear empty-state message rather than a broken or empty list.
4. **Given** the detail panel is open, **When** the user clicks the close button or presses Escape, **Then** the panel closes and the table is fully visible again.
5. **Given** the detail panel is open, **When** the logged-in user is the same person whose profile is being viewed, **Then** the panel still shows the profile correctly — no special self-view restrictions.

---

### User Story 2 - Switch between profiles without closing the drawer (Priority: P2)

A user has the detail panel open for one person and clicks a different row in the table. The panel updates in place to show the new person's profile without a full close/reopen cycle.

**Why this priority**: Reduces friction for users comparing or quickly reviewing multiple profiles. The table stays visible alongside the drawer, making row-switching a natural action.

**Independent Test**: Open the drawer for User A, then click User B's row. Confirm the panel updates to show User B's data without a visible close/open animation between them.

**Acceptance Scenarios**:

1. **Given** the detail panel is open for User A, **When** the user clicks User B's row in the table, **Then** the panel content updates to show User B's profile without fully closing and reopening.
2. **Given** the panel is updating to a new user, **When** the new profile data is loading, **Then** the panel shows a loading indicator rather than stale data from the previous user.

---

### User Story 3 - Highlighted row indicates which profile is currently shown (Priority: P3)

While the detail panel is open, the row corresponding to the currently displayed user is visually highlighted in the table so the viewer always knows which record they are looking at.

**Why this priority**: Quality-of-life improvement that prevents confusion when the table is long. Independently useful even if story 2 is not implemented.

**Independent Test**: Open the panel for any user and confirm their row in the table has a distinct visual highlight compared to other rows. Click a different row and confirm the highlight moves.

**Acceptance Scenarios**:

1. **Given** the detail panel is open, **When** the user looks at the table, **Then** the row for the currently displayed profile is visually distinct from all other rows.
2. **Given** the user clicks a different row, **When** the panel updates, **Then** the highlight moves to the newly selected row.

---

### Edge Cases

- What happens if the user's profile data fails to load after clicking a row — does the panel show an error state rather than staying empty?
- What happens on narrow screens where the drawer and the table cannot both be fully visible — does the drawer overlay the table on mobile?
- What if a user is deleted by an admin while another user has that person's detail panel open — does the panel gracefully handle the missing record?
- What if a social media URL stored in the profile is malformed — is the link hidden or shown as plain text?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Users MUST be able to open a side detail panel by clicking any row in the Users table.
- **FR-002**: The detail panel MUST display the selected user's profile picture; if no picture is set, it MUST display the user's initials as a fallback.
- **FR-003**: The detail panel MUST display the selected user's full name, email address, role, and status.
- **FR-004**: The detail panel MUST display a section for social media accounts; for each platform (LinkedIn, Instagram, X) where the user has provided a profile URL, it MUST show the platform name and a clickable link that opens in a new tab.
- **FR-005**: If a user has no connected social accounts, the social section MUST display a clear empty-state message.
- **FR-006**: The detail panel MUST be strictly read-only — no edit controls, form fields, or action buttons that modify data may appear inside it.
- **FR-007**: The detail panel MUST be closable via a visible close button and via the Escape key.
- **FR-008**: Any logged-in user MUST be able to view the detail panel for any other user — no role restriction on viewing.
- **FR-009**: While the detail panel is open, the row currently shown MUST be visually highlighted in the table.
- **FR-010**: Clicking a different row while the panel is open MUST update the panel content to the newly selected user without requiring the panel to be manually closed and reopened.
- **FR-011**: The panel MUST show a loading state while profile data is being fetched and an error state if the fetch fails.

### Key Entities

- **User Profile (read-only view)**: The data shown in the panel — id, full name, email, role, status, avatar image or initials, and a list of connected social platform links. This is a read projection of the existing User entity; no new data is stored.
- **Social Link**: A platform identifier (LinkedIn, Instagram, X) paired with a URL; displayed only when the URL is non-empty.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can open a colleague's full profile in under 2 seconds from clicking a table row — including all profile data and social links.
- **SC-002**: 100% of rows in the Users table are clickable and open the correct profile — verified across all users in the system.
- **SC-003**: The detail panel opens, displays complete data, and closes without any visible errors in all standard scenarios (user with avatar, user without avatar, user with social links, user with no social links).
- **SC-004**: Switching between profiles by clicking different rows requires zero manual close/reopen steps — the panel updates in place.
- **SC-005**: The currently viewed row is visually distinguishable from all other rows at all times while the panel is open.

## Assumptions

- All data required for the detail view (name, email, role, status, avatar URL, social links) is already stored in the existing user record — no new data fields or database changes are needed.
- Social media links are stored as full URLs; the feature displays them as-is. Malformed URLs are shown as plain text rather than hidden.
- The detail panel is a right-side overlay that sits alongside the table on desktop; on small screens it overlays the full table width.
- No new permission model is required — the existing authenticated-user session is sufficient to view any profile.
- The close-on-Escape behaviour applies only when the detail panel is the topmost open element; if an edit modal is open on top of the drawer, Escape closes the modal first.
- The feature does not include deep-linking to a specific user's profile via URL (e.g., `/users/123`) — navigation is in-page only.
