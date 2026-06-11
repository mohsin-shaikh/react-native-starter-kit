import { QueryClient } from "@tanstack/react-query";

import { AppError } from "@/lib/errors";

/**
 * Single QueryClient for the app. Defaults are tuned for mobile:
 *  - retry only on transient errors (never on 401/403/422 — those won't fix
 *    themselves by retrying and just delay the error UI)
 *  - sane staleTime so screens don't refetch on every focus
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: (failureCount, error) => {
        if (error instanceof AppError && !error.isRetryable) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});
