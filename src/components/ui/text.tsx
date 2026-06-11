import { Text as RNText, type TextProps as RNTextProps } from "react-native";

import { cn } from "@/utils/cn";

type Variant =
  | "default"
  | "title"
  | "heading"
  | "subtitle"
  | "muted"
  | "destructive";

const VARIANTS: Record<Variant, string> = {
  default: "text-base text-foreground",
  title: "text-3xl font-bold text-foreground",
  heading: "text-xl font-semibold text-foreground",
  subtitle: "text-base text-muted-foreground",
  muted: "text-sm text-muted-foreground",
  destructive: "text-sm text-destructive",
};

export interface TextProps extends RNTextProps {
  variant?: Variant;
  className?: string;
}

/** Typed typography primitive. Use instead of bare <Text> for consistency. */
export function Text({ variant = "default", className, ...props }: TextProps) {
  return <RNText className={cn(VARIANTS[variant], className)} {...props} />;
}
