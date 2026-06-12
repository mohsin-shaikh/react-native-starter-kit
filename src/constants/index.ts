/**
 * App-wide constants. Keep magic strings (storage keys, query keys roots,
 * route paths) here so they have a single source of truth.
 */

/** Keys used with SecureStore / AsyncStorage. Namespaced to avoid collisions. */
export const STORAGE_KEYS = {
  // The real session cookie is persisted by better-auth's Expo plugin under
  // its own "starterkit" prefix; this key is only for the mock backend.
  MOCK_SESSION: "auth.mockSession",
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
