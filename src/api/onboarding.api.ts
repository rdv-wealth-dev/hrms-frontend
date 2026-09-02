import axiosInstance from "./axios";
import type { CustomFieldDefinition } from "./custom-field.api";

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

export interface EducationDetail {
  qualificationLevel:
    | "DOCTORATE"
    | "POST_GRADUATE"
    | "UNDER_GRADUATE"
    | "DIPLOMA"
    | "HIGHER_SECONDARY"
    | "SECONDARY"
    | "OTHER";
  degree: string;
  fieldOfStudy?: string;
  institutionName: string;
  yearOfPassing?: number;
  percentageOrCgpa?: string;
  isCustom?: boolean;
  boardCode?: string;
  boardName?: string;
  boardDescription?: string;
  stateBoardState?: string;
  otherBoardName?: string;
  degreeDescription?: string;
}

export interface SchoolBoardOption {
  code: string;
  name: string;
  description?: string;
  requiresStateSelection?: boolean;
}

export interface StateBoardOption {
  state: string;
  boardName: string;
  boardCode: string;
}

export interface EducationStreamCategory {
  category: string;
  degrees: string[];
}

export interface EducationOptionsResponse {
  succeeded?: boolean;
  message?: string;
  data?: {
    qualificationLevel?: string;
    countryCode?: string;
    searchQuery?: string;
    totalMatches?: number;
    categories?: EducationStreamCategory[];
    allDegrees?: string[];
    boardOptions?: SchoolBoardOption[];
    stateBoards?: StateBoardOption[];
  };
}


export interface Step1Payload {
  dateOfBirth: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  bloodGroup?: string;
  maritalStatus: "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED";
  religion?: string;
  phone: string;
  fatherName?: string;
  fatherPhone?: string;
  motherName?: string;
  motherPhone?: string;
  highestQualification?: string;
  educationDetails?: EducationDetail[];
  previousEmployerName?: string;
  previousEmployerLastWorkingDate?: string;
  currentAddress: CurrentAddress;
  emergencyContact: EmergencyContact[];
  pan?: string;
  aadhaar?: string;
  passportNo?: string;
  customFields?: Record<string, any>;
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
  isNotApplicable?: boolean;
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
    customFieldDefinitions?: CustomFieldDefinition[];
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

export const getEducationOptions = async (
  qualificationLevel?: string,
  countryCode: string = "IN",
  search?: string
): Promise<EducationOptionsResponse> => {
  try {
    const params: Record<string, string> = { countryCode };
    if (qualificationLevel) {
      params.qualificationLevel = qualificationLevel;
    }
    if (search && search.trim().length >= 2) {
      params.search = search.trim();
    }

    const response = await axiosInstance.get<EducationOptionsResponse>(
      "/onboarding/education-options",
      { params }
    );
    return response.data;
  } catch (err: any) {
    const msg = err?.response?.data?.message || err?.message || "Failed to fetch education options";
    return {
      succeeded: false,
      message: msg,
      data: { categories: [], allDegrees: [], boardOptions: [], stateBoards: [] },
    };
  }
};

export const skipOnboardingStep = async (step?: number): Promise<OnboardingStepResponse> => {
  try {
    const payload = step ? { step } : {};
    const response = await axiosInstance.post<OnboardingStepResponse>(
      "/onboarding/skip",
      payload
    );
    return response.data;
  } catch (err: any) {
    const msg =
      err?.response?.data?.error?.message ||
      err?.response?.data?.message ||
      err?.response?.data?.errors?.[0] ||
      err?.message ||
      "Failed to skip step";
    return { succeeded: false, message: msg };
  }
};



