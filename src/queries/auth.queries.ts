import { useMutation } from "@tanstack/react-query";

import type { AppError } from "@/lib/errors";
import { authService } from "@/services/auth/auth.service";
import type { LoginCredentials, SignupData } from "@/services/auth/auth.types";
import { useAuthStore } from "@/stores/auth.store";

/**
 * Auth MUTATIONS as React Query hooks.
 *
 * Why mutations and not just calling the store? React Query gives the form
 * `isPending` / `error` for free and a clean place to hang side effects. The
 * actual state transition still happens in the Zustand store (single source of
 * truth for "am I signed in") — the mutation just delegates to it.
 */
export function useLoginMutation() {
  const login = useAuthStore((s) => s.login);
  return useMutation<void, AppError, LoginCredentials>({
    mutationFn: (credentials) => login(credentials),
  });
}

export function useSignupMutation() {
  const signup = useAuthStore((s) => s.signup);
  return useMutation<void, AppError, SignupData>({
    mutationFn: (data) => signup(data),
  });
}

export function useLogoutMutation() {
  const logout = useAuthStore((s) => s.logout);
  return useMutation<void, AppError, void>({
    mutationFn: () => logout(),
  });
}

export function useForgotPasswordMutation() {
  return useMutation<void, AppError, string>({
    mutationFn: (email) => authService.requestPasswordReset(email),
  });
}
