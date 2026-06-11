import { Link } from "expo-router";
import { View } from "react-native";

import { Text } from "@/components/ui/text";

export default function NotFound() {
  return (
    <View className="flex-1 items-center justify-center gap-3 bg-background px-6">
      <Text variant="heading">This screen doesn&apos;t exist.</Text>
      <Link href="/" className="text-primary underline">
        Go home
      </Link>
    </View>
  );
}
