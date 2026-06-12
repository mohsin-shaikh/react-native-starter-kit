import { useRouter } from "expo-router";
import { View } from "react-native";

import { Screen } from "@/components/layout/screen";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

export default function CreatePurchaseScreen() {
  const router = useRouter();

  return (
    <Screen scroll className="py-6">
      <Text variant="muted">
        Build the purchase form here — vendor, line items, amount, bill date.
      </Text>

      <View className="mt-8 gap-3">
        <Button label="Save purchase" onPress={() => router.back()} />
        <Button label="Cancel" variant="ghost" onPress={() => router.back()} />
      </View>
    </Screen>
  );
}
