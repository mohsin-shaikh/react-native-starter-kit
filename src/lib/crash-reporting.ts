import { logger } from "./logger";

/**
 * Crash / error reporting abstraction (vendor-free).
 *
 * The global error boundary and the API layer report here. Swap `NoopCrash`
 * for Sentry / Bugsnag / Crashlytics later — initialize the SDK inside the
 * concrete implementation and nothing else changes.
 */
export interface CrashReporter {
  init(): void;
  setUser(user: { id: string; email?: string } | null): void;
  captureException(error: unknown, context?: Record<string, unknown>): void;
  addBreadcrumb(message: string, data?: Record<string, unknown>): void;
}

class NoopCrashReporter implements CrashReporter {
  init() {
    logger.debug("crash.init");
  }
  setUser(user: { id: string; email?: string } | null) {
    logger.debug("crash.setUser", { user });
  }
  captureException(error: unknown, context?: Record<string, unknown>) {
    logger.error("crash.captureException", { error: String(error), context });
  }
  addBreadcrumb(message: string, data?: Record<string, unknown>) {
    logger.debug("crash.breadcrumb", { message, data });
  }
}

export const crashReporter: CrashReporter = new NoopCrashReporter();
