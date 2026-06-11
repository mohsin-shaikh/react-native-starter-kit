import type { AuthRepository } from "@/services/auth/auth.types";
import type { Paginated, User } from "@/types";

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

export interface Repositories {
  auth: AuthRepository;
  users: UserRepository;
}
