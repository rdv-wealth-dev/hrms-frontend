import { z } from "zod";

export const createTeamSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Team name must be at least 2 characters")
    .max(100, "Team name cannot exceed 100 characters"),
  code: z
    .string()
    .trim()
    .min(2, "Team code must be at least 2 characters")
    .max(20, "Team code cannot exceed 20 characters")
    .regex(/^[A-Z0-9_-]+$/, "Team code must be uppercase alphanumeric (e.g. BLR-ENG-BE)"),
  type: z.enum(["PERMANENT", "TEMPORARY", "PROJECT_BASED"]),
  departmentId: z.string().min(1, "Department is mandatory"),
  branchId: z.string().optional(),
  leadId: z.string().optional(),
  isCrossFunctional: z.boolean().optional(),
  description: z.string().max(500, "Description cannot exceed 500 characters").optional(),
  maxConcurrentLeaves: z
    .number()
    .min(0, "Leaves cannot be negative")
    .max(50, "Max concurrent leaves must be reasonable")
    .optional(),
  reporting: z
    .object({
      type: z.enum(["DEPARTMENT_HEAD", "CUSTOM", "DIRECT_MANAGER"]).optional(),
      targetId: z.string().optional(),
      targetName: z.string().optional(),
    })
    .optional(),
  tags: z.array(z.string()).optional(),
  startDate: z.string().optional(),
});

export type CreateTeamFormValues = z.infer<typeof createTeamSchema>;
