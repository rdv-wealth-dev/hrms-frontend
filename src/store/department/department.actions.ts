import type {
  DepartmentAction,
  CreateDepartmentPayload,
  UpdateDepartmentPayload,
  ListDepartmentsSuccessPayload,
} from "./department.types";

import { DEPARTMENT_ACTIONS } from "./department.types";
import type { Department } from "../../auth/types";

export const listDepartmentsRequest = (): DepartmentAction => ({
  type: DEPARTMENT_ACTIONS.LIST_REQUEST,
});

export const listDepartmentsSuccess = (
  payload: ListDepartmentsSuccessPayload
): DepartmentAction => ({
  type: DEPARTMENT_ACTIONS.LIST_SUCCESS,
  payload,
});

export const listDepartmentsFailure = (payload: string): DepartmentAction => ({
  type: DEPARTMENT_ACTIONS.LIST_FAILURE,
  payload,
});

export const getDepartmentByIdRequest = (id: string): DepartmentAction => ({
  type: DEPARTMENT_ACTIONS.GET_BY_ID_REQUEST,
  payload: id,
});

export const getDepartmentByIdSuccess = (
  payload: Department
): DepartmentAction => ({
  type: DEPARTMENT_ACTIONS.GET_BY_ID_SUCCESS,
  payload,
});

export const getDepartmentByIdFailure = (payload: string): DepartmentAction => ({
  type: DEPARTMENT_ACTIONS.GET_BY_ID_FAILURE,
  payload,
});

export const createDepartmentRequest = (
  payload: CreateDepartmentPayload
): DepartmentAction => ({
  type: DEPARTMENT_ACTIONS.CREATE_REQUEST,
  payload,
});

export const createDepartmentSuccess = (
  payload: Department
): DepartmentAction => ({
  type: DEPARTMENT_ACTIONS.CREATE_SUCCESS,
  payload,
});

export const createDepartmentFailure = (payload: string): DepartmentAction => ({
  type: DEPARTMENT_ACTIONS.CREATE_FAILURE,
  payload,
});

export const updateDepartmentRequest = (
  payload: UpdateDepartmentPayload
): DepartmentAction => ({
  type: DEPARTMENT_ACTIONS.UPDATE_REQUEST,
  payload,
});

export const updateDepartmentSuccess = (
  payload: Department
): DepartmentAction => ({
  type: DEPARTMENT_ACTIONS.UPDATE_SUCCESS,
  payload,
});

export const updateDepartmentFailure = (payload: string): DepartmentAction => ({
  type: DEPARTMENT_ACTIONS.UPDATE_FAILURE,
  payload,
});

export const clearSelectedDepartment = (): DepartmentAction => ({
  type: DEPARTMENT_ACTIONS.CLEAR_SELECTED,
});

export const clearDepartmentError = (): DepartmentAction => ({
  type: DEPARTMENT_ACTIONS.CLEAR_ERROR,
});