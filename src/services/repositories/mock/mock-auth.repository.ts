import { STORAGE_KEYS } from "@/constants";
import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import type {
  AuthRepository,
  LoginCredentials,
  SignupData,
} from "@/services/auth/auth.types";
import { secureStorage } from "@/services/storage/secure-storage";
import type { User } from "@/types";

import { mockDb } from "./mock-db";

/**
 * Dummy auth backend. Mirrors the session-based contract the better-auth
 * repository implements so the swap is mechanical: one opaque session token,
 * persisted in SecureStore by this class (better-auth's Expo plugin does the
 * same with its session cookie). Throws normalized AppErrors so
 * error-handling UI is exercised end to end.
 */
export class MockAuthRepository implements AuthRepository {
  private sessionToken: string | null = null;

  private async startSession(userId: string): Promise<void> {
    this.sessionToken = mockDb.issueSessionToken(userId);
    await secureStorage.setItem(STORAGE_KEYS.MOCK_SESSION, this.sessionToken);
  }

  private async endSession(): Promise<void> {
    if (this.sessionToken) mockDb.revoke(this.sessionToken);
    this.sessionToken = null;
    await secureStorage.removeItem(STORAGE_KEYS.MOCK_SESSION);
  }

  async login({ email, password }: LoginCredentials): Promise<User> {
    const account = mockDb.findByEmail(email);
    if (!account || account.password !== password) {
      throw new AppError({
        kind: "unauthorized",
        status: 401,
        message: "Invalid email or password.",
      });
    }
    await this.startSession(account.user.id);
    return mockDb.delay(account.user);
  }

  async signup(data: SignupData): Promise<User> {
    if (mockDb.findByEmail(data.email)) {
      throw new AppError({
        kind: "conflict",
        status: 409,
        message: "An account with this email already exists.",
        fields: [{ field: "email", message: "Email is already in use." }],
      });
    }
    const account = mockDb.createAccount(data);
    await this.startSession(account.user.id);
    return mockDb.delay(account.user);
  }

  async logout(): Promise<void> {
    await this.endSession();
    return mockDb.delay(undefined, 200);
  }

  async restoreSession(): Promise<User | null> {
    const token = await secureStorage.getItem(STORAGE_KEYS.MOCK_SESSION);
    if (!token) return null;
    const user = mockDb.userForToken(token);
    if (!user) {
      logger.info("mockAuth.restoreSession: stale session token");
      await secureStorage.removeItem(STORAGE_KEYS.MOCK_SESSION);
      return null;
    }
    this.sessionToken = token;
    return mockDb.delay(user, 200);
  }

  async requestPasswordReset(_email: string): Promise<void> {
    // Always succeeds (never reveal whether an email exists).
    return mockDb.delay(undefined, 400);
  }

  getAuthHeaders(): Record<string, string> {
    return this.sessionToken
      ? { Authorization: `Bearer ${this.sessionToken}` }
      : {};
  }
}
