import { Redirect } from "expo-router";
import { type ReactNode } from "react";

import { LoadingScreen } from "@/components/feedback/loading-screen";
import { ROUTES } from "@/constants";
import { useAuthStore } from "@/stores/auth.store";
import { useOnboardingStore } from "@/stores/onboarding.store";

/**
 * OnboardingGuard — protects the onboarding group.
 *
 * Onboarding is a POST-auth step in this template, so:
 *  - not authenticated?       -> login (can't onboard a stranger)
 *  - already completed?       -> straight to the app
 *  - otherwise                -> let them onboard
 */
export function OnboardingGuard({ children }: { children: ReactNode }) {
  const status = useAuthStore((s) => s.status);
  const hasOnboarded = useOnboardingStore((s) => s.hasCompleted);

  if (status === "idle" || status === "restoring") {
    return <LoadingScreen />;
  }
  if (status === "unauthenticated") {
    return <Redirect href={ROUTES.LOGIN} />;
  }
  if (hasOnboarded) {
    return <Redirect href={ROUTES.HOME} />;
  }
  return <>{children}</>;
}
