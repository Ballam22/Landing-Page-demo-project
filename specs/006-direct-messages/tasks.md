# Tasks: Direct Messages

**Input**: Design documents from `/specs/006-direct-messages/`
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | quickstart.md ✅

**Tests**: Not requested — manual browser verification per project constitution.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the Supabase table and add i18n keys that all user stories depend on.

- [X] T001 Create the `messages` table in Supabase — run this SQL in the Supabase dashboard SQL editor: `CREATE TABLE IF NOT EXISTS messages (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), sender_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, recipient_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, body text NOT NULL CHECK (char_length(trim(body)) > 0), created_at timestamptz NOT NULL DEFAULT now(), read_at timestamptz); CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id); CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id); CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);`
- [X] T002 [P] Audit existing `MESSAGES.*` keys in `src/_metronic/i18n/messages/en.json` and add any missing keys: `MESSAGES.PAGE_TITLE`, `MESSAGES.NEW_MESSAGE`, `MESSAGES.EMPTY_STATE_TITLE`, `MESSAGES.EMPTY_STATE_HINT`, `MESSAGES.EMPTY_THREAD`, `MESSAGES.SELECT_RECIPIENT`, `MESSAGES.NO_RECIPIENTS` — do not duplicate keys that already exist
- [X] T003 [P] Audit existing `MESSAGES.*` keys in `src/_metronic/i18n/messages/de.ts` and add matching German translations for any keys added in T002: `MESSAGES.PAGE_TITLE: 'Nachrichten'`, `MESSAGES.NEW_MESSAGE: 'Neue Nachricht'`, `MESSAGES.EMPTY_STATE_TITLE: 'Noch keine Unterhaltungen'`, `MESSAGES.EMPTY_STATE_HINT: 'Starte eine Unterhaltung über Neue Nachricht'`, `MESSAGES.EMPTY_THREAD: 'Noch keine Nachrichten. Schreib die erste!'`, `MESSAGES.SELECT_RECIPIENT: 'Empfänger auswählen'`, `MESSAGES.NO_RECIPIENTS: 'Keine aktiven Benutzer verfügbar'`

---

## Phase 2: Foundational (MVC Data Layer)

**Purpose**: Migrate the three existing stub files into the MVC layer structure and delete the originals. All UI components depend on these layers.

**⚠️ CRITICAL**: T004–T008 must complete before any user story UI work begins.

- [X] T004 Create `src/app/modules/messages/model/Message.ts` — export `Message` type: `{ id: string; senderId: string; recipientId: string; body: string; createdAt: string; readAt: string | null }` and `ConversationSummary` type: `{ userId: string; lastMessage: Message | null; unreadCount: number }` — this replaces `_models.ts`
- [X] T005 Create `src/app/modules/messages/repository/messageRepository.ts` — import `supabase` from `'../../../lib/supabaseClient'`; define `DbMessageRow` type matching the DB columns; export: `getAllForUser(userId: string): Promise<Message[]>` (fetches where sender_id = userId OR recipient_id = userId, ordered by created_at ASC), `getConversation(userId: string, otherUserId: string): Promise<Message[]>` (both directions, ordered ASC), `send(senderId: string, recipientId: string, body: string): Promise<Message>` (insert + select single), `markAsRead(userId: string, otherUserId: string): Promise<void>` (update read_at = now() where recipient_id = userId AND sender_id = otherUserId AND read_at IS NULL) — this replaces `_requests.ts`
- [X] T006 Create `src/app/modules/messages/service/messageService.ts` — import from `'../repository/messageRepository'` and `'../model/Message'`; export: `deriveConversations(messages: Message[], currentUserId: string): ConversationSummary[]` (group messages by other participant ID, compute lastMessage and unreadCount per group, sort by lastMessage.createdAt descending); `sendMessage(senderId: string, recipientId: string, body: string): Promise<Message>` (validates body is non-empty after trim, delegates to repository)
- [X] T007 Create `src/app/modules/messages/controller/useMessageController.ts` — import from `'react-query'` and service/repository layers; export query key constants `MESSAGE_QUERY_KEY`; export hooks: `useConversations(userId?: string)` (calls `getAllForUser` + `deriveConversations`, `refetchInterval: 15_000`, enabled when userId truthy), `useThread(userId?: string, otherUserId?: string)` (calls `getConversation`, `refetchInterval: 15_000`, enabled when both truthy), `useSendMessage()` (mutation calling `messageService.sendMessage`, on success invalidates `getAllForUser` and `getConversation` queries for both participants), `useMarkAsRead()` (mutation calling `markAsRead`, on success invalidates affected queries) — this replaces `hooks/useMessages.ts`
- [X] T008 Delete the three old files now that T004–T007 are complete: delete `src/app/modules/messages/_models.ts`, `src/app/modules/messages/_requests.ts`, and `src/app/modules/messages/hooks/useMessages.ts` (and the empty `hooks/` directory if it becomes empty)

