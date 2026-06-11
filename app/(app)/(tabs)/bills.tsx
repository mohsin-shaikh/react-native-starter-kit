import { useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Screen } from "@/components/layout/screen";
import { Card } from "@/components/ui/card";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";
import { Text } from "@/components/ui/text";

type BillsTab = "invoice" | "purchase";

const TABS = [
  { key: "invoice", label: "Invoice" },
  { key: "purchase", label: "Purchase" },
] as const;

const COPY: Record<BillsTab, { title: string; body: string }> = {
  invoice: {
    title: "No invoices yet",
    body: "Invoices you raise to customers will appear here.",
  },
  purchase: {
    title: "No purchases yet",
    body: "Bills you receive from vendors will appear here.",
  },
};

export default function BillsScreen() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<BillsTab>("invoice");
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
    </View>
  );
}
