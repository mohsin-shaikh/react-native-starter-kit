import { create } from "zustand";

import { logger } from "@/lib/logger";
import { repositories } from "@/services/repositories";

/**
 * Client-side MIRROR of the session's active organization.
 *
 * The source of truth is the server session (better-auth's
 * `session.activeOrganizationId`); the backend restores it into every new
 * session, so nothing is persisted here. The mirror exists so business-data
 * query keys and deep components can read the active tenant synchronously.
 *
 * - Hydrated by the auth store after login / session restore.
 * - Updated optimistically by the switch mutation
 *   (see queries/organization.queries.ts), which owns rollback on failure.
 *
 * The org LIST is server state and lives in React Query, not here.
 */
interface OrganizationState {
  /** `undefined` = not yet hydrated; `null` = session has no active org. */
  activeOrgId: string | null | undefined;

  setActiveOrgId: (id: string | null) => void;
  /** Pull the session's active org. Called by the auth store on sign-in. */
  hydrateFromSession: () => Promise<void>;
  /** Back to pre-hydration state. Called by the auth store on sign-out. */
  reset: () => void;
}

export const useOrganizationStore = create<OrganizationState>((set) => ({
  activeOrgId: undefined,

  setActiveOrgId: (id) => set({ activeOrgId: id }),

  hydrateFromSession: async () => {
    try {
      const id = await repositories.organizations.getActiveOrganizationId();
      set({ activeOrgId: id });
    } catch (error) {
      logger.warn("organization.hydrateFromSession failed", {
        error: String(error),
      });
      set({ activeOrgId: null });
    }
  },

  reset: () => set({ activeOrgId: undefined }),
}));