**Checkpoint**: Run `npx tsc --noEmit` — zero errors. All MVC layers exist and old files are gone.

---

## Phase 3: User Story 1 — View and navigate conversations (Priority: P1) 🎯 MVP

**Goal**: A logged-in user can navigate to `/messages`, see their conversation list in the left sidebar with names/avatars/previews/badges, and click a conversation to see the full thread in the right panel.

**Independent Test**: Navigate to `/messages`; verify the sidebar lists conversations with correct names, avatars/initials, last-message preview, and unread badges. Click a conversation; verify the right panel shows the full message history in chronological order.

### Implementation for User Story 1

- [X] T009 [P] [US1] Create `src/app/modules/messages/components/ConversationItem.tsx` — props: `{ summary: ConversationSummary; user: User; isSelected: boolean; onClick: () => void }`; renders a clickable row with the user's avatar (60px symbol: `<img>` if `user.avatarUrl`, else initials from `user.fullName`), full name, truncated last-message body preview (max 40 chars, ellipsis), formatted time of last message, and a `<span className='badge badge-danger rounded-pill'>` showing `summary.unreadCount` when > 0; apply `bg-light-primary` highlight when `isSelected`
- [X] T010 [US1] Create `src/app/modules/messages/components/ConversationList.tsx` — props: `{ conversations: ConversationSummary[]; users: User[]; selectedUserId: string | null; onSelect: (userId: string) => void; onNewConversation: () => void; isLoading: boolean }`; renders a fixed-width left panel (`min-width: 280px`, `border-end`); header row contains the `MESSAGES.PAGE_TITLE` heading and a `+ New` button (calls `onNewConversation`); when `isLoading` shows a spinner; when `conversations` is empty shows `MESSAGES.EMPTY_STATE_TITLE` + `MESSAGES.EMPTY_STATE_HINT`; otherwise renders a list of `<ConversationItem>` components, matching each `ConversationSummary` to a `User` by `summary.userId`; import `User` from `../../user-management/model/User`
- [X] T011 [US1] Create `src/app/modules/messages/components/MessagesPage.tsx` — page root; uses `useAuth()` to get `currentUser.email`; calls `resolveCurrentUserId(email)` (or reads from context) to get `currentUserId: string | null`; calls `useUserController()` to get `users`; calls `useConversations(currentUserId)` to get `conversations` and `isLoading`; local state: `selectedUserId: string | null`, `pickerOpen: boolean`; renders a `d-flex h-100` container: left side `<ConversationList>` (wired with all props); right side shows a placeholder `<div className='flex-grow-1 d-flex align-items-center justify-content-center text-muted'>` with `MESSAGES.EMPTY_THREAD` text when no conversation is selected (thread component wired in T017); import `useMessageController` from `'../controller/useMessageController'`, `useUserController` from `'../../user-management/controller/useUserController'`
- [X] T012 [US1] Update `src/app/routing/PrivateRoutes.tsx` — add `const MessagesPage = lazy(() => import('../modules/messages/components/MessagesPage'))` inside `PrivateRoutes`; add route `<Route path='messages' element={<SuspensedView><MessagesPage /></SuspensedView>} />` before the wildcard `*` route — no role guard; all logged-in users can access
- [X] T013 [P] [US1] Add a Messages nav item to the Metronic sidebar — find the sidebar menu file (check `src/_metronic/layout/components/aside/` or `src/_metronic/layout/components/sidebar/` for the main menu component); add an `<AsideMenuItem to='/messages' icon='message-text' title={intl.formatMessage({id: 'MESSAGES.PAGE_TITLE'})} />` entry after the Dashboard item using the `ki-duotone ki-message-text` Keenicon

**Checkpoint**: Navigate to `/messages` in the browser; sidebar loads with conversations (or empty state); clicking a conversation highlights it in the sidebar. Right panel shows placeholder text.

---

## Phase 4: User Story 2 — Send a message (Priority: P1)

**Goal**: With a conversation open, the user can type a message, submit it, and see it immediately appended to the thread. Empty sends are blocked.

