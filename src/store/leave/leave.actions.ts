import type { CreateLeaveTypeRequest, LeaveType, CreateHolidayRequest, UpdateHolidayRequest, Holiday, LeaveBalance, CreateLeaveRequest, LeaveRequestsPaginatedResponse, CompOffRecord } from "../../api/leave.api";
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

export const updateHolidayRequest = (id: string, data: UpdateHolidayRequest): LeaveAction => ({
  type: LEAVE_ACTIONS.UPDATE_HOLIDAY_REQUEST,
  payload: { id, data },
});

export const updateHolidaySuccess = (payload: Holiday): LeaveAction => ({
  type: LEAVE_ACTIONS.UPDATE_HOLIDAY_SUCCESS,
  payload,
});

export const updateHolidayFailure = (payload: string): LeaveAction => ({
  type: LEAVE_ACTIONS.UPDATE_HOLIDAY_FAILURE,
  payload,
});

export const deleteHolidayRequest = (payload: string): LeaveAction => ({
  type: LEAVE_ACTIONS.DELETE_HOLIDAY_REQUEST,
  payload,
});

export const deleteHolidaySuccess = (payload: string): LeaveAction => ({
  type: LEAVE_ACTIONS.DELETE_HOLIDAY_SUCCESS,
  payload,
});

export const deleteHolidayFailure = (payload: string): LeaveAction => ({
  type: LEAVE_ACTIONS.DELETE_HOLIDAY_FAILURE,
  payload,
});

export const seedDefaultHolidaysRequest = (payload?: { countryCode?: string; stateCode?: string }): LeaveAction => ({
  type: LEAVE_ACTIONS.SEED_DEFAULT_HOLIDAYS_REQUEST,
  payload,
});

export const seedDefaultHolidaysSuccess = (data?: Holiday[]): LeaveAction => ({
  type: LEAVE_ACTIONS.SEED_DEFAULT_HOLIDAYS_SUCCESS,
  payload: data,
});

export const seedDefaultHolidaysFailure = (payload: string): LeaveAction => ({
  type: LEAVE_ACTIONS.SEED_DEFAULT_HOLIDAYS_FAILURE,
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

// Get My Requests
export const getMyLeaveRequestsRequest = (payload: { pageNumber: number; pageSize: number }): LeaveAction => ({
  type: LEAVE_ACTIONS.GET_MY_REQUESTS_REQUEST,
  payload,
});

export const getMyLeaveRequestsSuccess = (payload: LeaveRequestsPaginatedResponse): LeaveAction => ({
  type: LEAVE_ACTIONS.GET_MY_REQUESTS_SUCCESS,
  payload,
});

export const getMyLeaveRequestsFailure = (payload: string): LeaveAction => ({
  type: LEAVE_ACTIONS.GET_MY_REQUESTS_FAILURE,
  payload,
});

// Cancel Request
export const cancelLeaveRequestRequest = (payload: { id: string; cancelReason: string }): LeaveAction => ({
  type: LEAVE_ACTIONS.CANCEL_LEAVE_REQUEST,
  payload,
});

export const cancelLeaveRequestSuccess = (): LeaveAction => ({
  type: LEAVE_ACTIONS.CANCEL_LEAVE_SUCCESS,
});

export const cancelLeaveRequestFailure = (payload: string): LeaveAction => ({
  type: LEAVE_ACTIONS.CANCEL_LEAVE_FAILURE,
  payload,
});

// Comp-Off Balances
export const getMyCompOffBalancesRequest = (): LeaveAction => ({
  type: LEAVE_ACTIONS.GET_COMP_OFF_REQUEST,
});

export const getMyCompOffBalancesSuccess = (payload: CompOffRecord[]): LeaveAction => ({
  type: LEAVE_ACTIONS.GET_COMP_OFF_SUCCESS,
  payload,
});

export const getMyCompOffBalancesFailure = (payload: string): LeaveAction => ({
  type: LEAVE_ACTIONS.GET_COMP_OFF_FAILURE,
  payload,
});
