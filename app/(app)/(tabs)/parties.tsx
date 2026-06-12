import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Screen } from "@/components/layout/screen";
import { Card } from "@/components/ui/card";
import { Fab } from "@/components/ui/fab";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";
import { Text } from "@/components/ui/text";

type PartiesTab = "customer" | "vendor";

const TABS = [
  { key: "customer", label: "Customer" },
  { key: "vendor", label: "Vendor" },
] as const;

const COPY: Record<PartiesTab, { title: string; body: string }> = {
  customer: {
    title: "No customers yet",
    body: "Add a customer to start tracking what they owe you.",
  },
  vendor: {
    title: "No vendors yet",
    body: "Add a vendor to start tracking what you owe them.",
  },
};

export default function PartiesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [tab, setTab] = useState<PartiesTab>("customer");
  const copy = COPY[tab];

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <SegmentedTabs tabs={TABS} value={tab} onChange={setTab} />
      <Screen scroll className="py-6" edges={["bottom"]}>
        <View className="gap-3">
          <Card className="items-center gap-1 py-8">
            <Text className="font-semibold">{copy.title}</Text>
            <Text variant="muted" className="text-center">
              {copy.body}
            </Text>
          </Card>
        </View>
      </Screen>
      <Fab
        accessibilityLabel={`Create ${tab}`}
        onPress={() =>
          router.push(
            tab === "customer"
              ? "/(app)/create-customer"
              : "/(app)/create-vendor",
          )
        }
      />
    </View>
  );
}
