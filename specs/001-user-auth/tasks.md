# Tasks: User Authentication System

**Input**: Design documents from `/specs/001-user-auth/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, quickstart.md ✓

**Tests**: No automated tests — demo project per constitution. Manual browser verification in Polish phase.

**Organization**: Tasks grouped by user story (US1–US4) to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1–US4)
- All file paths are relative to `D:/29.3.26/react project/react/metronic_react_v8.2.3_demo1/`

---

## Phase 1: Setup

**Purpose**: Ensure environment is correctly configured for mock auth.

- [x] T001 Verify `VITE_APP_USE_MOCK_AUTH=true` exists in `.env`; if missing, add it. Confirm `VITE_APP_API_URL` is set to any non-empty string (e.g., `http://localhost:3001`)

---

## Phase 2: Foundation (Blocking Prerequisites)

**Purpose**: Shared types, mock data infrastructure, and Auth context extensions that every user story depends on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T002 Extend `src/app/modules/auth/core/_models.ts`: add `MockUser` type (id, email, firstName, lastName, passwordHash, emailVerified, createdAt, lastLoginAt), `LockoutRecord` type ({ count, resetAt }), `ResetToken` type ({ email, expiresAt, used }), `ResetRateLimit` type ({ count, windowStart }); extend `UserModel` with `emailVerified?: boolean`
- [x] T003 Add mock user store infrastructure to `src/app/modules/auth/core/_requests.ts`: localStorage helpers `getMockUsers()` / `saveMockUsers()`, in-memory `resetTokens: Map<string, ResetToken>`, and update `getUserByToken()` to look up users from the mock store by token prefix `mock-{id}`, falling back to the existing `MOCK_DEMO_USER` for the `metronic-local-mock-token`
- [x] T004 Extend `src/app/modules/auth/core/Auth.tsx`: add `emailVerificationDismissed: boolean` and `dismissEmailVerification: () => void` to `AuthContextProps`; add corresponding `useState` in `AuthProvider` (default `false`); reset to `false` whenever `saveAuth` is called with a new auth token
- [x] T005 [P] Add all new i18n keys to `src/_metronic/i18n/messages/en.json` (use exact values from plan.md Group E1); then copy the same keys with identical English values to `de.json`, `es.json`, `fr.json`, `ja.json`, `zh.json` in the same directory. Keys to add: `AUTH.VERIFY.*`, `AUTH.RESET.*`, `AUTH.LOCKOUT.*`, `AUTH.RATE_LIMIT.*`, `AUTH.LOGIN.*`, `AUTH.REGISTER.*`, `AUTH.FORGOT.*` (full list in plan.md)

**Checkpoint**: Foundation ready — user story phases can now begin.

---

## Phase 3: User Story 1 — New User Registration (Priority: P1) 🎯 MVP

**Goal**: A new visitor can register with email + password, is immediately logged in, and sees a persistent email verification banner.

**Independent Test**: Navigate to `/auth/registration`, submit valid details (8+ char password with letter and number), verify redirect to `/dashboard` and banner appears at top of page. Register a second time with the same email and verify a duplicate-email error is shown.

### Implementation

