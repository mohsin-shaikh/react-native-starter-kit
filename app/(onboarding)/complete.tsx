import { useRouter } from "expo-router";
import { Check } from "lucide-react-native";
import { View } from "react-native";

import { Screen } from "@/components/layout/screen";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { ROUTES } from "@/constants";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { analytics } from "@/lib/analytics";
import { useOnboardingStore } from "@/stores/onboarding.store";

export default function CompleteScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const complete = useOnboardingStore((s) => s.complete);

  const finish = () => {
    // Flipping `hasCompleted` is what unlocks the app group for this user.
    complete();
    analytics.track("onboarding_completed", { durationMs: 0 });
    // Replace so the back gesture can't return into the onboarding flow.
    router.replace(ROUTES.HOME);
  };

  return (
    <Screen className="justify-between py-10">
      <View className="flex-1 items-center justify-center gap-4">
        <View className="h-24 w-24 items-center justify-center rounded-full bg-primary">
          <Check color={colors.primaryForeground} size={48} strokeWidth={3} />
        </View>
        <Text variant="title" className="text-center">
          You&apos;re all set!
        </Text>
        <Text variant="subtitle" className="text-center">
          Your account is ready. Let&apos;s dive in.
        </Text>
      </View>

      <Button label="Go to app" onPress={finish} />
    </Screen>
  );
}
