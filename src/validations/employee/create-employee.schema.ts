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
  phone: z.string().trim().regex(/^\d{10}$/, "Emergency phone must be exactly 10 digits"),
  email: z.string().email("Enter valid email").optional().or(z.literal("")),
});

export const salaryLineItemSchema = z.object({
  componentCode: z.string().min(1, "Component code is required"),
  amount: z.number().min(0, "Amount must be >= 0"),
  isPartOfWages: z.boolean().optional(),
});

export const salaryStructureV1Schema = z.object({
  ctcAnnual: z.number().min(0, "Annual CTC must be >= 0"),
  lineItems: z.array(salaryLineItemSchema).min(1, "At least 1 payroll component is required"),
});

const salaryComponentSchema = z.object({
  componentCode: z.string().optional(),
  amount: z.number().optional(),
  isPartOfWages: z.boolean().optional(),
});

const salaryStructureSchema = z.object({
  type: z.string().optional(),
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
  employeePayType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERN", "CONSULTANT", "TEMPORARY", "UNPAID", "FREELANCE"]).optional(),
  structure: salaryStructureSchema.optional(),
  effectiveFrom: z.string().optional(),
  benefits: z.object({
    hasHealthInsurance: z.boolean().optional(),
    hasRetirementPlan: z.boolean().optional(),
    hasLeaveEncashment: z.boolean().optional(),
    leaveEncashmentRate: z.number().optional(),
  }).optional(),
});

export const createEmployeeSchema = z.object({
  firstName: z.string().trim().min(2, "First name must be 2-100 characters").max(100, "Max 100 characters"),
  lastName: z.string().trim().min(2, "Last name must be 2-100 characters").max(100, "Max 100 characters"),
  email: z.string().trim().min(1, "Email is required").email("Please enter a valid email"),
  phone: z.string().trim().regex(/^\d{1,10}$/, "Phone number cannot exceed 10 digits").optional().or(z.literal("")),
  countryCode: z.string().min(1, "Country code is required"),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional().or(z.literal("")),
  bloodGroup: z.string().trim().optional(),
  maritalStatus: z.enum(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"]).optional().or(z.literal("")),
  nationality: z.string().trim().optional(),
  pan: z.string().trim().refine((val) => !val || val.length === 10, "PAN must be exactly 10 characters").optional().or(z.literal("")),
  aadhaar: z.string().trim().refine((val) => !val || /^\d{12}$/.test(val), "Aadhaar must be exactly 12 numeric digits").optional().or(z.literal("")),
  
  // Organization Mapping
  branchId: z.string().min(1, "Branch is required").optional().or(z.literal("")),
  departmentId: z.string().min(1, "Department is required"),
  designationId: z.string().min(1, "Designation is required"),
  
  managerId: z.string().optional(),
  teamId: z.string().optional(),
  secondaryManagerIds: z.array(z.string()).optional(),
  role: z.string().min(1, "Role is required"),
  employeeType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERN", "CONSULTANT", "TEMPORARY", "UNPAID", "FREELANCE"], { message: "Employee type is required" }),
  joiningDate: z.string().min(1, "Joining date is required"),
  probationEndDate: z.string().optional(),
  currentAddress: addressSchema.optional(),
  permanentAddress: addressSchema.optional(),
  emergencyContacts: z.array(emergencyContactSchema).optional(),
  
  salarySetup: salarySetupSchema.optional(),
  salaryStructure: salaryStructureV1Schema.optional(),
  shiftId: z.string().optional(),
});

export type CreateEmployeeFormData = z.infer<typeof createEmployeeSchema>;
