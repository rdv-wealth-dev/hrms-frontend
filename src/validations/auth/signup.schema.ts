import { z } from "zod";

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

    countryCode: z.string().min(1, "Country code is required"),

    phone: z
      .string()
      .min(1, "Phone number is required")
      .min(10, "Phone number must be at least 10 digits"),

    // ✅ timezone removed from the form schema — it's auto-detected, not user input

    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters"),

    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignupFormData = z.infer<typeof signupSchema>;