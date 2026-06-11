import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "expo-router";
import { useForm } from "react-hook-form";
import { View } from "react-native";

import { Screen } from "@/components/layout/screen";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Text } from "@/components/ui/text";
import { loginSchema, type LoginFormValues } from "@/features/auth/schemas";
import { useLoginMutation } from "@/queries/auth.queries";

/**
 * Login screen — the canonical RHF + Zod + React Query pattern:
 *  - useForm + zodResolver: typed values, client-side validation
 *  - useLoginMutation: async state (isPending) + normalized AppError
 *  On success the auth store flips to `authenticated`; the GuestGuard then
 *  redirects away automatically — no manual navigation here.
 */
export default function LoginScreen() {
  const { control, handleSubmit } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "demo@example.com", password: "password123" },
  });
  const login = useLoginMutation();

  const onSubmit = handleSubmit((values) => login.mutate(values));

  return (
    <Screen scroll className="justify-center py-10">
      <View className="gap-2">
        <Text variant="title">Welcome back</Text>
        <Text variant="subtitle">Sign in to continue.</Text>
      </View>

      <View className="mt-8 gap-4">
        <FormField
          control={control}
          name="email"
          label="Email"
          placeholder="you@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />
        <FormField
          control={control}
          name="password"
          label="Password"
          placeholder="••••••••"
          secureTextEntry
          autoComplete="password"
        />

        {login.error ? (
          <Text variant="destructive">{login.error.userMessage}</Text>
        ) : null}

        <Button label="Sign in" onPress={onSubmit} loading={login.isPending} />

        <Link
          href="/(auth)/forgot-password"
          className="text-center text-sm text-primary"
        >
          Forgot password?
        </Link>
      </View>

      <View className="mt-10 flex-row justify-center gap-1">
        <Text variant="muted">Don&apos;t have an account?</Text>
        <Link
          href="/(auth)/signup"
          className="text-sm font-semibold text-primary"
        >
          Sign up
        </Link>
      </View>
    </Screen>
  );
}
