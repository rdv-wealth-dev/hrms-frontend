import { z } from "zod";
import { isValidPhoneNumber } from "libphonenumber-js";

export const signupSchema = z
  .object({
    companyName: z
      .string()
      .min(2, "Company name must be at least 2 characters")
      .max(200, "Company name cannot exceed 200 characters"),

    workspaceSlug: z
      .string()
      .min(3, "Workspace URL must be at least 3 characters")
      .max(63, "Workspace URL cannot exceed 63 characters")
      .regex(
        /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/,
        "Only lowercase letters, numbers, and hyphens. Cannot start or end with a hyphen."
      ),

    employeeCountRange: z.enum(
      ["1-10", "11-50", "51-200", "201-500", "500+"],
      { required_error: "Please select your team size" }
    ),

    industry: z.string().optional(),

    firstName: z
      .string()
      .min(2, "First name must be at least 2 characters")
      .max(100, "First name cannot exceed 100 characters"),

    lastName: z
      .string()
      .min(2, "Last name must be at least 2 characters")
      .max(100, "Last name cannot exceed 100 characters"),

    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email"),

    // ISO alpha-2 country code — used for phone validation
    countryCode: z.string().min(1, "Country code is required"),

    // Optional phone — digits only, validated per-country
    phone: z
      .string()
      .regex(/^\d*$/, "Phone number must contain digits only")
      .max(15, "Phone number cannot exceed 15 digits")
      .optional()
      .or(z.literal("")),

    // ✅ timezone auto-detected on submit — not a form field
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters"),

    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  // Per-country phone validation — only runs when phone is provided
  .refine(
    (data) => {
      if (!data.phone || !data.countryCode) return true;
      try {
        return isValidPhoneNumber(
          data.phone,
          data.countryCode as Parameters<typeof isValidPhoneNumber>[1]
        );
      } catch {
        return false;
      }
    },
    {
      message: "Invalid phone number for the selected country",
      path: ["phone"],
    }
  );

export type SignupFormData = z.infer<typeof signupSchema>;