import type { LeaveType, CreateLeaveTypeRequest, Holiday, CreateHolidayRequest, LeaveBalance, CreateLeaveRequest, LeaveRequest, LeaveRequestsPaginatedResponse, CompOffRecord } from "../../api/leave.api";

export type LeaveState = {
  leaveTypes: LeaveType[];
  holidays: Holiday[];
  balances: LeaveBalance[];
  pendingRequests: LeaveRequest[];
  totalPendingRecords: number;
  myRequests: LeaveRequest[];
  totalMyRecords: number;
  compOffs: CompOffRecord[];
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

  GET_PENDING_REQUESTS_REQUEST: 'leave/get_pending_requests_request',
  GET_PENDING_REQUESTS_SUCCESS: 'leave/get_pending_requests_success',
  GET_PENDING_REQUESTS_FAILURE: 'leave/get_pending_requests_failure',

  REVIEW_REQUEST_REQUEST: 'leave/review_request_request',
  REVIEW_REQUEST_SUCCESS: 'leave/review_request_success',
  REVIEW_REQUEST_FAILURE: 'leave/review_request_failure',

  GET_MY_REQUESTS_REQUEST: 'leave/get_my_requests_request',
  GET_MY_REQUESTS_SUCCESS: 'leave/get_my_requests_success',
  GET_MY_REQUESTS_FAILURE: 'leave/get_my_requests_failure',

  CANCEL_LEAVE_REQUEST: 'leave/cancel_leave_request',
  CANCEL_LEAVE_SUCCESS: 'leave/cancel_leave_success',
  CANCEL_LEAVE_FAILURE: 'leave/cancel_leave_failure',

  GET_COMP_OFF_REQUEST: 'leave/get_comp_off_request',
  GET_COMP_OFF_SUCCESS: 'leave/get_comp_off_success',
  GET_COMP_OFF_FAILURE: 'leave/get_comp_off_failure',
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

export type GetPendingLeaveRequestsRequestAction = {
  type: typeof LEAVE_ACTIONS.GET_PENDING_REQUESTS_REQUEST;
  payload: { pageNumber: number; pageSize: number };
};

export type GetPendingLeaveRequestsSuccessAction = {
  type: typeof LEAVE_ACTIONS.GET_PENDING_REQUESTS_SUCCESS;
  payload: LeaveRequestsPaginatedResponse;
};

export type GetPendingLeaveRequestsFailureAction = {
  type: typeof LEAVE_ACTIONS.GET_PENDING_REQUESTS_FAILURE;
  payload: string;
};

export type ReviewLeaveRequestRequestAction = {
  type: typeof LEAVE_ACTIONS.REVIEW_REQUEST_REQUEST;
  payload: { id: string; status: "APPROVED" | "REJECTED"; reviewComments?: string };
};

export type ReviewLeaveRequestSuccessAction = {
  type: typeof LEAVE_ACTIONS.REVIEW_REQUEST_SUCCESS;
};

export type ReviewLeaveRequestFailureAction = {
  type: typeof LEAVE_ACTIONS.REVIEW_REQUEST_FAILURE;
  payload: string;
};

export type GetMyLeaveRequestsRequestAction = {
  type: typeof LEAVE_ACTIONS.GET_MY_REQUESTS_REQUEST;
  payload: { pageNumber: number; pageSize: number };
};

export type GetMyLeaveRequestsSuccessAction = {
  type: typeof LEAVE_ACTIONS.GET_MY_REQUESTS_SUCCESS;
  payload: LeaveRequestsPaginatedResponse;
};

export type GetMyLeaveRequestsFailureAction = {
  type: typeof LEAVE_ACTIONS.GET_MY_REQUESTS_FAILURE;
  payload: string;
};

export type CancelLeaveRequestRequestAction = {
  type: typeof LEAVE_ACTIONS.CANCEL_LEAVE_REQUEST;
  payload: { id: string; cancelReason: string };
};

export type CancelLeaveRequestSuccessAction = {
  type: typeof LEAVE_ACTIONS.CANCEL_LEAVE_SUCCESS;
};

export type CancelLeaveRequestFailureAction = {
  type: typeof LEAVE_ACTIONS.CANCEL_LEAVE_FAILURE;
  payload: string;
};

export type GetMyCompOffBalancesRequestAction = {
  type: typeof LEAVE_ACTIONS.GET_COMP_OFF_REQUEST;
};

export type GetMyCompOffBalancesSuccessAction = {
  type: typeof LEAVE_ACTIONS.GET_COMP_OFF_SUCCESS;
  payload: CompOffRecord[];
};

export type GetMyCompOffBalancesFailureAction = {
  type: typeof LEAVE_ACTIONS.GET_COMP_OFF_FAILURE;
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
  | ApplyLeaveFailureAction
  | GetPendingLeaveRequestsRequestAction
  | GetPendingLeaveRequestsSuccessAction
  | GetPendingLeaveRequestsFailureAction
  | ReviewLeaveRequestRequestAction
  | ReviewLeaveRequestSuccessAction
  | ReviewLeaveRequestFailureAction
  | GetMyLeaveRequestsRequestAction
  | GetMyLeaveRequestsSuccessAction
  | GetMyLeaveRequestsFailureAction
  | CancelLeaveRequestRequestAction
  | CancelLeaveRequestSuccessAction
  | CancelLeaveRequestFailureAction
  | GetMyCompOffBalancesRequestAction
  | GetMyCompOffBalancesSuccessAction
  | GetMyCompOffBalancesFailureAction;
