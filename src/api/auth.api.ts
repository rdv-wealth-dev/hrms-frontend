import axiosInstance from "./axios";

import type {
  SignupRequest,
  SignupResponse,
  LoginRequest,
  LoginResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
  ResendVerificationRequest,
  ResendVerificationResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  MeResponse,
  ActivateAccountRequest,
  ActivateAccountResponse,
  CheckSlugResponse,
  CheckEmailRequest,
  CheckEmailResponse,
  LogoutResponse,
} from "../auth/types";

export const registerCompany = async (
  payload: SignupRequest
): Promise<SignupResponse> => {
  const response = await axiosInstance.post<SignupResponse>(
    "/auth/register",
    payload
  );
  return response.data;
};

export const loginUser = async (
  payload: LoginRequest
): Promise<LoginResponse> => {
  const response = await axiosInstance.post<LoginResponse>(
    "/auth/login",
    payload
  );
  return response.data;
};

export const verifyEmail = async (
  payload: VerifyEmailRequest
): Promise<VerifyEmailResponse> => {
  const response = await axiosInstance.post<VerifyEmailResponse>(
    "/auth/verify-email",
    payload
  );
  return response.data;
};

export const resendVerificationEmail = async (
  payload: ResendVerificationRequest
): Promise<ResendVerificationResponse> => {
  const response = await axiosInstance.post<ResendVerificationResponse>(
    "/auth/resend-verification",
    payload
  );
  return response.data;
};

// Real-time workspace slug availability check (GET — no auth required)
export const checkSlug = async (slug: string): Promise<CheckSlugResponse> => {
  const response = await axiosInstance.get<CheckSlugResponse>(
    `/auth/check-slug?slug=${encodeURIComponent(slug)}`
  );
  return response.data;
};

export const checkEmail = async (
  payload: CheckEmailRequest
): Promise<CheckEmailResponse> => {
  const response = await axiosInstance.post<CheckEmailResponse>(
    "/auth/check-email",
    payload
  );
  return response.data;
};

export const logoutUser = async (): Promise<LogoutResponse> => {
  const response = await axiosInstance.post<LogoutResponse>("/auth/logout");
  return response.data;
};

// ✅ New
export const forgotPassword = async (
  payload: ForgotPasswordRequest
): Promise<ForgotPasswordResponse> => {
  const response = await axiosInstance.post<ForgotPasswordResponse>(
    "/auth/forgot-password",
    payload
  );
  return response.data;
};

// ✅ New
export const resetPassword = async (
  payload: ResetPasswordRequest
): Promise<ResetPasswordResponse> => {
  const response = await axiosInstance.post<ResetPasswordResponse>(
    "/auth/reset-password",
    payload
  );
  return response.data;
};

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
});

export const getMe = async (): Promise<MeResponse> => {
  const response = await axiosInstance.get<MeResponse>("/auth/me", {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const activateAccount = async (
  payload: ActivateAccountRequest
): Promise<ActivateAccountResponse> => {
  const response = await axiosInstance.post<ActivateAccountResponse>(
    "/auth/activate-account",
    payload
  );
  return response.data;
};

export interface CompleteOnboardingRequest {
  countryCode: string;
  timezone: string;
  employeeCountRange: string;
  industry: string;
  phone: string;
  baseCurrency: string;
  fiscalYearStart: string;
  adminJobTitle: string;
}

export interface CompleteOnboardingResponse {
  succeeded: boolean;
  message: string;
  errors: string[];
  data?: any;
}

export const completeOnboarding = async (
  payload: CompleteOnboardingRequest
): Promise<CompleteOnboardingResponse> => {
  const response = await axiosInstance.post<CompleteOnboardingResponse>(
    "/auth/complete-onboarding",
    payload
  );
  return response.data;
};