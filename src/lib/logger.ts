import { env } from "@/config/env";

/**
 * Logging abstraction.
 *
 * Code logs through this interface, never `console.*` directly. In dev it
 * pretty-prints to the console; in production you swap the implementation for
 * one that forwards to your crash/observability vendor (Sentry breadcrumbs,
 * Datadog, etc.) without changing a single call site.
 */
export type LogLevel = "debug" | "info" | "warn" | "error";

export interface Logger {
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
}

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};
const MIN_LEVEL: LogLevel = env.IS_DEV ? "debug" : "warn";

class ConsoleLogger implements Logger {
  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
  ) {
    if (LEVEL_ORDER[level] < LEVEL_ORDER[MIN_LEVEL]) return;
    const prefix = `[${level.toUpperCase()}]`;
    // eslint-disable-next-line no-console
    const fn =
      level === "error"
        ? console.error
        : level === "warn"
          ? console.warn
          : console.log;
    fn(prefix, message, context ?? "");
  }

  debug = (m: string, c?: Record<string, unknown>) => this.log("debug", m, c);
  info = (m: string, c?: Record<string, unknown>) => this.log("info", m, c);
  warn = (m: string, c?: Record<string, unknown>) => this.log("warn", m, c);
  error = (m: string, c?: Record<string, unknown>) => this.log("error", m, c);
}

export const logger: Logger = new ConsoleLogger();
