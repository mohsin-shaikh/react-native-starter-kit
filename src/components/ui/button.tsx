import {
  ActivityIndicator,
  Pressable,
  Text,
  type PressableProps,
} from "react-native";

import { cn } from "@/utils/cn";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg";

const CONTAINER: Record<Variant, string> = {
  primary: "bg-primary active:opacity-90",
  secondary: "bg-secondary active:opacity-90",
  outline: "border border-input bg-transparent active:bg-accent",
  ghost: "bg-transparent active:bg-accent",
  destructive: "bg-destructive active:opacity-90",
};

const LABEL: Record<Variant, string> = {
  primary: "text-primary-foreground",
  secondary: "text-secondary-foreground",
  outline: "text-foreground",
  ghost: "text-foreground",
  destructive: "text-destructive-foreground",
};

const SIZE: Record<Size, string> = {
  sm: "h-9 px-3",
  md: "h-11 px-4",
  lg: "h-12 px-6",
};

export interface ButtonProps extends Omit<PressableProps, "children"> {
  label: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  className?: string;
}

export function Button({
  label,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: loading }}
      disabled={isDisabled}
      className={cn(
        "flex-row items-center justify-center rounded-md",
        SIZE[size],
        CONTAINER[variant],
        isDisabled && "opacity-50",
        className,
      )}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text className={cn("text-base font-semibold", LABEL[variant])}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}
