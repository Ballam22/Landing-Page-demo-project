# Research: Direct Messages

**Branch**: `006-direct-messages` | **Date**: 2026-04-21

---

## Decision 1: Architecture — migrate existing files to MVC pattern

**Decision**: Migrate the three existing files (`_models.ts`, `_requests.ts`, `hooks/useMessages.ts`) into the standard MVC layer structure established in feature 004, then delete the originals.

| Old file | New location |
|----------|-------------|
| `_models.ts` | `model/Message.ts` |
| `_requests.ts` | `repository/messageRepository.ts` |
| `hooks/useMessages.ts` | `controller/useMessageController.ts` |
| *(new)* | `service/messageService.ts` |

**Rationale**: The feature spec explicitly requires MVC. Feature 004 established this as the project standard and the constitution's `_requests.ts` convention is superseded by that precedent. Migrating eliminates the structural inconsistency the old files introduced.

**Alternatives considered**:
- Keep `_requests.ts` and `hooks/` and build UI on top → rejected: contradicts the feature spec and the MVC precedent from 004.

---

## Decision 2: Supabase table schema for `messages`

**Decision**: Create a single `messages` table. No separate `conversations` table — conversations are computed at read time by grouping messages on the other participant.

```sql
CREATE TABLE messages (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id   uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id uuid       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body        text        NOT NULL CHECK (char_length(trim(body)) > 0),
  created_at  timestamptz NOT NULL DEFAULT now(),
  read_at     timestamptz
);

CREATE INDEX idx_messages_sender    ON messages(sender_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_id);
CREATE INDEX idx_messages_created   ON messages(created_at DESC);
```

**Rationale**: A `conversations` table would require maintaining a join table with its own state. Since conversations are simply pairs of users that have exchanged at least one message, they can be derived efficiently with a query that groups by the "other" participant. This keeps the schema minimal and matches the existing `_requests.ts` design.

**RLS decision**: Disable RLS on the `messages` table, consistent with the existing `users` table policy (app-layer auth guard via `resolveCurrentUserId`). The anon key is scoped to what the application logic permits. RLS hardening is explicitly deferred per project constraints.

**Alternatives considered**:
- Add a `conversations` table → rejected: extra schema complexity for no functional gain at this scale.
- Enable RLS with `auth.uid()` → rejected: the project's `users.id` is independent of `auth.uid()` (custom UUID, not Supabase auth UID), so `auth.uid()`-based policies would break all queries.

---

## Decision 3: Conversation derivation pattern

**Decision**: In `messageRepository`, fetch all messages where `sender_id = userId OR recipient_id = userId`. In `messageService`, group these by the other participant's ID to produce `ConversationSummary[]`. Sort by the most-recent message timestamp descending.

```ts
// Pseudocode for deriving ConversationSummary[]
const grouped = new Map<string, Message[]>()
for (const msg of allMessages) {
  const otherId = msg.senderId === userId ? msg.recipientId : msg.senderId
  grouped.set(otherId, [...(grouped.get(otherId) ?? []), msg])
}
return Array.from(grouped.entries()).map(([otherId, msgs]) => ({
  userId: otherId,
  lastMessage: msgs[msgs.length - 1],
  unreadCount: msgs.filter(m => m.recipientId === userId && m.readAt === null).length,
})).sort((a, b) => /* lastMessage.createdAt desc */)
```

**Rationale**: All messages for a user are already fetched for the sidebar; grouping in the service layer costs no extra Supabase round trips and keeps the repository simple.

**Alternatives considered**:
- One Supabase query per conversation (N+1 pattern) → rejected: expensive and not needed at this scale.
- Supabase RPC/stored procedure for grouping → rejected: adds schema complexity and schema change risk with no benefit for current user counts.

---

## Decision 4: Polling strategy (no real-time push)

**Decision**: Use React Query `refetchInterval: 15_000` on the conversation list query and on the active thread query. No Supabase Realtime subscriptions in this version.

**Rationale**: The spec explicitly excludes real-time push. A 15-second poll interval is a reasonable default for an internal tool at low user counts. React Query already handles stale-while-revalidate semantics, so the UI stays consistent.

**Alternatives considered**:
- Supabase Realtime channel → out of scope per spec; can be added as a future enhancement.
- Shorter interval (5s) → rejected: unnecessary server load for an internal app.

---

## Decision 5: Routing and navigation entry point

**Decision**: Add `/messages` as a protected route in `PrivateRoutes.tsx` (lazy-loaded, no role guard — all logged-in users can message). Add a "Messages" nav item to the Metronic sidebar by editing `src/_metronic/layout/components/aside/AsideMenuMain.tsx` (or equivalent menu config file), reusing the existing `ki-duotone ki-message-text` Keenicon.

**Rationale**: `/messages` follows the kebab-case routing convention. All active users should be able to access messaging regardless of role (per spec assumption). Lazy loading is required by Principle V.

**Alternatives considered**:
- Messages as a slide-in drawer (like the existing DrawerMessenger) → rejected: the spec asks for a full page with a two-panel layout, which needs more horizontal space than a fixed-width drawer.

---

## Summary: No NEEDS CLARIFICATION items

All implementation decisions are resolved. The only new dependency is the `messages` Supabase table — SQL is defined above and becomes a setup task in `tasks.md`.
