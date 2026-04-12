# Data Model: User Authentication System

**Feature**: 001-user-auth  
**Date**: 2026-04-12

---

## Entities

### MockUser

Stored as JSON array in `localStorage["auth-mock-users"]`.

```typescript
type MockUser = {
  id: string           // UUID, generated at registration
  email: string        // lowercase-normalised, unique
  firstName: string
  lastName: string
  passwordHash: string // SHA-256 hex of password (demo-grade, not production-safe)
  emailVerified: boolean
  createdAt: number    // Unix timestamp ms
  lastLoginAt: number | null
}
```

**Uniqueness rule**: `email` is case-insensitive unique. Normalise to lowercase on write and lookup.

**State transitions**:
- Created (emailVerified: false) → Email verified (emailVerified: true)
- Active ↔ Locked (tracked separately in LockoutRecord, not on the user)

---

### LockoutRecord

Stored per-email in `localStorage["auth-lockout-{normalisedEmail}"]`.

```typescript
type LockoutRecord = {
  count: number    // failed login attempts in current window
  resetAt: number  // Unix ms; if now < resetAt, account is locked
}
```

**Rules**:
- Increment `count` on every failed login
- When `count >= 5`: set `resetAt = Date.now() + 15 * 60 * 1000`
- Before login attempt: if `resetAt > Date.now()`, reject with locked error
- When `resetAt <= Date.now()`: reset record (count = 0) and allow attempt

---

### ResetToken

Stored in-memory `Map<string, ResetToken>` in `_requests.ts` module scope (ephemeral).

```typescript
type ResetToken = {
  email: string      // normalised email the token was issued for
  expiresAt: number  // Unix ms; Date.now() + 60 * 60 * 1000 (1 hour)
  used: boolean
}
```

**Rules**:
- Each `requestPassword()` call for the same email invalidates previous tokens (set `used = true`) and issues a new one
- On `resetPassword(token, newPassword)`: validate token exists, not used, not expired
- After successful reset: mark `used = true`

---

### ResetRateLimit

Stored per-email in `localStorage["auth-reset-rate-{normalisedEmail}"]`.

```typescript
type ResetRateLimit = {
  count: number        // reset emails sent in current 1-hour window
  windowStart: number  // Unix ms start of current window
}
```

**Rules**:
- If `Date.now() - windowStart > 3600000`: reset to `{ count: 1, windowStart: Date.now() }`
- Else if `count >= 3`: reject request
- Else: increment count and allow

---

### AuthModel (existing, unchanged)

```typescript
// src/app/modules/auth/core/_models.ts
type AuthModel = {
  api_token: string
  refreshToken?: string
}
```

The `api_token` for mock users is `"mock-{user.id}"`.

---

### UserModel (existing, extended)

```typescript
// Extend existing UserModel with emailVerified flag
type UserModel = {
  // ... existing fields ...
  emailVerified?: boolean  // NEW: drives banner display
}
```

---

## Auth Context State Extensions

```typescript
// Auth.tsx — add to AuthContextProps
type AuthContextProps = {
  // ... existing ...
  emailVerificationDismissed: boolean
  dismissEmailVerification: () => void
}
```

The `emailVerificationDismissed` flag lives in React state only (not persisted). It resets on every login.

---

## Validation Rules (Yup)

### Password Policy (updated from existing)

```typescript
Yup.string()
  .min(8, 'Minimum 8 characters')
  .matches(/[a-zA-Z]/, 'Must contain at least one letter')
  .matches(/[0-9]/, 'Must contain at least one number')
  .required('Password is required')
```

Applies to: Registration, ResetPassword forms.

---

## Session Inactivity

No persistent storage. `useSessionTimeout` hook stores timer reference in `useRef`. Activity events reset the timer. On expiry: `logout()` from Auth context.

```typescript
// Activity events tracked:
const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']
const TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes
```
