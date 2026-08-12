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
  pageSize = 10,
  branchId?: string
): Promise<DepartmentListResponse> => {
  let url = `/departments?pageNumber=${page}&pageSize=${pageSize}`;
  if (branchId) {
    url += `&branchId=${encodeURIComponent(branchId)}`;
  }
  const response = await axiosInstance.get<DepartmentListResponse>(
    url,
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

export const seedDefaultDepartments = async (branchId: string): Promise<string[]> => {
  const createdDepartmentIds: string[] = [];
  
  for (const dept of DEFAULT_STARTER_DEPARTMENTS) {
    try {
      const response = await createDepartment({ ...dept, branchId });
      if (response.succeeded && response.data?._id) {
        createdDepartmentIds.push(response.data._id);
      }
    } catch {
      // Ignore if individual department code already exists
    }
  }
  
  return createdDepartmentIds;
};