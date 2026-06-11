import { Stack } from "expo-router";

import { GuestGuard } from "@/components/guards/guest-guard";

/**
 * Auth group layout. The GuestGuard wraps the whole stack, so NONE of these
 * screens can be reached by an authenticated user — the guard redirects first.
 */
export default function AuthLayout() {
  return (
    <GuestGuard>
      <Stack
        screenOptions={{ headerShown: false, animation: "slide_from_right" }}
      />
    </GuestGuard>
  );
}
