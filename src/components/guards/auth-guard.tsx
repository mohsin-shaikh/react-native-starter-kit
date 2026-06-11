import { Redirect } from "expo-router";
import { type ReactNode } from "react";

import { LoadingScreen } from "@/components/feedback/loading-screen";
import { ROUTES } from "@/constants";
import { useAuthStore } from "@/stores/auth.store";
import { useOnboardingStore } from "@/stores/onboarding.store";

/**
 * AuthGuard — protects the main app group.
 *
 * Rules enforced:
 *  - still booting?            -> show loader (don't flash a redirect)
 *  - not authenticated?        -> back to login
 *  - authenticated but not yet onboarded? -> into onboarding
 *  - otherwise                 -> render the app
 *
 * Declarative redirects (vs. imperative router.replace in effects) are race-
 * free: the navigator simply never mounts a protected screen for the wrong
 * state.
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const status = useAuthStore((s) => s.status);
  const hasOnboarded = useOnboardingStore((s) => s.hasCompleted);

  if (status === "idle" || status === "restoring") {
    return <LoadingScreen message="Loading your session…" />;
  }
  if (status === "unauthenticated") {
    return <Redirect href={ROUTES.LOGIN} />;
  }
  if (!hasOnboarded) {
    return <Redirect href={ROUTES.ONBOARDING_WELCOME} />;
  }
  return <>{children}</>;
}
