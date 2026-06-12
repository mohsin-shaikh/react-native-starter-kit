import { create } from "zustand";

import { analytics } from "@/lib/analytics";
import { crashReporter } from "@/lib/crash-reporting";
import { toAppError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { queryClient } from "@/queries/query-client";
import { registerAuthHeadersProvider } from "@/services/api/client";
import { authService } from "@/services/auth/auth.service";
import type { LoginCredentials, SignupData } from "@/services/auth/auth.types";
import type { Role, User } from "@/types";

import { waitForOnboardingHydration } from "./onboarding.store";
import { useOrganizationStore } from "./organization.store";

/**
 * Auth STATE (not persistence). The store is the single source of truth the
 * UI subscribes to for "who is signed in and are we still booting".
 *
 * - Session credentials live in SecureStore inside the auth repository
 *   (better-auth's Expo plugin / the mock), never here.
 * - `status` drives the root navigator's redirect decisions.
 */
export type AuthStatus =
  | "idle" // not yet bootstrapped
  | "restoring" // checking SecureStore for an existing session
  | "authenticated"
  | "unauthenticated";

interface AuthState {
  status: AuthStatus;
  user: User | null;

  /** Cold-start: restore a session from secure storage. */
  initialize: () => Promise<void>;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  /** Re-sync the user from the server (e.g. after a profile change). */
  refreshSession: () => Promise<void>;

  hasRole: (role: Role) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: "idle",
  user: null,

  initialize: async () => {
    set({ status: "restoring" });

    // Wire the HTTP client to this auth layer: attach the session cookie to
    // every request; a hard 401 (session revoked/expired server-side) forces
    // the user back to signed-out — sessions have no refresh path.
    registerAuthHeadersProvider({
      getAuthHeaders: () => authService.getAuthHeaders(),
      onAuthFailure: () => {
        logger.info("auth.onAuthFailure — forcing sign-out");
        void get().logout();
      },
    });

    // Restore the session and wait for persisted onboarding state in parallel,
    // so the first navigation decision sees correct values for both.
    const [user] = await Promise.all([
      authService.restoreSession(),
      waitForOnboardingHydration(),
    ]);
    if (user) {
      crashReporter.setUser({ id: user.id, email: user.email });
      analytics.identify(user.id);
      // Mirror the session's active organization before declaring ourselves
      // authenticated, so the first authenticated render knows the tenant.
      await useOrganizationStore.getState().hydrateFromSession();
      set({ status: "authenticated", user });
    } else {
      set({ status: "unauthenticated", user: null });
    }
  },

  login: async (credentials) => {
    try {
      const user = await authService.login(credentials);
      crashReporter.setUser({ id: user.id, email: user.email });
      analytics.identify(user.id);
      analytics.track("sign_in", { method: "password" });
      await useOrganizationStore.getState().hydrateFromSession();
      set({ status: "authenticated", user });
    } catch (error) {
      throw toAppError(error); // surfaced to the form via the mutation
    }
  },

  signup: async (data) => {
    try {
      const user = await authService.signup(data);
      crashReporter.setUser({ id: user.id, email: user.email });
      analytics.identify(user.id);
      analytics.track("sign_up", { method: "password" });
      await useOrganizationStore.getState().hydrateFromSession();
      set({ status: "authenticated", user });
    } catch (error) {
      throw toAppError(error);
    }
  },

  logout: async () => {
    await authService.logout();
    analytics.track("sign_out", {});
    analytics.reset();
    crashReporter.setUser(null);
    useOrganizationStore.getState().reset();
    // Drop all cached server state so the next account never sees the
    // previous account's data (org list, profile, …) flash before refetch.
    queryClient.clear();
    set({ status: "unauthenticated", user: null });
  },

  refreshSession: async () => {
    try {
      const user = await authService.restoreSession();
      if (user) {
        set({ user });
      } else {
        await get().logout();
      }
    } catch (error) {
      logger.warn("auth.refreshSession failed", { error: String(error) });
    }
  },

  hasRole: (role) => get().user?.roles.includes(role) ?? false,
}));

/** Selector helpers — keep components subscribing to the narrowest slice. */
export const selectIsAuthenticated = (s: AuthState) =>
  s.status === "authenticated";
export const selectUser = (s: AuthState) => s.user;
