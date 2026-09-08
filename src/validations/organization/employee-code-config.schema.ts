import { z } from "zod";

export const employeeCodeConfigSchema = z.object({
  prefix: z
    .string()
    .trim()
    .min(1, "Prefix is required")
    .max(15, "Prefix cannot exceed 15 characters")
    .transform((value) => value.toUpperCase()),
  separator: z
    .string()
    .max(3, "Separator cannot exceed 3 characters"),
  digits: z.coerce
    .number()
    .int("Digits must be a whole number")
    .min(1, "Digits must be at least 1")
    .max(8, "Digits cannot exceed 8"),
  startSequenceNumber: z.coerce
    .number()
    .int("Starting sequence must be a whole number")
    .min(1, "Starting sequence must be at least 1"),
});

export type EmployeeCodeConfigFormValues = z.input<typeof employeeCodeConfigSchema>;
export type EmployeeCodeConfigValues = z.output<typeof employeeCodeConfigSchema>;
