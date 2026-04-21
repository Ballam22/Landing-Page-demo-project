# Quickstart: Direct Messages

**Branch**: `006-direct-messages` | **Date**: 2026-04-21

---

## What this feature adds

A full-page Messages module at `/messages`. Left sidebar lists all conversations; right panel shows the selected thread. Users can send messages to any active user and start new conversations via a recipient picker.

---

## Step 0: Create the Supabase table

Run this SQL in the Supabase dashboard (SQL editor) before starting the app:

```sql
CREATE TABLE IF NOT EXISTS messages (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id    uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body         text        NOT NULL CHECK (char_length(trim(body)) > 0),
  created_at   timestamptz NOT NULL DEFAULT now(),
  read_at      timestamptz
);
CREATE INDEX IF NOT EXISTS idx_messages_sender    ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_created   ON messages(created_at DESC);
```

---

## Files touched

| File | Change type |
|------|-------------|
| `src/app/modules/messages/model/Message.ts` | **New** — `Message` and `ConversationSummary` types |
| `src/app/modules/messages/repository/messageRepository.ts` | **New** — Supabase queries (migrated + extended from `_requests.ts`) |
| `src/app/modules/messages/service/messageService.ts` | **New** — conversation derivation, send validation |
| `src/app/modules/messages/controller/useMessageController.ts` | **New** — React Query hooks (migrated from `hooks/useMessages.ts`) |
| `src/app/modules/messages/components/MessagesPage.tsx` | **New** — two-panel layout page |
| `src/app/modules/messages/components/ConversationList.tsx` | **New** — left sidebar |
| `src/app/modules/messages/components/ConversationItem.tsx` | **New** — single sidebar entry |
| `src/app/modules/messages/components/MessageThread.tsx` | **New** — right panel thread view |
| `src/app/modules/messages/components/MessageBubble.tsx` | **New** — single message row |
| `src/app/modules/messages/components/MessageInput.tsx` | **New** — text input + Send button |
| `src/app/modules/messages/components/NewConversationPicker.tsx` | **New** — recipient selector modal |
| `src/app/modules/messages/_models.ts` | **Deleted** — replaced by `model/Message.ts` |
| `src/app/modules/messages/_requests.ts` | **Deleted** — replaced by `repository/messageRepository.ts` |
| `src/app/modules/messages/hooks/useMessages.ts` | **Deleted** — replaced by `controller/useMessageController.ts` |
| `src/app/routing/PrivateRoutes.tsx` | **Updated** — add `/messages` lazy route |
| `src/_metronic/layout/components/aside/AsideMenuMain.tsx` | **Updated** — add Messages nav item |
| `src/_metronic/i18n/messages/en.json` | **Updated** — new `MESSAGES.*` keys |
| `src/_metronic/i18n/messages/de.ts` | **Updated** — matching German translations |

---

## Architecture

```
messages/
├── model/
│   └── Message.ts                    # Message, ConversationSummary types
├── repository/
│   └── messageRepository.ts          # Raw Supabase queries
├── service/
│   └── messageService.ts             # Conversation grouping, send validation
├── controller/
│   └── useMessageController.ts       # React Query hooks
└── components/
    ├── MessagesPage.tsx               # Page root, two-panel layout
    ├── ConversationList.tsx           # Left sidebar with New Message button
    ├── ConversationItem.tsx           # Single conversation row
    ├── MessageThread.tsx              # Right panel: thread + input
    ├── MessageBubble.tsx              # Single message
    ├── MessageInput.tsx               # Textarea + Send
    └── NewConversationPicker.tsx      # Modal: select recipient
```

---

## How it works

### 1. Data layer

```ts
// repository/messageRepository.ts
// Fetches all messages involving a user (for conversation list)
export async function getAllForUser(userId: string): Promise<Message[]>

// Fetches one conversation thread
export async function getConversation(userId: string, otherUserId: string): Promise<Message[]>

// Sends a message
export async function send(senderId: string, recipientId: string, body: string): Promise<Message>

// Marks all messages in a thread as read
export async function markAsRead(userId: string, otherUserId: string): Promise<void>
```

```ts
// service/messageService.ts
// Groups messages into ConversationSummary[]
export function deriveConversations(messages: Message[], currentUserId: string): ConversationSummary[]

// Validates body before send
export async function sendMessage(senderId: string, recipientId: string, body: string): Promise<Message>
```

### 2. Controller (React Query hooks)

```ts
// controller/useMessageController.ts
export function useConversations(userId?: string)  // refetchInterval: 15_000
export function useThread(userId?: string, otherUserId?: string)  // refetchInterval: 15_000
export function useSendMessage()  // mutation, invalidates conversations + thread
export function useMarkAsRead()   // mutation, invalidates unread count
```

### 3. Page layout sketch

```tsx
// MessagesPage.tsx
const MessagesPage = () => {
  const {currentUserId} = useUserManagement()
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)

  const {conversations, allMessages, isLoading} = useConversations(currentUserId)

  return (
    <div className='d-flex h-100'>
      {/* Left: conversation list */}
      <ConversationList
        conversations={conversations}
        selectedUserId={selectedUserId}
        onSelect={setSelectedUserId}
        onNewConversation={() => setPickerOpen(true)}
        isLoading={isLoading}
      />

      {/* Right: thread */}
      {selectedUserId
        ? <MessageThread currentUserId={currentUserId} otherUserId={selectedUserId} />
        : <EmptyThreadPlaceholder />
      }

      <NewConversationPicker
        isOpen={pickerOpen}
        onSelect={(uid) => { setSelectedUserId(uid); setPickerOpen(false) }}
        onClose={() => setPickerOpen(false)}
      />
    </div>
  )
}
```

### 4. Route addition

```tsx
// PrivateRoutes.tsx — add inside Routes
const MessagesPage = lazy(() => import('../modules/messages/components/MessagesPage'))

<Route
  path='messages'
  element={
    <SuspensedView>
      <MessagesPage />
    </SuspensedView>
  }
/>
```

### 5. Sidebar navigation

Add to `AsideMenuMain.tsx` (or the equivalent menu config) using the existing Keenicon pattern:

```tsx
<AsideMenuItem
  to='/messages'
  icon='message-text'
  title={intl.formatMessage({id: 'MESSAGES.PAGE_TITLE'})}
/>
```

---

## Verification checklist (manual, post-implementation)

- [x] `npx tsc --noEmit` — zero errors
- [x] `npm run lint` — zero warnings
- [x] `messages` table exists in Supabase with correct columns
- [x] `/messages` route is accessible when logged in
- [x] Messages nav item appears in the sidebar
- [x] Conversation list loads and shows existing conversations
- [x] Clicking a conversation opens the thread in the right panel
- [x] Unread badge appears for unread conversations
- [x] Opening a conversation clears the unread badge
- [x] Sending a message appends it to the thread and clears the input
- [x] Empty message submit is a no-op
- [x] Clicking "New message" opens the recipient picker
- [x] All active users (except self) appear in the picker
- [x] Selecting an existing conversation partner opens that thread (no duplicate)
- [x] Selecting a new recipient opens an empty thread; sending creates the conversation
- [x] Old `_models.ts`, `_requests.ts`, `hooks/` files are deleted
