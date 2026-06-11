/**
 * Centralized query keys. Co-locating them prevents typos and makes targeted
 * invalidation easy: `queryClient.invalidateQueries({ queryKey: qk.user.all })`.
 */
export const qk = {
  user: {
    all: ["user"] as const,
    profile: () => [...qk.user.all, "profile"] as const,
    list: (cursor?: string) =>
      [...qk.user.all, "list", cursor ?? "first"] as const,
  },
} as const;
