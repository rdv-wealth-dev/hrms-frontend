import axiosInstance from "./axios";
import type { 
    CreateShiftRequest, 
    ShiftResponse, 
    ShiftListResponse, 
    AttendanceRecordResponse, 
    AttendanceHistoryResponse, 
    ManualAttendanceRequest,
    CreateRegularizationRequest,
    RegularizationListResponse
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
    type: "CHECK_IN" | "BREAK_OUT" | "BREAK_IN" | "CHECK_OUT"
): Promise<AttendanceRecordResponse> => {
    const response = await axiosInstance.post<AttendanceRecordResponse>(
        "/attendance/me/punch/web",
        { type },
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

export const getPendingRegularizationRequests = async (): Promise<RegularizationListResponse | RegularizationRequest[]> => {
  const response = await axiosInstance.get<RegularizationListResponse | RegularizationRequest[]>(
    "/attendance/regularizations/pending",
    { headers: getAuthHeader() }
  );
  return response.data;
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

 