import { AppError, kindFromStatus } from "@/lib/errors";
import { logger } from "@/lib/logger";
import type {
  AuthRepository,
  LoginCredentials,
  SignupData,
} from "@/services/auth/auth.types";
import { authClient } from "@/services/auth/better-auth-client";
import type { Role, User } from "@/types";

/**
 * AuthRepository backed by the app-one backend's better-auth instance.
 *
 * Thin by design: better-auth's Expo client already owns session-cookie
 * persistence (SecureStore) and re-attachment. This class only translates
 * between vendor shapes and our domain shapes:
 *  - better-auth `{ data, error }` results -> resolved value or AppError
 *  - better-auth user -> our `User`
 */

/** The user shape better-auth returns (server fields we care about). */
interface BetterAuthUser {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  role?: string | null;
  createdAt: Date | string;
  onboardingComplete?: boolean | null;
}

function toUser(raw: BetterAuthUser): User {
  return {
    id: raw.id,
    email: raw.email,
    name: raw.name,
    avatarUrl: raw.image ?? undefined,
    // Backend stores a single role string ("user" | "admin"); our domain
    // models roles as a list for forward-compat with finer-grained RBAC.
    roles: [(raw.role as Role) ?? "user"],
    createdAt:
      typeof raw.createdAt === "string"
        ? raw.createdAt
        : raw.createdAt.toISOString(),
    onboardingComplete: raw.onboardingComplete ?? undefined,
  };
}

/** better-auth's error envelope ({ data, error } results). */
interface BetterAuthError {
  status: number;
  statusText: string;
  message?: string;
  code?: string;
}

function toAppError(error: BetterAuthError): AppError {
  return new AppError({
    kind: kindFromStatus(error.status),
    status: error.status,
    message: error.message ?? error.statusText ?? "Authentication failed",
    cause: error,
  });
}

/** Unwrap a better-auth `{ data, error }` result or throw an AppError. */
function unwrap<T>(result: { data: T | null; error: BetterAuthError | null }): T {
  if (result.error) throw toAppError(result.error);
  return result.data as T;
}

export class BetterAuthAuthRepository implements AuthRepository {
  async login(credentials: LoginCredentials): Promise<User> {
    const data = unwrap(await authClient.signIn.email(credentials));
    return toUser(data.user);
  }

  async signup(data: SignupData): Promise<User> {
    const result = unwrap(await authClient.signUp.email(data));
    return toUser(result.user);
  }

  async logout(): Promise<void> {
    unwrap(await authClient.signOut());
  }

  async restoreSession(): Promise<User | null> {
    const { data, error } = await authClient.getSession();
    if (error) {
      // "Can't reach the server" at cold start is not a sign-out signal we
      // can act on here; treat it like "no session" and let the user log in.
      logger.info("auth.getSession failed", { error: error.message ?? "" });
      return null;
    }
    return data?.user ? toUser(data.user) : null;
  }

  async requestPasswordReset(email: string): Promise<void> {
    // redirectTo is resolved against the backend's web app, which hosts the
    // actual reset form (mobile deep-linking can come later).
    unwrap(
      await authClient.requestPasswordReset({
        email,
        redirectTo: "/auth/reset-password",
      }),
    );
  }

  getAuthHeaders(): Record<string, string> {
    // The Expo plugin keeps the session cookie in SecureStore; expose it so
    // the HTTP client can authenticate non-auth API calls (/api/*).
    const cookie = authClient.getCookie();
    return cookie ? { cookie } : {};
  }
}
