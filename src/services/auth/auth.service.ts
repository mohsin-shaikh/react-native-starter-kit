import { logger } from "@/lib/logger";
import { repositories } from "@/services/repositories";
import type { User } from "@/types";

import type { LoginCredentials, SignupData } from "./auth.types";

/**
 * Auth service: the single entry point the store and queries use for auth
 * operations. With a session-based backend (better-auth) this is a thin
 * facade — credential persistence lives inside the repository (the Expo
 * plugin's SecureStore cookie for better-auth, an opaque token for the mock),
 * so there is no token machinery to orchestrate here anymore.
 */
class AuthService {
  login(credentials: LoginCredentials): Promise<User> {
    return repositories.auth.login(credentials);
  }

  signup(data: SignupData): Promise<User> {
    return repositories.auth.signup(data);
  }

  async logout(): Promise<void> {
    try {
      await repositories.auth.logout();
    } catch (error) {
      // Logout must always succeed locally even if the server call fails.
      logger.warn("auth.logout server call failed", { error: String(error) });
    }
  }

  /**
   * Cold-start session restore (or re-sync after a server-side change).
   * Returns the user if a valid session exists, otherwise null.
   */
  restoreSession(): Promise<User | null> {
    return repositories.auth.restoreSession();
  }

  requestPasswordReset(email: string): Promise<void> {
    return repositories.auth.requestPasswordReset(email);
  }

  /** Headers that authenticate API requests (consumed by the HTTP client). */
  getAuthHeaders(): Record<string, string> {
    return repositories.auth.getAuthHeaders();
  }
}

export const authService = new AuthService();
