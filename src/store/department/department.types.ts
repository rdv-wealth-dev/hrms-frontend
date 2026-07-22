import type {
  Department,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
} from "../../auth/types";

// ===========================================
// Department State
// ===========================================

export type DepartmentState = {
  departments: Department[];
  selectedDepartment: Department | null;

  total: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;

  loading: boolean;
  submitting: boolean;
  error: string | null;
};

// ===========================================
// Action Names
// ===========================================

export const DEPARTMENT_ACTIONS = {
  LIST_REQUEST: "department/listRequest",
  LIST_SUCCESS: "department/listSuccess",
  LIST_FAILURE: "department/listFailure",

  GET_BY_ID_REQUEST: "department/getByIdRequest",
  GET_BY_ID_SUCCESS: "department/getByIdSuccess",
  GET_BY_ID_FAILURE: "department/getByIdFailure",

  CREATE_REQUEST: "department/createRequest",
  CREATE_SUCCESS: "department/createSuccess",
  CREATE_FAILURE: "department/createFailure",

  UPDATE_REQUEST: "department/updateRequest",
  UPDATE_SUCCESS: "department/updateSuccess",
  UPDATE_FAILURE: "department/updateFailure",

  CLEAR_SELECTED: "department/clearSelected",
  CLEAR_ERROR: "department/clearError",
} as const;

// ===========================================
// Payload Types
// ===========================================

export type ListDepartmentsSuccessPayload = {
  items: Department[];
  total: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
};

export type CreateDepartmentPayload = CreateDepartmentRequest;
export type UpdateDepartmentPayload = {
  id: string;
  data: UpdateDepartmentRequest;
};

// ===========================================
// Action Types
// ===========================================

export type DepartmentAction =
  | { type: typeof DEPARTMENT_ACTIONS.LIST_REQUEST }
  | { type: typeof DEPARTMENT_ACTIONS.LIST_SUCCESS; payload: ListDepartmentsSuccessPayload }
  | { type: typeof DEPARTMENT_ACTIONS.LIST_FAILURE; payload: string }
  | { type: typeof DEPARTMENT_ACTIONS.GET_BY_ID_REQUEST; payload: string }
  | { type: typeof DEPARTMENT_ACTIONS.GET_BY_ID_SUCCESS; payload: Department }
  | { type: typeof DEPARTMENT_ACTIONS.GET_BY_ID_FAILURE; payload: string }
  | { type: typeof DEPARTMENT_ACTIONS.CREATE_REQUEST; payload: CreateDepartmentPayload }
  | { type: typeof DEPARTMENT_ACTIONS.CREATE_SUCCESS; payload: Department }
  | { type: typeof DEPARTMENT_ACTIONS.CREATE_FAILURE; payload: string }
  | { type: typeof DEPARTMENT_ACTIONS.UPDATE_REQUEST; payload: UpdateDepartmentPayload }
  | { type: typeof DEPARTMENT_ACTIONS.UPDATE_SUCCESS; payload: Department }
  | { type: typeof DEPARTMENT_ACTIONS.UPDATE_FAILURE; payload: string }
  | { type: typeof DEPARTMENT_ACTIONS.CLEAR_SELECTED }
  | { type: typeof DEPARTMENT_ACTIONS.CLEAR_ERROR };