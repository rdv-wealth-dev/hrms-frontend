export type AttendanceState = {
  loading: boolean
  error: string | null
}

export const ATTENDANCE_ACTIONS = {
  RESET: 'attendance/reset',
} as const

export type AttendanceAction = { type: typeof ATTENDANCE_ACTIONS.RESET }

export interface CreateShiftRequest {
  name: string;
  code: string;
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
  gracePeriodMinutes?: number;
  graceLimitPerMonth?: number;
  halfDayThresholdMinutes?: number;
  fullDayMinutes?: number;
  breakDurationMinutes?: number;
  isDefault?: boolean;
}

export interface Shift {
  _id: string;
  tenantId: string;
  branchId: string;
  name: string;
  code: string;
  startTime: string;
  endTime: string;
  gracePeriodMinutes: number;
  graceLimitPerMonth: number;
  halfDayThresholdMinutes: number;
  fullDayMinutes: number;
  breakDurationMinutes: number;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShiftResponse {
  succeeded: boolean;
  message: string;
  errors: string[];
  data: Shift | null;
}

export interface ShiftListResponse {
  succeeded: boolean;
  message: string | null;
  errors: string[];
  data: Shift[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
  firstPage: number | null;
  lastPage: number | null;
  nextPage: number | null;
  previousPage: number | null;
}

export interface PunchSession {
  type: "CHECK_IN" | "BREAK_OUT" | "BREAK_IN" | "CHECK_OUT";
  timestamp: string;
  source: "WEB" | "MOBILE" | "MANUAL";
  ipAddress?: string;
  deviceInfo?: string;
  withinGeofence?: boolean | null;
}

export interface AttendanceRecord {
  _id?: string;
  tenantId?: string;
  branchId?: string;
  employeeId?: string;
  shiftId?: string;
  attendanceDate?: string;
  sessions: PunchSession[];
  status: "NOT_CHECKED_IN" | "PRESENT" | "LATE" | "HALF_DAY" | "ABSENT" | "ON_LEAVE" | "HOLIDAY" | "WEEK_OFF";
  workedMinutes: number;
  isRegularized: boolean;
  firstCheckIn?: string;
  lastCheckOut?: string;
}

export interface AttendanceRecordResponse {
  succeeded: boolean;
  message: string | null;
  errors: string[];
  data: AttendanceRecord;
}

export interface AttendanceHistoryResponse {
  succeeded: boolean;
  message: string | null;
  errors: string[];
  data: AttendanceRecord[];
}

export interface ManualAttendanceRequest {
  employeeId: string;
  attendanceDate: string; // YYYY-MM-DD
  checkIn: string;        // ISO datetime string
  checkOut?: string;      // ISO datetime string
  notes?: string;
}

export interface CreateRegularizationRequest {
  attendanceId: string;
  requestedCheckIn?: string;  // ISO datetime string
  requestedCheckOut?: string; // ISO datetime string
  reason: string;
}

export interface RegularizationRequest {
  _id: string;
  tenantId: string;
  branchId: string;
  employeeId: string;
  attendanceId: string;
  attendanceDate: string;
  requestedCheckIn?: string;
  requestedCheckOut?: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
}

export interface RegularizationListResponse {
  succeeded: boolean;
  message: string | null;
  errors: string[];
  data: RegularizationRequest[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
}

export interface AttendanceReportResponse {
  succeeded: boolean;
  message: string | null;
  errors: string[];
  data: {
    data: AttendanceRecord[];
    totalRecords: number;
    pageNumber: number;
    pageSize: number;
  };
}
