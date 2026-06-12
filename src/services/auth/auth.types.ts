import type { User } from "@/types";

/**
 * Auth domain types. These are PRODUCT-level types, not vendor types.
 * Whether the backend is better-auth, Supabase, or Firebase, it must be
 * mapped into these shapes at the repository boundary.
 *
 * Note the contract is SESSION-based, not token-based: the repository owns
 * whatever credential persistence its backend needs (better-auth's Expo
 * plugin keeps a session cookie in SecureStore; the mock keeps an opaque
 * session token). Nothing above this layer ever sees a token.
 */

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
}

/** What a backend implementation must provide. See repositories/types.ts. */
export interface AuthRepository {
  login(credentials: LoginCredentials): Promise<User>;
  signup(data: SignupData): Promise<User>;
  logout(): Promise<void>;
  /**
   * Cold-start: resolve the user for a previously persisted session.
   * Returns null when there is no (valid) session — never throws for the
   * ordinary "not signed in" case.
   */
  restoreSession(): Promise<User | null>;
  requestPasswordReset(email: string): Promise<void>;
  /**
   * Headers that authenticate API requests against this backend
   * (better-auth: the session cookie). Synchronous because the HTTP client
   * calls it on every request.
   */
  getAuthHeaders(): Record<string, string>;
}
