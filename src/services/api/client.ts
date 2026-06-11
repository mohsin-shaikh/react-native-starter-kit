import { env } from "@/config/env";

import { FetchHttpClient } from "./http-client";
import type { AuthTokenProvider, HttpClient } from "./types";

/**
 * The shared HttpClient instance.
 *
 * The client needs a token provider, but the auth layer needs the client —
 * a cycle. We break it with late registration: the auth layer calls
 * `registerAuthTokenProvider()` during bootstrap, and until then requests
 * simply go out unauthenticated. No import cycle at module-eval time.
 */
let tokenProvider: AuthTokenProvider | null = null;

const lazyProvider: AuthTokenProvider = {
  getAccessToken: () =>
    tokenProvider?.getAccessToken() ?? Promise.resolve(null),
  refreshAccessToken: () =>
    tokenProvider?.refreshAccessToken() ?? Promise.resolve(null),
  onAuthFailure: () => tokenProvider?.onAuthFailure(),
};

export function registerAuthTokenProvider(provider: AuthTokenProvider): void {
  tokenProvider = provider;
}

export const apiClient: HttpClient = new FetchHttpClient(
  env.API_URL,
  lazyProvider,
);
