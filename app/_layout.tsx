import "../global.css";

import { Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { useColorScheme } from "react-native";

import { AppProviders } from "@/providers/app-providers";
import { crashReporter } from "@/lib/crash-reporting";
import { navDarkTheme, navLightTheme } from "@/lib/navigation-theme";
import { useAuthStore } from "@/stores/auth.store";

// Keep the native splash up until the first navigation decision is made, so the
// user never sees an empty/flashing screen during session restore.
void SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const status = useAuthStore((s) => s.status);
  const initialize = useAuthStore((s) => s.initialize);

  // ---- Bootstrap: runs exactly once on cold start --------------------------
  useEffect(() => {
    crashReporter.init();
    void initialize(); // session restore -> sets status to (un)authenticated
  }, [initialize]);

  // Hide the native splash once bootstrap has resolved the auth status.
  useEffect(() => {
    if (status !== "idle" && status !== "restoring") {
      void SplashScreen.hideAsync();
    }
  }, [status]);

  // While restoring, keep the native splash on screen (render nothing).
  if (status === "idle" || status === "restoring") {
    return null;
  }

  // A single Stack hosting the three route GROUPS. Each group's _layout applies
  // its own guard, so this stack itself stays dumb. `index` is the entry that
  // redirects to the correct group.
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="(app)" />
      <Stack.Screen
        name="+not-found"
        options={{ headerShown: true, title: "Not found" }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  // Drive React Navigation's chrome (header + tab bar) from the system theme,
  // the same signal Uniwind uses for the `dark` variant — so nav and content
  // flip together.
  const colorScheme = useColorScheme();

  return (
    <AppProviders>
      <ThemeProvider
        value={colorScheme === "dark" ? navDarkTheme : navLightTheme}
      >
        <StatusBar style="auto" />
        <RootNavigator />
      </ThemeProvider>
    </AppProviders>
  );
}
