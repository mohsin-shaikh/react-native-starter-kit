import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/hooks/use-auth";
import type { AppError } from "@/lib/errors";
import { repositories } from "@/services/repositories";
import { useOrganizationStore } from "@/stores/organization.store";
import type { Organization } from "@/types";

import { qk } from "./keys";

/**
 * Organization server state.
 *
 * The list of orgs lives in React Query; the ACTIVE org id is a session
 * value mirrored into the organization store (hydrated on sign-in, switched
 * optimistically here).
 *
 * CONTRACT for future business-data queries: their query keys must include
 * the active org id (e.g. `[...qk.bills.all, activeOrgId, ...]`). Switching
 * tenants invalidates everything outside `qk.organization.all`, so org-scoped
 * data refetches under the new tenant automatically.
 */

export function useOrganizationsQuery() {
  const { isAuthenticated } = useAuth();
  return useQuery<Organization[], AppError>({
    queryKey: qk.organization.list(),
    queryFn: () => repositories.organizations.list(),
    enabled: isAuthenticated,
  });
}

export function useSetActiveOrganizationMutation() {
  const queryClient = useQueryClient();
  const setActiveOrgId = useOrganizationStore((s) => s.setActiveOrgId);

  return useMutation<void, AppError, string, { previousOrgId: string | null }>(
    {
      mutationFn: (organizationId) =>
        repositories.organizations.setActive(organizationId),

      // Optimistic: the header switches immediately; rollback on failure.
      onMutate: (organizationId) => {
        const previousOrgId =
          useOrganizationStore.getState().activeOrgId ?? null;
        setActiveOrgId(organizationId);
        return { previousOrgId };
      },

      onError: (_error, _organizationId, context) => {
        if (context) setActiveOrgId(context.previousOrgId);
      },

      onSuccess: () => {
        // Every org-scoped dataset is now stale; refetch under the new
        // tenant. The org list itself is tenant-independent, so keep it.
        void queryClient.invalidateQueries({
          predicate: (query) => query.queryKey[0] !== qk.organization.all[0],
        });
      },
    },
  );
}

export function useCreateOrganizationMutation() {
  const queryClient = useQueryClient();
  const setActiveOrgId = useOrganizationStore((s) => s.setActiveOrgId);

  return useMutation<Organization, AppError, { name: string }>({
    // Creating a tenant immediately switches into it — that's where the user
    // wants to be next (and what the backend's web onboarding does too).
    mutationFn: async (input) => {
      const org = await repositories.organizations.create(input);
      await repositories.organizations.setActive(org.id);
      return org;
    },

    onSuccess: (org) => {
      setActiveOrgId(org.id);
      queryClient.setQueryData<Organization[]>(
        qk.organization.list(),
        (current) => (current ? [...current, org] : [org]),
      );
      // New tenant: org-scoped data must refetch (same contract as switching).
      void queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] !== qk.organization.all[0],
      });
    },
  });
}
