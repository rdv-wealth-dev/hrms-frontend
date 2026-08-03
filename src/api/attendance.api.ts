import axiosInstance from "./axios";
import type { 
    CreateShiftRequest,
    UpdateShiftRequest, 
    ShiftResponse, 
    ShiftListResponse, 
    AttendanceRecordResponse, 
    AttendanceHistoryResponse, 
    ManualAttendanceRequest,
    CreateRegularizationRequest,
    RegularizationListResponse,
    AttendanceReportResponse,
    ShiftAssignmentsResponse,
    CreateRotationPlanRequest,
    CreateRotationPlanResponse,
    RotationPlanListResponse,
    AssignRotationPlanRequest,
    AssignRotationPlanResponse
} from "../store/attendance/attendance.types";

const getAuthHeader = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
        throw new Error("No access token found. Please log in again.");
    }
    return {
        Authorization: `Bearer ${token}`,
    };
};

export const createShift = async (
    payload: CreateShiftRequest
): Promise<ShiftResponse> => {
    const response = await axiosInstance.post<ShiftResponse>(
        "/attendance/shifts",
        payload,
        { headers: getAuthHeader() }
    );
    return response.data;
};

export const updateShift = async (
    id: string,
    payload: UpdateShiftRequest
): Promise<ShiftResponse> => {
    const response = await axiosInstance.patch<ShiftResponse>(
        `/attendance/shifts/${id}`,
        payload,
        { headers: getAuthHeader() }
    );
    return response.data;
};

export const listShifts = async (): Promise<ShiftListResponse> => {
    const response = await axiosInstance.get<ShiftListResponse>(
        "/attendance/shifts",
        { headers: getAuthHeader() }
    );
    return response.data;
};

export const getMyTodayAttendance = async (): Promise<AttendanceRecordResponse> => {
    const response = await axiosInstance.get<AttendanceRecordResponse>(
        "/attendance/me/today",
        { headers: getAuthHeader() }
    );
    return response.data;
};

export const recordPunch = async (
    type: "CHECK_IN" | "BREAK_OUT" | "BREAK_IN" | "CHECK_OUT",
    shiftId?: string,
    longitude?: number,
    latitude?: number
): Promise<AttendanceRecordResponse> => {
    const response = await axiosInstance.post<AttendanceRecordResponse>(
        "/attendance/me/punch/web",
        { type, shiftId, longitude, latitude },
        { headers: getAuthHeader() }
    );
    return response.data;
};

export const getMyAttendanceHistory = async (
    fromDate: string,
    toDate: string
): Promise<AttendanceHistoryResponse> => {
    const response = await axiosInstance.get<AttendanceHistoryResponse>(
        "/attendance/me/history",
        {
            params: { fromDate, toDate },
            headers: getAuthHeader(),
        }
    );
    return response.data;
};

export const createManualAttendance = async (
    payload: ManualAttendanceRequest
): Promise<AttendanceRecordResponse> => {
    const response = await axiosInstance.post<AttendanceRecordResponse>(
        "/attendance/manual",
        payload,
        { headers: getAuthHeader() }
    );
    return response.data;
};

export const createRegularizationRequest = async (
    payload: CreateRegularizationRequest
): Promise<any> => {
    const response = await axiosInstance.post<any>(
        "/attendance/regularizations",
        payload,
        { headers: getAuthHeader() }
    );
    return response.data;
};

export const getMyRegularizationRequests = async (): Promise<RegularizationListResponse> => {
    const response = await axiosInstance.get<RegularizationListResponse>(
        "/attendance/regularizations/me",
        { headers: getAuthHeader() }
    );
    return response.data;
};

export interface ReviewRegularizationRequest {
  status: "APPROVED" | "REJECTED";
  reviewComments?: string;
}

export interface ReviewRegularizationResponse {
  succeeded: boolean;
  message: string | null;
  errors: string[];
  data: any;
}

export const getPendingRegularizationRequests = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get(
      "/attendance/regularizations/pending",
      { headers: getAuthHeader() }
    );
    if (response.data) {
      const d = response.data;
      if (Array.isArray(d) && d.length > 0) return d;
      if (d.succeeded && Array.isArray(d.data) && d.data.length > 0) return d;
    }
    return response.data;
  } catch {
    const fallbackResponse = await axiosInstance.get(
      "/attendance/regularizations",
      { params: { status: "PENDING" }, headers: getAuthHeader() }
    );
    return fallbackResponse.data;
  }
};

export const reviewRegularizationRequest = async (
  id: string,
  payload: ReviewRegularizationRequest
): Promise<ReviewRegularizationResponse> => {
  const response = await axiosInstance.patch<ReviewRegularizationResponse>(
    `/attendance/regularizations/${id}/review`,
    payload,
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const getAttendanceReport = async (
  fromDate: string,
  toDate: string,
  pageNumber = 1,
  pageSize = 20,
  status?: string,
  employeeId?: string,
  designationId?: string,
  branchId?: string,
  departmentId?: string,
  search?: string
): Promise<AttendanceReportResponse> => {
  const response = await axiosInstance.get<AttendanceReportResponse>(
    "/attendance/report",
    {
      params: { 
        fromDate, 
        toDate, 
        pageNumber, 
        pageSize, 
        status, 
        employeeId,
        designationId,
        branchId,
        departmentId,
        search
      },
      headers: getAuthHeader(),
    }
  );
  return response.data;
};

export const getShiftAssignments = async (): Promise<ShiftAssignmentsResponse> => {
    const response = await axiosInstance.get<ShiftAssignmentsResponse>(
        "/attendance/shifts/assignments",
        { headers: getAuthHeader() }
    );
    return response.data;
};

export const createRotationPlan = async (
    payload: CreateRotationPlanRequest
): Promise<CreateRotationPlanResponse> => {
    const response = await axiosInstance.post<CreateRotationPlanResponse>(
        "/attendance/rotation-plans",
        payload,
        { headers: getAuthHeader() }
    );
    return response.data;
};

export const listRotationPlans = async (): Promise<RotationPlanListResponse> => {
    const response = await axiosInstance.get<RotationPlanListResponse>(
        "/attendance/rotation-plans",
        { headers: getAuthHeader() }
    );
    return response.data;
};

export const assignRotationPlan = async (
    payload: AssignRotationPlanRequest
): Promise<AssignRotationPlanResponse> => {
    const response = await axiosInstance.post<AssignRotationPlanResponse>(
        "/attendance/rotation-plans/assign",
        payload,
        { headers: getAuthHeader() }
    );
    return response.data;
};