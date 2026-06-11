import { useColorScheme } from "react-native";

import { palette, type ColorTokens } from "@/constants/colors";

/**
 * Returns the active theme's color tokens as JS values. Use it for things that
 * can't take a `className`: Lucide icons, react-native-svg, image tints, etc.
 *
 *   const c = useThemeColors();
 *   <House color={c.foreground} />
 */
export function useThemeColors(): ColorTokens {
  const scheme = useColorScheme();
  return scheme === "dark" ? palette.dark : palette.light;
}
