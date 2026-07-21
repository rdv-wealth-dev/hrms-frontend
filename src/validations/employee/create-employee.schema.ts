import { z } from "zod";

const addressSchema = z.object({
  addressLine1: z.string().trim().optional(),
  addressLine2: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  countryCode: z.string().optional(),
  zip: z.string().trim().optional(),
});

const emergencyContactSchema = z.object({
  name: z.string().trim().min(1, "Contact name is required"),
  relationship: z.string().trim().min(1, "Relationship is required"),
  phone: z.string().trim().min(10, "Emergency phone must be at least 10 digits"),
  email: z.string().email("Enter valid email").optional().or(z.literal("")),
});

const salaryComponentSchema = z.object({
  componentCode: z.string().min(1, "Component code is required"),
  amount: z.number().min(0, "Amount must be >= 0"),
  isPartOfWages: z.boolean(),
});

const salaryStructureSchema = z.object({
  type: z.string(),
  amount: z.number().optional(),
  currency: z.string().optional(),
  hourlyRate: z.number().optional(),
  workingHoursPerWeek: z.number().optional(),
  workingDaysPerMonth: z.number().optional(),
  frequency: z.enum(["MONTHLY", "WEEKLY", "ONE_TIME"]).optional(),
  description: z.string().optional(),
  components: z.array(salaryComponentSchema).optional(),
});

const salarySetupSchema = z.object({
  employeePayType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERN", "CONSULTANT", "TEMPORARY", "UNPAID", "FREELANCE"]),
  structure: salaryStructureSchema,
  effectiveFrom: z.string().optional(),
  benefits: z.object({
    hasHealthInsurance: z.boolean().optional(),
    hasRetirementPlan: z.boolean().optional(),
    hasLeaveEncashment: z.boolean().optional(),
    leaveEncashmentRate: z.number().optional(),
  }).optional(),
});

export const createEmployeeSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.string().trim().min(1, "Email is required").email("Please enter a valid email"),
  phone: z.string().trim().optional(),
  countryCode: z.string().default("IN"),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional().or(z.literal("")),
  bloodGroup: z.string().trim().optional(),
  maritalStatus: z.enum(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"]).optional().or(z.literal("")),
  nationality: z.string().trim().optional(),
  pan: z.string().trim().length(10, "PAN must be exactly 10 characters").optional().or(z.literal("")),
  aadhaar: z.string().trim().length(12, "Aadhaar must be exactly 12 digits").regex(/^\d{12}$/, "Aadhaar must be 12 digits").optional().or(z.literal("")),
  branchId: z.string().min(1, "Branch is required"),
  departmentId: z.string().min(1, "Department is required"),
  designationId: z.string().min(1, "Designation is required"),
  managerId: z.string().optional(),
  employeeType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERN", "CONSULTANT", "TEMPORARY", "UNPAID", "FREELANCE"], { message: "Employee type is required" }),
  joiningDate: z.string().min(1, "Joining date is required"),
  probationEndDate: z.string().optional(),
  currentAddress: addressSchema.optional(),
  permanentAddress: addressSchema.optional(),
  emergencyContacts: z.array(emergencyContactSchema).optional(),
  salarySetup: salarySetupSchema.optional(),
  shiftId: z.string().optional(),
});

export type CreateEmployeeFormData = z.input<typeof createEmployeeSchema>;
