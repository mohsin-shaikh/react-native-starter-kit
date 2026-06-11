import { useRouter } from "expo-router";
import { ChevronRight, Settings, User } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { Screen } from "@/components/layout/screen";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { cn } from "@/utils/cn";

export default function MoreScreen() {
  const router = useRouter();
  const colors = useThemeColors();

  const rows = [
    {
      label: "Profile",
      icon: User,
      onPress: () => router.push("/(app)/profile"),
    },
    {
      label: "Settings",
      icon: Settings,
      onPress: () => router.push("/(app)/settings"),
    },
  ] as const;

  return (
    <Screen scroll className="py-6" edges={["bottom"]}>
      <Text variant="heading">More</Text>

      <Card className="mt-6 gap-0 p-0">
        {rows.map((row, i) => {
          const Icon = row.icon;
          return (
            <Pressable
              key={row.label}
              onPress={row.onPress}
              className={cn(
                "flex-row items-center gap-3 p-4 active:bg-accent",
                i > 0 && "border-t border-border",
              )}
            >
              <Icon color={colors.foreground} size={20} />
              <Text className="flex-1 font-semibold">{row.label}</Text>
              <ChevronRight color={colors.mutedForeground} size={18} />
            </Pressable>
          );
        })}
      </Card>
    </Screen>
  );
}
