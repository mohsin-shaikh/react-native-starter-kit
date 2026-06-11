import { Stack } from "expo-router";

import { OnboardingGuard } from "@/components/guards/onboarding-guard";

/**
 * Onboarding group. The OnboardingGuard ensures only authenticated, not-yet-
 * onboarded users reach these screens. `gestureEnabled: false` keeps the flow
 * linear (no swipe-back skipping steps).
 */
export default function OnboardingLayout() {
  return (
    <OnboardingGuard>
      <Stack screenOptions={{ headerShown: false, gestureEnabled: false }} />
    </OnboardingGuard>
  );
}
