export interface OrganizationAddress {
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  countryCode?: string;
  zip?: string;
}

export interface OrganizationBranding {
  logoUrl?: string;
  primaryColor?: string;
  website?: string;
  supportEmail?: string;
  supportPhone?: string;
}

export type SaturdayOffMode =
  | "ALL_OFF"
  | "ALL_WORKING"
  | "FIRST_OFF"
  | "SECOND_OFF"
  | "THIRD_OFF"
  | "FOURTH_OFF"
  | "FIFTH_OFF_IF_EXISTS"
  | "FIRST_AND_THIRD_OFF"
  | "SECOND_AND_FOURTH_OFF"
  | "CUSTOM";

export const SaturdayOffMode = {
  ALL_OFF: "ALL_OFF",
  ALL_WORKING: "ALL_WORKING",
  FIRST_OFF: "FIRST_OFF",
  SECOND_OFF: "SECOND_OFF",
  THIRD_OFF: "THIRD_OFF",
  FOURTH_OFF: "FOURTH_OFF",
  FIFTH_OFF_IF_EXISTS: "FIFTH_OFF_IF_EXISTS",
  FIRST_AND_THIRD_OFF: "FIRST_AND_THIRD_OFF",
  SECOND_AND_FOURTH_OFF: "SECOND_AND_FOURTH_OFF",
  CUSTOM: "CUSTOM",
} as const;

export interface SaturdayPolicy {
  mode: SaturdayOffMode;
  customOffWeeks?: number[];
}

export interface OrganizationLocale {
  currencyCode: string;
  timezone: string;
  countryCode: string;
  dateFormat: string;
  timeFormat: string;
  fiscalYearStart: string;
  weeklyOffDays: string[];
  workingHoursPerDay: number;
  saturdayPolicy?: SaturdayPolicy;
}

export interface OrganizationSubscription {
  plan: string;
  status: string;
  trialEndsAt?: string;
  renewsAt?: string;
  maxEmployees: number;
  maxBranches: number;
}

export interface OrganizationModules {
  attendance: boolean;
  leave: boolean;
  payroll: boolean;
  performance: boolean;
  recruitment: boolean;
  assets: boolean;
}

export interface OrganizationStatutory {
  pfEnabled: boolean;
  esiEnabled: boolean;
  tdsEnabled: boolean;
  ptEnabled: boolean;
  lwfEnabled: boolean;
}

export interface Organization {
  _id: string;
  companyName: string;
  slug: string;
  legalName?: string;
  cin?: string;
  gstin?: string;
  pan?: string;
  tan?: string;
  industry?: string;
  employeeStrength: number;
  phone?: string;
  address?: OrganizationAddress;
  branding?: OrganizationBranding;
  locale: OrganizationLocale;
  subscription: OrganizationSubscription;
  modules: OrganizationModules;
  statutory: OrganizationStatutory;
  isActive: boolean;
  isDeleted: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
  mandatoryDocumentTypes?: string[];
}

export interface GetOrganizationResponse {
  succeeded: boolean;
  message: string;
  errors: string[];
  data: Organization | null;
}

export interface UpdateOrganizationRequest {
  companyName?: string;
  legalName?: string;
  industry?: string;
  phone?: string;
  gstin?: string;
  pan?: string;
  cin?: string;
  tan?: string;
  address?: Partial<OrganizationAddress>;
  branding?: Partial<OrganizationBranding>;
  locale?: Partial<OrganizationLocale>;
}

export interface UpdateOrganizationResponse {
  succeeded: boolean;
  message: string;
  errors: string[];
  data: Organization | null;
}

export interface UpdateModulesRequest {
  attendance?: boolean;
  leave?: boolean;
  payroll?: boolean;
  performance?: boolean;
  recruitment?: boolean;
  assets?: boolean;
}

export interface UpdateModulesResponse {
  succeeded: boolean;
  message: string;
  errors: string[];
  data: Organization | null;
}

export interface UpdateStatutoryRequest {
  pfEnabled?: boolean;
  esiEnabled?: boolean;
  tdsEnabled?: boolean;
  ptEnabled?: boolean;
  lwfEnabled?: boolean;
}

export interface UpdateStatutoryResponse {
  succeeded: boolean;
  message: string;
  errors: string[];
  data: Organization | null;
}

// ===========================================
// Organization State
// ===========================================
export interface OrganizationState {
  organization: Organization | null;
  loading: boolean;
  submitting: boolean;
  success: boolean;
  error: string | null;
}

