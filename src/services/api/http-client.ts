import { AppError, kindFromStatus } from "@/lib/errors";
import { logger } from "@/lib/logger";

import type { AuthTokenProvider, HttpClient, RequestOptions } from "./types";

const DEFAULT_TIMEOUT_MS = 15_000;

/**
 * fetch-based HttpClient with the cross-cutting concerns every screen would
 * otherwise reimplement:
 *  - base URL + query serialization
 *  - bearer token injection (via AuthTokenProvider)
 *  - timeouts (AbortController)
 *  - transparent 401 -> refresh -> retry-once
 *  - normalization of every failure into an AppError
 *
 * This is the only place that knows about HTTP. Repositories above it speak
 * domain language, not status codes.
 */
export class FetchHttpClient implements HttpClient {
  constructor(
    private readonly baseUrl: string,
    private readonly tokenProvider?: AuthTokenProvider,
  ) {}

  get<T>(path: string, options?: RequestOptions) {
    return this.request<T>("GET", path, undefined, options);
  }
  post<T>(path: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>("POST", path, body, options);
  }
  put<T>(path: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>("PUT", path, body, options);
  }
  patch<T>(path: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>("PATCH", path, body, options);
  }
  delete<T>(path: string, options?: RequestOptions) {
    return this.request<T>("DELETE", path, undefined, options);
  }

  private buildUrl(path: string, params?: RequestOptions["params"]): string {
    const url = new URL(
      path.replace(/^\//, ""),
      this.baseUrl.replace(/\/?$/, "/"),
    );
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) url.searchParams.set(key, String(value));
      }
    }
    return url.toString();
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    options: RequestOptions = {},
    isRetry = false,
  ): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    );

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    };

    if (!options.skipAuth && this.tokenProvider) {
      const token = await this.tokenProvider.getAccessToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(this.buildUrl(path, options.params), {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: options.signal ?? controller.signal,
      });

      if (
        response.status === 401 &&
        !options.skipAuth &&
        !isRetry &&
        this.tokenProvider
      ) {
        // Try a single transparent refresh, then replay the original request.
        const fresh = await this.tokenProvider.refreshAccessToken();
        if (fresh) {
          return this.request<T>(method, path, body, options, true);
        }
        this.tokenProvider.onAuthFailure();
      }

      if (!response.ok) {
        const payload = await this.safeJson(response);
        throw new AppError({
          kind: kindFromStatus(response.status),
          status: response.status,
          message: payload?.message ?? `Request failed (${response.status})`,
          fields: payload?.fields,
          cause: payload,
        });
      }

      if (response.status === 204) return undefined as T;
      return (await this.safeJson(response)) as T;
    } catch (error) {
      throw this.normalize(error);
    } finally {
      clearTimeout(timeout);
    }
  }

  private async safeJson(response: Response): Promise<any> {
    try {
      const text = await response.text();
      return text ? JSON.parse(text) : null;
    } catch {
      return null;
    }
  }

  private normalize(error: unknown): AppError {
    if (error instanceof AppError) return error;
    if (error instanceof DOMException && error.name === "AbortError") {
      return new AppError({
        kind: "timeout",
        message: "Request timed out",
        cause: error,
      });
    }
    // fetch rejects with a TypeError when the device is offline / DNS fails.
    logger.warn("http.networkError", { error: String(error) });
    return new AppError({
      kind: "network",
      message: "Network request failed",
      cause: error,
    });
  }
}
