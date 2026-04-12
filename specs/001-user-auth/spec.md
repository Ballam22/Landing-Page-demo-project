# Feature Specification: User Authentication System

**Feature Branch**: `001-user-auth`  
**Created**: 2026-04-12  
**Status**: Draft  
**Input**: User description: "Add a user authentication system with login, registration and password reset"

## Clarifications

### Session 2026-04-12

- Q: Does user registration require email verification before the account becomes active? → A: Soft verification — account is immediately active after registration, but a persistent banner prompts the user to verify their email address.
- Q: How should a locked account (after 5 failed login attempts) be unlocked? → A: Auto-unlock after the lockout window (15 minutes) expires — no user or admin action required.
- Q: Should login offer a "remember me" option to extend session duration across browser sessions? → A: No — all sessions use the standard 30-minute inactivity timeout; no persistent "remember me" option.
- Q: Should password reset requests be rate-limited per email address? → A: Yes — maximum 3 reset emails per email address per hour.
- Q: Is multi-factor authentication (MFA/2FA) in scope for this feature? → A: Explicitly out of scope — MFA is not part of this feature, but the system must be designed to allow MFA to be added in a future iteration without requiring a rebuild of the authentication layer.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - New User Registration (Priority: P1)

A new visitor wants to create an account so they can access the application. They provide their name, email address, and a password. The system validates their input, creates their account, and confirms registration.

**Why this priority**: Without the ability to create accounts, no other auth flows are possible. This is the entry point for all users.

**Independent Test**: Can be fully tested by completing the registration form with valid data and verifying the user can subsequently log in, delivering a working account creation flow.

**Acceptance Scenarios**:

1. **Given** a visitor is on the registration page, **When** they submit a valid name, email, and password, **Then** their account is created, they are immediately logged in, and a persistent banner prompts them to verify their email address.
2. **Given** a visitor submits a registration form, **When** the email address is already associated with an existing account, **Then** the system displays an error and does not create a duplicate account.
3. **Given** a visitor submits a registration form, **When** required fields are missing or the email format is invalid, **Then** the system highlights the specific errors before submission is processed.
4. **Given** a visitor submits a registration form, **When** the password does not meet minimum security requirements, **Then** the system explains the requirements and prevents account creation.

---

### User Story 2 - User Login (Priority: P1)

A registered user wants to access their account by providing their email and password. After successful verification, they are granted access to protected areas of the application.

**Why this priority**: Login is the primary recurring interaction for all existing users and gates access to the entire application.

**Independent Test**: Can be fully tested by logging in with valid credentials and verifying access to a protected page, delivering a complete authentication flow.

**Acceptance Scenarios**:

1. **Given** a registered user is on the login page, **When** they enter their correct email and password, **Then** they are authenticated and redirected to the application.
2. **Given** a user enters incorrect credentials, **When** they submit the login form, **Then** they receive a clear error message without revealing which field (email or password) was incorrect.
3. **Given** a user fails login multiple times, **When** they exceed the maximum allowed attempts within a time window, **Then** further login attempts are temporarily blocked to prevent brute-force attacks.
4. **Given** an authenticated user is inactive for an extended period, **When** they attempt an action requiring authentication, **Then** their session has expired and they are prompted to log in again.

---

### User Story 3 - Password Reset (Priority: P2)

A registered user has forgotten their password. They request a reset link via their email address. After clicking the link, they can set a new password and regain access to their account.

**Why this priority**: Password reset reduces user lockouts and support burden. It is critical for long-term retention but does not block initial access.

**Independent Test**: Can be fully tested by requesting a reset for an existing account, following the emailed link, setting a new password, and logging in successfully.

**Acceptance Scenarios**:

1. **Given** a user on the password reset request page, **When** they enter a registered email and submit, **Then** a time-limited reset link is sent to that email address.
2. **Given** a user clicks a valid, unexpired reset link, **When** they enter and confirm a new password meeting security requirements, **Then** their password is updated and the link is invalidated.
3. **Given** a user clicks an expired or already-used reset link, **When** they attempt to set a new password, **Then** they are informed the link is no longer valid and are prompted to request a new one.
4. **Given** a user requests a password reset for an email not in the system, **When** the form is submitted, **Then** the system responds as if the email existed (to prevent user enumeration) and no reset email is sent.

---

### User Story 4 - User Logout (Priority: P2)

An authenticated user wants to end their session securely, ensuring no one else can access their account from the same device.

**Why this priority**: Secure logout is essential for shared devices and security hygiene, though it does not block primary access flows.

**Independent Test**: Can be tested by logging in, performing logout, and confirming that protected pages are no longer accessible without re-authenticating.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** they choose to log out, **Then** their session is terminated and they are redirected to the login page.
2. **Given** a logged-out user, **When** they attempt to navigate to a protected page using the browser back button, **Then** they are redirected to the login page rather than seeing protected content.

---

### Edge Cases

