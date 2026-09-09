import { z } from "zod";

export const organizationProfileSchema = z.object({
  // Basic Details
  companyName: z
    .string()
    .trim()
    .min(2, "Company name must be at least 2 characters")
    .max(100, "Company name cannot exceed 100 characters"),
  legalName: z
    .string()
    .trim()
    .max(100, "Legal name cannot exceed 100 characters")
    .optional()
    .or(z.literal("")),
  industry: z
    .string()
    .trim()
    .max(60, "Industry cannot exceed 60 characters")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .trim()
    .refine(
      (val) => !val || /^\d{7,15}$/.test(val.replace(/\s+/g, "")),
      "Phone number must be between 7 and 15 digits"
    )
    .optional()
    .or(z.literal("")),

  // Corporate Address
  addressLine1: z
    .string()
    .trim()
    .max(150, "Address cannot exceed 150 characters")
    .optional()
    .or(z.literal("")),
  city: z
    .string()
    .trim()
    .max(60, "City cannot exceed 60 characters")
    .optional()
    .or(z.literal("")),
  state: z
    .string()
    .trim()
    .max(60, "State cannot exceed 60 characters")
    .optional()
    .or(z.literal("")),
  countryCode: z.string().trim().optional().or(z.literal("")),
  zip: z
    .string()
    .trim()
    .refine(
      (val) => !val || /^[0-9A-Za-z\s-]{3,10}$/.test(val),
      "Postal/ZIP code must be between 3 and 10 characters"
    )
    .optional()
    .or(z.literal("")),

  // Branding & Support
  website: z
    .string()
    .trim()
    .refine(
      (val) => !val || /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i.test(val),
      "Please enter a valid website URL (e.g. https://example.com)"
    )
    .optional()
    .or(z.literal("")),
  primaryColor: z
    .string()
    .trim()
    .refine(
      (val) => !val || /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(val),
      "Invalid Hex color code (e.g. #6D5DF6)"
    )
    .optional()
    .or(z.literal("")),
  supportEmail: z
    .string()
    .trim()
    .refine(
      (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      "Please enter a valid email address"
    )
    .optional()
    .or(z.literal("")),
});

export type OrganizationProfileFormValues = z.infer<typeof organizationProfileSchema>;
