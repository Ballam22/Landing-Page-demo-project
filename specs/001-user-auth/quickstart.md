# Quickstart: User Authentication System

**Feature**: 001-user-auth  
**Date**: 2026-04-12

---

## Running the Demo Locally

```bash
# From repo root
npm install
npm run dev
```

Ensure `.env` contains:
```
VITE_APP_USE_MOCK_AUTH=true
```

---

## Testing the Auth Flows

### Login (existing mock user)

Navigate to `/auth/login`.  
Use: `admin@demo.com` / `demo`  
After login you should be redirected to `/dashboard`.

### Registration (new mock user)

1. Navigate to `/auth/registration`
2. Fill in First Name, Last Name, Email (any), Password (8+ chars, mix of letters and numbers), confirm password, accept terms
3. Click Submit
4. You are immediately logged in and see the email verification banner at the top of the page
5. Click "Verify Email" or dismiss the banner

### Forgot Password / Reset

1. Navigate to `/auth/forgot-password`
2. Enter your registered email
3. The form shows a success message; in the browser console (or devtools network) you can see the generated token
4. Navigate to `/auth/reset-password?token=<TOKEN>` using that token
5. Enter your new password (8+ chars, letters + numbers)
6. On success you are redirected to `/auth/login`

### Account Lockout

1. Navigate to `/auth/login`
2. Enter a valid email (registered or `admin@demo.com`) with a wrong password
3. Repeat 5 times — on the 5th attempt the form shows the lockout message with the unlock time
4. Wait 15 minutes (or clear `auth-lockout-*` from localStorage in devtools) to unlock

### Session Inactivity

1. Log in
2. Leave the browser idle (no mouse, keyboard, clicks) for 30 minutes
3. You will be automatically logged out and redirected to `/auth/login`  
   (To test quickly: temporarily reduce `TIMEOUT_MS` in `useSessionTimeout.ts` to 10000ms)

---

## Key Files

| File | Purpose |
|------|---------|
| `src/app/modules/auth/core/_requests.ts` | All mock logic (user store, lockout, reset tokens, rate limiting) |
| `src/app/modules/auth/core/Auth.tsx` | Auth context: session state, email verification dismiss |
| `src/app/modules/auth/core/hooks/useSessionTimeout.ts` | Inactivity logout hook |
| `src/app/modules/auth/components/Login.tsx` | Login form with lockout display |
| `src/app/modules/auth/components/Registration.tsx` | Registration with post-signup redirect |
| `src/app/modules/auth/components/ForgotPassword.tsx` | Reset request with rate limit feedback |
| `src/app/modules/auth/components/ResetPassword.tsx` | New password form (token from URL) |
| `src/app/modules/auth/components/EmailVerificationBanner.tsx` | Soft verification alert |
| `src/_metronic/i18n/messages/en.json` | i18n keys (AUTH.VERIFY.*, AUTH.RESET.*, AUTH.LOCKOUT.*) |

---

## Environment Variables

| Variable | Value | Purpose |
|----------|-------|---------|
| `VITE_APP_USE_MOCK_AUTH` | `"true"` | Enables all mock auth logic |
| `VITE_APP_API_URL` | any string | Base URL (unused in mock mode) |

---

## localStorage Keys (dev inspection)

Open devtools → Application → Local Storage:

| Key | Content |
|-----|---------|
| `auth-mock-users` | JSON array of registered mock users |
| `auth-lockout-{email}` | Lockout state for a specific email |
| `auth-reset-rate-{email}` | Reset request rate limit for an email |
| `kt-auth-react-v` | Active session token |

To reset all mock state: clear localStorage and reload.
