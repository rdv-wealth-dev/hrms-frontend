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

export const DEFAULT_STARTER_DEPARTMENTS = [
  { name: "Human Resources", code: "HR", description: "People management, payroll, and talent acquisition" },
  { name: "Information Technology", code: "IT", description: "IT infrastructure, software, and tech support" },
  { name: "Engineering", code: "ENG", description: "Product design and software development" },
  { name: "Sales & Marketing", code: "SALES", description: "Business growth, marketing, and client relations" },
  { name: "Operations", code: "OPS", description: "Day-to-day business operations and logistics" },
];

export const seedDefaultDepartments = async (): Promise<boolean> => {
  for (const dept of DEFAULT_STARTER_DEPARTMENTS) {
    try {
      await createDepartment(dept);
    } catch {
      // Ignore if individual department code already exists
    }
  }
  return true;
};