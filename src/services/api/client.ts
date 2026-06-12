import { env } from "@/config/env";

import { FetchHttpClient } from "./http-client";
import type { AuthHeadersProvider, HttpClient } from "./types";

/**
 * The shared HttpClient instance.
 *
 * The client needs auth headers, but the auth layer needs the client —
 * a cycle. We break it with late registration: the auth layer calls
 * `registerAuthHeadersProvider()` during bootstrap, and until then requests
 * simply go out unauthenticated. No import cycle at module-eval time.
 */
let authProvider: AuthHeadersProvider | null = null;

const lazyProvider: AuthHeadersProvider = {
  getAuthHeaders: () => authProvider?.getAuthHeaders() ?? {},
  onAuthFailure: () => authProvider?.onAuthFailure(),
};

export function registerAuthHeadersProvider(
  provider: AuthHeadersProvider,
): void {
  authProvider = provider;
}

export const apiClient: HttpClient = new FetchHttpClient(
  env.API_URL,
  lazyProvider,
);
