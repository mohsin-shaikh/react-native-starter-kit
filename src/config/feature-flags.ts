import { env } from "./env";

/**
 * Feature flags.
 *
 * Today these are static, env-driven booleans. The shape is intentionally a
 * provider interface so you can later back it with LaunchDarkly, Statsig,
 * PostHog, or a remote-config endpoint WITHOUT touching call sites:
 *
 *   if (featureFlags.isEnabled('new_onboarding')) { ... }
 *
 * Swap `StaticFeatureFlagProvider` for a `RemoteFeatureFlagProvider` in one
 * place (the export at the bottom) and every screen picks it up.
 */
export type FeatureFlagKey =
  | "new_onboarding"
  | "ai_assistant"
  | "biometric_login"
  | "push_notifications";

export interface FeatureFlagProvider {
  isEnabled(key: FeatureFlagKey): boolean;
  /** Override at runtime (debug menu, E2E tests). */
  override(key: FeatureFlagKey, value: boolean): void;
}

const DEFAULTS: Record<FeatureFlagKey, boolean> = {
  new_onboarding: true,
  ai_assistant: false,
  biometric_login: false,
  push_notifications: env.IS_PROD,
};

class StaticFeatureFlagProvider implements FeatureFlagProvider {
  private overrides = new Map<FeatureFlagKey, boolean>();

  isEnabled(key: FeatureFlagKey): boolean {
    return this.overrides.get(key) ?? DEFAULTS[key];
  }

  override(key: FeatureFlagKey, value: boolean): void {
    this.overrides.set(key, value);
  }
}

export const featureFlags: FeatureFlagProvider =
  new StaticFeatureFlagProvider();
