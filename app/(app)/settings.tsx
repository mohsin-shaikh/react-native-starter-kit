import { View } from "react-native";

import { RoleGuard } from "@/components/guards/role-guard";
import { Screen } from "@/components/layout/screen";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { env } from "@/config/env";
import { useLogoutMutation } from "@/queries/auth.queries";

export default function SettingsScreen() {
  const logout = useLogoutMutation();

  return (
    <Screen scroll className="py-6" edges={["bottom"]}>
      <Text variant="heading">Settings</Text>

      <View className="mt-6 gap-3">
        <Card className="gap-1">
          <Text className="font-semibold">App version</Text>
          <Text variant="muted">
            {env.APP_VERSION} · {env.APP_ENV}
            {env.USE_MOCKS ? " · mocks on" : ""}
          </Text>
        </Card>

        {/* RBAC demo: only admins/owners see this section. */}
        <RoleGuard roles={["admin", "owner"]} fallback={null}>
          <Card className="gap-1">
            <Text className="font-semibold">Admin tools</Text>
            <Text variant="muted">Visible only to admin/owner roles.</Text>
          </Card>
        </RoleGuard>
      </View>

      <View className="mt-8">
        <Button
          label="Sign out"
          variant="destructive"
          loading={logout.isPending}
          onPress={() => logout.mutate()}
        />
      </View>
    </Screen>
  );
}
