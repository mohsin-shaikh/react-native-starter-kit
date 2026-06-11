import { QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/feedback/error-boundary";
import { queryClient } from "@/queries/query-client";

/**
 * The single provider stack for the whole app, mounted once in the root
 * layout. Order matters: GestureHandler must be outermost; the ErrorBoundary
 * sits inside the data/UI providers so its fallback is themed and can use them.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ErrorBoundary>{children}</ErrorBoundary>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
