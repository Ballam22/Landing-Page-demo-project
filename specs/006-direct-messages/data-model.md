# Data Model: Direct Messages

**Branch**: `006-direct-messages` | **Date**: 2026-04-21

---

## New Entity: `Message`

Stored in the `messages` Supabase table.

| Field | DB column | Type | Nullable | Notes |
|-------|-----------|------|----------|-------|
| `id` | `id` | `string` (uuid) | No | PK, auto-generated |
| `senderId` | `sender_id` | `string` (uuid) | No | FK → `users.id` |
| `recipientId` | `recipient_id` | `string` (uuid) | No | FK → `users.id` |
| `body` | `body` | `string` | No | Trimmed, non-empty |
| `createdAt` | `created_at` | `string` (ISO 8601) | No | Default `now()` |
| `readAt` | `read_at` | `string \| null` (ISO 8601) | Yes | Null = unread |

**TypeScript type**:
```ts
export type Message = {
  id: string
  senderId: string
  recipientId: string
  body: string
  createdAt: string
  readAt: string | null
}
```

---

## Derived Type: `ConversationSummary`

Not stored — computed from messages in the service layer.

| Field | Type | Source |
|-------|------|--------|
| `userId` | `string` | The other participant's `users.id` |
| `lastMessage` | `Message \| null` | Last message in the thread by `createdAt` |
| `unreadCount` | `number` | Count where `recipientId === currentUserId` AND `readAt === null` |

**TypeScript type**:
```ts
export type ConversationSummary = {
  userId: string
  lastMessage: Message | null
  unreadCount: number
}
```

---

## Supabase DDL

Run in the Supabase SQL editor to create the `messages` table:

```sql
-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id    uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body         text        NOT NULL CHECK (char_length(trim(body)) > 0),
  created_at   timestamptz NOT NULL DEFAULT now(),
  read_at      timestamptz
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_messages_sender    ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_created   ON messages(created_at DESC);

-- RLS: disabled for this phase (consistent with users table policy)
-- App-layer auth guard enforces access via resolveCurrentUserId
```

---

## New i18n Keys

Add to `src/_metronic/i18n/messages/en.json` and `de.ts`:

| Key | English | German |
|-----|---------|--------|
| `MESSAGES.PAGE_TITLE` | `"Messages"` | `'Nachrichten'` |
| `MESSAGES.NEW_MESSAGE` | `"New message"` | `'Neue Nachricht'` |
| `MESSAGES.INPUT_PLACEHOLDER` | `"Write a message..."` | `'Schreibe eine Nachricht...'` |
| `MESSAGES.SEND` | `"Send"` | `'Senden'` |
| `MESSAGES.SENDING` | `"Sending..."` | `'Wird gesendet...'` |
| `MESSAGES.EMPTY_STATE_TITLE` | `"No conversations yet"` | `'Noch keine Unterhaltungen'` |
| `MESSAGES.EMPTY_STATE_HINT` | `"Start a conversation by clicking New message"` | `'Starte eine Unterhaltung über Neue Nachricht'` |
| `MESSAGES.EMPTY_THREAD` | `"No messages yet. Send the first one!"` | `'Noch keine Nachrichten. Schreib die erste!'` |
| `MESSAGES.SELECT_RECIPIENT` | `"Select a recipient"` | `'Empfänger auswählen'` |
| `MESSAGES.NO_RECIPIENTS` | `"No active users available"` | `'Keine aktiven Benutzer verfügbar'` |
| `MESSAGES.LOAD_ERROR` | `"Unable to load messages right now."` | `'Nachrichten konnten gerade nicht geladen werden.'` |
| `MESSAGES.SEND_ERROR` | `"The message could not be sent."` | `'Die Nachricht konnte nicht gesendet werden.'` |
| `MESSAGES.SEND_SUCCESS` | `"Message sent."` | `'Nachricht gesendet.'` |

> **Note**: Some of these keys already exist in `en.json` and `de.ts` from earlier work. Verify before adding to avoid duplicates.

---

## State Transitions

```
No conversations
  │
  │ User sends first message to a recipient
  ▼
Conversation exists (unread for recipient)
  │                          │
  │ Recipient opens thread   │ More messages sent
  ▼                          ▼
All messages read        Messages accumulate (unread count grows)
  │
  │ readAt set on all unread messages
  ▼
unreadCount = 0, badge cleared
```

---

## Component Props Contracts

### `MessagesPage`
```ts
// No props — reads currentUserId from auth context
```

### `ConversationList`
```ts
type ConversationListProps = {
  conversations: ConversationSummary[]
  users: User[]                          // for name/avatar lookup
  selectedUserId: string | null
  onSelect: (userId: string) => void
  onNewConversation: () => void
  isLoading: boolean
}
```

### `MessageThread`
```ts
type MessageThreadProps = {
  messages: Message[]
  currentUserId: string
  otherUser: User
  isLoading: boolean
  onSend: (body: string) => Promise<void>
}
```

### `NewConversationPicker`
```ts
type NewConversationPickerProps = {
  users: User[]                          // active users excluding self
  onSelect: (userId: string) => void
  onClose: () => void
  isOpen: boolean
}
```
