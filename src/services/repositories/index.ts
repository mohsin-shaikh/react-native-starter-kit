import { env } from "@/config/env";

import { BetterAuthAuthRepository } from "./better-auth/better-auth-auth.repository";
import { BetterAuthOrganizationRepository } from "./better-auth/better-auth-organization.repository";
import { MockAuthRepository } from "./mock/mock-auth.repository";
import { MockOrganizationRepository } from "./mock/mock-organization.repository";
import { MockUserRepository } from "./mock/mock-user.repository";
import type { Repositories } from "./types";

/**
 * Composition root for the data layer.
 *
 * This single function decides which backend the entire app talks to. Flip
 * `EXPO_PUBLIC_USE_MOCKS` to switch between the in-memory mock backend and
 * the real app-one backend (better-auth + REST/oRPC). Nothing above this file
 * — services, hooks, screens — changes.
 */
function createRepositories(): Repositories {
  if (env.USE_MOCKS) {
    return {
      auth: new MockAuthRepository(),
      users: new MockUserRepository(),
      organizations: new MockOrganizationRepository(),
    };
  }

  return {
    auth: new BetterAuthAuthRepository(),
    // Business-data repositories (REST/oRPC against /api) come with the next
    // phases; the profile screen stays on the mock until then.
    users: new MockUserRepository(),
    organizations: new BetterAuthOrganizationRepository(),
  };
}

export const repositories: Repositories = createRepositories();
