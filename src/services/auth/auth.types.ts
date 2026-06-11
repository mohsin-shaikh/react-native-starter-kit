import type { User } from "@/types";

/**
 * Auth domain types. These are PRODUCT-level types, not vendor types.
 * Whether the backend is Supabase, Firebase, or your own API, it must be
 * mapped into these shapes at the repository boundary.
 */

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  /** Unix epoch ms when the access token expires. */
  expiresAt: number;
}

export interface AuthSession {
  user: User;
  tokens: AuthTokens;
}

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
  login(credentials: LoginCredentials): Promise<AuthSession>;
  signup(data: SignupData): Promise<AuthSession>;
  logout(refreshToken: string): Promise<void>;
  refresh(refreshToken: string): Promise<AuthTokens>;
  /** Resolve the user for an existing access token (session restore). */
  me(accessToken: string): Promise<User>;
  requestPasswordReset(email: string): Promise<void>;
}
