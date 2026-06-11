import { View } from "react-native";

import { Screen } from "@/components/layout/screen";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";

export default function BillsScreen() {
  return (
    <Screen scroll className="py-6" edges={["bottom"]}>
      <Text variant="heading">Bills</Text>

      <View className="mt-6 gap-3">
        <Card className="items-center gap-1 py-8">
          <Text className="font-semibold">No bills yet</Text>
          <Text variant="muted" className="text-center">
            Scanned and manually added bills will appear here.
          </Text>
        </Card>
      </View>
    </Screen>
  );
}
