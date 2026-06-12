import type { Organization, User } from "@/types";

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

// Maps an opaque session token back to its user — stands in for server-side
// sessions (the mock equivalent of better-auth's session cookie).
const tokenToUserId = new Map<string, string>();

// The tenants the demo user belongs to (an accounting app is multi-tenant).
const organizations: Organization[] = [
  { id: "org_acme", name: "Acme Traders" },
  { id: "org_globex", name: "Globex Pvt Ltd" },
  { id: "org_initech", name: "Initech LLP" },
];

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

  issueSessionToken(userId: string): string {
    // The user id is embedded (dot-separated) so a token persisted in
    // SecureStore can survive an app restart even though this map is
    // in-memory — see userForToken's fallback.
    const token = `mock_session.${userId}.${Math.random().toString(36).slice(2)}`;
    tokenToUserId.set(token, userId);
    return token;
  },

  userForToken(token: string): User | undefined {
    // Fallback to the id embedded in the token: after a cold start the map is
    // empty, but seeded accounts (demo@example.com) should still restore.
    const userId = tokenToUserId.get(token) ?? token.split(".")[1];
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

  listOrganizations(): Organization[] {
    return [...organizations];
  },

  createOrganization(name: string): Organization {
    const org: Organization = {
      id: `org_${Math.random().toString(36).slice(2, 10)}`,
      name,
    };
    organizations.push(org);
    return org;
  },
};
