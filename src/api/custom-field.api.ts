import axiosInstance from "./axios";

export type FieldType =
  | "TEXT"
  | "NUMBER"
  | "DATE"
  | "SELECT"
  | "MULTI_SELECT"
  | "BOOLEAN";

export type UIComponentType =
  | "DROPDOWN"
  | "RADIO_GROUP"
  | "PILL_SELECT"
  | "TEXT_INPUT"
  | "SWITCH";

export type FieldScope = "ORGANIZATION" | "DEPARTMENT" | "BRANCH" | "GLOBAL";

export interface CustomFieldOption {
  label: string;
  value: string;
  description?: string;
  color?: string;
}

export interface CustomFieldDefinition {
  _id: string;
  fieldLabel: string;
  fieldKey: string;
  fieldType: FieldType;
  uiComponent?: UIComponentType;
  scope?: FieldScope;
  wizardStep?: number;
  section?: string;
  defaultValue?: any;
  isRequired: boolean;
  options?: CustomFieldOption[];
  placeholder?: string | null;
  helperText?: string | null;
  showInOnboarding?: boolean;
  showInBulkImport?: boolean;
  order?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCustomFieldPayload {
  fieldLabel: string;
  fieldType: FieldType;
  uiComponent?: UIComponentType;
  scope?: FieldScope;
  wizardStep?: number;
  section?: string;
  defaultValue?: any;
  isRequired?: boolean;
  options?: CustomFieldOption[];
  placeholder?: string | null;
  helperText?: string | null;
  showInOnboarding?: boolean;
  showInBulkImport?: boolean;
  order?: number;
}

export interface CustomFieldResponse {
  succeeded: boolean;
  message?: string;
  data: CustomFieldDefinition;
}

export interface CustomFieldListResponse {
  succeeded: boolean;
  message?: string;
  data: CustomFieldDefinition[];
}

export interface ReorderCustomFieldsPayload {
  items: Array<{ id: string; order: number }>;
}

export interface BaseApiResponse {
  succeeded: boolean;
  message?: string;
  data?: any;
}

// ── API 1: Create Custom Field ───────────────────────────────
export const createCustomField = async (
  payload: CreateCustomFieldPayload
): Promise<CustomFieldResponse> => {
  const response = await axiosInstance.post<CustomFieldResponse>(
    "/custom-fields",
    payload
  );
  return response.data;
};

// ── API 2: List Scoped Custom Fields ─────────────────────────
export const getCustomFields = async (
  scope: FieldScope = "ORGANIZATION"
): Promise<CustomFieldListResponse> => {
  const response = await axiosInstance.get<CustomFieldListResponse>(
    `/custom-fields?scope=${encodeURIComponent(scope)}`
  );
  return response.data;
};

// ── API 3: Reorder Custom Fields Sequence ────────────────────
export const reorderCustomFields = async (
  payload: ReorderCustomFieldsPayload
): Promise<BaseApiResponse> => {
  const response = await axiosInstance.post<BaseApiResponse>(
    "/custom-fields/reorder",
    payload
  );
  return response.data;
};

// ── API 4: Remove / Delete Custom Field ──────────────────────
export const deleteCustomField = async (
  id: string,
  purgeValues: boolean = false
): Promise<BaseApiResponse> => {
  const response = await axiosInstance.delete<BaseApiResponse>(
    `/custom-fields/${id}?purgeValues=${purgeValues}`
  );
  return response.data;
};
