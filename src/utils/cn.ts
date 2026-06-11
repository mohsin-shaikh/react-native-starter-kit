import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind/Uniwind class strings with later classes winning conflicts.
 * `cn('p-2', condition && 'p-4')` -> 'p-4'. Used by every UI primitive so
 * callers can override styles via `className` predictably.
 */
export function cn(
  ...inputs: Array<string | false | null | undefined>
): string {
  return twMerge(inputs.filter(Boolean).join(" "));
}