**Independent Test**: Open a conversation, type a message, press Send; verify the message appears at the end of the thread, the input clears, and the conversation moves to the top of the sidebar.

### Implementation for User Story 2

- [X] T014 [P] [US2] Create `src/app/modules/messages/components/MessageBubble.tsx` — props: `{ message: Message; isMine: boolean; senderUser: User | undefined }`; renders a message row; when `isMine` aligns right with `bg-light-primary` bubble; when not `isMine` aligns left with sender avatar/initials and `bg-light` bubble; shows `message.body` and a formatted timestamp from `message.createdAt`
- [X] T015 [P] [US2] Create `src/app/modules/messages/components/MessageInput.tsx` — props: `{ onSend: (body: string) => Promise<void>; disabled?: boolean }`; local state: `value: string`, `sending: boolean`; renders a `<textarea>` (rows=2, placeholder from `MESSAGES.INPUT_PLACEHOLDER`) and a Send button (disabled when `sending` or `value.trim()` is empty, shows `MESSAGES.SENDING` spinner while sending); on submit calls `onSend(value.trim())`, sets `sending=true`, clears input on success, shows inline error on failure; supports `Enter` to send (Shift+Enter for newline)
- [X] T016 [US2] Create `src/app/modules/messages/components/MessageThread.tsx` — props: `{ currentUserId: string; otherUser: User }`; calls `useThread(currentUserId, otherUser.id)` and `useSendMessage()`; renders a `d-flex flex-column h-100` container: scrollable message list (flex-grow-1, overflow-y auto) showing `<MessageBubble>` for each message with `isMine={msg.senderId === currentUserId}`; auto-scrolls to bottom on new messages using a `useEffect` + `useRef`; fixed bottom `<MessageInput onSend={async (body) => sendMessage({senderId: currentUserId, recipientId: otherUser.id, body})} />`; shows empty state `MESSAGES.EMPTY_THREAD` when thread has no messages; shows error alert when thread query has error
- [X] T017 [US2] Update `src/app/modules/messages/components/MessagesPage.tsx` — replace the placeholder right panel with `<MessageThread currentUserId={currentUserId} otherUser={selectedUser} />` when `selectedUserId !== null` (look up `selectedUser` from `users` array by id); keep the empty-state placeholder when nothing is selected; import `MessageThread` from `'./MessageThread'`

**Checkpoint**: Click a conversation → thread shows all messages → type a message → Send → message appears at bottom → input clears. Sending empty string does nothing.

---

## Phase 5: User Story 3 — Start a new conversation (Priority: P2)

**Goal**: The user can open a recipient picker, select any active user they haven't messaged (or have), and open that thread. Sending the first message creates the conversation.

**Independent Test**: Click "New message" → picker opens showing active users (excluding self) → select a new user → empty thread opens → send a message → conversation appears in sidebar.

### Implementation for User Story 3

- [X] T018 [US3] Create `src/app/modules/messages/components/NewConversationPicker.tsx` — props: `{ isOpen: boolean; users: User[]; currentUserId: string; onSelect: (userId: string) => void; onClose: () => void }`; renders a Bootstrap modal (`show={isOpen}`) with a searchable list of users (filter by `user.fullName` as the user types); each user row shows avatar/initials and full name as a clickable item; excludes the current user from the list; shows `MESSAGES.SELECT_RECIPIENT` as the modal title; shows `MESSAGES.NO_RECIPIENTS` when the filtered list is empty; clicking a user calls `onSelect(user.id)` and `onClose()`
- [X] T019 [US3] Update `src/app/modules/messages/components/MessagesPage.tsx` — add `pickerOpen` state (already scaffolded in T011); pass `onNewConversation={() => setPickerOpen(true)}` to `<ConversationList>`; render `<NewConversationPicker isOpen={pickerOpen} users={activeUsersExcludingSelf} currentUserId={currentUserId} onSelect={(uid) => { setSelectedUserId(uid); setPickerOpen(false) }} onClose={() => setPickerOpen(false)} />`; derive `activeUsersExcludingSelf` as `users.filter(u => u.status === 'Active' && u.id !== currentUserId)`

**Checkpoint**: New message button → picker with user list → select user → thread opens (empty or existing) → send a message → sidebar shows conversation.

---

## Phase 6: User Story 4 — Mark messages as read (Priority: P2)

**Goal**: Opening a conversation with unread messages automatically marks them as read and clears the unread badge.

**Independent Test**: A conversation with an unread badge — open it; verify the badge disappears within 1 second.

### Implementation for User Story 4

