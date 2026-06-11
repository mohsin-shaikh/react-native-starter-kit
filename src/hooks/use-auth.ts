import { useAuthStore } from "@/stores/auth.store";

/**
 * Ergonomic read-only view of auth state for components that just need to know
 * "who am I / am I signed in". For actions (login/logout) use the React Query
 * mutation hooks so you also get pending/error state.
 */
export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  const hasRole = useAuthStore((s) => s.hasRole);
  return {
    user,
    status,
    isAuthenticated: status === "authenticated",
    isLoading: status === "idle" || status === "restoring",
    hasRole,
  };
}
