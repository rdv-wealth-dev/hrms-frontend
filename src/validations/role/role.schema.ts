import { z } from "zod";

export const roleFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Role name must be at least 2 characters")
    .max(100, "Role name cannot exceed 100 characters"),
  slug: z
    .string()
    .trim()
    .toUpperCase()
    .min(2, "Role slug must be at least 2 characters")
    .max(50, "Role slug cannot exceed 50 characters")
    .regex(/^[A-Z0-9_]+$/, "Role slug must contain only uppercase letters, numbers, and underscores"),
  description: z.string().trim().max(500, "Description cannot exceed 500 characters").optional().default(""),
  permissions: z.array(z.string().trim()).min(1, "Select at least one permission"),
});

export type RoleFormValues = z.infer<typeof roleFormSchema>;
