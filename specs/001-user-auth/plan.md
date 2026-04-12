# Implementation Plan: User Authentication System

**Branch**: `001-user-auth` | **Date**: 2026-04-12 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-user-auth/spec.md`

## Summary

Extend the existing Metronic demo auth module to meet the full specification: add a password reset confirmation page, email verification banner, session inactivity timeout, account lockout, password reset rate limiting, proper password strength validation, and i18n for all user-facing strings. All auth flows are mock-only — no backend required.

## Technical Context

**Language/Version**: TypeScript 5.3.3  
**Primary Dependencies**: React 18.2, React Router DOM 6.30, Formik 2.2.9, Yup 1.0, Axios 1.13.5, React Intl 6.4.4  
**Storage**: localStorage (mock user store, lockout, rate limit); in-memory Map (reset tokens)  
**Testing**: Manual browser verification (demo project — no automated tests required)  
**Target Platform**: Web browser (Vite + SWC dev server)  
**Project Type**: Web application (SPA, React)  
**Performance Goals**: All auth flows complete under 30 seconds (SC-002); no measurable latency in mock mode  
**Constraints**: Must not break dark mode or RTL; no new npm packages; stay within `src/app/modules/auth/`  
**Scale/Scope**: Single-user-type demo; no multi-tenancy

## Constitution Check

*GATE: Must pass before implementation.*

| Rule | Status | Notes |
|------|--------|-------|
| I. Stack locked (TS, React, Formik, Yup, Axios, React Intl) | ✓ PASS | No new dependencies introduced |
| II. Project structure (modules in `src/app/modules/`, theme core untouched) | ✓ PASS | All changes in `src/app/modules/auth/` |
| III. Strict TypeScript, no `any` without comment | ✓ PASS | All new code typed; existing `any` in AuthHelpers has eslint-disable comment |
| IV. Metronic component patterns, Bootstrap/SCSS utilities | ✓ PASS | Using Bootstrap alert classes, Metronic tokens |
| V. Protected routes in PrivateRoutes, public auth in AppRoutes | ✓ PASS | New `/auth/reset-password` added to AuthPage (public) |
| VI. React Query + Axios for server state; no raw `useEffect` + `useState` for API | ✓ PASS | Mock calls return Promises; no React Query needed for mock flows |
| VII. Formik + Yup for all forms | ✓ PASS | ResetPassword uses Formik + Yup |
| VIII. React Intl for all user-facing strings — **VIOLATION in existing files** | ⚠️ REMEDIATE | Existing Login, Registration, ForgotPassword hardcode strings. New code and all modified strings must use `intl.formatMessage()`. Full migration of these three files included in this plan. |
| IX. ESLint zero warnings; PascalCase components; `use` prefix hooks | ✓ PASS | All new files follow naming conventions |

**Complexity Tracking**: No constitution violations that require justification. The i18n remediation is a fix, not a violation.

## Project Structure

### Documentation (this feature)

```text
specs/001-user-auth/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
└── tasks.md             ← Phase 2 output (/speckit.tasks — not yet created)
```

### Source Code (changes for this feature)

```text
src/
├── _metronic/
│   └── i18n/
│       └── messages/
│           ├── en.json          MODIFY — add AUTH.VERIFY.*, AUTH.RESET.*, AUTH.LOCKOUT.*, AUTH.RATE_LIMIT.*
│           ├── de.json          MODIFY — same keys (English fallback text)
│           ├── es.json          MODIFY — same keys
│           ├── fr.json          MODIFY — same keys
│           ├── ja.json          MODIFY — same keys
│           └── zh.json          MODIFY — same keys
└── app/
    └── modules/
        └── auth/
            ├── AuthPage.tsx                        MODIFY — add reset-password route
            ├── core/
            │   ├── _models.ts                      MODIFY — add MockUser, LockoutRecord, ResetToken, ResetRateLimit types
            │   ├── _requests.ts                    MODIFY — full mock store: users, lockout, rate limit, reset tokens
            │   ├── Auth.tsx                        MODIFY — add emailVerificationDismissed state + dismissEmailVerification
            │   └── hooks/
            │       └── useSessionTimeout.ts        NEW — inactivity logout hook
            └── components/
                ├── Login.tsx                       MODIFY — i18n, lockout display, password policy link
                ├── Registration.tsx                MODIFY — i18n, password policy (8+ chars+numbers), mock hookup
                ├── ForgotPassword.tsx              MODIFY — i18n, rate limit feedback
                ├── ResetPassword.tsx               NEW — reset password form with token from URL
                └── EmailVerificationBanner.tsx     NEW — dismissible soft-verification alert
