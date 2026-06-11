import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { View } from "react-native";

import { Screen } from "@/components/layout/screen";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Text } from "@/components/ui/text";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/features/auth/schemas";
import { useForgotPasswordMutation } from "@/queries/auth.queries";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { control, handleSubmit } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });
  const forgot = useForgotPasswordMutation();

  const onSubmit = handleSubmit((values) => forgot.mutate(values.email));

  return (
    <Screen scroll className="justify-center py-10">
      <View className="gap-2">
        <Text variant="title">Reset password</Text>
        <Text variant="subtitle">
          Enter your email and we&apos;ll send you a reset link.
        </Text>
      </View>

      {forgot.isSuccess ? (
        <View className="mt-8 gap-4">
          <Text>
            If an account exists for that email, a reset link is on its way.
          </Text>
          <Button
            label="Back to sign in"
            variant="outline"
            onPress={() => router.back()}
          />
        </View>
      ) : (
        <View className="mt-8 gap-4">
          <FormField
            control={control}
            name="email"
            label="Email"
            placeholder="you@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
          />
          {forgot.error ? (
            <Text variant="destructive">{forgot.error.userMessage}</Text>
          ) : null}
          <Button
            label="Send reset link"
            onPress={onSubmit}
            loading={forgot.isPending}
          />
        </View>
      )}
    </Screen>
  );
}
