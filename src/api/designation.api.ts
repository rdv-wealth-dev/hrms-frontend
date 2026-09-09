import axiosInstance from "./axios";

import type {
    CreateDesignationRequest,
    UpdateDesignationRequest,
    DesignationResponse,
    DesignationListResponse,
} from "../auth/types";

const getAuthHeader = () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
        throw new Error("No access token found. Please log in again.");
    }

    return {
        Authorization: `Bearer ${token}`,
    };
};

export const createDesignation = async (
    payload: CreateDesignationRequest
): Promise<DesignationResponse> => {
    const response = await axiosInstance.post<DesignationResponse>(
        "/designations",
        payload,
        { headers: getAuthHeader() }
    );
    return response.data;
};

export const listDesignations = async (
    pageNumber = 1,
    pageSize = 100,
    departmentId?: string
): Promise<DesignationListResponse> => {
    let url = `/designations?pageNumber=${pageNumber}&pageSize=${pageSize}`;
    if (departmentId) {
        url += `&departmentId=${encodeURIComponent(departmentId)}`;
    }
    const response = await axiosInstance.get<DesignationListResponse>(
        url,
        { headers: getAuthHeader() }
    );
    return response.data;
};

export const getDesignationById = async (
    id: string
): Promise<DesignationResponse> => {
    const response = await axiosInstance.get<DesignationResponse>(
        `/designations/${id}`,
        { headers: getAuthHeader() }
    );
    return response.data;
};

export const updateDesignation = async (
    id: string,
    payload: UpdateDesignationRequest
): Promise<DesignationResponse> => {
    const response = await axiosInstance.patch<DesignationResponse>(
        `/designations/${id}`,
        payload,
        { headers: getAuthHeader() }
    );
    return response.data;
};

export const DEFAULT_STARTER_DESIGNATIONS = [
    { name: "HR Manager", code: "HR_MGR", description: "Manages human resource operations and policies" },
    { name: "Software Engineer", code: "SE", description: "Builds and maintains software applications" },
    { name: "Sales Executive", code: "SALES_EXEC", description: "Drives business growth and client acquisition" },
    { name: "Accountant", code: "ACCT", description: "Manages financial accounts, ledger, and auditing" },
    { name: "Operations Executive", code: "OPS_EXEC", description: "Coordinates daily operational workflows" },
];

export const seedDefaultDesignations = async (branchId: string, departmentIds: string[]): Promise<boolean> => {
  // Distribute designations across departments
  // If we have 5 designations and 5 departments, assign 1 to each
  // If departments mismatch, cycle through available departments
  
  for (let i = 0; i < DEFAULT_STARTER_DESIGNATIONS.length; i++) {
    const desig = DEFAULT_STARTER_DESIGNATIONS[i];
    const departmentId = departmentIds[i % departmentIds.length]; // Cycle through departments
    
    try {
      await createDesignation({ 
        ...desig, 
        branchId,
        departmentId 
      });
    } catch {
      // Ignore if individual designation code already exists
    }
  }
  
  return true;
};

export interface DeleteBranchDesignationsResponse {
  success: boolean;
  message: string;
  data?: {
    message: string;
    branchId: string;
    deletedCount: number;
  };
}

/**
 * Delete all designations for a specific branch
 * DELETE /api/v1/designations/branch/:branchId?force=boolean
 */
export const deleteDesignationsByBranch = async (
  branchId: string,
  force = false
): Promise<DeleteBranchDesignationsResponse> => {
  const url = `/designations/branch/${encodeURIComponent(branchId)}${force ? "?force=true" : "?force=false"}`;
  const response = await axiosInstance.delete<DeleteBranchDesignationsResponse>(
    url,
    { headers: getAuthHeader() }
  );
  return response.data;
};

export interface DeleteDepartmentDesignationsResponse {
  success: boolean;
  message: string;
  data?: {
    message: string;
    departmentId: string;
    deletedCount: number;
  };
}

/**
 * Delete all designations for a specific department
 * DELETE /api/v1/designations/department/:departmentId?force=boolean
 */
export const deleteDesignationsByDepartment = async (
  departmentId: string,
  force = false
): Promise<DeleteDepartmentDesignationsResponse> => {
  const url = `/designations/department/${encodeURIComponent(departmentId)}${force ? "?force=true" : "?force=false"}`;
  const response = await axiosInstance.delete<DeleteDepartmentDesignationsResponse>(
    url,
    { headers: getAuthHeader() }
  );
  return response.data;
};

export interface DeleteSingleDesignationResponse {
  success: boolean;
  message: string;
  data?: {
    message: string;
    designationId: string;
  };
}

/**
 * Delete a single designation by ID
 * DELETE /api/v1/designations/:id?force=boolean
 */
export const deleteDesignation = async (
  id: string,
  force = false
): Promise<DeleteSingleDesignationResponse> => {
  const url = `/designations/${encodeURIComponent(id)}${force ? "?force=true" : "?force=false"}`;
  const response = await axiosInstance.delete<DeleteSingleDesignationResponse>(
    url,
    { headers: getAuthHeader() }
  );
  return response.data;
};