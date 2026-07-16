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

export interface DeleteEmployeeResponse {
  succeeded: boolean;
  message: string;
  errors: string[];
  data: {
    message: string;
  };
}

export const deleteEmployee = async (id: string): Promise<DeleteEmployeeResponse> => {
  const response = await axiosInstance.delete<DeleteEmployeeResponse>(
    `/employees/${id}`,
    { headers: getAuthHeader() }
  );
  return response.data;
};

export interface AddBankAccountRequest {
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountType: "SALARY" | "SAVINGS" | "CURRENT";
  isPrimary: boolean;
}

export interface AddBankAccountResponse {
  succeeded: boolean;
  message: string;
  errors: string[];
  data: {
    _id: string;
    tenantId: string;
    branchId: string;
    employeeId: string;
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    accountType: string;
    isPrimary: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

export interface BankAccount {
  _id: string;
  tenantId: string;
  branchId: string;
  employeeId: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountType: string;
  isPrimary: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetBankAccountsResponse {
  succeeded: boolean;
  message: string;
  errors: string[];
  data: BankAccount[];
}

export const getBankAccounts = async (): Promise<GetBankAccountsResponse> => {
  const response = await axiosInstance.get<GetBankAccountsResponse>(
    "/employees/me/bank-accounts",
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const addBankAccount = async (
  payload: AddBankAccountRequest
): Promise<AddBankAccountResponse> => {
  const response = await axiosInstance.post<AddBankAccountResponse>(
    "/employees/me/bank-accounts",
    payload,
    { headers: getAuthHeader() }
  );
  return response.data;
};

export interface DeleteBankAccountResponse {
  succeeded: boolean;
  message: string;
  errors: string[];
  data: {
    message: string;
  };
}

export const deleteBankAccount = async (
  employeeId: string,
  bankAccountId: string
): Promise<DeleteBankAccountResponse> => {
  const response = await axiosInstance.delete<DeleteBankAccountResponse>(
    `/employees/${employeeId}/bank-accounts/${bankAccountId}`,
    { headers: getAuthHeader() }
  );
  return response.data;
};

/* ─── Document Upload ─── */

export interface RequestUploadUrlRequest {
  fileName: string;
  mimeType: string;
  documentType: string;
}

export interface RequestUploadUrlResponse {
  succeeded: boolean;
  message: string;
  errors: string[];
  data: {
    uploadUrl: string;
    expiresIn: number;
    s3Key: string;
    documentType: string;
    fileName: string;
  };
}

export const requestUploadUrl = async (
  payload: RequestUploadUrlRequest
): Promise<RequestUploadUrlResponse> => {
  const response = await axiosInstance.post<RequestUploadUrlResponse>(
    "/employees/me/documents/upload-url",
    payload,
    { headers: getAuthHeader() }
  );
  return response.data;
};

export interface SaveDocumentMetadataRequest {
  documentType: string;
  fileName: string;
  s3Key: string;
  mimeType: string;
  sizeBytes: number;
}

export interface SaveDocumentMetadataResponse {
  succeeded: boolean;
  message: string;
  errors: string[];
  data: {
    _id: string;
    employeeId: string;
    documentType: string;
    fileName: string;
    s3Key: string;
    mimeType: string;
    sizeBytes: number;
    isVerified: boolean;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

export const saveDocumentMetadata = async (
  payload: SaveDocumentMetadataRequest
): Promise<SaveDocumentMetadataResponse> => {
  const response = await axiosInstance.post<SaveDocumentMetadataResponse>(
    "/employees/me/documents",
    payload,
    { headers: getAuthHeader() }
  );
  return response.data;
};

export interface UploadDocumentResponse {
  succeeded: boolean;
  message: string;
  errors: string[];
  data: {
    _id: string;
    employeeId: string;
    documentType: string;
    fileName: string;
    s3Key: string;
    mimeType: string;
    sizeBytes: number;
    isVerified: boolean;
    uploadedBy: string;
    createdAt: string;
    updatedAt: string;
  };
}

export const uploadDocument = async (
  file: File,
  documentType: string
): Promise<UploadDocumentResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("documentType", documentType);

  const token = localStorage.getItem("accessToken");
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const response = await fetch(`${baseUrl}/employees/me/documents/upload`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  return response.json();
};

export interface EmployeeDocument {
  _id: string;
  employeeId: string | { _id: string; employeeCode?: string; firstName?: string; lastName?: string };
  documentType: string;
  fileName: string;
  s3Key: string;
  mimeType: string;
  sizeBytes: number;
  isVerified: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetEmployeeDocumentsResponse {
  succeeded: boolean;
  message: string;
  errors: string[];
  data: EmployeeDocument[];
}

export const getEmployeeDocuments = async (): Promise<GetEmployeeDocumentsResponse> => {
  const response = await axiosInstance.get<GetEmployeeDocumentsResponse>(
    "/employees/me/documents",
    { headers: getAuthHeader() }
  );
  return response.data;
};

export interface GetDownloadUrlResponse {
  succeeded: boolean;
  message: string;
  errors: string[];
  data: {
    downloadUrl: string;
    fileName: string;
    expiresIn: number;
  };
}

export const getDownloadUrl = async (
  docId: string
): Promise<GetDownloadUrlResponse> => {
  const response = await axiosInstance.get<GetDownloadUrlResponse>(
    `/employees/me/documents/${docId}/download-url`,
    { headers: getAuthHeader() }
  );
  return response.data;
};

/* ─── HR — Pending Documents ─── */

export interface GetPendingDocumentsResponse {
  succeeded: boolean;
  message: string;
  errors: string[];
  data: EmployeeDocument[];
}

export const getPendingDocuments = async (): Promise<GetPendingDocumentsResponse> => {
  const response = await axiosInstance.get<GetPendingDocumentsResponse>(
    "/employees/documents/pending",
    { headers: getAuthHeader() }
  );
  return response.data;
};

export interface VerifyDocumentRequest {
  isVerified: boolean;
  remarks?: string;
}

export interface VerifyDocumentResponse {
  succeeded: boolean;
  message: string;
  errors: string[];
  data: EmployeeDocument;
}

export const verifyDocument = async (
  docId: string,
  payload: VerifyDocumentRequest
): Promise<VerifyDocumentResponse> => {
  const response = await axiosInstance.patch<VerifyDocumentResponse>(
    `/employees/documents/${docId}/verify`,
    payload,
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const getHrDownloadUrl = async (
  employeeId: string,
  docId: string
): Promise<GetDownloadUrlResponse> => {
  const response = await axiosInstance.get<GetDownloadUrlResponse>(
    `/employees/${employeeId}/documents/${docId}/download-url`,
    { headers: getAuthHeader() }
  );
  return response.data;
};
