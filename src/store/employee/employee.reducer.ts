import type { EmployeeAction, EmployeeState } from './employee.types'
import { EMPLOYEE_ACTIONS } from './employee.types'

const initialState: EmployeeState = {
  loading: false,
  submitting: false,
  success: false,
  error: null,
  employees: [],
  total: 0,
  pageNumber: 1,
  pageSize: 10,
  totalPages: 0,
  search: "",
  status: "",
}

export function employeeReducer(
  state = initialState,
  action: EmployeeAction,
): EmployeeState {
  switch (action.type) {
    case EMPLOYEE_ACTIONS.CREATE_REQUEST:
      return {
        ...state,
        submitting: true,
        success: false,
        error: null,
      }

    case EMPLOYEE_ACTIONS.CREATE_SUCCESS:
      return {
        ...state,
        submitting: false,
        success: true,
        error: null,
      }

    case EMPLOYEE_ACTIONS.CREATE_FAILURE:
      return {
        ...state,
        submitting: false,
        success: false,
        error: action.payload,
      }

    case EMPLOYEE_ACTIONS.LIST_REQUEST:
      return {
        ...state,
        loading: true,
        pageNumber: action.payload.pageNumber,
        pageSize: action.payload.pageSize,
        search: action.payload.search,
        status: action.payload.status,
        error: null,
      }

    case EMPLOYEE_ACTIONS.LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        employees: action.payload.data ?? [],
        total: action.payload.totalRecords ?? 0,
        pageNumber: action.payload.pageNumber ?? 1,
        pageSize: action.payload.pageSize ?? 10,
        totalPages: action.payload.totalPages ?? 0,
        error: null,
      }

    case EMPLOYEE_ACTIONS.LIST_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      }

    case EMPLOYEE_ACTIONS.UPDATE_REQUEST:
      return {
        ...state,
        submitting: true,
        success: false,
        error: null,
      }

    case EMPLOYEE_ACTIONS.UPDATE_SUCCESS:
      return {
        ...state,
        submitting: false,
        success: true,
        employees: state.employees.map((emp) =>
          action.payload.data && emp._id === action.payload.data._id
            ? action.payload.data
            : emp
        ),
        error: null,
      }

    case EMPLOYEE_ACTIONS.UPDATE_FAILURE:
      return {
        ...state,
        submitting: false,
        success: false,
        error: action.payload,
      }

    case EMPLOYEE_ACTIONS.UPDATE_STATUS_REQUEST:
      return {
        ...state,
        submitting: true,
        success: false,
        error: null,
      }

    case EMPLOYEE_ACTIONS.UPDATE_STATUS_SUCCESS:
      return {
        ...state,
        submitting: false,
        success: true,
        employees: state.employees.map((emp) =>
          action.payload.data && emp._id === action.payload.data._id
            ? action.payload.data
            : emp
        ),
        error: null,
      }

    case EMPLOYEE_ACTIONS.UPDATE_STATUS_FAILURE:
      return {
        ...state,
        submitting: false,
        success: false,
        error: action.payload,
      }

    case EMPLOYEE_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      }

    case EMPLOYEE_ACTIONS.RESET:
      return initialState

    default:
      return state
  }
}
