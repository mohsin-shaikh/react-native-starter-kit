import { Stack } from "expo-router";

import { AuthGuard } from "@/components/guards/auth-guard";

/**
 * App group. AuthGuard protects everything here (tabs, modals, settings).
 * `(modals)` could be added as a sibling with `presentation: 'modal'`.
 */
export default function AppLayout() {
  return (
    <AuthGuard>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </AuthGuard>
  );
}
