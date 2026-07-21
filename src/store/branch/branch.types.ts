import type { SaturdayPolicy } from "../organization/organization.types";

export interface BranchAddress {
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  countryCode: string;
  zip?: string;
}

export interface BranchContact {
  phone?: string;
  email?: string;
}

export interface BranchGeo {
  lat?: number;
  lng?: number;
  geofenceRadiusMeters?: number;
  geofenceEnabled?: boolean;
}

export interface BranchWorkPolicy {
  timezone?: string;
  weeklyOffDays?: string[];
  shiftStartTime?: string;
  shiftEndTime?: string;
  workingHoursPerDay?: number;
  saturdayPolicy?: SaturdayPolicy;
}

export interface BranchStatutory {
  pfApplicable?: boolean | null;
  esiApplicable?: boolean | null;
  ptApplicable?: boolean | null;
  ptStateCode?: string | null;
}

export interface Branch {
  _id: string;
  tenantId: string;
  branchId?: string;
  isDeleted: boolean;
  version: number;
  name: string;
  code: string;
  isHeadOffice: boolean;
  isActive: boolean;
  parentBranchId?: string | null;
  address?: BranchAddress;
  contact?: BranchContact;
  geo?: BranchGeo;
  workPolicy?: BranchWorkPolicy;
  statutory?: BranchStatutory;
  createdAt: string;
  updatedAt: string;
}

export interface BranchListResponse {
  succeeded: boolean;
  message: string | null;
  errors: string[];
  data: Branch[];
}

export interface CreateBranchRequest {
  name: string;
  code: string;
  address?: BranchAddress;
  contact?: BranchContact;
  geo?: BranchGeo;
  workPolicy?: BranchWorkPolicy;
  statutory?: BranchStatutory;
}

export interface CreateBranchResponse {
  succeeded: boolean;
  message: string;
  errors: string[];
  data: Branch | null;
}

export interface UpdateBranchRequest {
  name?: string;
  code?: string;
  address?: Partial<BranchAddress>;
  contact?: Partial<BranchContact>;
  geo?: BranchGeo;
  workPolicy?: Partial<BranchWorkPolicy>;
  statutory?: Partial<BranchStatutory>;
}

export interface UpdateBranchResponse {
  succeeded: boolean;
  message: string;
  errors: string[];
  data: Branch | null;
}

export interface GetHeadOfficeResponse {
  succeeded: boolean;
  message: string;
  errors: string[];
  data: Branch | null;
}

export interface DeleteBranchResponse {
  succeeded: boolean;
  message: string;
  errors: string[];
  data: {
    message: string;
  } | null;
}

// ===========================================
// Branch State
// ===========================================
export type BranchState = {
  branches: Branch[];
  headOffice: Branch | null;
  loading: boolean;
  loadingHeadOffice: boolean;
  submitting: boolean;
  success: boolean;
  error: string | null;
};

// ===========================================
// Action Names
// ===========================================
export const BRANCH_ACTIONS = {
  LIST_REQUEST: "branch/listRequest",
  LIST_SUCCESS: "branch/listSuccess",
  LIST_FAILURE: "branch/listFailure",

  CREATE_REQUEST: "branch/createRequest",
  CREATE_SUCCESS: "branch/createSuccess",
  CREATE_FAILURE: "branch/createFailure",
  RESET_STATUS: "branch/resetStatus",

  UPDATE_REQUEST: "branch/updateRequest",
  UPDATE_SUCCESS: "branch/updateSuccess",
  UPDATE_FAILURE: "branch/updateFailure",

  DELETE_REQUEST: "branch/deleteRequest",
  DELETE_SUCCESS: "branch/deleteSuccess",
  DELETE_FAILURE: "branch/deleteFailure",

  HEAD_OFFICE_REQUEST: "branch/headOfficeRequest",
  HEAD_OFFICE_SUCCESS: "branch/headOfficeSuccess",
  HEAD_OFFICE_FAILURE: "branch/headOfficeFailure",
} as const;

// ===========================================
// Action Types
// ===========================================
export type ListBranchesRequestAction = {
  type: typeof BRANCH_ACTIONS.LIST_REQUEST;
};

export type ListBranchesSuccessAction = {
  type: typeof BRANCH_ACTIONS.LIST_SUCCESS;
  payload: Branch[];
};

export type ListBranchesFailureAction = {
  type: typeof BRANCH_ACTIONS.LIST_FAILURE;
  payload: string;
};

export type CreateBranchRequestAction = {
  type: typeof BRANCH_ACTIONS.CREATE_REQUEST;
  payload: CreateBranchRequest;
};

export type CreateBranchSuccessAction = {
  type: typeof BRANCH_ACTIONS.CREATE_SUCCESS;
  payload: Branch;
};

export type CreateBranchFailureAction = {
  type: typeof BRANCH_ACTIONS.CREATE_FAILURE;
  payload: string;
};

export type ResetBranchStatusAction = {
  type: typeof BRANCH_ACTIONS.RESET_STATUS;
};

export type GetHeadOfficeRequestAction = {
  type: typeof BRANCH_ACTIONS.HEAD_OFFICE_REQUEST;
};

export type GetHeadOfficeSuccessAction = {
  type: typeof BRANCH_ACTIONS.HEAD_OFFICE_SUCCESS;
  payload: Branch;
};

export type GetHeadOfficeFailureAction = {
  type: typeof BRANCH_ACTIONS.HEAD_OFFICE_FAILURE;
  payload: string;
};

export type UpdateBranchRequestAction = {
  type: typeof BRANCH_ACTIONS.UPDATE_REQUEST;
  payload: { id: string; data: UpdateBranchRequest };
};

export type UpdateBranchSuccessAction = {
  type: typeof BRANCH_ACTIONS.UPDATE_SUCCESS;
  payload: Branch;
};

export type UpdateBranchFailureAction = {
  type: typeof BRANCH_ACTIONS.UPDATE_FAILURE;
  payload: string;
};

export type DeleteBranchRequestAction = {
  type: typeof BRANCH_ACTIONS.DELETE_REQUEST;
  payload: string;
};

export type DeleteBranchSuccessAction = {
  type: typeof BRANCH_ACTIONS.DELETE_SUCCESS;
  payload: string;
};

export type DeleteBranchFailureAction = {
  type: typeof BRANCH_ACTIONS.DELETE_FAILURE;
  payload: string;
};

export type BranchAction =
  | ListBranchesRequestAction
  | ListBranchesSuccessAction
  | ListBranchesFailureAction
  | CreateBranchRequestAction
  | CreateBranchSuccessAction
  | CreateBranchFailureAction
  | ResetBranchStatusAction
  | UpdateBranchRequestAction
  | UpdateBranchSuccessAction
  | UpdateBranchFailureAction
  | DeleteBranchRequestAction
  | DeleteBranchSuccessAction
  | DeleteBranchFailureAction
  | GetHeadOfficeRequestAction
  | GetHeadOfficeSuccessAction
  | GetHeadOfficeFailureAction;