- [x] T006 Implement `register()` mock in `src/app/modules/auth/core/_requests.ts` using `USE_MOCK_AUTH` guard: normalise email to lowercase, check `getMockUsers()` for duplicates (throw error if found), compute `passwordHash` using `crypto.subtle.digest('SHA-256', ...)` encoded as hex, create `MockUser` with `crypto.randomUUID()` as id, `emailVerified: false`, persist via `saveMockUsers()`, return `{ data: { api_token: 'mock-' + user.id } }` as `AxiosResponse<AuthModel>`
- [x] T007 [P] [US1] Create `src/app/modules/auth/components/EmailVerificationBanner.tsx`: show only when `currentUser && !currentUser.emailVerified && !emailVerificationDismissed` (from `useAuth()`); render Bootstrap `alert alert-warning d-flex align-items-center` with Keenicon `ki-duotone ki-information fs-2 me-3`; include "Resend" button (calls a no-op `sendVerificationEmail()` then shows a brief success state), "Dismiss" button (calls `dismissEmailVerification()`); use `<FormattedMessage id='AUTH.VERIFY.BANNER_MESSAGE' />` and related keys for all text
- [x] T008 [US1] Update `src/app/modules/auth/components/Registration.tsx`: (1) replace Yup `password` min from 3 to 8 and add `.matches(/[a-zA-Z]/, ...)` and `.matches(/[0-9]/, ...)` rules; (2) update password hint text to use `intl.formatMessage({ id: 'AUTH.REGISTER.PASSWORD_HINT' })`; (3) replace all remaining hardcoded label and button strings with `intl.formatMessage()` calls using AUTH.REGISTER.* keys; (4) remove the Google and Apple social login button rows; (5) update `onSubmit` to work with the new mock `register()` which now returns a proper `AuthModel` — call `saveAuth(auth)` then `getUserByToken(auth.api_token)` then `setCurrentUser(user)`; (6) remove `acceptTerms` field and its Yup rule (not in spec)
- [x] T009 [US1] Mount `<EmailVerificationBanner />` in the authenticated layout: import it in `src/app/routing/PrivateRoutes.tsx` and render it immediately before the `<Outlet />` or `<SuspensedView>` wrapper so it appears at the top of every authenticated page

**Checkpoint**: User Story 1 complete — registration, immediate login, and email verification banner all work independently.

---

## Phase 4: User Story 2 — User Login (Priority: P1)

**Goal**: A registered user can log in with email and password; accounts lock after 5 failed attempts and auto-unlock after 15 minutes; sessions expire after 30 minutes of inactivity.

**Independent Test**: Log in with `admin@demo.com` / `demo` and verify dashboard access. Then deliberately fail login 5 times with a registered email and verify the lockout message shows the unlock time. Use devtools to shorten `TIMEOUT_MS` in `useSessionTimeout.ts` to 10000ms and verify automatic logout after inactivity.

### Implementation

- [x] T010 Add lockout logic to `login()` in `src/app/modules/auth/core/_requests.ts` using `USE_MOCK_AUTH` guard: (1) normalise email to lowercase; (2) read `LockoutRecord` from `localStorage["auth-lockout-" + email]`; (3) if `record.resetAt > Date.now()` throw a lockout error with `{ type: 'lockout', resetAt: record.resetAt }`; (4) if `resetAt <= Date.now()` reset the record; (5) look up user in `getMockUsers()`, compare `passwordHash`; (6) on mismatch: increment lockout count, if `count >= 5` set `resetAt = Date.now() + 15 * 60 * 1000`, persist record, throw credential error; (7) on match: clear lockout record, update `user.lastLoginAt`, persist, return `{ data: { api_token: 'mock-' + user.id } }`
- [x] T011 [P] [US2] Create `src/app/modules/auth/core/hooks/useSessionTimeout.ts`: accept `{ timeoutMs, onTimeout }` props; on mount attach event listeners for `['mousemove','keydown','click','scroll','touchstart']` on `window`, each resetting a `useRef` timer via `setTimeout(onTimeout, timeoutMs)`; clear the timer and remove listeners on unmount; export as default
- [x] T012 [US2] Update `src/app/modules/auth/components/Login.tsx`: (1) remove Google and Apple social button rows; (2) replace all hardcoded label, placeholder, and button strings with `intl.formatMessage()` using AUTH.LOGIN.* keys; (3) remove the demo credentials hint block; (4) update `onSubmit` catch block to detect `error.type === 'lockout'` and set a lockout status with the unlock time: `intl.formatMessage({ id: 'AUTH.LOCKOUT.UNLOCK_TIME' }, { time: new Date(error.resetAt).toLocaleTimeString() })`; show this lockout message in a `alert-danger` above the form
- [x] T013 [US2] Wire `useSessionTimeout` into `src/app/modules/auth/core/Auth.tsx`: import the hook into `AuthInit`; call `useSessionTimeout({ timeoutMs: 30 * 60 * 1000, onTimeout: logout })` inside `AuthInit` (it no-ops automatically when no auth exists since logout is idempotent)

**Checkpoint**: User Story 2 complete — login, lockout display, and session timeout all work independently.

---

## Phase 5: User Story 3 — Password Reset (Priority: P2)

**Goal**: A user can request a password reset link, receive a demo token, navigate to the reset page, set a new password, and log in with it. Requests are rate-limited to 3 per hour.

