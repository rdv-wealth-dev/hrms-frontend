import type { LeaveAction, LeaveState } from './leave.types'
import { LEAVE_ACTIONS } from './leave.types'

const initialState: LeaveState = {
  leaveTypes: [],
  holidays: [],
  balances: [],
  pendingRequests: [],
  totalPendingRecords: 0,
  myRequests: [],
  totalMyRecords: 0,
  compOffs: [],
  loading: false,
  loadingBalances: false,
  submitting: false,
  success: false,
  error: null,
}

export function leaveReducer(
  state = initialState,
  action: LeaveAction,
): LeaveState {
  switch (action.type) {
    case LEAVE_ACTIONS.RESET:
      return initialState

    case LEAVE_ACTIONS.RESET_STATUS:
      return {
        ...state,
        submitting: false,
        success: false,
        error: null,
      }

    case LEAVE_ACTIONS.LIST_REQUEST:
    case LEAVE_ACTIONS.LIST_HOLIDAYS_REQUEST:
    case LEAVE_ACTIONS.GET_PENDING_REQUESTS_REQUEST:
    case LEAVE_ACTIONS.GET_MY_REQUESTS_REQUEST:
    case LEAVE_ACTIONS.GET_COMP_OFF_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      }

    case LEAVE_ACTIONS.GET_MY_BALANCES_REQUEST:
      return {
        ...state,
        loadingBalances: true,
        error: null,
      }

    case LEAVE_ACTIONS.LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        leaveTypes: action.payload,
        error: null,
      }

    case LEAVE_ACTIONS.LIST_HOLIDAYS_SUCCESS:
      return {
        ...state,
        loading: false,
        holidays: action.payload,
        error: null,
      }

    case LEAVE_ACTIONS.GET_MY_BALANCES_SUCCESS:
      return {
        ...state,
        loadingBalances: false,
        balances: action.payload,
        error: null,
      }

    case LEAVE_ACTIONS.GET_PENDING_REQUESTS_SUCCESS:
      return {
        ...state,
        loading: false,
        pendingRequests: action.payload.data,
        totalPendingRecords: action.payload.totalRecords,
        error: null,
      }

    case LEAVE_ACTIONS.GET_MY_REQUESTS_SUCCESS:
      return {
        ...state,
        loading: false,
        myRequests: action.payload.data,
        totalMyRecords: action.payload.totalRecords,
        error: null,
      }

    case LEAVE_ACTIONS.GET_COMP_OFF_SUCCESS:
      return {
        ...state,
        loading: false,
        compOffs: action.payload,
        error: null,
      }

    case LEAVE_ACTIONS.LIST_FAILURE:
    case LEAVE_ACTIONS.LIST_HOLIDAYS_FAILURE:
    case LEAVE_ACTIONS.GET_PENDING_REQUESTS_FAILURE:
    case LEAVE_ACTIONS.GET_MY_REQUESTS_FAILURE:
    case LEAVE_ACTIONS.GET_COMP_OFF_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      }

    case LEAVE_ACTIONS.GET_MY_BALANCES_FAILURE:
      return {
        ...state,
        loadingBalances: false,
        error: action.payload,
      }

    case LEAVE_ACTIONS.CREATE_REQUEST:
    case LEAVE_ACTIONS.CREATE_HOLIDAY_REQUEST:
    case LEAVE_ACTIONS.UPDATE_HOLIDAY_REQUEST:
    case LEAVE_ACTIONS.DELETE_HOLIDAY_REQUEST:
    case LEAVE_ACTIONS.SEED_DEFAULT_HOLIDAYS_REQUEST:
    case LEAVE_ACTIONS.APPLY_LEAVE_REQUEST:
    case LEAVE_ACTIONS.REVIEW_REQUEST_REQUEST:
    case LEAVE_ACTIONS.CANCEL_LEAVE_REQUEST:
      return {
        ...state,
        submitting: true,
        success: false,
        error: null,
      }

    case LEAVE_ACTIONS.CREATE_SUCCESS:
      return {
        ...state,
        submitting: false,
        success: true,
        leaveTypes: [...state.leaveTypes, action.payload],
        error: null,
      }

    case LEAVE_ACTIONS.CREATE_HOLIDAY_SUCCESS:
      return {
        ...state,
        submitting: false,
        success: true,
        holidays: [...state.holidays, action.payload],
        error: null,
      }

    case LEAVE_ACTIONS.UPDATE_HOLIDAY_SUCCESS:
      return {
        ...state,
        submitting: false,
        success: true,
        holidays: state.holidays.map((h) =>
          h._id === action.payload._id ? action.payload : h
        ),
        error: null,
      }

    case LEAVE_ACTIONS.DELETE_HOLIDAY_SUCCESS:
      return {
        ...state,
        submitting: false,
        success: true,
        holidays: state.holidays.filter((h) => h._id !== action.payload),
        error: null,
      }

    case LEAVE_ACTIONS.SEED_DEFAULT_HOLIDAYS_SUCCESS:
      return {
        ...state,
        submitting: false,
        success: true,
        holidays: action.payload && Array.isArray(action.payload) && action.payload.length > 0
          ? [...action.payload]
          : state.holidays,
        error: null,
      }

    case LEAVE_ACTIONS.APPLY_LEAVE_SUCCESS:
    case LEAVE_ACTIONS.REVIEW_REQUEST_SUCCESS:
    case LEAVE_ACTIONS.CANCEL_LEAVE_SUCCESS:
      return {
        ...state,
        submitting: false,
        success: true,
        error: null,
      }

    case LEAVE_ACTIONS.CREATE_FAILURE:
    case LEAVE_ACTIONS.CREATE_HOLIDAY_FAILURE:
    case LEAVE_ACTIONS.UPDATE_HOLIDAY_FAILURE:
    case LEAVE_ACTIONS.DELETE_HOLIDAY_FAILURE:
    case LEAVE_ACTIONS.SEED_DEFAULT_HOLIDAYS_FAILURE:
    case LEAVE_ACTIONS.APPLY_LEAVE_FAILURE:
    case LEAVE_ACTIONS.REVIEW_REQUEST_FAILURE:
    case LEAVE_ACTIONS.CANCEL_LEAVE_FAILURE:
      return {
        ...state,
        submitting: false,
        success: false,
        error: action.payload,
      }

    default:
      return state
  }
}
