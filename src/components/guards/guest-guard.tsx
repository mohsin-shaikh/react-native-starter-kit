import { Redirect } from "expo-router";
import { type ReactNode } from "react";

import { LoadingScreen } from "@/components/feedback/loading-screen";
import { ROUTES } from "@/constants";
import { useAuthStore } from "@/stores/auth.store";
import { useOnboardingStore } from "@/stores/onboarding.store";

/**
 * GuestGuard — protects the auth group (login/signup/forgot-password).
 *
 * An already-authenticated user must never see the login screen; bounce them
 * forward to onboarding or the app depending on their onboarding state.
 */
export function GuestGuard({ children }: { children: ReactNode }) {
  const status = useAuthStore((s) => s.status);
  const hasOnboarded = useOnboardingStore((s) => s.hasCompleted);

  if (status === "idle" || status === "restoring") {
    return <LoadingScreen />;
  }
  if (status === "authenticated") {
    return (
      <Redirect href={hasOnboarded ? ROUTES.HOME : ROUTES.ONBOARDING_WELCOME} />
    );
  }
  return <>{children}</>;
}
