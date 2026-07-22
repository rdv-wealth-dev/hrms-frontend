import { z } from "zod";

export const createLeaveTypeSchema = z.object({
  name: z.string().trim().min(1, "Leave type name is required"),
  code: z.string().trim().min(1, "Leave code is required"),
  description: z.string().optional(),
  isPaid: z.boolean().optional(),
  annualQuota: z.number().min(1, "Annual quota must be at least 1 day"),
  accrualFrequency: z.enum(["MONTHLY", "YEARLY", "NONE"]).optional(),
  accrualAmountPerCycle: z.number().min(0, "Accrual amount cannot be negative").optional(),
  maxCarryForwardDays: z.number().min(0, "Max carry forward cannot be negative").optional(),
  maxConsecutiveDays: z.number().min(0, "Max consecutive days cannot be negative").optional(),
  advanceNoticeDays: z.number().min(0, "Advance notice cannot be negative").optional(),
  minAdvanceNoticeDays: z.number().min(0).optional(),
  requiresApproval: z.boolean().optional(),
  approvalLevels: z.number().min(1, "At least 1 approval level required").max(3, "Maximum 3 approval levels").optional(),
  allowNegativeBalance: z.boolean().optional(),
  probationEligible: z.boolean().optional(),
  applySandwichPolicy: z.boolean().optional(),
});

export type CreateLeaveTypeFormData = z.infer<typeof createLeaveTypeSchema>;
