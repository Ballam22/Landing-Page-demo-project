# Implementation Plan: Direct Messages

**Branch**: `006-direct-messages` | **Date**: 2026-04-21 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/006-direct-messages/spec.md`

## Summary

Add a full-page direct messaging module at `/messages`. A two-panel layout shows a conversation list sidebar (sorted by recency, with unread badges) and a message thread panel. Users can send messages to any active user and start new conversations via a recipient picker. The existing `_models.ts`, `_requests.ts`, and `hooks/useMessages.ts` files are migrated into the MVC layer structure (model/repository/service/controller/components) established in feature 004, then deleted. The `messages` Supabase table is created as part of setup.

## Technical Context

**Language/Version**: TypeScript ^5.3.3  
**Primary Dependencies**: React ^18.2.0, React Query 3.38.0, Bootstrap 5 + Metronic SCSS, React Intl ^6.4.4, Supabase JS ^2.104.0  
**Storage**: Database: Supabase (PostgreSQL) via `src/app/lib/supabaseClient.ts` | No file uploads in this feature  
**Testing**: Manual browser verification per project constitution  
**Target Platform**: Web SPA (Vite + SWC)  
**Project Type**: Web application (React SPA)  
**Performance Goals**: Message send appears in thread within 2 seconds (SC-002); conversation list loads within 2 seconds (spec SC-004)  
**Constraints**: No real-time push (polling at 15s interval); no message pagination; text-only messages  
**Scale/Scope**: One new page, ~10 new components, 1 new Supabase table, 3 files migrated + deleted

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Technology Stack | ✅ PASS | No new dependencies — all stack items already in `package.json` |
| II. Project Structure | ✅ PASS | New module in `src/app/modules/messages/`; new page route |
| III. TypeScript Rules | ✅ PASS | Strict types, no `any` |
| IV. Component & Styling Rules | ✅ PASS | Metronic utility classes; Keenicons for icons; CSS variables for colours |
| V. Routing Rules | ✅ PASS | `/messages` lazy-loaded protected route in `PrivateRoutes.tsx` |
| VI. Data Fetching Rules | ⚠️ JUSTIFIED | Uses `repository/` instead of `_requests.ts` convention — justified by feature 004 MVC precedent (same justification applies) |
| VII. Forms Rules | ✅ PASS | Message input is a single uncontrolled textarea — no Formik needed for a plain send field |
| VIII. Internationalisation | ✅ PASS | All new strings use React Intl keys |
| IX. Code Quality Rules | ⚠️ JUSTIFIED | React Query hooks live in `controller/` instead of `hooks/` — same MVC precedent as feature 004 |
| X. Storage Rules | ✅ PASS | No file uploads in this feature |

> **Supabase gate**: All Supabase calls route through `src/app/lib/supabaseClient.ts` via the repository layer. ✅

## Project Structure

### Documentation (this feature)

```text
specs/006-direct-messages/
├── plan.md              # This file
├── research.md          # Phase 0 output ✅
├── data-model.md        # Phase 1 output ✅
├── quickstart.md        # Phase 1 output ✅
└── tasks.md             # Phase 2 output (/speckit.tasks — not yet created)
```

### Source Code Changes

```text
# New files
src/app/modules/messages/
├── model/
│   └── Message.ts                        # Message + ConversationSummary types
├── repository/
│   └── messageRepository.ts              # Supabase queries
├── service/
│   └── messageService.ts                 # Conversation derivation, send validation
├── controller/
│   └── useMessageController.ts           # React Query hooks
└── components/
    ├── MessagesPage.tsx                   # Two-panel page root
    ├── ConversationList.tsx               # Left sidebar
    ├── ConversationItem.tsx               # Single conversation row
    ├── MessageThread.tsx                  # Right panel: thread + input
    ├── MessageBubble.tsx                  # Single message
    ├── MessageInput.tsx                   # Textarea + Send button
    └── NewConversationPicker.tsx          # Recipient selector modal

# Files to delete (replaced by MVC layers above)
src/app/modules/messages/_models.ts       # → model/Message.ts
src/app/modules/messages/_requests.ts     # → repository/messageRepository.ts
src/app/modules/messages/hooks/useMessages.ts  # → controller/useMessageController.ts

# Modified files
src/app/routing/PrivateRoutes.tsx         # Add /messages lazy route
src/_metronic/layout/components/aside/AsideMenuMain.tsx  # Add Messages nav item
src/_metronic/i18n/messages/en.json       # New MESSAGES.* keys
src/_metronic/i18n/messages/de.ts         # Matching German translations

# New Supabase table (run SQL manually in Supabase dashboard)
# messages (id, sender_id, recipient_id, body, created_at, read_at)
```

**Structure Decision**: Single-project SPA following the MVC pattern from feature 004. The messages module is self-contained in `src/app/modules/messages/` with its own model/repository/service/controller/components layers. `MessagesPage` is the page root; all data fetching flows through `useMessageController`.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| Principle VI: `repository/` instead of `_requests.ts` | MVC pattern established in feature 004 is the project standard going forward | Reverting to `_requests.ts` would create inconsistency with all features built since 004 |
| Principle IX: `controller/` instead of `hooks/` | Same MVC precedent | Same reasoning — consistency across feature modules outweighs the literal hook-naming rule |
