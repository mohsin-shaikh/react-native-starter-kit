import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "expo-router";
import { useForm } from "react-hook-form";
import { View } from "react-native";

import { Screen } from "@/components/layout/screen";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Text } from "@/components/ui/text";
import { signupSchema, type SignupFormValues } from "@/features/auth/schemas";
import { useSignupMutation } from "@/queries/auth.queries";

export default function SignupScreen() {
  const { control, handleSubmit } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });
  const signup = useSignupMutation();

  const onSubmit = handleSubmit(({ name, email, password }) =>
    signup.mutate({ name, email, password }),
  );

  return (
    <Screen scroll className="justify-center py-10">
      <View className="gap-2">
        <Text variant="title">Create account</Text>
        <Text variant="subtitle">Start your free account in seconds.</Text>
      </View>

      <View className="mt-8 gap-4">
        <FormField
          control={control}
          name="name"
          label="Name"
          placeholder="Ada Lovelace"
        />
        <FormField
          control={control}
          name="email"
          label="Email"
          placeholder="you@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <FormField
          control={control}
          name="password"
          label="Password"
          placeholder="At least 8 characters"
          secureTextEntry
        />
        <FormField
          control={control}
          name="confirmPassword"
          label="Confirm password"
          placeholder="Re-enter your password"
          secureTextEntry
        />

        {signup.error ? (
          <Text variant="destructive">{signup.error.userMessage}</Text>
        ) : null}

        <Button
          label="Create account"
          onPress={onSubmit}
          loading={signup.isPending}
        />
      </View>

      <View className="mt-10 flex-row justify-center gap-1">
        <Text variant="muted">Already have an account?</Text>
        <Link
          href="/(auth)/login"
          className="text-sm font-semibold text-primary"
        >
          Sign in
        </Link>
      </View>
    </Screen>
  );
}
