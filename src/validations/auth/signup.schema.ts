import { z } from "zod";

export const signupSchema = z
  .object({
    companyName: z
      .string()
      .min(1, "Company name is required"),

    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email"),

    phone: z
      .string()
      .min(1, "Phone number is required")
      .min(10, "Phone number must be at least 10 digits"),

    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters"),

    confirmPassword: z
      .string()
      .min(1, "Confirm password is required"),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }
  );

export type SignupFormData = z.infer<typeof signupSchema>;