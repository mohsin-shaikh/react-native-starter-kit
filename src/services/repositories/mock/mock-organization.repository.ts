import { STORAGE_KEYS } from "@/constants";
import type { OrganizationRepository } from "@/services/repositories/types";
import { kvStorage } from "@/services/storage/kv-storage";
import type { Organization } from "@/types";

import { mockDb } from "./mock-db";

/**
 * Dummy organization backend. The active org id is persisted in AsyncStorage
 * to simulate what the real backend does server-side (each new session
 * restores `user.lastActiveOrganizationId`).
 */
export class MockOrganizationRepository implements OrganizationRepository {
  async list(): Promise<Organization[]> {
    return mockDb.delay(mockDb.listOrganizations(), 300);
  }

  async getActiveOrganizationId(): Promise<string | null> {
    const stored = await kvStorage.getString(STORAGE_KEYS.ACTIVE_ORG);
    // Fall back to the first org so the demo works out of the box.
    return mockDb.delay(stored ?? mockDb.listOrganizations()[0]?.id ?? null, 150);
  }

  async setActive(organizationId: string): Promise<void> {
    await kvStorage.set(STORAGE_KEYS.ACTIVE_ORG, organizationId);
    return mockDb.delay(undefined, 250);
  }

  async create(input: { name: string }): Promise<Organization> {
    return mockDb.delay(mockDb.createOrganization(input.name), 400);
  }
}
