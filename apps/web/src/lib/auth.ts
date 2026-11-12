/**
 * QuantVanguard Public Authentication & Session Management
 * Built using standard Web Crypto API for maximum portability across Node.js & Edge runtimes.
 */

import { UserSessionDto } from './types';

export interface StoredUserAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  isDemoUser: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  token: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
}

// In-Memory Multi-User Account and Session Store
interface AuthStoreState {
  users: Map<string, StoredUserAccount>; // email -> user
  usersById: Map<string, StoredUserAccount>; // id -> user
  sessions: Map<string, AuthSession>; // token -> session
}

const globalForAuth = globalThis as unknown as {
  quantvanguardAuthStore?: AuthStoreState;
};

if (!globalForAuth.quantvanguardAuthStore) {
  globalForAuth.quantvanguardAuthStore = {
    users: new Map(),
    usersById: new Map(),
    sessions: new Map(),
  };

  // Seed demo recruiter account
  const demoRecruiter: StoredUserAccount = {
    id: 'demo-user-recruiter-uuid',
    name: 'Recruiter Guest Portfolio',
    email: 'recruiter-demo@quantvanguard.internal',
    passwordHash: 'demo-password-hash',
    isDemoUser: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  globalForAuth.quantvanguardAuthStore.users.set(demoRecruiter.email, demoRecruiter);
  globalForAuth.quantvanguardAuthStore.usersById.set(demoRecruiter.id, demoRecruiter);

  // Seed demo recruiter tokens
  const demoSessionRecruiter: AuthSession = {
    token: 'demo-session-token-recruiter',
    userId: demoRecruiter.id,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
  };
  const demoSessionGeneric: AuthSession = {
    token: 'demo-session-token',
    userId: demoRecruiter.id,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
  };

  globalForAuth.quantvanguardAuthStore.sessions.set(demoSessionRecruiter.token, demoSessionRecruiter);
  globalForAuth.quantvanguardAuthStore.sessions.set(demoSessionGeneric.token, demoSessionGeneric);
}

const authStore = globalForAuth.quantvanguardAuthStore;

/**
 * SHA-256 Password Hash helper using Web Crypto API.
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + ':qv-salt-2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Register a new public user.
 */
export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<{ user: UserSessionDto; token: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  if (authStore.users.has(normalizedEmail)) {
    throw new Error('Email sudah terdaftar. Silakan gunakan email lain atau langsung masuk.');
  }

  if (password.length < 6) {
    throw new Error('Kata sandi harus minimal 6 karakter.');
  }

  const userId = `user-${crypto.randomUUID()}`;
  const passwordHash = await hashPassword(password);
  const now = new Date().toISOString();

  const userAccount: StoredUserAccount = {
    id: userId,
    name: name.trim() || 'Investor Baru',
    email: normalizedEmail,
    passwordHash,
    isDemoUser: false,
    createdAt: now,
    updatedAt: now,
  };

  authStore.users.set(normalizedEmail, userAccount);
  authStore.usersById.set(userId, userAccount);

  const token = `qv-usr-${crypto.randomUUID().replace(/-/g, '')}`;
  const session: AuthSession = {
    token,
    userId,
    createdAt: now,
    expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
  };
  authStore.sessions.set(token, session);

  return {
    user: {
      id: userAccount.id,
      name: userAccount.name,
      email: userAccount.email,
      isDemoUser: false,
      createdAt: userAccount.createdAt,
    },
    token,
  };
}

/**
 * Login existing user.
 */
export async function loginUser(
  email: string,
  password: string
): Promise<{ user: UserSessionDto; token: string }> {
  const normalizedEmail = email.trim().toLowerCase();

  // Allow instant demo login shortcut
  if (normalizedEmail === 'demo' || normalizedEmail === 'recruiter-demo@quantvanguard.internal') {
    return {
      user: {
        id: 'demo-user-recruiter-uuid',
        name: 'Recruiter Guest Portfolio',
        email: 'recruiter-demo@quantvanguard.internal',
        isDemoUser: true,
      },
      token: 'demo-session-token-recruiter',
    };
  }

  const user = authStore.users.get(normalizedEmail);
  if (!user) {
    throw new Error('Akun dengan email ini belum terdaftar.');
  }

  const hash = await hashPassword(password);
  if (user.passwordHash !== hash) {
    throw new Error('Kata sandi salah. Silakan coba lagi.');
  }

  const token = `qv-usr-${crypto.randomUUID().replace(/-/g, '')}`;
  const now = new Date().toISOString();
  authStore.sessions.set(token, {
    token,
    userId: user.id,
    createdAt: now,
    expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      isDemoUser: user.isDemoUser,
      createdAt: user.createdAt,
    },
    token,
  };
}

/**
 * Verify token and return user if valid.
 */
export function verifySessionToken(token: string): UserSessionDto | null {
  if (!token) return null;

  // Recruiter demo tokens are always valid
  if (token === 'demo-session-token' || token === 'demo-session-token-recruiter') {
    return {
      id: 'demo-user-recruiter-uuid',
      name: 'Recruiter Guest Portfolio',
      email: 'recruiter-demo@quantvanguard.internal',
      isDemoUser: true,
    };
  }

  const session = authStore.sessions.get(token);
  if (!session) return null;

  if (new Date(session.expiresAt) < new Date()) {
    authStore.sessions.delete(token);
    return null;
  }

  const user = authStore.usersById.get(session.userId);
  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    isDemoUser: user.isDemoUser,
    createdAt: user.createdAt,
  };
}

/**
 * Invalidate session token.
 */
export function logoutSession(token: string): boolean {
  if (token === 'demo-session-token' || token === 'demo-session-token-recruiter') {
    return true;
  }
  return authStore.sessions.delete(token);
}
