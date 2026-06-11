import { View } from "react-native";

import { LoadingScreen } from "@/components/feedback/loading-screen";
import { Screen } from "@/components/layout/screen";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { useProfileQuery } from "@/queries/user.queries";

/**
 * Profile screen — reads SERVER state via React Query (useProfileQuery), not
 * the auth store. Demonstrates the loading/error/success split that Query
 * gives every data screen for free.
 */
export default function ProfileScreen() {
  const {
    data: profile,
    isLoading,
    isError,
    error,
    refetch,
  } = useProfileQuery();

  if (isLoading) return <LoadingScreen message="Loading profile…" />;

  if (isError) {
    return (
      <Screen className="items-center justify-center gap-4">
        <Text variant="subtitle" className="text-center">
          {error.userMessage}
        </Text>
        <Button label="Retry" onPress={() => refetch()} />
      </Screen>
    );
  }

  return (
    <Screen scroll className="py-6" edges={["bottom"]}>
      <View className="items-center gap-3">
        <View className="h-20 w-20 items-center justify-center rounded-full bg-secondary">
          <Text variant="heading">{profile?.name.charAt(0).toUpperCase()}</Text>
        </View>
        <Text variant="heading">{profile?.name}</Text>
        <Text variant="muted">{profile?.email}</Text>
      </View>

      <Card className="mt-6 gap-2">
        <Text className="font-semibold">Roles</Text>
        <Text variant="muted">{profile?.roles.join(", ")}</Text>
      </Card>
    </Screen>
  );
}
