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

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("accessToken") ?? ""}`,
});

export const listBranches = async (): Promise<BranchListResponse> => {
  const response = await axiosInstance.get<BranchListResponse>(
    "/branches",
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const createBranch = async (
  payload: CreateBranchRequest
): Promise<CreateBranchResponse> => {
  const response = await axiosInstance.post<CreateBranchResponse>(
    "/branches",
    payload,
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const getHeadOffice = async (): Promise<GetHeadOfficeResponse> => {
  const response = await axiosInstance.get<GetHeadOfficeResponse>(
    "/branches/head-office",
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const updateBranch = async (
  id: string,
  payload: UpdateBranchRequest
): Promise<UpdateBranchResponse> => {
  const response = await axiosInstance.patch<UpdateBranchResponse>(
    `/branches/${id}`,
    payload,
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const deleteBranch = async (id: string): Promise<DeleteBranchResponse> => {
  const response = await axiosInstance.delete<DeleteBranchResponse>(
    `/branches/${id}`,
    { headers: getAuthHeader() }
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
    {
      params,
      headers: getAuthHeader(),
    }
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
    {
      params,
      headers: getAuthHeader(),
    }
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
    {
      params,
      headers: getAuthHeader(),
    }
  );
  return response.data;
};


