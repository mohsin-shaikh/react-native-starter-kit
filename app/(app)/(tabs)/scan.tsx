import { ScanLine } from "lucide-react-native";
import { View } from "react-native";

import { Screen } from "@/components/layout/screen";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/hooks/use-theme-colors";

export default function ScanScreen() {
  const colors = useThemeColors();

  return (
    <Screen className="items-center justify-center gap-6">
      <View className="h-24 w-24 items-center justify-center rounded-full bg-secondary">
        <ScanLine color={colors.foreground} size={40} />
      </View>

      <View className="items-center gap-1">
        <Text variant="subtitle">Scan a receipt</Text>
        <Text variant="muted" className="text-center">
          Capture a bill and let AI extract the amount, date, and party.
        </Text>
      </View>

      <Button label="Open camera" onPress={() => {}} />
    </Screen>
  );
}
