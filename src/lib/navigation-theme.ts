// SDK 56: expo-router vendors its navigation core and re-exports the theming
// primitives. Import them from 'expo-router', NOT '@react-navigation/native'
// (which is no longer a compatible direct dependency).
import { DarkTheme, DefaultTheme } from "expo-router";

import { palette } from "@/constants/colors";

type Theme = typeof DefaultTheme;

/**
 * React Navigation themes for the header (Stack) and tab bar (Tabs) — surfaces
 * Uniwind's `className` can't reach. Built from the shared `palette` so the nav
 * chrome and screen content switch light/dark together with no visible seam.
 */
export const navLightTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: palette.light.primary,
    background: palette.light.background,
    card: palette.light.card,
    text: palette.light.foreground,
    border: palette.light.border,
    notification: palette.light.destructive,
  },
};

export const navDarkTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: palette.dark.primary,
    background: palette.dark.background,
    card: palette.dark.card,
    text: palette.dark.foreground,
    border: palette.dark.border,
    notification: palette.dark.destructive,
  },
};
