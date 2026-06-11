/**
 * Normalized error model.
 *
 * The API/repository layer is responsible for converting ANY thrown thing
 * (fetch failures, non-2xx responses, vendor SDK errors, Zod errors) into one
 * of these typed `AppError`s. UI then switches on `error.kind` instead of
 * sniffing status codes or string-matching messages. This is the seam that
 * keeps screens backend-agnostic.
 */
export type AppErrorKind =
  | "network" // device offline / request never completed
  | "timeout"
  | "unauthorized" // 401 — token missing/expired
  | "forbidden" // 403 — authenticated but not allowed (RBAC)
  | "not_found" // 404
  | "validation" // 422 / client-side Zod failure
  | "conflict" // 409
  | "rate_limited" // 429
  | "server" // 5xx
  | "unknown";

export interface FieldError {
  field: string;
  message: string;
}

export class AppError extends Error {
  readonly kind: AppErrorKind;
  readonly status?: number;
  /** Field-level errors for form validation surfaces. */
  readonly fields?: FieldError[];
  /** The original error, preserved for logging/crash reporting. */
  readonly cause?: unknown;

  constructor(params: {
    kind: AppErrorKind;
    message: string;
    status?: number;
    fields?: FieldError[];
    cause?: unknown;
  }) {
    super(params.message);
    this.name = "AppError";
    this.kind = params.kind;
    this.status = params.status;
    this.fields = params.fields;
    this.cause = params.cause;
  }

  /** True when retrying the same request might succeed. */
  get isRetryable(): boolean {
    return (
      this.kind === "network" ||
      this.kind === "timeout" ||
      this.kind === "server" ||
      this.kind === "rate_limited"
    );
  }

  /** A safe, user-facing message. Never leak raw server/stack detail. */
  get userMessage(): string {
    switch (this.kind) {
      case "network":
        return "No internet connection. Please check your network and try again.";
      case "timeout":
        return "The request took too long. Please try again.";
      case "unauthorized":
        return "Your session has expired. Please sign in again.";
      case "forbidden":
        return "You don't have permission to do that.";
      case "not_found":
        return "We couldn't find what you were looking for.";
      case "validation":
        return this.message || "Please check the form and try again.";
      case "rate_limited":
        return "Too many requests. Please slow down and try again shortly.";
      case "server":
        return "Something went wrong on our end. Please try again later.";
      default:
        return "Something went wrong. Please try again.";
    }
  }
}

/** Map an HTTP status code to an error kind. */
export function kindFromStatus(status: number): AppErrorKind {
  switch (status) {
    case 401:
      return "unauthorized";
    case 403:
      return "forbidden";
    case 404:
      return "not_found";
    case 409:
      return "conflict";
    case 422:
      return "validation";
    case 429:
      return "rate_limited";
    default:
      if (status >= 500) return "server";
      return "unknown";
  }
}

/** Coerce any unknown thrown value into an AppError. */
export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  if (error instanceof Error) {
    return new AppError({
      kind: "unknown",
      message: error.message,
      cause: error,
    });
  }
  return new AppError({
    kind: "unknown",
    message: "Unexpected error",
    cause: error,
  });
}
