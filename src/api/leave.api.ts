import axiosInstance from "./axios";

const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    throw new Error("No access token found. Please log in again.");
  }
  return {
    Authorization: `Bearer ${token}`,
  };
};

export interface CreateLeaveTypeRequest {
  name: string;
  code: string;
  description?: string;
  isPaid?: boolean;
  annualQuota: number;
  accrualFrequency?: "MONTHLY" | "YEARLY" | "NONE";
  accrualAmountPerCycle?: number;
  maxCarryForwardDays?: number;
  maxConsecutiveDays?: number;
  advanceNoticeDays?: number;
  minAdvanceNoticeDays?: number;
  requiresApproval?: boolean;
  approvalLevels?: number;
  allowNegativeBalance?: boolean;
  probationEligible?: boolean;
  applySandwichPolicy?: boolean;
}

export interface LeaveType {
  _id: string;
  tenantId: string;
  branchId: string;
  name: string;
  code: string;
  description: string;
  isPaid: boolean;
  annualQuota: number;
  accrualFrequency: "MONTHLY" | "YEARLY" | "NONE";
  accrualAmountPerCycle: number;
  maxCarryForwardDays: number;
  maxConsecutiveDays: number;
  advanceNoticeDays: number;
  minAdvanceNoticeDays: number;
  requiresApproval: boolean;
  approvalLevels: number;
  allowNegativeBalance: boolean;
  probationEligible: boolean;
  applySandwichPolicy: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveTypesPaginatedResponse {
  succeeded: boolean;
  message: string | null;
  errors: string[];
  data: LeaveType[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
}

export interface CreateLeaveTypeResponse {
  succeeded: boolean;
  message: string;
  errors: string[];
  data: LeaveType;
}

export const createLeaveType = async (
  payload: CreateLeaveTypeRequest
): Promise<CreateLeaveTypeResponse> => {
  const response = await axiosInstance.post<CreateLeaveTypeResponse>(
    "/leave/types",
    payload,
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const listLeaveTypes = async (): Promise<LeaveTypesPaginatedResponse> => {
  const response = await axiosInstance.get<LeaveTypesPaginatedResponse>(
    "/leave/types",
    { headers: getAuthHeader() }
  );
  return response.data;
};

export interface CreateHolidayRequest {
  name: string;
  date: string;
  type?: "NATIONAL" | "RESTRICTED" | "REGIONAL";
  isOptional?: boolean;
  description?: string;
  branchId?: string;
}

export interface Holiday {
  _id: string;
  tenantId: string;
  name: string;
  date: string;
  type: "NATIONAL" | "RESTRICTED" | "REGIONAL";
  isOptional: boolean;
  description?: string;
  branchId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HolidayListResponse {
  succeeded: boolean;
  message: string | null;
  errors: string[];
  data: Holiday[];
}

export interface CreateHolidayResponse {
  succeeded: boolean;
  message: string;
  errors: string[];
  data: Holiday;
}

export const createHoliday = async (
  payload: CreateHolidayRequest
): Promise<CreateHolidayResponse> => {
  const response = await axiosInstance.post<CreateHolidayResponse>(
    "/leave/holidays",
    payload,
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const listHolidays = async (year?: number): Promise<HolidayListResponse> => {
  const response = await axiosInstance.get<HolidayListResponse>(
    "/leave/holidays",
    {
      params: year ? { year } : undefined,
      headers: getAuthHeader(),
    }
  );
  return response.data;
};

export interface LeaveBalance {
  _id: string;
  tenantId: string;
  branchId: string;
  employeeId: string;
  leaveTypeId: string;
  year: number;
  allocated: number;
  carriedForward: number;
  used: number;
  pending: number;
  available: number;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveBalancesResponse {
  succeeded: boolean;
  message: string | null;
  errors: string[];
  data: LeaveBalance[];
}

export const getMyLeaveBalances = async (
  year?: number
): Promise<LeaveBalancesResponse> => {
  const response = await axiosInstance.get<LeaveBalancesResponse>(
    "/leave/balances/me",
    {
      params: year ? { year } : undefined,
      headers: getAuthHeader(),
    }
  );
  return response.data;
};

export interface CreateLeaveRequest {
  leaveTypeId: string;
  fromDate: string;
  toDate: string;
  fromSession?: "FULL_DAY" | "FIRST_HALF" | "SECOND_HALF";
  toSession?: "FULL_DAY" | "FIRST_HALF" | "SECOND_HALF";
  reason: string;
}

export interface CreateLeaveRequestResponse {
  succeeded: boolean;
  message: string;
  errors: string[];
  data: {
    _id: string;
    tenantId: string;
    branchId: string;
    employeeId: string;
    leaveTypeId: string;
    fromDate: string;
    toDate: string;
    fromSession: "FULL_DAY" | "FIRST_HALF" | "SECOND_HALF";
    toSession: "FULL_DAY" | "FIRST_HALF" | "SECOND_HALF";
    totalDays: number;
    baseDays: number;
    isSandwiched: boolean;
    reason: string;
    status: string;
    appliedAt: string;
    createdAt: string;
    updatedAt: string;
  };
}

export const applyForLeave = async (
  payload: CreateLeaveRequest
): Promise<CreateLeaveRequestResponse> => {
  const response = await axiosInstance.post<CreateLeaveRequestResponse>(
    "/leave/requests",
    payload,
    { headers: getAuthHeader() }
  );
  return response.data;
};
