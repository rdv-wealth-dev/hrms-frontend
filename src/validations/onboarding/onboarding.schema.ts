import { z } from "zod";

// ── Step 1 Schema ──────────────────────────────────────────

export const currentAddressSchema = z.object({
  addressLine1: z.string().trim().min(1, "Address Line 1 is required").max(200, "Max 200 characters"),
  addressLine2: z.string().trim().max(200, "Max 200 characters").optional().or(z.literal("")),
  city: z.string().trim().min(1, "City is required").max(100, "Max 100 characters"),
  state: z.string().trim().min(1, "State is required").max(100, "Max 100 characters"),
  countryCode: z.string().trim().length(2, "Country code must be 2 characters (e.g. IN)").transform((v) => v.toUpperCase()),
  zip: z.string().trim().regex(/^\d{6}$/, "Zip / Postal code must be exactly 6 digits"),
});

export const emergencyContactSchema = z.object({
  name: z.string().trim().min(2, "Name must be 2-100 characters").max(100, "Max 100 characters"),
  relationship: z.string().trim().min(2, "Relationship must be 2-50 characters").max(50, "Max 50 characters"),
  phone: z.string().trim().regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  email: z.string().trim().min(1, "Emergency contact email is required").email("Invalid email address"),
});

export const educationDetailSchema = z.object({
  qualificationLevel: z.enum([
    "DOCTORATE",
    "POST_GRADUATE",
    "UNDER_GRADUATE",
    "DIPLOMA",
    "HIGHER_SECONDARY",
    "SECONDARY",
    "OTHER",
  ]),
  degree: z.string().trim().max(150, "Max 150 characters").optional().or(z.literal("")),
  fieldOfStudy: z.string().trim().max(100, "Max 100 characters").optional().or(z.literal("")),
  institutionName: z.string().trim().max(200, "Max 200 characters").optional().or(z.literal("")),
  yearOfPassing: z.number().int().min(1950, "Invalid passing year").max(2100, "Invalid passing year").optional(),
  percentageOrCgpa: z.string().trim().max(50, "Max 50 characters").optional().or(z.literal("")),
});

export type EducationDetailFormData = z.infer<typeof educationDetailSchema>;

export const onboardingStep1Schema = z
  .object({
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    gender: z.enum(["MALE", "FEMALE", "OTHER"]).or(z.literal("")),
    bloodGroup: z.enum(["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]).optional().or(z.literal("")),
    maritalStatus: z.enum(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"]).or(z.literal("")),
    religion: z
      .enum([
        "HINDUISM",
        "ISLAM",
        "CHRISTIANITY",
        "SIKHISM",
        "BUDDHISM",
        "JAINISM",
        "ZOROASTRIANISM",
        "JUDAISM",
        "OTHER",
        "PREFER_NOT_TO_SAY",
      ])
      .optional()
      .or(z.literal("")),
    phone: z.string().trim().min(10, "Phone number must be at least 10 digits"),
    fatherName: z.string().trim().max(100, "Max 100 characters").optional().or(z.literal("")),
    fatherPhone: z.string().trim().optional().or(z.literal("")),
    motherName: z.string().trim().max(100, "Max 100 characters").optional().or(z.literal("")),
    motherPhone: z.string().trim().optional().or(z.literal("")),
    highestQualification: z
      .enum([
        "DOCTORATE",
        "POST_GRADUATE",
        "UNDER_GRADUATE",
        "DIPLOMA",
        "HIGHER_SECONDARY",
        "SECONDARY",
        "OTHER",
      ])
      .optional()
      .or(z.literal("")),
    educationDetails: z.array(educationDetailSchema).optional(),
    previousEmployerName: z.string().trim().max(100, "Max 100 characters").optional().or(z.literal("")),
    previousEmployerLastWorkingDate: z.string().optional().or(z.literal("")),
    pan: z
      .string()
      .trim()
      .transform((v) => v.toUpperCase())
      .refine((v) => !v || v.length === 10, "PAN must be exactly 10 characters")
      .optional()
      .or(z.literal("")),
    aadhaar: z
      .string()
      .trim()
      .refine(
        (v) => !v || /^[2-9]\d{11}$/.test(v),
        "Aadhaar must be exactly 12 numeric digits and cannot start with 0 or 1"
      )
      .optional()
      .or(z.literal("")),
    passportNo: z.string().trim().optional().or(z.literal("")),
    currentAddress: currentAddressSchema,
    emergencyContact: z.array(emergencyContactSchema).min(1, "At least 1 emergency contact is required"),
  })
  .refine((data) => !!data.gender, {
    message: "Gender is required",
    path: ["gender"],
  })
  .refine((data) => !!data.maritalStatus, {
    message: "Marital status is required",
    path: ["maritalStatus"],
  })
  .refine(
    (data) => {
      if (data.previousEmployerName && data.previousEmployerName.trim().length > 0) {
        return !!data.previousEmployerLastWorkingDate && data.previousEmployerLastWorkingDate.trim().length > 0;
      }
      return true;
    },
    {
      message: "Last working date is required when previous employer name is provided",
      path: ["previousEmployerLastWorkingDate"],
    }
  );

export type OnboardingStep1FormData = z.infer<typeof onboardingStep1Schema>;

// ── Step 2 Schema ──────────────────────────────────────────

export const familyMemberSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be 2-100 characters").max(100, "Max 100 characters"),
  relationship: z.union([z.enum(["SPOUSE", "CHILD", "FATHER", "MOTHER", "SIBLING", "OTHER"]), z.literal("")]).refine(
    (v): v is "SPOUSE" | "CHILD" | "FATHER" | "MOTHER" | "SIBLING" | "OTHER" | "" => v !== "",
    { message: "Relationship is required" }
  ),
  dateOfBirth: z.string().optional().or(z.literal("")),
  gender: z.string().optional().or(z.literal("")),
  isDependent: z.boolean(),
  occupation: z.string().trim().max(100, "Max 100 characters").optional().or(z.literal("")),
  phone: z.string().trim().regex(/^\d{10}$/, "Phone number must be 10 digits"),
  isNominee: z.boolean(),
});

export const onboardingStep2Schema = z.object({
  familyMembers: z.array(familyMemberSchema),
});

export type OnboardingStep2FormData = z.infer<typeof onboardingStep2Schema>;

// ── Step 3 Schema ──────────────────────────────────────────

export const onboardingStep3Schema = z.object({
  bankName: z.string().trim().min(2, "Bank name must be 2-200 characters").max(200, "Max 200 characters"),
  accountNumber: z.string().trim().regex(/^\d{8,20}$/, "Account number must be between 8 and 20 numeric digits"),
  ifscCode: z.string().trim().transform((v) => v.toUpperCase()).pipe(
    z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code format (e.g. SBIN0001234)")
  ),
  accountType: z.union([z.enum(["SAVINGS", "CURRENT", "SALARY"]), z.literal("")]).refine(
    (v): v is "SAVINGS" | "CURRENT" | "SALARY" | "" => v !== "",
    { message: "Account type is required" }
  ),
});

export type OnboardingStep3FormData = z.infer<typeof onboardingStep3Schema>;

// ── Step 5 Schema ──────────────────────────────────────────

export const onboardingStep5Schema = z.object({
  confirmed: z.literal(true, { message: "You must confirm that your details are accurate before submitting." }),
});

export type OnboardingStep5FormData = z.infer<typeof onboardingStep5Schema>;
