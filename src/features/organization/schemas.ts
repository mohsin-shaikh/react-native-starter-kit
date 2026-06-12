import { z } from "zod";

/**
 * Zod schemas for organization forms — single source of truth for validation
 * and the inferred form types (same pattern as features/auth/schemas.ts).
 */
export const createOrganizationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name must be at most 80 characters"),
});

export type CreateOrganizationFormValues = z.infer<
  typeof createOrganizationSchema
>;
