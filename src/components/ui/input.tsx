import { forwardRef } from "react";
import { TextInput, View, type TextInputProps } from "react-native";

import { cn } from "@/utils/cn";

import { Text } from "./text";

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  className?: string;
  containerClassName?: string;
}

/**
 * Labeled text input with an inline error slot. Pairs with FormField for
 * React Hook Form, but is usable standalone. Forwards the ref so RHF can focus
 * the next field / scroll to errors.
 */
export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, className, containerClassName, ...props },
  ref,
) {
  return (
    <View className={cn("gap-1.5", containerClassName)}>
      {label ? (
        <Text variant="muted" className="font-medium text-foreground">
          {label}
        </Text>
      ) : null}
      <TextInput
        ref={ref}
        placeholderTextColor="#9ca3af"
        className={cn(
          "h-11 rounded-md border border-input bg-background px-3 text-base text-foreground",
          error && "border-destructive",
          className,
        )}
        {...props}
      />
      {error ? <Text variant="destructive">{error}</Text> : null}
    </View>
  );
});
