import { z } from "zod";

export const addTeamMemberSchema = z.object({
  employeeId: z.string().min(1, "Please select an employee"),
  roleInTeam: z.enum(["MEMBER", "LEAD"]),
  isPrimary: z.boolean(),
  allocationPercentage: z
    .number({ message: "Allocation must be a number" })
    .min(1, "Allocation must be at least 1%")
    .max(100, "Allocation cannot exceed 100%"),
});

export type AddTeamMemberFormValues = z.infer<typeof addTeamMemberSchema>;
