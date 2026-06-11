import { useRouter } from "expo-router";
import { View } from "react-native";

import { Screen } from "@/components/layout/screen";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { ROUTES } from "@/constants";
import { logger } from "@/lib/logger";
import { useOnboardingStore } from "@/stores/onboarding.store";

/**
 * Permissions step. This is where you'd request push-notification / camera /
 * location permission. We keep it a placeholder (no vendor) — wire the real
 * `expo-notifications` request inside `requestNotifications` later.
 */
export default function PermissionsScreen() {
  const router = useRouter();
  const setPermission = useOnboardingStore((s) => s.setPermission);
  const setStep = useOnboardingStore((s) => s.setStep);

  const goNext = () => {
    setStep("complete");
    router.push(ROUTES.ONBOARDING_COMPLETE);
  };

  const requestNotifications = async () => {
    // TODO: const { status } = await Notifications.requestPermissionsAsync();
    logger.info("onboarding: requesting notification permission (placeholder)");
    setPermission("notifications", true);
    goNext();
  };

  return (
    <Screen className="justify-between py-10">
      <View className="gap-6">
        <View className="gap-2">
          <Text variant="title">Stay in the loop</Text>
          <Text variant="subtitle">
            Enable notifications so you don&apos;t miss updates.
          </Text>
        </View>
        <Card className="gap-1">
          <Text className="font-semibold">Push notifications</Text>
          <Text variant="muted">
            Reminders, activity, and important alerts.
          </Text>
        </Card>
      </View>

      <View className="gap-3">
        <Button label="Enable notifications" onPress={requestNotifications} />
        <Button label="Maybe later" variant="ghost" onPress={goNext} />
      </View>
    </Screen>
  );
}
