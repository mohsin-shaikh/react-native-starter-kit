/**
 * App-wide constants. Keep magic strings (storage keys, query keys roots,
 * route paths) here so they have a single source of truth.
 */

/** Keys used with SecureStore / AsyncStorage. Namespaced to avoid collisions. */
export const STORAGE_KEYS = {
  ACCESS_TOKEN: "auth.accessToken",
  REFRESH_TOKEN: "auth.refreshToken",
  ONBOARDING_STATE: "onboarding.state",
  THEME: "preferences.theme",
  ACTIVE_ORG: "organization.activeId",
} as const;

/** Canonical route paths. Use these instead of hand-typed strings. */
export const ROUTES = {
  // Auth group
  LOGIN: "/(auth)/login",
  SIGNUP: "/(auth)/signup",
  FORGOT_PASSWORD: "/(auth)/forgot-password",
  // Onboarding group
  ONBOARDING_WELCOME: "/(onboarding)/welcome",
  ONBOARDING_PROFILE: "/(onboarding)/profile-setup",
  ONBOARDING_PERMISSIONS: "/(onboarding)/permissions",
  ONBOARDING_COMPLETE: "/(onboarding)/complete",
  // App group
  HOME: "/(app)/(tabs)",
  PROFILE: "/(app)/(tabs)/profile",
  SETTINGS: "/(app)/(tabs)/settings",
} as const;

/** How many ms before token expiry we proactively refresh. */
export const TOKEN_REFRESH_THRESHOLD_MS = 60_000;
