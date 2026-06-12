import Constants from "expo-constants";

/**
 * Centralized, validated access to environment configuration.
 *
 * Read env vars in exactly ONE place. Screens and services import the typed
 * `env` object instead of reaching for `process.env` directly — that keeps
 * config swappable and makes missing values fail loudly at startup instead of
 * silently as `undefined` deep inside a request.
 */
export type AppEnvironment = "development" | "staging" | "production";

function required(value: string | undefined, key: string): string {
  if (value == null || value === "") {
    throw new Error(`[env] Missing required environment variable: ${key}`);
  }
  return value;
}

const appEnv = (process.env.EXPO_PUBLIC_APP_ENV ??
  "development") as AppEnvironment;

/**
 * In development, "localhost" only works on the iOS simulator (it shares the
 * host's network). On an Android emulator localhost is the device itself, and
 * on a physical device it's meaningless. But every device already reached the
 * dev machine to load the JS bundle — so reuse Metro's host (hostUri) for the
 * API too. Non-localhost URLs (staging/prod) pass through untouched.
 */
function resolveApiUrl(raw: string): string {
  if (appEnv !== "development") return raw;
  if (!/\/\/(localhost|127\.0\.0\.1)([:/]|$)/.test(raw)) return raw;

  const metroHost = Constants.expoConfig?.hostUri?.split(":")[0];
  if (!metroHost) return raw;
  return raw.replace(/\/\/(localhost|127\.0\.0\.1)/, `//${metroHost}`);
}

export const env = {
  APP_ENV: appEnv,
  IS_DEV: appEnv === "development",
  IS_PROD: appEnv === "production",

  API_URL: resolveApiUrl(
    required(process.env.EXPO_PUBLIC_API_URL, "EXPO_PUBLIC_API_URL"),
  ),

  // When true the app uses the in-memory mock auth/API layer. This is the
  // single switch that lets a real backend be plugged in later.
  USE_MOCKS: (process.env.EXPO_PUBLIC_USE_MOCKS ?? "true") === "true",

  ANALYTICS_KEY: process.env.EXPO_PUBLIC_ANALYTICS_KEY ?? "",
  SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN ?? "",

  APP_VERSION: Constants.expoConfig?.version ?? "0.0.0",
} as const;

export type Env = typeof env;
