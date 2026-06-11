import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { AppError } from "@/lib/errors";
import { repositories } from "@/services/repositories";
import type { User } from "@/types";

import { qk } from "./keys";

/**
 * SERVER state (the profile) lives in React Query, NOT Zustand. It is owned by
 * the backend, can go stale, and needs caching/refetch/invalidation — exactly
 * what Query is for. Contrast with the auth *session*, which is client state.
 */
export function useProfileQuery() {
  return useQuery<User, AppError>({
    queryKey: qk.user.profile(),
    queryFn: () => repositories.users.getProfile(),
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation<User, AppError, Partial<Pick<User, "name" | "avatarUrl">>>(
    {
      mutationFn: (patch) => repositories.users.updateProfile(patch),
      onSuccess: (updated) => {
        // Write-through: update the cache so the UI reflects it immediately.
        queryClient.setQueryData(qk.user.profile(), updated);
      },
    },
  );
}
