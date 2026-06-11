/**
 * Shared domain types that more than one feature depends on.
 * Feature-specific types live next to their feature (e.g. auth.types.ts).
 */

/** Role-based access control. Extend as your product grows. */
export type Role = "guest" | "user" | "admin" | "owner";

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  roles: Role[];
  createdAt: string;
}

/** A normalized async resource state for non-Query local flows. */
export type AsyncStatus = "idle" | "loading" | "success" | "error";

/** Generic paginated envelope returned by repositories. */
export interface Paginated<T> {
  items: T[];
  nextCursor: string | null;
  total: number;
}
