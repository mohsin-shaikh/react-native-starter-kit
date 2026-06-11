import { Component, type ReactNode } from "react";
import { View } from "react-native";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { crashReporter } from "@/lib/crash-reporting";
import { toAppError } from "@/lib/errors";

interface Props {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Global React error boundary — the last line of defense for UNEXPECTED
 * render-time errors. It reports to the crash abstraction and shows a recovery
 * UI instead of a white screen. (Async/network errors are handled earlier by
 * React Query + AppError; this catches the ones that slip through render.)
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    crashReporter.captureException(error, { boundary: "root" });
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    if (this.props.fallback) return this.props.fallback(error, this.reset);

    const appError = toAppError(error);
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-background px-6">
        <Text variant="heading">Something went wrong</Text>
        <Text variant="subtitle" className="text-center">
          {appError.userMessage}
        </Text>
        <Button label="Try again" onPress={this.reset} />
      </View>
    );
  }
}
