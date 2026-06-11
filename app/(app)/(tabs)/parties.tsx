import { View } from "react-native";

import { Screen } from "@/components/layout/screen";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";

export default function PartiesScreen() {
  return (
    <Screen scroll className="py-6" edges={["bottom"]}>
      <Text variant="heading">Parties</Text>
      <Text variant="muted" className="mt-1">
        Customers and suppliers you transact with.
      </Text>

      <View className="mt-6 gap-3">
        <Card className="items-center gap-1 py-8">
          <Text className="font-semibold">No parties yet</Text>
          <Text variant="muted" className="text-center">
            Add a customer or supplier to start tracking what they owe you.
          </Text>
        </Card>
      </View>
    </Screen>
  );
}