- What happens when a user tries to register with an email that has a different letter case (e.g., `User@Example.com` vs `user@example.com`)? Email addresses should be treated case-insensitively.
- How does the system handle simultaneous login attempts from multiple devices for the same account?
- What happens when a password reset email is requested multiple times in quick succession? Only the most recent link is valid; requests are rate-limited to 3 per email address per hour, after which the user is asked to wait.
- How does the system behave when a user's account is in a locked state? The account auto-unlocks after the 15-minute lockout window; the user is shown the remaining wait time on the login page.
- What happens if the user's email provider delays delivery of the reset email — is there a resend option?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow any visitor to create a new account by providing a unique email address, first name, last name, and a password. The account is immediately active upon creation.
- **FR-001a**: System MUST display a persistent banner to newly registered users prompting them to verify their email address. The banner MUST remain visible until the user verifies their email or explicitly dismisses it.
- **FR-001b**: System SHOULD send a verification email upon registration containing a link the user can click to confirm ownership of their email address. Verification is optional — it does not block account access. *(Mock mode: email delivery is simulated; the banner's "Resend" button is a no-op placeholder.)*
- **FR-002**: System MUST validate that email addresses are correctly formatted and unique across all accounts.
- **FR-003**: System MUST enforce a minimum password strength policy (at least 8 characters, mixing letters and numbers).
- **FR-004**: System MUST allow registered users to log in using their email address and password.
- **FR-005**: System MUST provide clear, non-specific error messages on login failure to prevent revealing which credential was wrong.
- **FR-006**: System MUST temporarily lock an account after 5 failed login attempts since the last successful login or since the previous lockout expired. The account MUST automatically unlock once the 15-minute lockout period has elapsed, with no user or admin action required. The user MUST be informed their account is temporarily locked and told when it will unlock. *(The attempt counter resets on successful login or when the lockout period expires — no separate rolling time window applies to the attempt count.)*
- **FR-007**: System MUST allow users to request a password reset by providing their registered email address.
- **FR-008**: System MUST send a password reset link to the user's email that expires after 1 hour.
- **FR-009**: System MUST invalidate a password reset link immediately after it is used successfully.
- **FR-009a**: System MUST limit password reset emails to a maximum of 3 requests per email address per hour. When the limit is reached, the system MUST inform the user to wait before requesting again (without revealing whether the email is registered).
- **FR-010**: System MUST allow users to log out and fully terminate their active session.
- **FR-011**: System MUST protect all application routes that require authentication, redirecting unauthenticated users to the login page.
- **FR-012**: System MUST automatically expire user sessions after 30 minutes of inactivity. There is no "remember me" option — all sessions are subject to the same inactivity timeout regardless of device or user preference.
- **FR-013**: System MUST treat email addresses as case-insensitive during all authentication operations.
- **FR-014**: System MUST respond identically to password reset requests for both registered and unregistered emails (to prevent user enumeration).

### Key Entities

- **User**: Represents a registered person. Key attributes: unique identifier, first name, last name, email address (unique, case-insensitive), hashed password, email verified flag, creation date, last login date.
- **Session**: Represents an active authenticated session. In mock mode, implemented as an API token stored in `localStorage` (`kt-auth-react-v`); inactivity is tracked in-memory via the `useSessionTimeout` hook. Key attributes: token value, associated user, last activity timestamp.
- **Password Reset Token**: Represents a single-use, time-limited credential for resetting a password. Key attributes: unique token value, associated user, creation timestamp, expiry timestamp, used status.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete the registration process in under 2 minutes from landing on the registration page to receiving account confirmation.
- **SC-002**: Users can log in successfully in under 30 seconds under normal conditions.
- **SC-003**: Users can request and complete a password reset (from request to new password set) in under 5 minutes, assuming prompt email delivery.
- **SC-004**: 95% of users successfully complete registration on their first attempt without encountering confusing errors.
- **SC-005**: Zero accounts are accessible after a user explicitly logs out, verified by attempting access to protected resources without re-authentication.
- **SC-006**: No user account information is exposed through error messages or system responses (zero enumeration vulnerabilities).
- **SC-007**: Account lockout engages within 5 failed attempts, protecting against brute-force access.

## Assumptions

- Users have access to a valid email address they can receive messages from (required for registration and password reset).
- The application is a web-based system accessible via a standard browser; native mobile apps are out of scope for this feature.
- Email delivery for password resets relies on an existing or separately configured email sending capability; that capability is not part of this feature's scope.
- Social login (e.g., Google, GitHub) is out of scope for this feature; only email/password authentication is required.
- Multi-factor authentication (MFA/2FA) is out of scope for this feature. However, the authentication layer must be designed to accommodate MFA as a future addition without requiring a full rebuild.
- There is no existing authentication system to migrate from; this is a greenfield implementation.
- User roles and permissions beyond basic authentication (e.g., admin vs. standard user) are out of scope for this feature.
- The application has a single user type; multi-tenant or organisation-level access control is not required.
