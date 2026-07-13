import type { LeaveType, CreateLeaveTypeRequest, Holiday, CreateHolidayRequest, LeaveBalance, CreateLeaveRequest } from "../../api/leave.api";

export type LeaveState = {
  leaveTypes: LeaveType[];
  holidays: Holiday[];
  balances: LeaveBalance[];
  loading: boolean;
  loadingBalances: boolean;
  submitting: boolean;
  success: boolean;
  error: string | null;
}

export const LEAVE_ACTIONS = {
  RESET: 'leave/reset',
  RESET_STATUS: 'leave/reset_status',

  LIST_REQUEST: 'leave/list_request',
  LIST_SUCCESS: 'leave/list_success',
  LIST_FAILURE: 'leave/list_failure',

  CREATE_REQUEST: 'leave/create_request',
  CREATE_SUCCESS: 'leave/create_success',
  CREATE_FAILURE: 'leave/create_failure',

  LIST_HOLIDAYS_REQUEST: 'leave/list_holidays_request',
  LIST_HOLIDAYS_SUCCESS: 'leave/list_holidays_success',
  LIST_HOLIDAYS_FAILURE: 'leave/list_holidays_failure',

  CREATE_HOLIDAY_REQUEST: 'leave/create_holiday_request',
  CREATE_HOLIDAY_SUCCESS: 'leave/create_holiday_success',
  CREATE_HOLIDAY_FAILURE: 'leave/create_holiday_failure',

  GET_MY_BALANCES_REQUEST: 'leave/get_my_balances_request',
  GET_MY_BALANCES_SUCCESS: 'leave/get_my_balances_success',
  GET_MY_BALANCES_FAILURE: 'leave/get_my_balances_failure',

  APPLY_LEAVE_REQUEST: 'leave/apply_leave_request',
  APPLY_LEAVE_SUCCESS: 'leave/apply_leave_success',
  APPLY_LEAVE_FAILURE: 'leave/apply_leave_failure',
} as const;

export type ResetAction = { type: typeof LEAVE_ACTIONS.RESET };
export type ResetStatusAction = { type: typeof LEAVE_ACTIONS.RESET_STATUS };

export type ListLeaveTypesRequestAction = {
  type: typeof LEAVE_ACTIONS.LIST_REQUEST;
};

export type ListLeaveTypesSuccessAction = {
  type: typeof LEAVE_ACTIONS.LIST_SUCCESS;
  payload: LeaveType[];
};

export type ListLeaveTypesFailureAction = {
  type: typeof LEAVE_ACTIONS.LIST_FAILURE;
  payload: string;
};

export type CreateLeaveTypeRequestAction = {
  type: typeof LEAVE_ACTIONS.CREATE_REQUEST;
  payload: CreateLeaveTypeRequest;
};

export type CreateLeaveTypeSuccessAction = {
  type: typeof LEAVE_ACTIONS.CREATE_SUCCESS;
  payload: LeaveType;
};

export type CreateLeaveTypeFailureAction = {
  type: typeof LEAVE_ACTIONS.CREATE_FAILURE;
  payload: string;
};

export type ListHolidaysRequestAction = {
  type: typeof LEAVE_ACTIONS.LIST_HOLIDAYS_REQUEST;
  payload?: number;
};

export type ListHolidaysSuccessAction = {
  type: typeof LEAVE_ACTIONS.LIST_HOLIDAYS_SUCCESS;
  payload: Holiday[];
};

export type ListHolidaysFailureAction = {
  type: typeof LEAVE_ACTIONS.LIST_HOLIDAYS_FAILURE;
  payload: string;
};

export type CreateHolidayRequestAction = {
  type: typeof LEAVE_ACTIONS.CREATE_HOLIDAY_REQUEST;
  payload: CreateHolidayRequest;
};

export type CreateHolidaySuccessAction = {
  type: typeof LEAVE_ACTIONS.CREATE_HOLIDAY_SUCCESS;
  payload: Holiday;
};

export type CreateHolidayFailureAction = {
  type: typeof LEAVE_ACTIONS.CREATE_HOLIDAY_FAILURE;
  payload: string;
};

export type GetMyLeaveBalancesRequestAction = {
  type: typeof LEAVE_ACTIONS.GET_MY_BALANCES_REQUEST;
  payload?: number;
};

export type GetMyLeaveBalancesSuccessAction = {
  type: typeof LEAVE_ACTIONS.GET_MY_BALANCES_SUCCESS;
  payload: LeaveBalance[];
};

export type GetMyLeaveBalancesFailureAction = {
  type: typeof LEAVE_ACTIONS.GET_MY_BALANCES_FAILURE;
  payload: string;
};

export type ApplyLeaveRequestAction = {
  type: typeof LEAVE_ACTIONS.APPLY_LEAVE_REQUEST;
  payload: CreateLeaveRequest;
};

export type ApplyLeaveSuccessAction = {
  type: typeof LEAVE_ACTIONS.APPLY_LEAVE_SUCCESS;
};

export type ApplyLeaveFailureAction = {
  type: typeof LEAVE_ACTIONS.APPLY_LEAVE_FAILURE;
  payload: string;
};

export type LeaveAction =
  | ResetAction
  | ResetStatusAction
  | ListLeaveTypesRequestAction
  | ListLeaveTypesSuccessAction
  | ListLeaveTypesFailureAction
  | CreateLeaveTypeRequestAction
  | CreateLeaveTypeSuccessAction
  | CreateLeaveTypeFailureAction
  | ListHolidaysRequestAction
  | ListHolidaysSuccessAction
  | ListHolidaysFailureAction
  | CreateHolidayRequestAction
  | CreateHolidaySuccessAction
  | CreateHolidayFailureAction
  | GetMyLeaveBalancesRequestAction
  | GetMyLeaveBalancesSuccessAction
  | GetMyLeaveBalancesFailureAction
  | ApplyLeaveRequestAction
  | ApplyLeaveSuccessAction
  | ApplyLeaveFailureAction;