- [X] T020 [US4] Update `src/app/modules/messages/components/MessagesPage.tsx` — when `selectedUserId` changes to a non-null value, call `markAsRead({ userId: currentUserId, otherUserId: selectedUserId })` inside a `useEffect` (dep: `[selectedUserId, currentUserId]`); import `useMarkAsRead` from `'../controller/useMessageController'`; this invalidates the conversations query, which causes the unread badge to clear

**Checkpoint**: Open a conversation with an unread badge → badge disappears → switching conversations triggers mark-as-read for the newly opened one.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Type safety, lint, and final manual verification.

- [X] T021 [P] Run `npx tsc --noEmit` from the repo root — fix every type error; common issues: `User` import in message components, `ConversationSummary` type mismatches, missing `useEffect` deps
- [X] T022 [P] Run `npm run lint` from the repo root — fix every ESLint warning until `--max-warnings 0` passes; watch for unused imports in `MessagesPage.tsx`, `MessageThread.tsx`, and `useMessageController.ts`
- [ ] T023 Run manual verification checklist from `specs/006-direct-messages/quickstart.md` — all 17 checklist items must pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — T001, T002, T003 can run immediately (T002 and T003 in parallel)
- **Foundational (Phase 2)**: T001 must complete (table must exist); T004 → T005 → T006 → T007 → T008 (sequential within phase)
- **US1 (Phase 3)**: Depends on Phase 2 — T009 and T013 in parallel; T010 after T009; T011 after T010; T012 anytime after Phase 2
- **US2 (Phase 4)**: Depends on US1 (MessagesPage must exist for wiring) — T014 and T015 in parallel; T016 after both; T017 after T016
- **US3 (Phase 5)**: Depends on US1 — T018 then T019
- **US4 (Phase 6)**: Depends on US1 — single task T020
- **Polish (Phase 7)**: Depends on all story phases complete — T021 and T022 in parallel; T023 after both

### User Story Dependencies

- **US1 (P1)**: Requires Phase 2 complete
- **US2 (P1)**: Requires US1 complete (needs MessagesPage to wire into)
- **US3 (P2)**: Requires US1 complete (needs MessagesPage + ConversationList)
- **US4 (P2)**: Requires US1 complete (needs MessagesPage and selectedUserId state)

---

## Parallel Opportunities

```
Phase 1 (can run simultaneously after T001):
  T002: Add i18n keys to en.json
  T003: Add i18n keys to de.ts

Phase 2 (sequential — each depends on prior):
  T004 → T005 → T006 → T007 → T008

Phase 3 (partial parallel):
  T009 + T013: ConversationItem + sidebar nav item (no dependency on each other)
  T010 after T009
  T011 after T010
  T012 anytime after Phase 2

Phase 4 (partial parallel):
  T014 + T015: MessageBubble + MessageInput (no dependency on each other)
  T016 after T014 and T015
  T017 after T016

Phase 7 (can run simultaneously):
  T021: tsc
  T022: lint
```

---

## Implementation Strategy

### MVP First (US1 + US2 — T001–T017)

1. T001–T003: Setup (table + i18n)
2. T004–T008: MVC data layer
3. T009–T013: US1 — conversation list + routing
4. **STOP and VALIDATE**: `/messages` loads, sidebar works, thread visible
5. T014–T017: US2 — send a message
6. **STOP and VALIDATE**: Full send/receive flow works

### Incremental Delivery

1. T001–T008 → Foundation ready (table + MVC layers)
2. T009–T013 → US1 complete: read-only messaging view (**navigable**)
3. T014–T017 → US2 complete: send messages (**MVP shippable**)
4. T018–T019 → US3 complete: start new conversations
5. T020 → US4 complete: unread tracking
6. T021–T023 → Polish: types + lint + manual QA

---

## Notes

- The `messages` Supabase table (T001) must be created manually in the Supabase dashboard before any data layer code can be tested
- `ConversationSummary` is a derived type — it is never stored in the database; `deriveConversations()` in the service computes it from the raw messages array
- The old files (`_models.ts`, `_requests.ts`, `hooks/useMessages.ts`) must only be deleted (T008) after the replacement files are confirmed to compile
- `MessagesPage` needs `currentUserId` — resolve it via `useUserManagement()` context (already used on `UserManagementPage`) or by calling `resolveCurrentUserId(currentUser.email)` directly
- Auto-scroll to bottom in `MessageThread` requires a `useRef` on the last message element and a `useEffect` that calls `.scrollIntoView()` whenever the messages array length changes
