/**
 * Transport-layer contracts. This describes "how we talk to a server",
 * independent of WHICH server. A REST client, a GraphQL client, or a fake
 * in-memory client all satisfy `HttpClient`.
 */
export interface RequestOptions {
  /** Query params, serialized into the URL. */
  params?: Record<string, string | number | boolean | undefined>;
  /** Extra headers merged over the defaults. */
  headers?: Record<string, string>;
  /** Abort after this many ms. */
  timeoutMs?: number;
  /** Skip the auth token (e.g. for login/refresh). */
  skipAuth?: boolean;
  signal?: AbortSignal;
}

export interface HttpClient {
  get<T>(path: string, options?: RequestOptions): Promise<T>;
  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T>;
  put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T>;
  patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T>;
  delete<T>(path: string, options?: RequestOptions): Promise<T>;
}

/**
 * The client asks this provider for the current token and what to do on 401.
 * Implemented by the auth layer — breaks the circular dependency between
 * "the client needs a token" and "auth needs the client".
 */
export interface AuthTokenProvider {
  getAccessToken(): Promise<string | null>;
  /** Called on 401. Return a fresh token to retry once, or null to give up. */
  refreshAccessToken(): Promise<string | null>;
  onAuthFailure(): void;
}
