import axiosInstance from "./axios";

import type {
  SignupRequest,
  SignupResponse,
} from "../auth/types";

export const registerCompany = async (
  payload: SignupRequest
): Promise<SignupResponse> => {
  const response = await axiosInstance.post<SignupResponse>(
    "/auth/register",
    payload,
  );

  return response.data;
};