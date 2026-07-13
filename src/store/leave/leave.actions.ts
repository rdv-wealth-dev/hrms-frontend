import type { CreateLeaveTypeRequest, LeaveType, CreateHolidayRequest, Holiday } from "../../api/leave.api";
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
export const listHolidaysRequest = (): LeaveAction => ({
  type: LEAVE_ACTIONS.LIST_HOLIDAYS_REQUEST,
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
