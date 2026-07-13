import type { CreateLeaveTypeRequest, LeaveType, CreateHolidayRequest, Holiday, LeaveBalance, CreateLeaveRequest, LeaveRequestsPaginatedResponse } from "../../api/leave.api";
import { LEAVE_ACTIONS } from "./leave.types";
import type { LeaveAction } from "./leave.types";

export const resetLeaveState = (): LeaveAction => ({
  type: LEAVE_ACTIONS.RESET,
});

export const resetLeaveStatus = (): LeaveAction => ({
  type: LEAVE_ACTIONS.RESET_STATUS,
});

export const listLeaveTypesRequest = (): LeaveAction => ({
  type: LEAVE_ACTIONS.LIST_REQUEST,
});

export const listLeaveTypesSuccess = (payload: LeaveType[]): LeaveAction => ({
  type: LEAVE_ACTIONS.LIST_SUCCESS,
  payload,
});

export const listLeaveTypesFailure = (payload: string): LeaveAction => ({
  type: LEAVE_ACTIONS.LIST_FAILURE,
  payload,
});

export const createLeaveTypeRequest = (payload: CreateLeaveTypeRequest): LeaveAction => ({
  type: LEAVE_ACTIONS.CREATE_REQUEST,
  payload,
});

export const createLeaveTypeSuccess = (payload: LeaveType): LeaveAction => ({
  type: LEAVE_ACTIONS.CREATE_SUCCESS,
  payload,
});

export const createLeaveTypeFailure = (payload: string): LeaveAction => ({
  type: LEAVE_ACTIONS.CREATE_FAILURE,
  payload,
});

// Holidays
export const listHolidaysRequest = (payload?: number): LeaveAction => ({
  type: LEAVE_ACTIONS.LIST_HOLIDAYS_REQUEST,
  payload,
});

export const listHolidaysSuccess = (payload: Holiday[]): LeaveAction => ({
  type: LEAVE_ACTIONS.LIST_HOLIDAYS_SUCCESS,
  payload,
});

export const listHolidaysFailure = (payload: string): LeaveAction => ({
  type: LEAVE_ACTIONS.LIST_HOLIDAYS_FAILURE,
  payload,
});

export const createHolidayRequest = (payload: CreateHolidayRequest): LeaveAction => ({
  type: LEAVE_ACTIONS.CREATE_HOLIDAY_REQUEST,
  payload,
});

export const createHolidaySuccess = (payload: Holiday): LeaveAction => ({
  type: LEAVE_ACTIONS.CREATE_HOLIDAY_SUCCESS,
  payload,
});

export const createHolidayFailure = (payload: string): LeaveAction => ({
  type: LEAVE_ACTIONS.CREATE_HOLIDAY_FAILURE,
  payload,
});

// Balances
export const getMyLeaveBalancesRequest = (payload?: number): LeaveAction => ({
  type: LEAVE_ACTIONS.GET_MY_BALANCES_REQUEST,
  payload,
});

export const getMyLeaveBalancesSuccess = (payload: LeaveBalance[]): LeaveAction => ({
  type: LEAVE_ACTIONS.GET_MY_BALANCES_SUCCESS,
  payload,
});

export const getMyLeaveBalancesFailure = (payload: string): LeaveAction => ({
  type: LEAVE_ACTIONS.GET_MY_BALANCES_FAILURE,
  payload,
});

// Apply Leave
export const applyLeaveRequest = (payload: CreateLeaveRequest): LeaveAction => ({
  type: LEAVE_ACTIONS.APPLY_LEAVE_REQUEST,
  payload,
});

export const applyLeaveSuccess = (): LeaveAction => ({
  type: LEAVE_ACTIONS.APPLY_LEAVE_SUCCESS,
});

export const applyLeaveFailure = (payload: string): LeaveAction => ({
  type: LEAVE_ACTIONS.APPLY_LEAVE_FAILURE,
  payload,
});

// Pending Approvals
export const getPendingLeaveRequestsRequest = (payload: { pageNumber: number; pageSize: number }): LeaveAction => ({
  type: LEAVE_ACTIONS.GET_PENDING_REQUESTS_REQUEST,
  payload,
});

export const getPendingLeaveRequestsSuccess = (payload: LeaveRequestsPaginatedResponse): LeaveAction => ({
  type: LEAVE_ACTIONS.GET_PENDING_REQUESTS_SUCCESS,
  payload,
});

export const getPendingLeaveRequestsFailure = (payload: string): LeaveAction => ({
  type: LEAVE_ACTIONS.GET_PENDING_REQUESTS_FAILURE,
  payload,
});

// Review Request
export const reviewLeaveRequestRequest = (payload: { id: string; status: "APPROVED" | "REJECTED"; reviewComments?: string }): LeaveAction => ({
  type: LEAVE_ACTIONS.REVIEW_REQUEST_REQUEST,
  payload,
});

export const reviewLeaveRequestSuccess = (): LeaveAction => ({
  type: LEAVE_ACTIONS.REVIEW_REQUEST_SUCCESS,
});

export const reviewLeaveRequestFailure = (payload: string): LeaveAction => ({
  type: LEAVE_ACTIONS.REVIEW_REQUEST_FAILURE,
  payload,
});
