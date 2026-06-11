import { env } from "@/config/env";
import { apiClient } from "@/services/api/client";

import { MockAuthRepository } from "./mock/mock-auth.repository";
import { MockUserRepository } from "./mock/mock-user.repository";
import { RestAuthRepository } from "./rest/rest-auth.repository";
import type { Repositories } from "./types";

/**
 * Composition root for the data layer.
 *
 * This single function decides which backend the entire app talks to. Flip
 * `EXPO_PUBLIC_USE_MOCKS` (or replace a line here) to migrate from the dummy
 * provider to REST / Supabase / Firebase / GraphQL. Nothing above this file
 * — services, hooks, screens — changes.
 */
function createRepositories(): Repositories {
  if (env.USE_MOCKS) {
    return {
      auth: new MockAuthRepository(),
      users: new MockUserRepository(),
    };
  }

  // Real backend example (REST). Add SupabaseAuthRepository, FirebaseAuth-
  // Repository, etc. the same way and switch on a provider env var.
  return {
    auth: new RestAuthRepository(apiClient),
    // users: new RestUserRepository(apiClient),
    users: new MockUserRepository(), // placeholder until implemented
  };
}

export const repositories: Repositories = createRepositories();
