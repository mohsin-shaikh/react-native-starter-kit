import { type ReactNode } from "react";
import { ScrollView, View } from "react-native";
import {
  SafeAreaView as RNSafeAreaView,
  type Edge,
} from "react-native-safe-area-context";
import { withUniwind } from "uniwind";

import { cn } from "@/utils/cn";

// Core RN components (View, Text, Pressable, TextInput, ScrollView) accept
// className automatically. Third-party components like SafeAreaView must be
// wrapped once with withUniwind to gain className support.
const SafeAreaView = withUniwind(RNSafeAreaView);

interface ScreenProps {
  children: ReactNode;
  /** Wrap content in a ScrollView (forms, long content). */
  scroll?: boolean;
  className?: string;
  edges?: readonly Edge[];
}

/**
 * Standard screen container: safe-area aware, themed background, consistent
 * padding. Use on every screen so spacing/insets are uniform app-wide.
 */
export function Screen({
  children,
  scroll = false,
  className,
  edges = ["top", "bottom"],
}: ScreenProps) {
  const content = (
    <View className={cn("flex-1 px-5", className)}>{children}</View>
  );
  return (
    <SafeAreaView edges={edges} className="flex-1 bg-background">
      {scroll ? (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}
