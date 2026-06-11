import { Tabs } from "expo-router";
import { House, Menu, ReceiptText, ScanLine, Users } from "lucide-react-native";

/**
 * Bottom tab navigator for the accounting app. Lucide icons receive `color`
 * and `size` straight from React Navigation, which is themed in the root
 * layout — so the icons follow the system dark/light theme with no hardcoded
 * colors.
 */
export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <House color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="bills"
        options={{
          title: "Bills",
          tabBarIcon: ({ color, size }) => (
            <ReceiptText color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: "Scan",
          tabBarIcon: ({ color, size }) => (
            <ScanLine color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="parties"
        options={{
          title: "Parties",
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarIcon: ({ color, size }) => <Menu color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
