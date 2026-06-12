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
        <Stack.Screen
          name="profile"
          options={{ headerShown: true, title: "Profile" }}
        />
        <Stack.Screen
          name="settings"
          options={{ headerShown: true, title: "Settings" }}
        />
        <Stack.Screen
          name="create-invoice"
          options={{
            headerShown: true,
            title: "New Invoice",
            presentation: "modal",
          }}
        />
        <Stack.Screen
          name="create-purchase"
          options={{
            headerShown: true,
            title: "New Purchase",
            presentation: "modal",
          }}
        />
        <Stack.Screen
          name="create-customer"
          options={{
            headerShown: true,
            title: "New Customer",
            presentation: "modal",
          }}
        />
        <Stack.Screen
          name="create-vendor"
          options={{
            headerShown: true,
            title: "New Vendor",
            presentation: "modal",
          }}
        />
      </Stack>
    </AuthGuard>
  );
}