**Independent Test**: Register a user, go to `/auth/forgot-password`, enter the email, copy the displayed demo token, navigate to `/auth/reset-password?token=TOKEN`, enter a new password, confirm, submit, log in with the new password. Then request reset 4 times and verify the 4th shows a rate limit error.

### Implementation

- [x] T014 Implement `requestPassword()` mock and add `resetPassword()` export in `src/app/modules/auth/core/_requests.ts` under `USE_MOCK_AUTH` guard: **requestPassword** — normalise email; read `ResetRateLimit` from `localStorage["auth-reset-rate-" + email]`; if window still open (`Date.now() - windowStart < 3600000`) and `count >= 3` throw `{ type: 'rate_limit' }`; else update/create rate limit record; generate `token = crypto.randomUUID()`; if email exists in mock store, store `resetTokens.set(token, { email, expiresAt: Date.now() + 3600000, used: false })`; always return `{ data: { result: true, token } }` (token visible for demo); **resetPassword(token, newPassword)** — look up token in `resetTokens`, throw `{ type: 'invalid_token' }` if missing/used/expired; compute new `passwordHash`; update user in `getMockUsers()` / `saveMockUsers()`; mark token `used: true`; return `{ data: { result: true } }`
- [x] T015 [P] [US3] Create `src/app/modules/auth/components/ResetPassword.tsx`: read `token` from `useSearchParams()`; Formik form with `newPassword` and `confirmPassword` fields; Yup schema identical to Registration password rules plus `.oneOf([Yup.ref('newPassword')], ...)` for confirm; on submit call `resetPassword(token, values.newPassword)`; on success use `useNavigate()` to push `/auth/login?reset=success`; on `invalid_token` error show `alert-danger` with `<FormattedMessage id='AUTH.RESET.INVALID_TOKEN' />` and a `<Link to='/auth/forgot-password'>` using `AUTH.RESET.REQUEST_NEW`; all labels/buttons via `<FormattedMessage />`
- [x] T016 [P] [US3] Update `src/app/modules/auth/components/ForgotPassword.tsx`: (1) replace all hardcoded strings with `intl.formatMessage()` using AUTH.FORGOT.* keys; (2) update success branch to also render the demo token: `<div className='mt-3'><small className='text-muted'><FormattedMessage id='AUTH.RESET.DEMO_TOKEN_LABEL' /></small><br /><code className='text-break'>{token}</code></div>` (store `token` from response in component state); (3) add catch branch for `error.type === 'rate_limit'` to show `alert-warning` using `AUTH.RATE_LIMIT.MESSAGE`; (4) remove `setTimeout` wrapper around `requestPassword` call (not needed for mock)
- [x] T017 [US3] Add reset-password route to `src/app/modules/auth/AuthPage.tsx`: import `React.lazy(() => import('./components/ResetPassword'))` and add `<Route path='reset-password' element={<SuspensedView><ResetPasswordPage /></SuspensedView>} />` inside the existing `<Route element={<AuthLayout />}>` — or import directly if `AuthPage.tsx` uses static imports like the other auth components

**Checkpoint**: User Story 3 complete — full password reset flow works independently.

---

## Phase 6: User Story 4 — User Logout (Priority: P2)

**Goal**: Authenticated users can end their session; protected routes are inaccessible after logout.

**Independent Test**: Log in, click logout, verify redirect to `/auth/login`. Use browser back button — verify you remain on the login page rather than seeing dashboard content.

### Implementation

- [x] T018 [US4] Update `src/app/modules/auth/Logout.tsx`: replace `document.location.reload()` with `useNavigate()` from React Router — call `navigate('/auth/login', { replace: true })` after `logout()`; fix the `<Routes><Navigate ... /></Routes>` to use `<Routes><Route path='*' element={<Navigate to='/auth/login' replace />} /></Routes>` as a fallback; ensure the `useEffect` cleanup handles the case where the component unmounts before navigation
- [x] T019 [US4] Verify `src/app/routing/AppRoutes.tsx` and `src/app/routing/PrivateRoutes.tsx` — confirm unauthenticated users are redirected to `/auth` on any protected path; if `PrivateRoutes.tsx` does not already render a `<Navigate to='/auth' replace />` for unauthenticated access, add it as the fallback route

