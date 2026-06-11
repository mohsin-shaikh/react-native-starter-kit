import { type ReactNode } from "react";
import { View } from "react-native";

import { Text } from "@/components/ui/text";
import { useAuthStore } from "@/stores/auth.store";
import type { Role } from "@/types";

/**
 * RoleGuard — RBAC at the component/route level. Wrap any subtree that should
 * only render for certain roles. Use the `fallback` to either hide it or show
 * a "not authorized" surface.
 *
 *   <RoleGuard roles={['admin', 'owner']}><AdminPanel /></RoleGuard>
 *
 * Client-side RBAC is for UX only — the backend MUST re-check permissions on
 * every privileged request.
 */
export function RoleGuard({
  roles,
  children,
  fallback,
}: {
  roles: Role[];
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const userRoles = useAuthStore((s) => s.user?.roles ?? []);
  const allowed = roles.some((r) => userRoles.includes(r));

  if (!allowed) {
    return (
      fallback ?? (
        <View className="flex-1 items-center justify-center px-6">
          <Text variant="subtitle" className="text-center">
            You don&apos;t have permission to view this.
          </Text>
        </View>
      )
    );
  }
  return <>{children}</>;
}
