import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { STORAGE_KEYS } from "@/constants";
import { zustandStorage } from "@/services/storage/kv-storage";

/**
 * The tenant the user is currently operating in. An accounting app is
 * multi-tenant: one user can belong to several organizations and all data
 * (bills, parties, …) is scoped to the active one.
 *
 * Only `activeOrgId` is persisted so a returning user lands back in the same
 * tenant. Swap the seeded `organizations` for a server-driven list (React
 * Query) once there's a backend.
 */
export interface Organization {
  id: string;
  name: string;
}

const SEED_ORGANIZATIONS = [
  { id: "org_acme", name: "Acme Traders" },
  { id: "org_globex", name: "Globex Pvt Ltd" },
  { id: "org_initech", name: "Initech LLP" },
] as const satisfies readonly Organization[];

const DEFAULT_ORG = SEED_ORGANIZATIONS[0];

interface OrganizationState {
  organizations: readonly Organization[];
  activeOrgId: string;
  setActiveOrg: (id: string) => void;
}

export const useOrganizationStore = create<OrganizationState>()(
  persist(
    (set) => ({
      organizations: SEED_ORGANIZATIONS,
      activeOrgId: DEFAULT_ORG.id,
      setActiveOrg: (id) => set({ activeOrgId: id }),
    }),
    {
      name: STORAGE_KEYS.ACTIVE_ORG,
      storage: createJSONStorage(() => zustandStorage),
      // Persist only the selection; the org list is seeded/fetched fresh.
      partialize: (s) => ({ activeOrgId: s.activeOrgId }),
    },
  ),
);

/** The currently active organization (falls back to the first if stale). */
export const selectActiveOrg = (s: OrganizationState): Organization =>
  s.organizations.find((o) => o.id === s.activeOrgId) ??
  s.organizations[0] ??
  DEFAULT_ORG;
