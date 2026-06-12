import { Plus } from "lucide-react-native";
import { Pressable, type PressableProps } from "react-native";

import { useThemeColors } from "@/hooks/use-theme-colors";
import { cn } from "@/utils/cn";

export interface FabProps extends Omit<PressableProps, "children"> {
  accessibilityLabel: string;
  className?: string;
}

/**
 * Floating action button pinned to the bottom-right of its parent. Render it as
 * a sibling of the screen's scroll area (not inside it) so it stays fixed while
 * content scrolls.
 */
export function Fab({ accessibilityLabel, className, ...props }: FabProps) {
  const colors = useThemeColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className={cn(
        "absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg active:opacity-90",
        className,
      )}
      {...props}
    >
      <Plus color={colors.primaryForeground} size={26} />
    </Pressable>
  );
}
