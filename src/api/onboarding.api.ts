import axiosInstance from "./axios";

export interface CurrentAddress {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  countryCode: string;
  zip: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface Step1Payload {
  dateOfBirth: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  bloodGroup?: string;
  maritalStatus: "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED";
  phone: string;
  currentAddress: CurrentAddress;
  emergencyContact: EmergencyContact[];
  pan?: string;
  aadhaar?: string;
  passportNo?: string;
}

export interface FamilyMember {
  name?: string;
  fullName?: string;
  relationship: string;
  dateOfBirth?: string;
  gender?: string;
  isDependent?: boolean;
  occupation?: string;
  phone?: string;
  isNominee?: boolean;
}

export interface Step2Payload {
  familyMembers: FamilyMember[];
}

export interface Step3Payload {
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountType?: "SAVINGS" | "CURRENT" | "SALARY";
}

export interface Step5Payload {
  confirmed: boolean;
}

export interface OnboardingStatusResponse {
  succeeded?: boolean;
  success?: boolean;
  message?: string;
  data?: {
    onboardingStep?: number;
    currentStep?: number;
    onboardingComplete?: boolean;
    isProfileComplete?: boolean;
    onboardingPhase?: "GRACE" | "NUDGE" | "RESTRICTED" | "COMPLETE";
    profileCompletionPct?: number;
    onboardingStepsCompleted?: {
      personalDetails?: boolean;
      familyDetails?: boolean;
      bankDetails?: boolean;
      documents?: boolean;
      reviewed?: boolean;
    };
    step1Data?: Partial<Step1Payload>;
    step2Data?: Partial<Step2Payload>;
    step3Data?: Partial<Step3Payload>;
    missingDocuments?: string[];
    mandatoryDocumentTypes?: string[];
  };
}

export interface OnboardingStepResponse {
  succeeded: boolean;
  message?: string;
  data?: any;
}

// ── Native Onboarding Wizard API Functions ───────────────────

export const getOnboardingStatus = async (): Promise<OnboardingStatusResponse> => {
  try {
    const response = await axiosInstance.get<OnboardingStatusResponse>(
      "/onboarding/status"
    );
    if (response.data && response.data.data) {
      const step = response.data.data.onboardingStep || 1;
      response.data.data.currentStep = step;
    }
    return response.data;
  } catch (err: any) {
    const msg = err?.response?.data?.message || err?.message || "Failed to fetch onboarding status";
    return {
      succeeded: false,
      message: msg,
      data: { onboardingStep: 1, currentStep: 1, onboardingComplete: false },
    };
  }
};

export const submitOnboardingStep1 = async (payload: Step1Payload): Promise<OnboardingStepResponse> => {
  try {
    const response = await axiosInstance.post<OnboardingStepResponse>(
      "/onboarding/step-1",
      payload
    );
    return response.data;
  } catch (err: any) {
    const msg = err?.response?.data?.error?.message || err?.response?.data?.message || err?.response?.data?.errors?.[0] || err?.message || "Failed to save Step 1";
    return { succeeded: false, message: msg };
  }
};

export const submitOnboardingStep2 = async (payload: Step2Payload): Promise<OnboardingStepResponse> => {
  try {
    const response = await axiosInstance.post<OnboardingStepResponse>(
      "/onboarding/step-2",
      payload
    );
    return response.data;
  } catch (err: any) {
    const msg = err?.response?.data?.error?.message || err?.response?.data?.message || err?.response?.data?.errors?.[0] || err?.message || "Failed to save Step 2";
    return { succeeded: false, message: msg };
  }
};

export const submitOnboardingStep3 = async (payload: Step3Payload): Promise<OnboardingStepResponse> => {
  try {
    const response = await axiosInstance.post<OnboardingStepResponse>(
      "/onboarding/step-3",
      payload
    );
    return response.data;
  } catch (err: any) {
    const msg = err?.response?.data?.error?.message || err?.response?.data?.message || err?.response?.data?.errors?.[0] || err?.message || "Failed to save Step 3";
    return { succeeded: false, message: msg };
  }
};

export const submitOnboardingStep4 = async (): Promise<OnboardingStepResponse> => {
  try {
    const response = await axiosInstance.post<OnboardingStepResponse>(
      "/onboarding/step-4",
      {}
    );
    return response.data;
  } catch (err: any) {
    const msg = err?.response?.data?.error?.message || err?.response?.data?.message || err?.response?.data?.errors?.[0] || err?.message || "Please upload all required documents before proceeding";
    return { succeeded: false, message: msg };
  }
};

export const submitOnboardingStep5 = async (_payload: Step5Payload): Promise<OnboardingStepResponse> => {
  try {
    const response = await axiosInstance.post<OnboardingStepResponse>(
      "/onboarding/step-5",
      {}
    );
    return response.data;
  } catch (err: any) {
    const msg = err?.response?.data?.error?.message || err?.response?.data?.message || err?.response?.data?.errors?.[0] || err?.message || "Failed to submit final onboarding";
    return { succeeded: false, message: msg };
  }
};
