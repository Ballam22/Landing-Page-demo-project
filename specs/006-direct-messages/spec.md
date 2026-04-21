# Feature Specification: Direct Messages

**Feature Branch**: `006-direct-messages`  
**Created**: 2026-04-21  
**Status**: Draft  
**Input**: User description: "Add a Messages module to the app. Logged-in users can send direct messages to any other active user. The main messages page shows a two-panel layout: a left sidebar listing all conversations (with the other user's name, avatar/initials, last message preview, and unread count badge), and a right panel showing the full message thread with the selected conversation. Users can type and send a new message from the thread panel. Clicking a conversation marks it as read."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — View and navigate conversations (Priority: P1)

A logged-in user opens the Messages page and sees a list of all their conversations in a left sidebar. Each entry shows the other person's name, their avatar (or initials if no photo), the most recent message as a truncated preview, and an unread count badge. Clicking an entry opens the full thread in the right panel.

**Why this priority**: This is the foundational read experience. Without it there is nothing to interact with.

**Independent Test**: Navigate to `/messages`; verify the sidebar lists all conversations with correct names, avatars/initials, last-message previews, and unread badges. Click one; verify the right panel shows the full history in chronological order.

**Acceptance Scenarios**:

1. **Given** the user has existing conversations, **When** they open the Messages page, **Then** the sidebar lists every conversation sorted by most-recent message first.
2. **Given** a conversation has unread messages, **When** the sidebar renders, **Then** a numeric unread count badge is visible on that entry.
3. **Given** the user has no conversations, **When** they open the Messages page, **Then** the sidebar shows an empty-state message prompting them to start a new conversation.
4. **Given** the user clicks a conversation entry, **When** the thread panel loads, **Then** all messages appear in chronological order with sender avatar/initials and timestamp.

---

### User Story 2 — Send a message (Priority: P1)

From an open thread, the user types a message in the input field at the bottom of the right panel and submits it. The message appears immediately at the end of the thread and the conversation moves to the top of the sidebar.

**Why this priority**: Sending is the core action of a messaging feature. Without it the module is read-only.

**Independent Test**: Open any conversation, type a message, press Send; verify the message appears in the thread, the input clears, and the conversation surfaces to the top of the sidebar.

**Acceptance Scenarios**:

1. **Given** a conversation is open, **When** the user types text and submits, **Then** the message appears instantly in the thread without a full page reload.
2. **Given** the user submits an empty message, **When** Send is pressed, **Then** nothing is sent and the input remains focused.
3. **Given** a message is sent successfully, **When** the send completes, **Then** the input field clears automatically.
4. **Given** the send fails, **When** an error occurs, **Then** an inline error is shown and the typed text is preserved for retry.

---

### User Story 3 — Start a new conversation (Priority: P2)

The user opens a recipient picker, selects an active user they have not messaged before, and is taken to an empty thread for that person. Sending the first message creates the conversation.

**Why this priority**: Without this, the module only works for existing threads and new conversations can never be created.

**Independent Test**: Click "New message", select a user not previously messaged; verify an empty thread opens. Send a message; verify it appears in the thread and a new sidebar entry is created.

**Acceptance Scenarios**:

1. **Given** the user opens the recipient picker, **When** it renders, **Then** it shows all active users except the current user.
2. **Given** the user selects a recipient they have already messaged, **When** confirmed, **Then** the existing conversation opens instead of creating a duplicate.
3. **Given** the user selects a new recipient and sends a message, **When** it succeeds, **Then** a new conversation entry appears in the sidebar.

---

### User Story 4 — Mark messages as read (Priority: P2)

Opening a conversation with unread messages automatically marks them as read and clears the unread badge on the sidebar entry.

**Why this priority**: Unread tracking is essential for usability but does not block the core send/receive flow.

**Independent Test**: With unread messages in a conversation, open that conversation; verify the badge disappears and the count drops to zero.

**Acceptance Scenarios**:

1. **Given** a conversation has an unread badge, **When** the user opens that conversation, **Then** the badge is removed and the unread count becomes zero.
2. **Given** the user returns to the sidebar after reading, **When** the list re-renders, **Then** the previously unread conversation shows no badge.

---

### Edge Cases

- What if the recipient list is empty (no other active users)? → Show an informative empty state in the picker.
- What if a message send fails mid-submit? → Display an inline error; preserve the unsent text.
- What if the user tries to message themselves? → The current user is excluded from the recipient list.
- What if the Messages page is opened with no prior conversations? → Empty-state with a prompt to start a new conversation.
- What if two conversations share the same most-recent timestamp? → Order is stable, determined by creation time.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a dedicated Messages page accessible from the main navigation.
- **FR-002**: The Messages page MUST display a two-panel layout: a conversation list sidebar on the left and a message thread panel on the right.
- **FR-003**: The conversation sidebar MUST list all conversations for the current user, sorted by most-recent message descending.
- **FR-004**: Each conversation entry MUST show the other participant's name, avatar (or initials fallback), a truncated preview of the last message, and the time of the last message.
- **FR-005**: Conversations with unread messages MUST display a numeric unread count badge.
- **FR-006**: Clicking a conversation entry MUST open the full thread in the right panel.
- **FR-007**: The message thread MUST display messages in chronological order, each showing the sender's avatar/initials, name, message body, and timestamp.
- **FR-008**: The thread panel MUST include a text input and a Send button fixed at the bottom.
- **FR-009**: Submitting a non-empty message MUST append it to the thread immediately and clear the input.
- **FR-010**: Submitting an empty message MUST be a no-op; the input must remain focused.
- **FR-011**: The system MUST provide a way to start a new conversation by selecting from a list of active users (excluding the current user).
- **FR-012**: If a conversation with the selected recipient already exists, the system MUST open that existing conversation rather than create a duplicate.
- **FR-013**: Opening a conversation MUST automatically mark all unread messages in that thread as read.
- **FR-014**: The unread badge MUST update immediately when messages are marked as read.
- **FR-015**: If the user has no conversations, the page MUST display an empty-state message with a prompt to start a new conversation.

### Key Entities

- **Message**: A single text message between two users. Attributes: sender, recipient, body text, sent timestamp, read timestamp (null if unread).
- **Conversation**: A logical thread between two users, derived from messages exchanged between them. Not stored separately — computed from the messages grouped by participant pair.
- **Conversation Summary**: A display-layer projection combining the other participant's profile (name, avatar), the last message preview, and the unread count.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can open the Messages page, read a conversation, and send a reply in under 30 seconds from navigation.
- **SC-002**: Sent messages appear in the thread within 2 seconds of submission under normal network conditions.
- **SC-003**: Unread badges clear within 1 second of opening a conversation.
- **SC-004**: The recipient picker loads all active users within 2 seconds of opening.
- **SC-005**: 100% of active users (excluding self) are selectable as recipients when starting a new conversation.

---

## Assumptions

- Only plain-text messages are supported; rich media attachments are out of scope for this version.
- Real-time push (live arrival of messages from others without manual refresh) is out of scope; the thread refreshes on send and on conversation open.
- The `messages` table does not yet exist in Supabase and must be created as part of this feature.
- The existing `users` table supplies all recipient data; no new user schema changes are needed.
- Message history is not paginated in this version; all messages in a conversation are loaded at once.
- Only one-to-one conversations are supported; group messaging is out of scope.
- Message deletion and editing are out of scope for this version.
- All logged-in users have equal access to messaging regardless of role.