**Checkpoint**: User Story 4 complete — all four auth flows (registration, login, password reset, logout) are independently functional.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, cleanup, and i18n completeness check.

- [x] T020 [P] Review `src/app/modules/auth/components/Login.tsx` and `Registration.tsx` for any remaining hardcoded English strings not covered in T008 and T012; replace with `intl.formatMessage()` if found
- [x] T021 Run ESLint on the auth module: `npx eslint src/app/modules/auth src/_metronic/i18n --max-warnings 0` — fix any warnings before considering the feature complete
- [ ] T022 Complete manual browser verification per `specs/001-user-auth/quickstart.md` acceptance checklist: registration → banner → login → lockout → reset flow → rate limit → invalid token → inactivity timeout → logout → back button

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundation)**: Depends on Phase 1 — **BLOCKS all user stories**
- **Phase 3 (US1)**: Depends on Phase 2
- **Phase 4 (US2)**: Depends on Phase 2
- **Phase 5 (US3)**: Depends on Phase 2
- **Phase 6 (US4)**: Depends on Phase 2
- **Phase 7 (Polish)**: Depends on all user story phases

### User Story Dependencies

- **US1 (Registration)**: No dependency on other stories — can start right after Phase 2
- **US2 (Login)**: No dependency on US1 — can start right after Phase 2 (uses same mock store)
- **US3 (Password Reset)**: No dependency on US1 or US2 — can start right after Phase 2
- **US4 (Logout)**: No code dependency on other stories — verifies existing routing

### Within Each User Story (US1–US3)

- Mock function task (`_requests.ts`) → must complete before UI tasks that call it
- New component tasks marked [P] → can run in parallel with the mock task
- Layout wiring task → must follow the new component task

### Within Phase 2

- T002 → T003 (T003 imports types from _models.ts)
- T002 → T004 (T004 imports AuthModel)
- T005 [P] can run alongside T002–T004 (different files)

---

## Parallel Opportunities

### Phase 2

```
T002 → T003 → T004   (sequential, same-file dependencies)
T005                  (parallel — i18n JSON files only)
```

### Phase 3 (US1)

```
T006 (register mock)
T007 [P] (EmailVerificationBanner.tsx)   ← parallel with T006
T008 (Registration.tsx) ← after T006, T007
T009 (wire banner) ← after T007
```

### Phase 4 (US2)

```
T010 (login mock with lockout)
T011 [P] (useSessionTimeout.ts)   ← parallel with T010
T012 (Login.tsx) ← after T010, T011
T013 (wire hook) ← after T011
```

### Phase 5 (US3)

```
T014 (requestPassword + resetPassword mocks)
T015 [P] (ResetPassword.tsx)   ← parallel with T014
T016 [P] (ForgotPassword.tsx)  ← parallel with T014
T017 (AuthPage.tsx route) ← after T015
```

### Stories in Parallel (if two developers)

```
Dev A: Phase 3 (US1) → Phase 6 (US4)
Dev B: Phase 4 (US2) → Phase 5 (US3)
```

---

## Implementation Strategy

### MVP First (US1 + US2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundation — **STOP, verify types compile**
3. Complete Phase 3: US1 (Registration) — **STOP, test registration**
4. Complete Phase 4: US2 (Login) — **STOP, test login + lockout + timeout**
5. Demo this MVP — core auth is working

### Incremental Delivery

1. Foundation → US1 → Demo: "Users can register"
2. +US2 → Demo: "Users can log in securely"
3. +US3 → Demo: "Users can reset forgotten passwords"
4. +US4 → Demo: "Sessions terminate cleanly"
5. Polish → Production-ready demo

---

## Notes

- All `_requests.ts` changes are gated behind `USE_MOCK_AUTH` — real API calls are unaffected
- `[P]` tasks operate on different files and have no incomplete predecessors
- Each user story phase is independently completable without the others
- After Phase 2, stories can be worked in any order (or in parallel by two developers)
- Password hashing uses `crypto.subtle` (Web Crypto API, available in all modern browsers) — no new npm package needed
- `crypto.randomUUID()` for token/user id generation — also available natively
