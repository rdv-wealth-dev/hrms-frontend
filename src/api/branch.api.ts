import axiosInstance from "./axios";
import type {
  BranchListResponse,
  CreateBranchRequest,
  CreateBranchResponse,
  GetHeadOfficeResponse,
  UpdateBranchRequest,
  UpdateBranchResponse,
  DeleteBranchResponse,
  GetBranchCalendarResponse,
} from "../store/branch/branch.types";

export interface SeedBranchMasterDataResponse {
  succeeded: boolean;
  message: string;
  errors: string[];
  data?: {
    message: string;
  };
}

export const listBranches = async (): Promise<BranchListResponse> => {
  const response = await axiosInstance.get<BranchListResponse>("/branches");
  return response.data;
};

export const createBranch = async (
  payload: CreateBranchRequest
): Promise<CreateBranchResponse> => {
  const response = await axiosInstance.post<CreateBranchResponse>(
    "/branches",
    payload
  );
  return response.data;
};

export const getHeadOffice = async (): Promise<GetHeadOfficeResponse> => {
  const response = await axiosInstance.get<GetHeadOfficeResponse>(
    "/branches/head-office"
  );
  return response.data;
};

export const updateBranch = async (
  id: string,
  payload: UpdateBranchRequest
): Promise<UpdateBranchResponse> => {
  const response = await axiosInstance.patch<UpdateBranchResponse>(
    `/branches/${id}`,
    payload
  );
  return response.data;
};

export const deleteBranch = async (id: string): Promise<DeleteBranchResponse> => {
  const response = await axiosInstance.delete<DeleteBranchResponse>(
    `/branches/${id}`
  );
  return response.data;
};

export const seedBranchMasterData = async (
  branchId: string
): Promise<SeedBranchMasterDataResponse> => {
  const response = await axiosInstance.post<SeedBranchMasterDataResponse>(
    `/branches/${branchId}/seed`
  );
  return response.data;
};

export const getBranchCalendar = async (
  branchId: string,
  year?: number,
  month?: number
): Promise<GetBranchCalendarResponse> => {
  const params: Record<string, number> = {};
  if (year) params.year = year;
  if (month) params.month = month;

  const response = await axiosInstance.get<GetBranchCalendarResponse>(
    `/branches/${branchId}/calendar`,
    { params }
  );
  return response.data;
};

export const getMyBranchCalendar = async (
  year?: number,
  month?: number
): Promise<GetBranchCalendarResponse> => {
  const params: Record<string, number> = {};
  if (year) params.year = year;
  if (month) params.month = month;

  const response = await axiosInstance.get<GetBranchCalendarResponse>(
    "/branches/my/calendar",
    { params }
  );
  return response.data;
};

export const getMySchedule = async (
  year?: number,
  month?: number
): Promise<GetBranchCalendarResponse> => {
  const params: Record<string, number> = {};
  if (year) params.year = year;
  if (month) params.month = month;

  const response = await axiosInstance.get<GetBranchCalendarResponse>(
    "/branches/me/schedule",
    { params }
  );
  return response.data;
};
