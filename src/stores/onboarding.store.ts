import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { STORAGE_KEYS } from "@/constants";
import { zustandStorage } from "@/services/storage/kv-storage";

/**
 * Onboarding STATE — persisted to AsyncStorage (non-sensitive, survives restarts).
 *
 * This is the canonical example of "persist a flag locally": the root
 * navigator reads `hasCompleted` to decide whether a signed-in user goes to
 * the app or into the onboarding flow.
 *
 * Note: persistence is per-device here. If onboarding should be per-USER,
 * key it by user id (or move it server-side and read it via React Query).
 */
interface OnboardingProfile {
  displayName?: string;
  avatarUrl?: string;
}

interface OnboardingState {
  /** Has the user finished the whole onboarding flow at least once? */
  hasCompleted: boolean;
  /** Furthest step reached, so the flow can resume where it left off. */
  step: "welcome" | "profile" | "permissions" | "complete";
  profile: OnboardingProfile;
  permissionsGranted: { notifications: boolean };

  setStep: (step: OnboardingState["step"]) => void;
  setProfile: (profile: OnboardingProfile) => void;
  setPermission: (
    key: keyof OnboardingState["permissionsGranted"],
    value: boolean,
  ) => void;
  complete: () => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      hasCompleted: false,
      step: "welcome",
      profile: {},
      permissionsGranted: { notifications: false },

      setStep: (step) => set({ step }),
      setProfile: (profile) =>
        set((s) => ({ profile: { ...s.profile, ...profile } })),
      setPermission: (key, value) =>
        set((s) => ({
          permissionsGranted: { ...s.permissionsGranted, [key]: value },
        })),
      complete: () => set({ hasCompleted: true, step: "complete" }),
      reset: () =>
        set({
          hasCompleted: false,
          step: "welcome",
          profile: {},
          permissionsGranted: { notifications: false },
        }),
    }),
    {
      name: STORAGE_KEYS.ONBOARDING_STATE,
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);

export const selectOnboardingComplete = (s: OnboardingState) => s.hasCompleted;

/**
 * Resolves once the persisted onboarding state has been read back from
 * AsyncStorage. The bootstrap awaits this so the very first navigation
 * decision sees the real `hasCompleted` value (no flash toward onboarding for
 * a returning user).
 */
export function waitForOnboardingHydration(): Promise<void> {
  if (useOnboardingStore.persist.hasHydrated()) return Promise.resolve();
  return new Promise((resolve) => {
    const unsub = useOnboardingStore.persist.onFinishHydration(() => {
      unsub();
      resolve();
    });
  });
}