```

---

## Phase 0: Research

**Status**: Complete. See [research.md](./research.md).

Key decisions:
- Build on existing auth module (extend, don't replace)
- Mock user store: localStorage JSON array `auth-mock-users`
- Lockout: localStorage per-email `auth-lockout-{email}`
- Reset rate limit: localStorage per-email `auth-reset-rate-{email}`
- Reset tokens: in-memory Map (ephemeral, demo-acceptable)
- Session timeout: DOM event listeners + `setTimeout` in custom hook
- i18n: extend existing `AUTH.*` key namespace; all 6 locale files updated

---

## Phase 1: Design & Contracts

**Status**: Complete. See [data-model.md](./data-model.md) and [quickstart.md](./quickstart.md).

### Contracts

This is a mock-only SPA demo with no external API surface. No contract files are generated — the module boundary is internal React context and the exported `useAuth` hook.

---

## Implementation Roadmap

Tasks are grouped by dependency order. Each group can be worked on after the previous group's foundation is in place.

### Group A — Foundation (no dependencies)

**A1. Extend `_models.ts`**  
Add `MockUser`, `LockoutRecord`, `ResetToken`, `ResetRateLimit` types.  
Extend `UserModel` with optional `emailVerified?: boolean`.

**A2. Rewrite `_requests.ts` mock layer**  
- `mockUsers`: persist to/read from `localStorage["auth-mock-users"]`
- `login()`: normalise email, check lockout, validate credentials, update lockout/lastLoginAt
- `register()`: check duplicate email, hash password (SHA-256 via SubtleCrypto), persist user, return mock auth token
- `requestPassword()`: check rate limit, generate UUID token, store in in-memory Map, return token in response body (demo only)
- `resetPassword(token, newPassword)`: validate token (exists, not used, not expired), update password in user store, mark token used — NEW export
- `getUserByToken()`: look up user by token prefix `mock-{id}` in mock user store

**A3. Add `useSessionTimeout.ts` hook**  
Attach activity event listeners on mount. Reset `setTimeout` on each event. Call `logout()` on expiry. Clean up on unmount.

---

### Group B — Context (depends on A1, A2)

**B1. Extend `Auth.tsx`**  
Add `emailVerificationDismissed` state (default `false`, reset on each login).  
Add `dismissEmailVerification()` setter.  
Expose both in `AuthContextProps`.

---

### Group C — New Components (depends on B1)

**C1. `EmailVerificationBanner.tsx`**  
Dismissible Bootstrap `alert-warning` with Keenicon `ki-duotone ki-information`.  
Show if: `currentUser && !currentUser.emailVerified && !emailVerificationDismissed`.  
"Verify email" action calls a mock `sendVerificationEmail()` (no-op with success toast).  
"Dismiss" calls `dismissEmailVerification()`.  
Must use `<FormattedMessage />` for all strings.

**C2. `ResetPassword.tsx`**  
Route: `/auth/reset-password` (public, inside `AuthPage`).  
Reads `?token=` from URL search params.  
Formik form: new password + confirm password, Yup schema (8+ chars, letter + number, passwords match).  
On submit: calls `resetPassword(token, newPassword)`.  
On success: navigate to `/auth/login` with `?reset=success` query param.  
On error (expired/used token): show inline alert linking back to `/auth/forgot-password`.  
Must use `<FormattedMessage />` for all strings.

---

### Group D — Modified Components (depends on B1, C1)

**D1. `Login.tsx`**  
- Replace all hardcoded strings with `intl.formatMessage()`.  
- Remove Google/Apple social buttons (out of scope per spec; decorative href="#" links that imply unavailable features).  
- Add lockout error display: if login response indicates lockout, show "Account locked. Try again at {time}." message.  
- After successful login: navigate back to intended page (or `/dashboard`); reset `emailVerificationDismissed` is handled by Auth context automatically.

**D2. `Registration.tsx`**  
- Replace all hardcoded strings with `intl.formatMessage()`.  
- Update Yup password schema: min 8, must contain letter, must contain number.  
- Wire `register()` mock: on success the mock returns `auth.api_token = "mock-{id}"`, then `getUserByToken()` returns the new user.  
- Remove Google/Apple social buttons.

**D3. `ForgotPassword.tsx`**  
- Replace all hardcoded strings with `intl.formatMessage()`.  
- Handle rate limit error from `requestPassword()`: show "Too many requests. Please wait before trying again."  
- On success: display the generated reset token in a `<code>` block labelled "Demo token (copy this to test reset):" (acceptable for mock demo).

**D4. `AuthPage.tsx`**  
Add route: `<Route path='reset-password' element={<ResetPassword />} />`.

---

### Group E — i18n (can be done alongside Group C/D)

**E1. Add keys to all 6 locale files**

New keys to add:

```json
{
  "AUTH.VERIFY.BANNER_MESSAGE": "Please verify your email address to secure your account.",
  "AUTH.VERIFY.BANNER_ACTION": "Resend verification email",
  "AUTH.VERIFY.BANNER_DISMISS": "Dismiss",
  "AUTH.VERIFY.SENT": "Verification email sent. Please check your inbox.",
  "AUTH.RESET.TITLE": "Reset Password",
  "AUTH.RESET.NEW_PASSWORD_LABEL": "New Password",
  "AUTH.RESET.CONFIRM_PASSWORD_LABEL": "Confirm New Password",
  "AUTH.RESET.SUBMIT": "Set New Password",
  "AUTH.RESET.SUCCESS": "Your password has been reset. Please sign in.",
  "AUTH.RESET.INVALID_TOKEN": "This reset link is invalid or has expired.",
  "AUTH.RESET.REQUEST_NEW": "Request a new reset link",
  "AUTH.RESET.DEMO_TOKEN_LABEL": "Demo token (copy to test reset):",
  "AUTH.LOCKOUT.MESSAGE": "Account temporarily locked due to too many failed attempts.",
  "AUTH.LOCKOUT.UNLOCK_TIME": "You can try again at {time}.",
  "AUTH.RATE_LIMIT.MESSAGE": "Too many reset requests. Please wait before trying again.",
  "AUTH.LOGIN.TITLE": "Sign In",
  "AUTH.LOGIN.EMAIL_LABEL": "Email",
  "AUTH.LOGIN.PASSWORD_LABEL": "Password",
  "AUTH.LOGIN.SUBMIT": "Continue",
  "AUTH.LOGIN.FORGOT_LINK": "Forgot Password?",
  "AUTH.LOGIN.NO_ACCOUNT": "Not a member yet?",
  "AUTH.LOGIN.SIGN_UP_LINK": "Sign up",
  "AUTH.LOGIN.INVALID_CREDENTIALS": "The login details are incorrect.",
  "AUTH.REGISTER.TITLE": "Sign Up",
  "AUTH.REGISTER.FIRSTNAME_LABEL": "First name",
  "AUTH.REGISTER.LASTNAME_LABEL": "Last name",
  "AUTH.REGISTER.EMAIL_LABEL": "Email",
  "AUTH.REGISTER.PASSWORD_LABEL": "Password",
  "AUTH.REGISTER.CONFIRM_PASSWORD_LABEL": "Confirm Password",
  "AUTH.REGISTER.PASSWORD_HINT": "Use 8 or more characters with a mix of letters and numbers.",
  "AUTH.REGISTER.ACCEPT_TERMS": "I Accept the",
  "AUTH.REGISTER.TERMS_LINK": "Terms",
  "AUTH.REGISTER.SUBMIT": "Submit",
  "AUTH.REGISTER.CANCEL": "Cancel",
  "AUTH.REGISTER.HAVE_ACCOUNT": "Already have an account?",
  "AUTH.REGISTER.SIGN_IN_LINK": "Sign in",
  "AUTH.REGISTER.ERROR": "Registration failed. Please check your details.",
  "AUTH.FORGOT.TITLE": "Forgot Password?",
  "AUTH.FORGOT.DESCRIPTION": "Enter your email to reset your password.",
  "AUTH.FORGOT.EMAIL_LABEL": "Email",
  "AUTH.FORGOT.SUBMIT": "Submit",
  "AUTH.FORGOT.CANCEL": "Cancel",
  "AUTH.FORGOT.SUCCESS": "If this email is registered, a reset link has been sent."
}
```

---

### Group F — Integration (depends on all above)

**F1. Wire `EmailVerificationBanner` into layout**  
Mount `<EmailVerificationBanner />` inside the authenticated layout — either in `MasterLayout` or as a top-level element in `PrivateRoutes`. It self-hides when conditions are not met.

**F2. Wire `useSessionTimeout` into authenticated flow**  
Call `useSessionTimeout()` inside `AuthInit` (or a dedicated wrapper component in the authenticated tree). The hook no-ops when no user is logged in.

---

## Acceptance Verification Checklist

Manual browser verification steps (no automated tests per constitution):

- [ ] Register with a new email → account active immediately → email banner shown
- [ ] Dismiss email banner → banner gone for session
- [ ] Login with registered user → redirected to dashboard
- [ ] Login with wrong password 5× → lockout message with time shown
- [ ] Wait 15 min (or clear lockout from localStorage) → login works again
- [ ] Request password reset → demo token shown on page
- [ ] Navigate to `/auth/reset-password?token=<TOKEN>` → enter new password → redirect to login → login with new password succeeds
- [ ] Request password reset 4× within an hour → 4th request shows rate limit error
- [ ] Use an expired/already-used reset token → error message with link to request new one
- [ ] Stay idle 30 min → automatically logged out (use shortened timeout to test)
- [ ] Log out manually → back button to protected page → redirected to login
- [ ] ESLint passes: `npx eslint src/app/modules/auth --max-warnings 0`
