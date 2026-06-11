import { ActivityIndicator, View } from "react-native";

import { Text } from "@/components/ui/text";

/**
 * Full-screen loading state. Shown by the root layout while the session is
 * being restored (after the native splash hides) and as a Suspense/Query
 * fallback for whole screens.
 */
export function LoadingScreen({ message }: { message?: string }) {
  return (
    <View className="flex-1 items-center justify-center gap-3 bg-background">
      <ActivityIndicator size="large" />
      {message ? <Text variant="muted">{message}</Text> : null}
    </View>
  );
}
