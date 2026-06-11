import { View } from "react-native";

import { Screen } from "@/components/layout/screen";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/hooks/use-auth";

export default function HomeScreen() {
  const { user } = useAuth();

  return (
    <Screen scroll className="py-6" edges={["bottom"]}>
      <View className="gap-1">
        <Text variant="muted">Welcome back,</Text>
        <Text variant="title">{user?.name ?? "there"} 👋</Text>
      </View>

      <View className="mt-6 gap-3">
        <Card className="gap-1">
          <Text className="font-semibold">Your starter is ready</Text>
          <Text variant="muted">
            This screen reads the signed-in user from the Zustand auth store.
          </Text>
        </Card>
        <Card className="gap-1">
          <Text className="font-semibold">Next steps</Text>
          <Text variant="muted">
            Swap the mock repository for a real backend in
            src/services/repositories/index.ts — no screen changes required.
          </Text>
        </Card>
      </View>
    </Screen>
  );
}
