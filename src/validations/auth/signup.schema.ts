import { z } from "zod";
import { isValidPhoneNumber } from "libphonenumber-js";

export const signupSchema = z
  .object({
    companyName: z.string().min(1, "Company name is required"),

    industry: z.string().min(1, "Industry is required"),

    firstName: z.string().min(1, "First name is required"),

    lastName: z.string().min(1, "Last name is required"),

    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email"),

    // ISO alpha-2 country code, e.g. "IN" — sent to backend and used for phone validation
    countryCode: z.string().min(1, "Country code is required"),

    // Digits only — max 10 digits. Validated per-country below.
    phone: z
      .string()
      .min(1, "Phone number is required")
      .regex(/^\d+$/, "Phone number must contain digits only")
      .max(10, "Phone number cannot exceed 10 digits"),

    // ✅ timezone removed from the form schema — it's auto-detected on submit

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
  // Per-country phone validation using libphonenumber-js
  // Only runs when both countryCode and phone are present
  .refine(
    (data) => {
      if (!data.countryCode || !data.phone) return true;
      try {
        return isValidPhoneNumber(data.phone, data.countryCode as Parameters<typeof isValidPhoneNumber>[1]);
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