import type {
  EmployeeAction,
  EmployeeDetail,
  CreateEmployeeRequest,
  CreateEmployeeResponse,
  EmployeeListResponse,
  UpdateEmployeeRequest,
  UpdateEmployeeResponse,
} from './employee.types'
import { EMPLOYEE_ACTIONS } from './employee.types'

export const resetEmployeeState = (): EmployeeAction => ({
  type: EMPLOYEE_ACTIONS.RESET,
})

export const createEmployeeRequest = (
  payload: CreateEmployeeRequest
): EmployeeAction => ({
  type: EMPLOYEE_ACTIONS.CREATE_REQUEST,
  payload,
})

export const createEmployeeSuccess = (
  payload: CreateEmployeeResponse
): EmployeeAction => ({
  type: EMPLOYEE_ACTIONS.CREATE_SUCCESS,
  payload,
})

export const createEmployeeFailure = (
  payload: string
): EmployeeAction => ({
  type: EMPLOYEE_ACTIONS.CREATE_FAILURE,
  payload,
})

export const clearEmployeeError = (): EmployeeAction => ({
  type: EMPLOYEE_ACTIONS.CLEAR_ERROR,
})

export const listEmployeesRequest = (
  payload: {
    pageNumber: number;
    pageSize: number;
    search?: string;
    status?: string;
    joiningPeriod?: string;
    branchId?: string;
    departmentId?: string;
    designationId?: string;
  }
): EmployeeAction => ({
  type: EMPLOYEE_ACTIONS.LIST_REQUEST,
  payload,
})

export const listEmployeesSuccess = (
  payload: EmployeeListResponse
): EmployeeAction => ({
  type: EMPLOYEE_ACTIONS.LIST_SUCCESS,
  payload,
})

export const listEmployeesFailure = (
  payload: string
): EmployeeAction => ({
  type: EMPLOYEE_ACTIONS.LIST_FAILURE,
  payload,
})

export const getEmployeeByIdRequest = (
  id: string
): EmployeeAction => ({
  type: EMPLOYEE_ACTIONS.GET_BY_ID_REQUEST,
  payload: id,
})

export const getEmployeeByIdSuccess = (
  payload: EmployeeDetail
): EmployeeAction => ({
  type: EMPLOYEE_ACTIONS.GET_BY_ID_SUCCESS,
  payload,
})

export const getEmployeeByIdFailure = (
  payload: string
): EmployeeAction => ({
  type: EMPLOYEE_ACTIONS.GET_BY_ID_FAILURE,
  payload,
})

export const clearSelectedEmployee = (): EmployeeAction => ({
  type: EMPLOYEE_ACTIONS.CLEAR_SELECTED,
})

export const updateEmployeeRequest = (
  id: string,
  data: UpdateEmployeeRequest
): EmployeeAction => ({
  type: EMPLOYEE_ACTIONS.UPDATE_REQUEST,
  payload: { id, data },
})

export const updateEmployeeSuccess = (
  payload: UpdateEmployeeResponse
): EmployeeAction => ({
  type: EMPLOYEE_ACTIONS.UPDATE_SUCCESS,
  payload,
})

export const updateEmployeeFailure = (
  payload: string
): EmployeeAction => ({
  type: EMPLOYEE_ACTIONS.UPDATE_FAILURE,
  payload,
})

export const updateEmployeeStatusRequest = (
  id: string,
  status: string
): EmployeeAction => ({
  type: EMPLOYEE_ACTIONS.UPDATE_STATUS_REQUEST,
  payload: { id, status },
})

export const updateEmployeeStatusSuccess = (
  payload: UpdateEmployeeResponse
): EmployeeAction => ({
  type: EMPLOYEE_ACTIONS.UPDATE_STATUS_SUCCESS,
  payload,
})

export const updateEmployeeStatusFailure = (
  payload: string
): EmployeeAction => ({
  type: EMPLOYEE_ACTIONS.UPDATE_STATUS_FAILURE,
  payload,
})