// ===========================================
// Action Names
// ===========================================
export const ORGANIZATION_ACTIONS = {
  LOAD_REQUEST: "organization/loadRequest",
  LOAD_SUCCESS: "organization/loadSuccess",
  LOAD_FAILURE: "organization/loadFailure",

  UPDATE_REQUEST: "organization/updateRequest",
  UPDATE_SUCCESS: "organization/updateSuccess",
  UPDATE_FAILURE: "organization/updateFailure",

  UPDATE_MODS_REQUEST: "organization/updateModsRequest",
  UPDATE_MODS_SUCCESS: "organization/updateModsSuccess",
  UPDATE_MODS_FAILURE: "organization/updateModsFailure",

  UPDATE_STATUTORY_REQUEST: "organization/updateStatutoryRequest",
  UPDATE_STATUTORY_SUCCESS: "organization/updateStatutorySuccess",
  UPDATE_STATUTORY_FAILURE: "organization/updateStatutoryFailure",

  UPDATE_MANDATORY_DOCS_REQUEST: "organization/updateMandatoryDocsRequest",
  UPDATE_MANDATORY_DOCS_SUCCESS: "organization/updateMandatoryDocsSuccess",
  UPDATE_MANDATORY_DOCS_FAILURE: "organization/updateMandatoryDocsFailure",

  RESET_STATUS: "organization/resetStatus",
} as const;

// ===========================================
// Action Types
// ===========================================
export type LoadOrganizationRequestAction = {
  type: typeof ORGANIZATION_ACTIONS.LOAD_REQUEST;
};

export type LoadOrganizationSuccessAction = {
  type: typeof ORGANIZATION_ACTIONS.LOAD_SUCCESS;
  payload: Organization;
};

export type LoadOrganizationFailureAction = {
  type: typeof ORGANIZATION_ACTIONS.LOAD_FAILURE;
  payload: string;
};

export type UpdateOrganizationRequestAction = {
  type: typeof ORGANIZATION_ACTIONS.UPDATE_REQUEST;
  payload: UpdateOrganizationRequest;
};

export type UpdateOrganizationSuccessAction = {
  type: typeof ORGANIZATION_ACTIONS.UPDATE_SUCCESS;
  payload: Organization;
};

export type UpdateOrganizationFailureAction = {
  type: typeof ORGANIZATION_ACTIONS.UPDATE_FAILURE;
  payload: string;
};

export type UpdateModulesRequestAction = {
  type: typeof ORGANIZATION_ACTIONS.UPDATE_MODS_REQUEST;
  payload: UpdateModulesRequest;
};

export type UpdateModulesSuccessAction = {
  type: typeof ORGANIZATION_ACTIONS.UPDATE_MODS_SUCCESS;
  payload: Organization;
};

export type UpdateModulesFailureAction = {
  type: typeof ORGANIZATION_ACTIONS.UPDATE_MODS_FAILURE;
  payload: string;
};

export type UpdateStatutoryRequestAction = {
  type: typeof ORGANIZATION_ACTIONS.UPDATE_STATUTORY_REQUEST;
  payload: UpdateStatutoryRequest;
};

export type UpdateStatutorySuccessAction = {
  type: typeof ORGANIZATION_ACTIONS.UPDATE_STATUTORY_SUCCESS;
  payload: Organization;
};

export type UpdateStatutoryFailureAction = {
  type: typeof ORGANIZATION_ACTIONS.UPDATE_STATUTORY_FAILURE;
  payload: string;
};

export interface UpdateMandatoryDocsRequest {
  mandatoryDocumentTypes: string[];
}

export type UpdateMandatoryDocsRequestAction = {
  type: typeof ORGANIZATION_ACTIONS.UPDATE_MANDATORY_DOCS_REQUEST;
  payload: UpdateMandatoryDocsRequest;
};

export type UpdateMandatoryDocsSuccessAction = {
  type: typeof ORGANIZATION_ACTIONS.UPDATE_MANDATORY_DOCS_SUCCESS;
  payload: Organization;
};

export type UpdateMandatoryDocsFailureAction = {
  type: typeof ORGANIZATION_ACTIONS.UPDATE_MANDATORY_DOCS_FAILURE;
  payload: string;
};

export type ResetOrganizationStatusAction = {
  type: typeof ORGANIZATION_ACTIONS.RESET_STATUS;
};

export type OrganizationAction =
  | LoadOrganizationRequestAction
  | LoadOrganizationSuccessAction
  | LoadOrganizationFailureAction
  | UpdateOrganizationRequestAction
  | UpdateOrganizationSuccessAction
  | UpdateOrganizationFailureAction
  | UpdateModulesRequestAction
  | UpdateModulesSuccessAction
  | UpdateModulesFailureAction
  | UpdateStatutoryRequestAction
  | UpdateStatutorySuccessAction
  | UpdateStatutoryFailureAction
  | UpdateMandatoryDocsRequestAction
  | UpdateMandatoryDocsSuccessAction
  | UpdateMandatoryDocsFailureAction
  | ResetOrganizationStatusAction;
