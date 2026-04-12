import axios, { AxiosResponse } from "axios";
import { AuthModel, LockoutRecord, MockUser, ResetRateLimit, ResetToken, UserModel } from "./_models";

const API_URL = import.meta.env.VITE_APP_API_URL;
const USE_MOCK_AUTH = import.meta.env.VITE_APP_USE_MOCK_AUTH === "true";

/** Mock token used for local dev when `VITE_APP_USE_MOCK_AUTH` is enabled. */
const MOCK_API_TOKEN = "metronic-local-mock-token";

const MOCK_DEMO_USER: UserModel = {
  id: 1,
  username: "demo",
  password: undefined,
  email: "admin@demo.com",
  first_name: "Demo",
  last_name: "User",
  fullname: "Demo User",
  occupation: "Developer",
  companyName: "Keenthemes",
  phone: "5000000000",
  roles: [1],
  pic: "media/avatars/300-3.jpg",
  language: "en",
};

const isMockDemoLogin = (email: string, password: string) =>
  email === "admin@demo.com" && password === "demo";

const MOCK_USERS_KEY = "auth-mock-users";

export function getMockUsers(): MockUser[] {
  try {
    const raw = localStorage.getItem(MOCK_USERS_KEY);
    return raw ? (JSON.parse(raw) as MockUser[]) : [];
  } catch {
    return [];
  }
}

export function saveMockUsers(users: MockUser[]): void {
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
}

export const resetTokens = new Map<string, ResetToken>();

export const GET_USER_BY_ACCESSTOKEN_URL = `${API_URL}/verify_token`;
export const LOGIN_URL = `${API_URL}/login`;
export const REGISTER_URL = `${API_URL}/register`;
export const REQUEST_PASSWORD_URL = `${API_URL}/forgot_password`;

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const LOCKOUT_MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

function getLockoutRecord(email: string): LockoutRecord | null {
  try {
    const raw = localStorage.getItem(`auth-lockout-${email}`);
    return raw ? (JSON.parse(raw) as LockoutRecord) : null;
  } catch {
    return null;
  }
}

function saveLockoutRecord(email: string, record: LockoutRecord): void {
  localStorage.setItem(`auth-lockout-${email}`, JSON.stringify(record));
}

function clearLockoutRecord(email: string): void {
  localStorage.removeItem(`auth-lockout-${email}`);
}

// Server should return AuthModel
export async function login(
  email: string,
  password: string
): Promise<AxiosResponse<AuthModel>> {
  if (USE_MOCK_AUTH) {
    const normEmail = email.toLowerCase();

    // Check lockout
    const lockout = getLockoutRecord(normEmail);
    if (lockout && lockout.resetAt > Date.now()) {
      return Promise.reject({
        type: "lockout",
        message: "Account is temporarily locked.",
        resetAt: lockout.resetAt,
      });
    }
    if (lockout && lockout.resetAt <= Date.now()) {
      clearLockoutRecord(normEmail);
    }

    // Demo admin user shortcut
    if (isMockDemoLogin(normEmail, password)) {
      clearLockoutRecord(normEmail);
      const data: AuthModel = { api_token: MOCK_API_TOKEN };
      return { data } as AxiosResponse<AuthModel>;
    }

    // Look up registered mock user
    const users = getMockUsers();
    const user = users.find((u) => u.email === normEmail);

    if (user) {
      const passwordHash = await hashPassword(password);
      if (user.passwordHash === passwordHash) {
        clearLockoutRecord(normEmail);
        const updated = users.map((u) =>
          u.id === user.id ? { ...u, lastLoginAt: Date.now() } : u
        );
        saveMockUsers(updated);
        const data: AuthModel = { api_token: `mock-${user.id}` };
        return { data } as AxiosResponse<AuthModel>;
      }
    }

    // Failed attempt — increment lockout
    const existing = getLockoutRecord(normEmail) ?? { count: 0, resetAt: 0 };
    const newCount = existing.count + 1;
    const newRecord: LockoutRecord =
      newCount >= LOCKOUT_MAX_ATTEMPTS
        ? { count: newCount, resetAt: Date.now() + LOCKOUT_DURATION_MS }
        : { count: newCount, resetAt: 0 };
    saveLockoutRecord(normEmail, newRecord);

    if (newCount >= LOCKOUT_MAX_ATTEMPTS) {
      return Promise.reject({
        type: "lockout",
        message: "Account is temporarily locked.",
        resetAt: newRecord.resetAt,
      });
    }

    return Promise.reject({
      type: "invalid_credentials",
      message: "The login details are incorrect.",
    });
  }

  return axios.post<AuthModel>(LOGIN_URL, { email, password });
}

