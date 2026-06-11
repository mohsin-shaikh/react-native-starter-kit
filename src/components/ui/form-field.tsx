import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import { Input, type InputProps } from "./input";

interface FormFieldProps<T extends FieldValues> extends Omit<
  InputProps,
  "value" | "onChangeText"
> {
  control: Control<T>;
  name: FieldPath<T>;
}

/**
 * Glue between React Hook Form and the Input primitive. Wraps a Controller so
 * a screen can write `<FormField control={control} name="email" label="Email" />`
 * and get validation, value binding, and error display for free.
 */
export function FormField<T extends FieldValues>({
  control,
  name,
  ...inputProps
}: FormFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({
        field: { value, onChange, onBlur },
        fieldState: { error },
      }) => (
        <Input
          value={value as string}
          onChangeText={onChange}
          onBlur={onBlur}
          error={error?.message}
          {...inputProps}
        />
      )}
    />
  );
}
