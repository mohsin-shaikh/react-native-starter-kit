import { AppError } from "@/lib/errors";
import type {
  AuthRepository,
  AuthSession,
  AuthTokens,
  LoginCredentials,
  SignupData,
} from "@/services/auth/auth.types";
import type { User } from "@/types";

import { mockDb } from "./mock-db";

/**
 * Dummy auth backend. Mirrors the request/response shape a real provider
 * would expose so the swap is mechanical. Throws normalized AppErrors exactly
 * as the HTTP client would, so error-handling UI is exercised end to end.
 */
export class MockAuthRepository implements AuthRepository {
  async login({ email, password }: LoginCredentials): Promise<AuthSession> {
    const account = mockDb.findByEmail(email);
    if (!account || account.password !== password) {
      throw new AppError({
        kind: "unauthorized",
        status: 401,
        message: "Invalid email or password.",
      });
    }
    const tokens = mockDb.issueTokens(account.user.id);
    return mockDb.delay({ user: account.user, tokens });
  }

  async signup(data: SignupData): Promise<AuthSession> {
    if (mockDb.findByEmail(data.email)) {
      throw new AppError({
        kind: "conflict",
        status: 409,
        message: "An account with this email already exists.",
        fields: [{ field: "email", message: "Email is already in use." }],
      });
    }
    const account = mockDb.createAccount(data);
    const tokens = mockDb.issueTokens(account.user.id);
    return mockDb.delay({ user: account.user, tokens });
  }

  async logout(refreshToken: string): Promise<void> {
    mockDb.revoke(refreshToken);
    return mockDb.delay(undefined, 200);
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const user = mockDb.userForToken(refreshToken);
    if (!user) {
      throw new AppError({
        kind: "unauthorized",
        status: 401,
        message: "Session expired.",
      });
    }
    mockDb.revoke(refreshToken); // rotate
    return mockDb.delay(mockDb.issueTokens(user.id), 300);
  }

  async me(accessToken: string): Promise<User> {
    const user = mockDb.userForToken(accessToken);
    if (!user) {
      throw new AppError({
        kind: "unauthorized",
        status: 401,
        message: "Session expired.",
      });
    }
    return mockDb.delay(user, 200);
  }

  async requestPasswordReset(_email: string): Promise<void> {
    // Always succeeds (never reveal whether an email exists).
    return mockDb.delay(undefined, 400);
  }
}