// Server should return AuthModel
export async function register(
  email: string,
  firstname: string,
  lastname: string,
  password: string,
  password_confirmation: string
): Promise<AxiosResponse<AuthModel>> {
  if (USE_MOCK_AUTH) {
    const normEmail = email.toLowerCase();
    const users = getMockUsers();
    if (users.some((u) => u.email === normEmail)) {
      return Promise.reject({
        type: "duplicate_email",
        message: "An account with this email already exists.",
      });
    }
    const passwordHash = await hashPassword(password);
    const newUser: MockUser = {
      id: crypto.randomUUID(),
      email: normEmail,
      firstName: firstname,
      lastName: lastname,
      passwordHash,
      emailVerified: false,
      createdAt: Date.now(),
      lastLoginAt: null,
    };
    saveMockUsers([...users, newUser]);
    const data: AuthModel = { api_token: `mock-${newUser.id}` };
    return { data } as AxiosResponse<AuthModel>;
  }
  return axios.post<AuthModel>(REGISTER_URL, {
    email,
    first_name: firstname,
    last_name: lastname,
    password,
    password_confirmation,
  });
}

const RESET_RATE_LIMIT_MAX = 3;
const RESET_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

function getResetRateLimit(email: string): ResetRateLimit | null {
  try {
    const raw = localStorage.getItem(`auth-reset-rate-${email}`);
    return raw ? (JSON.parse(raw) as ResetRateLimit) : null;
  } catch {
    return null;
  }
}

function saveResetRateLimit(email: string, record: ResetRateLimit): void {
  localStorage.setItem(`auth-reset-rate-${email}`, JSON.stringify(record));
}

// Server should return object => { result: boolean } (Is Email in DB)
export async function requestPassword(
  email: string
): Promise<AxiosResponse<{ result: boolean; token?: string }>> {
  if (USE_MOCK_AUTH) {
    const normEmail = email.toLowerCase();

    // Check rate limit
    const rateLimit = getResetRateLimit(normEmail);
    if (
      rateLimit &&
      Date.now() - rateLimit.windowStart < RESET_RATE_LIMIT_WINDOW_MS &&
      rateLimit.count >= RESET_RATE_LIMIT_MAX
    ) {
      return Promise.reject({ type: "rate_limit", message: "Too many reset requests." });
    }

    // Update rate limit record
    if (!rateLimit || Date.now() - rateLimit.windowStart >= RESET_RATE_LIMIT_WINDOW_MS) {
      saveResetRateLimit(normEmail, { count: 1, windowStart: Date.now() });
    } else {
      saveResetRateLimit(normEmail, { ...rateLimit, count: rateLimit.count + 1 });
    }

    // Generate token
    const token = crypto.randomUUID();
    const users = getMockUsers();
    if (users.some((u) => u.email === normEmail)) {
      resetTokens.set(token, {
        email: normEmail,
        expiresAt: Date.now() + RESET_RATE_LIMIT_WINDOW_MS,
        used: false,
      });
    }

    return { data: { result: true, token } } as AxiosResponse<{ result: boolean; token?: string }>;
  }

  return axios.post<{ result: boolean }>(REQUEST_PASSWORD_URL, { email });
}

export async function resetPassword(
  token: string,
  newPassword: string
): Promise<AxiosResponse<{ result: boolean }>> {
  if (USE_MOCK_AUTH) {
    const tokenRecord = resetTokens.get(token);
    if (!tokenRecord || tokenRecord.used || tokenRecord.expiresAt < Date.now()) {
      return Promise.reject({ type: "invalid_token", message: "Reset link is invalid or expired." });
    }

    const passwordHash = await hashPassword(newPassword);
    const users = getMockUsers();
    const updated = users.map((u) =>
      u.email === tokenRecord.email ? { ...u, passwordHash } : u
    );
    saveMockUsers(updated);
    resetTokens.set(token, { ...tokenRecord, used: true });

    return { data: { result: true } } as AxiosResponse<{ result: boolean }>;
  }

  return axios.post<{ result: boolean }>(`${API_URL}/reset_password`, { token, password: newPassword });
}

export function getUserByToken(token: string) {
  if (USE_MOCK_AUTH) {
    if (token === MOCK_API_TOKEN) {
      return Promise.resolve({ data: { ...MOCK_DEMO_USER } } as AxiosResponse<UserModel>);
    }
    if (token.startsWith("mock-")) {
      const id = token.slice(5);
      const users = getMockUsers();
      const mockUser = users.find((u) => u.id === id);
      if (mockUser) {
        const userModel: UserModel = {
          id: 0,
          username: mockUser.email,
          password: undefined,
          email: mockUser.email,
          first_name: mockUser.firstName,
          last_name: mockUser.lastName,
          fullname: `${mockUser.firstName} ${mockUser.lastName}`,
          emailVerified: mockUser.emailVerified,
        };
        return Promise.resolve({ data: userModel } as AxiosResponse<UserModel>);
      }
    }
  }
  return axios.post<UserModel>(GET_USER_BY_ACCESSTOKEN_URL, {
    api_token: token,
  });
}
