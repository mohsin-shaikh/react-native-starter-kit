import { logger } from "./logger";

/**
 * Analytics abstraction (vendor-free).
 *
 * Define your events as a typed map so `track()` is autocompleted and
 * impossible to misspell. Today it logs to the console; swap `NoopAnalytics`
 * for a Segment / PostHog / Amplitude / Firebase implementation in one place.
 */
export interface AnalyticsEvents {
  screen_view: { name: string };
  sign_in: { method: "password" | "oauth" };
  sign_up: { method: "password" | "oauth" };
  sign_out: Record<string, never>;
  onboarding_completed: { durationMs: number };
}

export interface Analytics {
  identify(userId: string, traits?: Record<string, unknown>): void;
  track<E extends keyof AnalyticsEvents>(
    event: E,
    props: AnalyticsEvents[E],
  ): void;
  reset(): void;
}

class NoopAnalytics implements Analytics {
  identify(userId: string, traits?: Record<string, unknown>) {
    logger.debug("analytics.identify", { userId, traits });
  }
  track<E extends keyof AnalyticsEvents>(event: E, props: AnalyticsEvents[E]) {
    logger.debug("analytics.track", { event, props });
  }
  reset() {
    logger.debug("analytics.reset");
  }
}

export const analytics: Analytics = new NoopAnalytics();
