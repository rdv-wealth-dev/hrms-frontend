import axiosInstance from "./axios";
import type {
  CreateEmployeeRequest,
  CreateEmployeeResponse,
  EmployeeListResponse,
  UpdateEmployeeRequest,
  UpdateEmployeeResponse,
} from "../store/employee/employee.types";

const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    throw new Error("No access token found. Please log in again.");
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

export const createEmployee = async (
  payload: CreateEmployeeRequest
): Promise<CreateEmployeeResponse> => {
  const response = await axiosInstance.post<CreateEmployeeResponse>(
    "/employees",
    payload,
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const listEmployees = async (
  pageNumber = 1,
  pageSize = 10,
  search?: string,
  status?: string
): Promise<EmployeeListResponse> => {
  let url = `/employees?pageNumber=${pageNumber}&pageSize=${pageSize}`;
  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }
  if (status) {
    url += `&status=${encodeURIComponent(status)}`;
  }
  const response = await axiosInstance.get<EmployeeListResponse>(
    url,
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const updateEmployee = async (
  id: string,
  payload: UpdateEmployeeRequest
): Promise<UpdateEmployeeResponse> => {
  const response = await axiosInstance.patch<UpdateEmployeeResponse>(
    `/employees/${id}`,
    payload,
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const updateEmployeeStatus = async (
  id: string,
  status: string
): Promise<UpdateEmployeeResponse> => {
  const response = await axiosInstance.patch<UpdateEmployeeResponse>(
    `/employees/${id}/status`,
    { status },
    { headers: getAuthHeader() }
  );
  return response.data;
};
