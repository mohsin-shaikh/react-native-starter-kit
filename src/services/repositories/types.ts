import type { AuthRepository } from "@/services/auth/auth.types";
import type { Organization, Paginated, User } from "@/types";

/**
 * Repository layer = the backend-agnostic contract.
 *
 * Screens and React Query hooks depend ONLY on these interfaces. The concrete
 * implementation (mock today; Supabase / Firebase / REST / GraphQL / Hono /
 * FastAPI tomorrow) is selected in `repositories/index.ts`. Swapping providers
 * therefore never touches a screen.
 */

export interface UserRepository {
  getProfile(): Promise<User>;
  updateProfile(
    patch: Partial<Pick<User, "name" | "avatarUrl">>,
  ): Promise<User>;
  list(cursor?: string): Promise<Paginated<User>>;
}

/**
 * Multi-tenancy. The ACTIVE organization is server state on the session
 * (better-auth: `session.activeOrganizationId`, restored into each new
 * session from `user.lastActiveOrganizationId`) — the client only mirrors it.
 */
export interface OrganizationRepository {
  /** Organizations the signed-in user belongs to. */
  list(): Promise<Organization[]>;
  /** The session's active organization id (null when none is set). */
  getActiveOrganizationId(): Promise<string | null>;
  /** Switch the session's active organization. */
  setActive(organizationId: string): Promise<void>;
  /**
   * Create a new organization. Slug generation is an implementation detail
   * (better-auth derives it from the name; users never type slugs on mobile).
   */
  create(input: { name: string }): Promise<Organization>;
}

export interface Repositories {
  auth: AuthRepository;
  users: UserRepository;
  organizations: OrganizationRepository;
}
