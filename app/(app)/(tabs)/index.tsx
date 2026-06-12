import { View } from "react-native";

import { Screen } from "@/components/layout/screen";
import { OrganizationSwitcher } from "@/components/organization/organization-switcher";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/hooks/use-auth";

export default function HomeScreen() {
  const { user } = useAuth();

  return (
    <Screen scroll className="py-6">
      <View className="mb-6 flex-row">
        <OrganizationSwitcher />
      </View>

      <View className="gap-1">
        <Text variant="muted">Welcome back,</Text>
        <Text variant="title">{user?.name ?? "there"} 👋</Text>
      </View>

      <View className="mt-6 flex-row gap-3">
        <Card className="flex-1 gap-1">
          <Text variant="muted">Receivable</Text>
          <Text variant="subtitle">₹0</Text>
        </Card>
        <Card className="flex-1 gap-1">
          <Text variant="muted">Payable</Text>
          <Text variant="subtitle">₹0</Text>
        </Card>
      </View>

      <View className="mt-6 gap-3">
        <Card className="gap-1">
          <Text className="font-semibold">Recent bills</Text>
          <Text variant="muted">
            No bills yet. Use the Scan tab to capture a receipt, or add one from
            the Bills tab.
          </Text>
        </Card>
      </View>
    </Screen>
  );
}
