import { z } from "zod";

export const createEmployeeSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.string().trim().min(1, "Email is required").email("Please enter a valid email"),
  phone: z.string().trim().min(10, "Phone number must be at least 10 digits"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"], { message: "Gender is required" }),
  bloodGroup: z.string().trim().min(1, "Blood group is required"),
  maritalStatus: z.enum(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"], { message: "Marital status is required" }),
  nationality: z.string().trim().min(1, "Nationality is required"),
  pan: z.string().trim().min(10, "PAN must be exactly 10 characters").max(10, "PAN must be exactly 10 characters"),
  branchId: z.string().min(1, "Branch is required"),
  countryCode: z.string().min(1, "Country code is required"),
  departmentId: z.string().min(1, "Department is required"),
  designationId: z.string().min(1, "Designation is required"),
  employeeType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERN"], { message: "Employee type is required" }),
  joiningDate: z.string().min(1, "Joining date is required"),
  currentAddress: z.object({
    addressLine1: z.string().trim().min(1, "Address Line 1 is required"),
    city: z.string().trim().min(1, "City is required"),
    state: z.string().trim().min(1, "State is required"),
    countryCode: z.string().min(1, "Country code is required"),
    zip: z.string().trim().min(6, "Zip code must be at least 6 digits"),
  }),
  emergencyContacts: z.array(
    z.object({
      name: z.string().trim().min(1, "Contact name is required"),
      relationship: z.string().trim().min(1, "Relationship is required"),
      phone: z.string().trim().min(10, "Emergency phone must be at least 10 digits"),
    })
  ).min(1, "At least one emergency contact is required"),
});

export type CreateEmployeeFormData = z.infer<typeof createEmployeeSchema>;
