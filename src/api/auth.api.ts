import axiosInstance from "./axios";

import type {
  SignupRequest,
  SignupResponse,
  LoginRequest,
  LoginResponse,
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