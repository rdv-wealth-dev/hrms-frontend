import type { LeaveAction, LeaveState } from './leave.types'
import { LEAVE_ACTIONS } from './leave.types'

const initialState: LeaveState = {
  leaveTypes: [],
  holidays: [],
  loading: false,
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
      return {
        ...state,
        loading: true,
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

    case LEAVE_ACTIONS.LIST_FAILURE:
    case LEAVE_ACTIONS.LIST_HOLIDAYS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      }

    case LEAVE_ACTIONS.CREATE_REQUEST:
    case LEAVE_ACTIONS.CREATE_HOLIDAY_REQUEST:
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

    case LEAVE_ACTIONS.CREATE_FAILURE:
    case LEAVE_ACTIONS.CREATE_HOLIDAY_FAILURE:
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
