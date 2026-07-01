import type {
  Designation,
  CreateDesignationRequest,
  UpdateDesignationRequest,
} from "../../auth/types";

// ===========================================
// Designation State
// ===========================================

export type DesignationState = {
  designations: Designation[];
  selectedDesignation: Designation | null;

  total: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;

  submitting: boolean;
  loading: boolean;
  error: string | null;
};

// ===========================================
// Action Names
// ===========================================

export const DESIGNATION_ACTIONS = {
  CREATE_REQUEST: "designation/createRequest",
  CREATE_SUCCESS: "designation/createSuccess",
  CREATE_FAILURE: "designation/createFailure",

  LIST_REQUEST: "designation/listRequest",
  LIST_SUCCESS: "designation/listSuccess",
  LIST_FAILURE: "designation/listFailure",

  GET_BY_ID_REQUEST: "designation/getByIdRequest",
  GET_BY_ID_SUCCESS: "designation/getByIdSuccess",
  GET_BY_ID_FAILURE: "designation/getByIdFailure",

  // ✅ New
  UPDATE_REQUEST: "designation/updateRequest",
  UPDATE_SUCCESS: "designation/updateSuccess",
  UPDATE_FAILURE: "designation/updateFailure",

  CLEAR_SELECTED: "designation/clearSelected",
  CLEAR_ERROR: "designation/clearError",
} as const;

// ===========================================
// Payload Types
// ===========================================

export type CreateDesignationPayload = CreateDesignationRequest;

export type ListDesignationsRequestPayload = {
  pageNumber?: number;
  pageSize?: number;
};

export type ListDesignationsSuccessPayload = {
  items: Designation[];
  total: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
};

// ✅ New
export type UpdateDesignationPayload = {
  id: string;
  data: UpdateDesignationRequest;
};

// ===========================================
// Action Types
// ===========================================

export type DesignationAction =
  | { type: typeof DESIGNATION_ACTIONS.CREATE_REQUEST; payload: CreateDesignationPayload }
  | { type: typeof DESIGNATION_ACTIONS.CREATE_SUCCESS; payload: Designation }
  | { type: typeof DESIGNATION_ACTIONS.CREATE_FAILURE; payload: string }
  | { type: typeof DESIGNATION_ACTIONS.LIST_REQUEST; payload: ListDesignationsRequestPayload }
  | { type: typeof DESIGNATION_ACTIONS.LIST_SUCCESS; payload: ListDesignationsSuccessPayload }
  | { type: typeof DESIGNATION_ACTIONS.LIST_FAILURE; payload: string }
  | { type: typeof DESIGNATION_ACTIONS.GET_BY_ID_REQUEST; payload: string }
  | { type: typeof DESIGNATION_ACTIONS.GET_BY_ID_SUCCESS; payload: Designation }
  | { type: typeof DESIGNATION_ACTIONS.GET_BY_ID_FAILURE; payload: string }
  | { type: typeof DESIGNATION_ACTIONS.UPDATE_REQUEST; payload: UpdateDesignationPayload } // ✅
  | { type: typeof DESIGNATION_ACTIONS.UPDATE_SUCCESS; payload: Designation } // ✅
  | { type: typeof DESIGNATION_ACTIONS.UPDATE_FAILURE; payload: string } // ✅
  | { type: typeof DESIGNATION_ACTIONS.CLEAR_SELECTED }
  | { type: typeof DESIGNATION_ACTIONS.CLEAR_ERROR };