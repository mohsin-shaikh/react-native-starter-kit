import { useRouter } from "expo-router";
import {
  Building,
  ChevronRight,
  CircleQuestionMark,
  Crown,
  FileCog,
  Gift,
  Globe,
  GraduationCap,
  Landmark,
  LayoutTemplate,
  LifeBuoy,
  type LucideIcon,
  Megaphone,
  MessageSquare,
  Package,
  PenTool,
  Settings,
  Share,
  ShieldCheck,
  Star,
  StickyNote,
  User,
} from "lucide-react-native";
import { Pressable, View } from "react-native";

import { Screen } from "@/components/layout/screen";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { cn } from "@/utils/cn";

interface Row {
  label: string;
  icon: LucideIcon;
  onPress?: () => void;
}

interface Section {
  title: string;
  rows: Row[];
}

export default function MoreScreen() {
  const router = useRouter();
  const colors = useThemeColors();

  const sections: Section[] = [
    {
      title: "Profile",
      rows: [
        { label: "Company", icon: Building },
        {
          label: "User Profile",
          icon: User,
          onPress: () => router.push("/(app)/profile"),
        },
        { label: "User Roles", icon: ShieldCheck },
      ],
    },
    {
      title: "Entries",
      rows: [{ label: "Products", icon: Package }],
    },
    {
      title: "Settings",
      rows: [
        { label: "Documents Settings", icon: FileCog },
        {
          label: "General Settings",
          icon: Settings,
          onPress: () => router.push("/(app)/settings"),
        },
        { label: "Invoice Template", icon: LayoutTemplate },
        { label: "Bank", icon: Landmark },
        { label: "Signatures", icon: PenTool },
        { label: "Notes & Terms", icon: StickyNote },
      ],
    },
    {
      title: "Support",
      rows: [
        { label: "Help & Support", icon: LifeBuoy },
        { label: "Tutorials", icon: GraduationCap },
        { label: "F.A.Q.s", icon: CircleQuestionMark },
        { label: "Feedback", icon: MessageSquare },
      ],
    },
    {
      title: "Other",
      rows: [
        { label: "Explore Subscription Plans", icon: Crown },
        { label: "Refer & Get ₹1000", icon: Gift },
        { label: "Social Links", icon: Globe },
        { label: "Rate app on Play Store", icon: Star },
        { label: "Share", icon: Share },
        { label: "What's New", icon: Megaphone },
      ],
    },
  ];

  return (
    <Screen scroll className="py-6">
      <Text variant="heading">More</Text>

      <View className="mt-4 gap-6">
        {sections.map((section) => (
          <View key={section.title} className="gap-2">
            <Text variant="muted" className="px-1 uppercase">
              {section.title}
            </Text>
            <Card className="gap-0 p-0">
              {section.rows.map((row, i) => {
                const Icon = row.icon;
                return (
                  <Pressable
                    key={row.label}
                    onPress={row.onPress}
                    accessibilityRole="button"
                    className={cn(
                      "flex-row items-center gap-3 p-4 active:bg-accent",
                      i > 0 && "border-t border-border",
                    )}
                  >
                    <Icon color={colors.foreground} size={20} />
                    <Text className="flex-1 font-medium">{row.label}</Text>
                    <ChevronRight color={colors.mutedForeground} size={18} />
                  </Pressable>
                );
              })}
            </Card>
          </View>
        ))}
      </View>
    </Screen>
  );
}
