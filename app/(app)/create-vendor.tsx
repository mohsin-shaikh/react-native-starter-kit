import { useRouter } from "expo-router";
import { View } from "react-native";

import { Screen } from "@/components/layout/screen";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

export default function CreateVendorScreen() {
  const router = useRouter();

  return (
    <Screen scroll className="py-6">
      <Text variant="muted">
        Build the vendor form here — name, phone, email, opening balance.
      </Text>

      <View className="mt-8 gap-3">
        <Button label="Save vendor" onPress={() => router.back()} />
        <Button label="Cancel" variant="ghost" onPress={() => router.back()} />
      </View>
    </Screen>
  );
}
