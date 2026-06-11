import type { AuthTokens } from "@/services/auth/auth.types";
import type { User } from "@/types";

/**
 * In-memory fake backend. This is the ONLY place that pretends to be a server.
 * It exists so the whole app — guards, stores, queries, screens — can be built
 * and demoed before a real provider is chosen. Delete nothing here when you
 * add a backend; just stop selecting it in repositories/index.ts.
 */

interface MockAccount {
  user: User;
  password: string;
}

// Seeded so you can log in immediately: demo@example.com / password123
const accounts = new Map<string, MockAccount>([
  [
    "demo@example.com",
    {
      password: "password123",
      user: {
        id: "usr_demo",
        email: "demo@example.com",
        name: "Demo User",
        roles: ["user"],
        createdAt: new Date("2024-01-01").toISOString(),
      },
    },
  ],
]);

// Maps an opaque token back to its user — stands in for server-side sessions.
const tokenToUserId = new Map<string, string>();
const ACCESS_TTL_MS = 15 * 60 * 1000; // 15 min

export const mockDb = {
  delay<T>(value: T, ms = 600): Promise<T> {
    return new Promise((resolve) => setTimeout(() => resolve(value), ms));
  },

  findByEmail(email: string): MockAccount | undefined {
    return accounts.get(email.toLowerCase());
  },

  createAccount(input: {
    name: string;
    email: string;
    password: string;
  }): MockAccount {
    const user: User = {
      id: `usr_${Math.random().toString(36).slice(2, 10)}`,
      email: input.email.toLowerCase(),
      name: input.name,
      roles: ["user"],
      createdAt: new Date().toISOString(),
    };
    const account: MockAccount = { user, password: input.password };
    accounts.set(user.email, account);
    return account;
  },

  issueTokens(userId: string): AuthTokens {
    const accessToken = `mock_access_${userId}_${Date.now()}`;
    const refreshToken = `mock_refresh_${userId}_${Math.random().toString(36).slice(2)}`;
    tokenToUserId.set(accessToken, userId);
    tokenToUserId.set(refreshToken, userId);
    return { accessToken, refreshToken, expiresAt: Date.now() + ACCESS_TTL_MS };
  },

  userForToken(token: string): User | undefined {
    const userId = tokenToUserId.get(token);
    if (!userId) return undefined;
    for (const account of accounts.values()) {
      if (account.user.id === userId) return account.user;
    }
    return undefined;
  },

  revoke(token: string): void {
    tokenToUserId.delete(token);
  },

  listUsers(): User[] {
    return Array.from(accounts.values()).map((a) => a.user);
  },
};
