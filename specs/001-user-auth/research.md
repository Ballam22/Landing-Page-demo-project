# Research: User Authentication System

**Feature**: 001-user-auth  
**Date**: 2026-04-12

---

## Finding 1: Existing Auth Module Baseline

**Decision**: Build on the existing `src/app/modules/auth/` module rather than creating a new one.

**Rationale**: The Metronic demo already ships Login, Registration, ForgotPassword, Auth context, AuthHelpers, and routing. All follow the correct patterns (Formik, Yup, React Router v6, Axios). Replacing this would violate the Constitution's "prefer extending over overriding" principle.

**Alternatives considered**: New standalone module — rejected because it duplicates working scaffolding and diverges from Metronic structure.

**Gap analysis — what exists vs. what the spec requires**:

| Spec Requirement | Exists? | Gap |
|-----------------|---------|-----|
| Login form (email/password) | ✓ | Password min length is 3, should be 8 |
| Registration form | ✓ | No mock user store; min password 3, needs 8+letters+numbers |
| ForgotPassword request page | ✓ | Needs i18n; rate limit feedback needed |
| ResetPassword confirmation page | ✗ | NEW: `/auth/reset-password?token=xxx` |
| Email verification banner | ✗ | NEW: dismissible alert after registration |
| Session inactivity timeout (30 min) | ✗ | NEW: `useSessionTimeout` hook |
| Account lockout (5 attempts / 15 min) | ✗ | NEW: in mock `_requests.ts` + login UI |
| Password reset rate limiting (3/hr) | ✗ | NEW: in mock `_requests.ts` + UI feedback |
| i18n for all strings | ✗ | NEW: keys in locale files |

---

## Finding 2: Mock Auth Strategy

**Decision**: Extend the existing mock pattern in `_requests.ts`. Use localStorage for the user registry and lockout state (survives page refresh). Use an in-memory Map for reset tokens (ephemeral — acceptable for demo).

**Rationale**: `VITE_APP_USE_MOCK_AUTH=true` is already the pattern for local dev. The constitution explicitly states "no real authentication backend needed — a mock auth flow is sufficient." Persisting the user store to localStorage enables multi-step flows (register → close tab → reopen → login) without a backend.

**Alternatives considered**:
- Server-side mock (json-server): rejected — adds a dependency and a running process.
- In-memory only: rejected — register + page reload would lose the user, breaking the registration → login acceptance scenario.

**Mock data structures** (localStorage keys):

| Key | Value shape | Purpose |
|-----|-------------|---------|
| `auth-mock-users` | `MockUser[]` JSON | Persisted user registry |
| `auth-lockout-{email}` | `{ count, resetAt }` JSON | Per-email lockout tracking |
| `auth-reset-rate-{email}` | `{ count, windowStart }` JSON | Per-email reset rate limit |
| `kt-auth-react-v` | `AuthModel` JSON | Active session (existing key) |

Reset tokens live in an in-memory `Map<string, ResetToken>` — intentionally ephemeral.

---

## Finding 3: Session Inactivity Timeout

**Decision**: Implement a `useSessionTimeout` custom hook that attaches DOM event listeners (mousemove, keydown, click, scroll, touchstart) to reset a `setTimeout` timer. On expiry, call `logout()` from the Auth context.

**Rationale**: No server-side session infrastructure exists. This is the standard SPA inactivity pattern. The hook mounts once in `AuthInit` (or a wrapper in `App.tsx`) and automatically cleans up on unmount.

**Alternatives considered**:
- `setInterval` polling: rejected — less accurate and fires even when user is active.
- Service Worker timer: rejected — over-engineered for a demo.

---

## Finding 4: Account Lockout Implementation

**Decision**: Track per-email in localStorage as `{ count: number, resetAt: number }`. On each failed login: increment count. If count ≥ 5, set `resetAt = now + 15 minutes`. On login attempt: check `resetAt > now` before even validating credentials. Auto-clears when `resetAt` has passed.

**Rationale**: Fully client-side (mock-only). Matches FR-006 exactly. No backend needed.

---

## Finding 5: Password Reset Token Flow (Mock)

**Decision**: `requestPassword(email)` generates a UUID token, stores it in the in-memory `resetTokens` Map with `{ email, expiresAt: now + 1 hour }`, and returns the token in the response (for demo purposes — normally this would be emailed). The `ResetPassword.tsx` page reads the token from the URL query string (`?token=xxx`) and calls a new `resetPassword(token, newPassword)` mock function.

**Rationale**: In a real system the token arrives via email; in this demo, the reset page is pre-navigated to with a visible token (acceptable for demo). Rate limiting tracked per-email in localStorage (3 per hour window).

---

## Finding 6: i18n Key Convention

**Decision**: Add new auth keys following the existing `AUTH.*` namespace in locale files. New keys prefixed `AUTH.VERIFY.*`, `AUTH.RESET.*`, `AUTH.LOCKOUT.*`, and `AUTH.RATE_LIMIT.*`.

**Rationale**: All existing auth keys use `AUTH.*`. Consistency required by Constitution Rule VIII and the existing key naming pattern seen in `en.json`.

**All 6 locale files** must be updated: `en.json`, `de.json`, `es.json`, `fr.json`, `ja.json`, `zh.json`. Non-English translations will use English placeholders (acceptable for demo per constitution's demo constraints).
