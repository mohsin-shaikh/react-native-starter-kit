import { AppError } from "@/lib/errors";
import type { UserRepository } from "@/services/repositories/types";
import type { Paginated, User } from "@/types";

import { mockDb } from "./mock-db";

export class MockUserRepository implements UserRepository {
  // The "current user" the mock profile screen reads/writes.
  private current: User | null = mockDb.listUsers()[0] ?? null;

  async getProfile(): Promise<User> {
    if (!this.current) {
      throw new AppError({
        kind: "not_found",
        status: 404,
        message: "No profile.",
      });
    }
    return mockDb.delay(this.current, 250);
  }

  async updateProfile(
    patch: Partial<Pick<User, "name" | "avatarUrl">>,
  ): Promise<User> {
    if (!this.current) {
      throw new AppError({
        kind: "not_found",
        status: 404,
        message: "No profile.",
      });
    }
    this.current = { ...this.current, ...patch };
    return mockDb.delay(this.current, 300);
  }

  async list(_cursor?: string): Promise<Paginated<User>> {
    const items = mockDb.listUsers();
    return mockDb.delay({ items, nextCursor: null, total: items.length }, 300);
  }
}
