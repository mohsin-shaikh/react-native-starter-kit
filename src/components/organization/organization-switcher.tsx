import { useRouter } from "expo-router";
import { Building2, Check, ChevronDown, Plus } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Modal, Pressable, View } from "react-native";

import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/hooks/use-theme-colors";
import {
  useOrganizationsQuery,
  useSetActiveOrganizationMutation,
} from "@/queries/organization.queries";
import { useOrganizationStore } from "@/stores/organization.store";
import type { Organization } from "@/types";
import { cn } from "@/utils/cn";

/**
 * Tenant switcher for the home header. Shows the active organization (a
 * session value mirrored in the organization store) and opens a sheet to
 * switch between the ones the user belongs to (server list via React Query).
 * Switching is optimistic — the mutation rolls the mirror back on failure.
 */
export function OrganizationSwitcher() {
  const colors = useThemeColors();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const {
    data: organizations,
    isPending,
    isError,
    refetch,
  } = useOrganizationsQuery();
  const activeOrgId = useOrganizationStore((s) => s.activeOrgId);
  const switchOrg = useSetActiveOrganizationMutation();

  const activeOrg = organizations?.find((o) => o.id === activeOrgId);
  // `activeOrgId` hydrates with the session; show a neutral label while the
  // list is loading or when the user has no organization yet.
  const triggerLabel = activeOrg?.name ?? (isPending ? "…" : "No organization");

  const onSelect = (org: Organization) => {
    setOpen(false);
    if (org.id !== activeOrgId) switchOrg.mutate(org.id);
  };

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Switch organization"
        className="flex-row items-center gap-2 self-start rounded-full border border-border bg-card py-1.5 pl-2 pr-3 active:opacity-80"
      >
        <View className="h-7 w-7 items-center justify-center rounded-full bg-secondary">
          <Building2 color={colors.foreground} size={16} />
        </View>
        <Text className="max-w-[180px] font-semibold" numberOfLines={1}>
          {triggerLabel}
        </Text>
        <ChevronDown color={colors.mutedForeground} size={16} />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          className="flex-1 justify-end bg-black/40"
          onPress={() => setOpen(false)}
        >
          {/* Stop propagation so taps inside the sheet don't dismiss it. */}
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="rounded-t-2xl bg-background p-4 pb-8"
          >
            <Text variant="muted" className="mb-2 px-2">
              Switch organization
            </Text>

            {isPending && (
              <View className="items-center py-6">
                <ActivityIndicator color={colors.foreground} />
              </View>
            )}

            {isError && (
              <Pressable
                onPress={() => refetch()}
                className="items-center rounded-lg p-4 active:bg-accent"
              >
                <Text variant="muted">
                  Couldn’t load organizations. Tap to retry.
                </Text>
              </Pressable>
            )}

            {organizations?.length === 0 && (
              <View className="items-center p-4">
                <Text variant="muted">
                  You don’t belong to any organization yet.
                </Text>
              </View>
            )}

            {organizations?.map((org) => {
              const active = org.id === activeOrgId;
              return (
                <Pressable
                  key={org.id}
                  onPress={() => onSelect(org)}
                  className="flex-row items-center gap-3 rounded-lg p-3 active:bg-accent"
                >
                  <View className="h-9 w-9 items-center justify-center rounded-full bg-secondary">
                    <Building2 color={colors.foreground} size={18} />
                  </View>
                  <Text
                    className={cn("flex-1", active && "font-semibold")}
                    numberOfLines={1}
                  >
                    {org.name}
                  </Text>
                  {active && <Check color={colors.foreground} size={18} />}
                </Pressable>
              );
            })}

            <Pressable
              onPress={() => {
                setOpen(false);
                router.push("/(app)/create-organization");
              }}
              accessibilityRole="button"
              className="mt-1 flex-row items-center gap-3 rounded-lg p-3 active:bg-accent"
            >
              <View className="h-9 w-9 items-center justify-center rounded-full border border-dashed border-border">
                <Plus color={colors.mutedForeground} size={18} />
              </View>
              <Text variant="muted" className="flex-1">
                New organization
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
