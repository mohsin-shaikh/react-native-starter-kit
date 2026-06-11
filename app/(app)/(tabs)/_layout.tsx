import { Tabs } from "expo-router";
import { House, Settings, User } from "lucide-react-native";

/**
 * Bottom tab navigator. Lucide icons receive `color` and `size` straight from
 * React Navigation, which is themed in the root layout — so the icons follow
 * the system dark/light theme with no hardcoded colors.
 */
export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: true }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <House color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Settings color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
