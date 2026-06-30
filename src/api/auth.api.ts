import axiosInstance from "./axios";

import type {
  SignupRequest,
  SignupResponse,
  LoginRequest,
  LoginResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
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