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
  /** Skip auth headers (e.g. for public endpoints). */
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
 * The client asks this provider for auth headers (better-auth: the session
 * cookie) and what to do on 401. Implemented by the auth layer — breaks the
 * circular dependency between "the client needs credentials" and "auth needs
 * the client".
 *
 * Note there is no refresh hook: better-auth sessions are validated
 * server-side per request, so a 401 is final — `onAuthFailure` flips the app
 * to signed-out.
 */
export interface AuthHeadersProvider {
  getAuthHeaders(): Record<string, string>;
  /** Called on 401 — the session is gone; force sign-out. */
  onAuthFailure(): void;
}
