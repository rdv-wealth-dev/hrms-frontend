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
    "/leave/types?pageNumber=1&pageSize=50",
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

export interface LeaveRequest {
  _id: string;
  tenantId: string;
  branchId: string;
  employeeId: {
    _id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
  };
  leaveTypeId: {
    _id: string;
    name: string;
    code: string;
  };
  fromDate: string;
  toDate: string;
  fromSession: "FULL_DAY" | "FIRST_HALF" | "SECOND_HALF";
  toSession: "FULL_DAY" | "FIRST_HALF" | "SECOND_HALF";
  totalDays: number;
  baseDays: number;
  isSandwiched: boolean;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  cancelReason?: string;
  cancelledAt?: string;
  currentApprovalLevel: number;
  approvals: Array<{
    level: number;
    approverRole: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    comments?: string;
    actedAt?: string;
    approverId?: string;
  }>;
  appliedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveRequestsPaginatedResponse {
  succeeded: boolean;
  message: string | null;
  errors: string[];
  data: LeaveRequest[];
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
}

export interface ReviewLeaveRequestResponse {
  succeeded: boolean;
  message: string;
  errors: string[];
}

export const getPendingLeaveRequests = async (
  pageNumber = 1,
  pageSize = 20
): Promise<LeaveRequestsPaginatedResponse> => {
  const response = await axiosInstance.get<LeaveRequestsPaginatedResponse>(
    `/leave/requests/pending?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const reviewLeaveRequest = async (
  id: string,
  status: "APPROVED" | "REJECTED",
  reviewComments?: string
): Promise<ReviewLeaveRequestResponse> => {
  const response = await axiosInstance.patch<ReviewLeaveRequestResponse>(
    `/leave/requests/${id}/review`,
    { status, reviewComments },
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const getMyLeaveRequests = async (
  pageNumber = 1,
  pageSize = 10
): Promise<LeaveRequestsPaginatedResponse> => {
  const response = await axiosInstance.get<LeaveRequestsPaginatedResponse>(
    `/leave/requests/me?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    { headers: getAuthHeader() }
  );
  return response.data;
};

export interface CancelLeaveRequestResponse {
  succeeded: boolean;
  message: string | null;
  errors: string[];
  data: LeaveRequest;
}

export const cancelLeaveRequest = async (
  id: string,
  cancelReason: string
): Promise<CancelLeaveRequestResponse> => {
  const response = await axiosInstance.patch<CancelLeaveRequestResponse>(
    `/leave/requests/${id}/cancel`,
    { cancelReason },
    { headers: getAuthHeader() }
  );
  return response.data;
};

export interface CompOffRecord {
  _id: string;
  tenantId: string;
  branchId: string;
  createdBy: string;
  updatedBy: string;
  isDeleted: boolean;
  version: number;
  employeeId: string;
  workDate: string;
  sourceType: "PUBLIC_HOLIDAY" | "WEEKEND_WORK";
  creditedDate: string;
  expiryDate: string;
  status: "AVAILABLE" | "USED" | "EXPIRED";
  createdAt: string;
  updatedAt: string;
}

export interface CompOffBalanceResponse {
  succeeded: boolean;
  message: string | null;
  errors: string[];
  data: CompOffRecord[];
}

export const getMyCompOffBalances = async (): Promise<CompOffBalanceResponse> => {
  const response = await axiosInstance.get<CompOffBalanceResponse>(
    "/leave/comp-off/me",
    { headers: getAuthHeader() }
  );
  return response.data;
};

export interface CreditCompOffRequest {
  employeeId: string;
  workDate: string;
  sourceType: "PUBLIC_HOLIDAY" | "WEEKEND_WORK";
}

export interface CreditCompOffResponse {
  succeeded: boolean;
  message: string | null;
  errors: string[];
  data: CompOffRecord;
}

export const creditCompOff = async (
  payload: CreditCompOffRequest
): Promise<CreditCompOffResponse> => {
  const response = await axiosInstance.post<CreditCompOffResponse>(
    "/leave/comp-off",
    payload,
    { headers: getAuthHeader() }
  );
  return response.data;
};


