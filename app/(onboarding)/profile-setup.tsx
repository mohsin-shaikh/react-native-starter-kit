import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { View } from "react-native";

import { Screen } from "@/components/layout/screen";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Text } from "@/components/ui/text";
import { ROUTES } from "@/constants";
import {
  profileSetupSchema,
  type ProfileSetupFormValues,
} from "@/features/auth/schemas";
import { useAuth } from "@/hooks/use-auth";
import { useOnboardingStore } from "@/stores/onboarding.store";

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const setProfile = useOnboardingStore((s) => s.setProfile);
  const setStep = useOnboardingStore((s) => s.setStep);

  const { control, handleSubmit } = useForm<ProfileSetupFormValues>({
    resolver: zodResolver(profileSetupSchema),
    defaultValues: { displayName: user?.name ?? "" },
  });

  const onSubmit = handleSubmit((values) => {
    setProfile({ displayName: values.displayName });
    setStep("permissions");
    router.push(ROUTES.ONBOARDING_PERMISSIONS);
  });

  return (
    <Screen scroll className="py-10">
      <View className="gap-2">
        <Text variant="title">Set up your profile</Text>
        <Text variant="subtitle">How should we address you?</Text>
      </View>

      <View className="mt-8 gap-4">
        <FormField
          control={control}
          name="displayName"
          label="Display name"
          placeholder="Your name"
        />
        <Button label="Continue" onPress={onSubmit} />
      </View>
    </Screen>
  );
}
