import { Building2, Check, ChevronDown } from "lucide-react-native";
import { useState } from "react";
import { Modal, Pressable, View } from "react-native";

import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/hooks/use-theme-colors";
import {
  selectActiveOrg,
  useOrganizationStore,
} from "@/stores/organization.store";
import { cn } from "@/utils/cn";

/**
 * Tenant switcher for the home header. Shows the active organization and opens
 * a sheet to switch between the ones the user belongs to.
 */
export function OrganizationSwitcher() {
  const colors = useThemeColors();
  const [open, setOpen] = useState(false);

  const organizations = useOrganizationStore((s) => s.organizations);
  const activeOrg = useOrganizationStore(selectActiveOrg);
  const setActiveOrg = useOrganizationStore((s) => s.setActiveOrg);

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
          {activeOrg.name}
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

            {organizations.map((org) => {
              const active = org.id === activeOrg.id;
              return (
                <Pressable
                  key={org.id}
                  onPress={() => {
                    setActiveOrg(org.id);
                    setOpen(false);
                  }}
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
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
