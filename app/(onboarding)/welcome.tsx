import { useRouter } from "expo-router";
import { View } from "react-native";

import { Screen } from "@/components/layout/screen";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { ROUTES } from "@/constants";
import { useOnboardingStore } from "@/stores/onboarding.store";

export default function WelcomeScreen() {
  const router = useRouter();
  const setStep = useOnboardingStore((s) => s.setStep);

  return (
    <Screen className="justify-between py-10">
      <View className="flex-1 items-center justify-center gap-4">
        <View className="h-24 w-24 rounded-3xl bg-primary" />
        <Text variant="title" className="text-center">
          Welcome 👋
        </Text>
        <Text variant="subtitle" className="text-center">
          Let&apos;s get your account set up. It only takes a minute.
        </Text>
      </View>

      <Button
        label="Get started"
        onPress={() => {
          setStep("profile");
          router.push(ROUTES.ONBOARDING_PROFILE);
        }}
      />
    </Screen>
  );
}
