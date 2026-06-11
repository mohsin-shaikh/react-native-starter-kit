import { STORAGE_KEYS, TOKEN_REFRESH_THRESHOLD_MS } from "@/constants";
import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { repositories } from "@/services/repositories";
import { secureStorage } from "@/services/storage/secure-storage";
import type { User } from "@/types";

import type {
  AuthSession,
  AuthTokens,
  LoginCredentials,
  SignupData,
} from "./auth.types";

/**
 * Auth service: the orchestration layer between the auth STORE (UI state) and
 * the auth REPOSITORY (backend). It owns one thing the store must never touch:
 * token persistence in SecureStore.
 *
 * Responsibilities:
 *  - call the repository for login/signup/logout/refresh
 *  - persist/clear tokens in the Keychain/Keystore
 *  - restore a session on cold start
 *  - hand a *valid* (auto-refreshed) access token to the HTTP client
 *
 * It holds the tokens in memory too, so the synchronous-ish token provider
 * path is fast and SecureStore is the source of truth across launches.
 */
class AuthService {
  private tokens: AuthTokens | null = null;
  /** De-dupes concurrent refreshes into a single in-flight promise. */
  private refreshInFlight: Promise<AuthTokens> | null = null;

  // ----- token persistence -------------------------------------------------

  private async persist(tokens: AuthTokens): Promise<void> {
    this.tokens = tokens;
    await Promise.all([
      secureStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken),
      secureStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken),
      secureStorage.setItem(
        `${STORAGE_KEYS.ACCESS_TOKEN}.expiresAt`,
        String(tokens.expiresAt),
      ),
    ]);
  }

  private async loadTokens(): Promise<AuthTokens | null> {
    const [accessToken, refreshToken, expiresAt] = await Promise.all([
      secureStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
      secureStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
      secureStorage.getItem(`${STORAGE_KEYS.ACCESS_TOKEN}.expiresAt`),
    ]);
    if (!accessToken || !refreshToken) return null;
    return { accessToken, refreshToken, expiresAt: Number(expiresAt ?? 0) };
  }

  async clearTokens(): Promise<void> {
    this.tokens = null;
    await Promise.all([
      secureStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN),
      secureStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
      secureStorage.removeItem(`${STORAGE_KEYS.ACCESS_TOKEN}.expiresAt`),
    ]);
  }

  // ----- auth operations ---------------------------------------------------

  async login(credentials: LoginCredentials): Promise<AuthSession> {
    const session = await repositories.auth.login(credentials);
    await this.persist(session.tokens);
    return session;
  }

  async signup(data: SignupData): Promise<AuthSession> {
    const session = await repositories.auth.signup(data);
    await this.persist(session.tokens);
    return session;
  }

  async logout(): Promise<void> {
    try {
      if (this.tokens) await repositories.auth.logout(this.tokens.refreshToken);
    } catch (error) {
      // Logout must always succeed locally even if the server call fails.
      logger.warn("auth.logout server call failed", { error: String(error) });
    } finally {
      await this.clearTokens();
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    await repositories.auth.requestPasswordReset(email);
  }

  /**
   * Cold-start session restore. Returns the user if a valid session exists,
   * otherwise null. Tries a refresh when the access token is expired.
   */
  async restoreSession(): Promise<User | null> {
    const stored = await this.loadTokens();
    if (!stored) return null;
    this.tokens = stored;

    try {
      const accessToken = await this.getValidAccessToken();
      if (!accessToken) return null;
      return await repositories.auth.me(accessToken);
    } catch (error) {
      logger.info("auth.restoreSession failed", { error: String(error) });
      await this.clearTokens();
      return null;
    }
  }

  /** Force a refresh now (used by the store's `refreshSession`). */
  async refresh(): Promise<AuthTokens> {
    if (!this.tokens) {
      throw new AppError({
        kind: "unauthorized",
        message: "No session to refresh.",
      });
    }
    if (this.refreshInFlight) return this.refreshInFlight;

    this.refreshInFlight = repositories.auth
      .refresh(this.tokens.refreshToken)
      .then(async (tokens) => {
        await this.persist(tokens);
        return tokens;
      })
      .finally(() => {
        this.refreshInFlight = null;
      });

    return this.refreshInFlight;
  }

  // ----- token provider (consumed by the HTTP client) ----------------------

  /** Returns a non-expired access token, refreshing proactively if needed. */
  async getValidAccessToken(): Promise<string | null> {
    if (!this.tokens) return null;
    const expiringSoon =
      this.tokens.expiresAt - Date.now() < TOKEN_REFRESH_THRESHOLD_MS;
    if (expiringSoon) {
      try {
        const tokens = await this.refresh();
        return tokens.accessToken;
      } catch {
        return null;
      }
    }
    return this.tokens.accessToken;
  }
}

export const authService = new AuthService();
