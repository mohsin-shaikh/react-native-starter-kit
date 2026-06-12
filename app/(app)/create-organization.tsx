import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { View } from "react-native";

import { Screen } from "@/components/layout/screen";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Text } from "@/components/ui/text";
import {
  createOrganizationSchema,
  type CreateOrganizationFormValues,
} from "@/features/organization/schemas";
import { useCreateOrganizationMutation } from "@/queries/organization.queries";

/**
 * Create a new organization (tenant). On success the new org becomes the
 * active one (the mutation handles the switch), so going back lands the user
 * straight in their new workspace.
 */
export default function CreateOrganizationScreen() {
  const router = useRouter();
  const { control, handleSubmit } = useForm<CreateOrganizationFormValues>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: { name: "" },
  });
  const createOrg = useCreateOrganizationMutation();

  const onSubmit = handleSubmit((values) =>
    createOrg.mutate(values, { onSuccess: () => router.back() }),
  );

  return (
    <Screen scroll className="py-6">
      <Text variant="muted">
        Organizations keep books separate — each one has its own bills,
        parties, and reports.
      </Text>

      <View className="mt-6 gap-4">
        <FormField
          control={control}
          name="name"
          label="Organization name"
          placeholder="e.g. Acme Traders"
          autoFocus
        />

        {createOrg.error ? (
          <Text variant="destructive">{createOrg.error.userMessage}</Text>
        ) : null}

        <Button
          label="Create organization"
          onPress={onSubmit}
          loading={createOrg.isPending}
        />
        <Button label="Cancel" variant="ghost" onPress={() => router.back()} />
      </View>
    </Screen>
  );
}
