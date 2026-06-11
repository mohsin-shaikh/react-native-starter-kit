import { Redirect } from "expo-router";

import { LoadingScreen } from "@/components/feedback/loading-screen";
import { ROUTES } from "@/constants";
import { useAuthStore } from "@/stores/auth.store";
import { useOnboardingStore } from "@/stores/onboarding.store";

/**
 * Entry route. This is the single place that encodes the launch flow:
 *
 *   not authenticated      -> auth
 *   authenticated + !onboarded -> onboarding
 *   authenticated + onboarded  -> app
 *
 * Everything is a declarative <Redirect>, so deep links that land on "/" also
 * route correctly, and there are no imperative-navigation race conditions.
 */
export default function Index() {
  const status = useAuthStore((s) => s.status);
  const hasOnboarded = useOnboardingStore((s) => s.hasCompleted);

  if (status === "idle" || status === "restoring") {
    return <LoadingScreen />;
  }
  if (status === "unauthenticated") {
    return <Redirect href={ROUTES.LOGIN} />;
  }
  if (!hasOnboarded) {
    return <Redirect href={ROUTES.ONBOARDING_WELCOME} />;
  }
  return <Redirect href={ROUTES.HOME} />;
}
