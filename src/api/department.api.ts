import axiosInstance from "./axios";

import type {
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  DepartmentListResponse,
  DepartmentResponse,
} from "../auth/types";

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("accessToken") ?? ""}`,
});

export const listDepartments = async (
  page = 1,
  pageSize = 10
): Promise<DepartmentListResponse> => {
  const response = await axiosInstance.get<DepartmentListResponse>(
    `/departments?pageNumber=${page}&pageSize=${pageSize}`,
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const getDepartmentById = async (
  id: string
): Promise<DepartmentResponse> => {
  const response = await axiosInstance.get<DepartmentResponse>(
    `/departments/${id}`,
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const createDepartment = async (
  payload: CreateDepartmentRequest
): Promise<DepartmentResponse> => {
  const response = await axiosInstance.post<DepartmentResponse>(
    "/departments",
    payload,
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const updateDepartment = async (
  id: string,
  payload: UpdateDepartmentRequest
): Promise<DepartmentResponse> => {
  const response = await axiosInstance.patch<DepartmentResponse>(
    `/departments/${id}`,
    payload,
    { headers: getAuthHeader() }
  );
  return response.data;
};