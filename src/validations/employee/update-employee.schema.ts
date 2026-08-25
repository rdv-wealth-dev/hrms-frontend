import { z } from "zod";

export const updateEmployeeSchema = z.object({
  // Tab 0: Organization & Access Hierarchy
  branchId: z
    .string()
    .trim()
    .min(1, "Branch Location is required"),
  departmentId: z
    .string()
    .trim()
    .min(1, "Department is required"),
  designationId: z
    .string()
    .trim()
    .min(1, "Designation is required"),
  teamId: z.string().optional().nullable(),
  managerId: z.string().optional().nullable(),
  secondaryManagerIds: z.array(z.string()).optional(),
  role: z.string().trim().min(1, "System Security Role is required"),
  employeeType: z.string().trim().min(1, "Employee Type is required"),

  // Tab 1: Personal Information & Identity
  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .max(100, "First name cannot exceed 100 characters"),
  lastName: z
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters")
    .max(100, "Last name cannot exceed 100 characters"),
  phone: z
    .string()
    .trim()
    .refine(
      (val) => !val || /^\d{7,15}$/.test(val.replace(/\s+/g, "")),
      "Phone number must be between 7 and 15 digits"
    )
    .optional()
    .or(z.literal("")),
  countryCode: z.string().optional().default("IN"),
  dateOfBirth: z.string().optional().or(z.literal("")),
  gender: z.string().optional().or(z.literal("")),
  bloodGroup: z.string().optional().or(z.literal("")),
  maritalStatus: z.string().optional().or(z.literal("")),
  nationality: z.string().optional().or(z.literal("")),
  pan: z
    .string()
    .trim()
    .toUpperCase()
    .refine(
      (val) => !val || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(val),
      "Invalid PAN format (e.g. ABCDE1234F)"
    )
    .optional()
    .or(z.literal("")),
  aadhaar: z
    .string()
    .trim()
    .refine(
      (val) => !val || /^\d{12}$/.test(val),
      "Aadhaar must be exactly 12 numeric digits"
    )
    .optional()
    .or(z.literal("")),
  passportNo: z.string().optional().or(z.literal("")),
  drivingLicense: z.string().optional().or(z.literal("")),
  voterId: z.string().optional().or(z.literal("")),

  // Tab 2: Employment & Schedule
  joiningDate: z.string().optional().or(z.literal("")),
  confirmationDate: z.string().optional().or(z.literal("")),
  probationEndDate: z.string().optional().or(z.literal("")),
  pfOnActuals: z.boolean().optional(),

  // Tab 3: Addresses
  currAddress1: z.string().optional().or(z.literal("")),
  currAddress2: z.string().optional().or(z.literal("")),
  currCity: z.string().optional().or(z.literal("")),
  currState: z.string().optional().or(z.literal("")),
  currZip: z.string().optional().or(z.literal("")),
  currCountry: z.string().optional().or(z.literal("")),

  sameAsCurrent: z.boolean().optional(),
  permAddress1: z.string().optional().or(z.literal("")),
  permAddress2: z.string().optional().or(z.literal("")),
  permCity: z.string().optional().or(z.literal("")),
  permState: z.string().optional().or(z.literal("")),
  permZip: z.string().optional().or(z.literal("")),
  permCountry: z.string().optional().or(z.literal("")),
});

export type UpdateEmployeeFormData = z.infer<typeof updateEmployeeSchema>;
