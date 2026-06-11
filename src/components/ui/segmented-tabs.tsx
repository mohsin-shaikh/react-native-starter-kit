import { Pressable, View } from "react-native";

import { Text } from "@/components/ui/text";
import { cn } from "@/utils/cn";

export interface SegmentedTab<T extends string> {
  key: T;
  label: string;
}

interface SegmentedTabsProps<T extends string> {
  tabs: readonly SegmentedTab<T>[];
  value: T;
  onChange: (key: T) => void;
  className?: string;
}

/**
 * Non-swipeable top tabs: a row of labels with an underline on the active tab.
 * State lives in the parent — pair with conditional content. Use for in-screen
 * sections (Invoice/Purchase, Customer/Vendor), not route navigation.
 */
export function SegmentedTabs<T extends string>({
  tabs,
  value,
  onChange,
  className,
}: SegmentedTabsProps<T>) {
  return (
    <View className={cn("flex-row border-b border-border", className)}>
      {tabs.map((tab) => {
        const active = tab.key === value;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            className="flex-1 items-center"
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
          >
            <Text
              className={cn(
                "py-3 font-semibold",
                active ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {tab.label}
            </Text>
            <View
              className={cn(
                "h-0.5 w-full",
                active ? "bg-foreground" : "bg-transparent",
              )}
            />
          </Pressable>
        );
      })}
    </View>
  );
}
