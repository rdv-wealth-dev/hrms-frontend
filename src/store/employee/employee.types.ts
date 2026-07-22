export interface Address {
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  countryCode?: string;
  zip?: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface SalaryComponent {
  componentCode: string;
  amount: number;
  isPartOfWages: boolean;
}

export interface SalaryStructure {
  type: "CTC" | "HOURLY_RATE" | "FIXED_MONTHLY" | "STIPEND" | "UNPAID";
  amount?: number;
  currency?: string;
  hourlyRate?: number;
  workingHoursPerWeek?: number;
  workingDaysPerMonth?: number;
  frequency?: "MONTHLY" | "WEEKLY" | "ONE_TIME";
  description?: string;
  components?: SalaryComponent[];
}

export interface Benefits {
  hasHealthInsurance?: boolean;
  hasRetirementPlan?: boolean;
  hasLeaveEncashment?: boolean;
  leaveEncashmentRate?: number;
}

export interface SalarySetup {
  employeePayType: string;
  structure: SalaryStructure;
  effectiveFrom?: string;
  benefits?: Benefits;
}

export interface CreateEmployeeRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  countryCode?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  maritalStatus?: string;
  nationality?: string;
  pan?: string;
  aadhaar?: string;
  branchId: string;
  departmentId: string;
  designationId: string;
  managerId?: string;
  employeeType: string;
  joiningDate: string;
  probationEndDate?: string;
  currentAddress?: Address;
  permanentAddress?: Address;
  emergencyContacts?: EmergencyContact[];
  salarySetup?: SalarySetup;
  shiftId?: string;
}

export interface EmployeeResponseData {
  employee: {
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    email: string;
    status: string;
    joiningDate: string;
  };
  userAccount: {
    id: string;
    email: string;
    role: string;
    isActive: boolean;
    message: string;
  };
}

export interface CreateEmployeeResponse {
  succeeded: boolean;
  message: string;
  errors: string[];
  data: EmployeeResponseData | null;
}

export interface EmployeeListItem {
  _id: string;
  tenantId: string;
  branchId: string;
  createdBy: string;
  updatedBy: string;
  isDeleted: boolean;
  version: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  maritalStatus: string;
  nationality: string;
  pan: string;
  departmentId: string;
  designationId: string;
  managerId: string | null;
  employeeType: string;
  status: string;
  joiningDate: string;
  currentAddress: Address & { _id?: string };
  emergencyContacts: EmergencyContact[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  confirmationDate?: string;
  shiftId?: string | null;
}

export interface EmployeeListResponse {
  succeeded: boolean;
  message: string | null;
  errors: string[];
  data: EmployeeListItem[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
}

export type EmployeeState = {
  loading: boolean;
  submitting: boolean;
  success: boolean;
  error: string | null;
  employees: EmployeeListItem[];
  total: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  search?: string;
  status?: string;
  joiningPeriod?: string;
}

export interface UpdateEmployeeRequest {
  maritalStatus?: string;
  confirmationDate?: string;
  departmentId?: string;
  designationId?: string;
  currentAddress?: {
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    countryCode?: string;
    zip?: string;
  };
}

export interface UpdateEmployeeResponse {
  succeeded: boolean;
  message: string;
  errors: string[];
  data: EmployeeListItem | null;
}

export const EMPLOYEE_ACTIONS = {
  RESET: 'employee/reset',
  CREATE_REQUEST: 'employee/create_request',
  CREATE_SUCCESS: 'employee/create_success',
  CREATE_FAILURE: 'employee/create_failure',
  CLEAR_ERROR: 'employee/clear_error',

  LIST_REQUEST: 'employee/list_request',
  LIST_SUCCESS: 'employee/list_success',
  LIST_FAILURE: 'employee/list_failure',

  UPDATE_REQUEST: 'employee/update_request',
  UPDATE_SUCCESS: 'employee/update_success',
  UPDATE_FAILURE: 'employee/update_failure',

  UPDATE_STATUS_REQUEST: 'employee/update_status_request',
  UPDATE_STATUS_SUCCESS: 'employee/update_status_success',
  UPDATE_STATUS_FAILURE: 'employee/update_status_failure',
} as const;

export type CreateEmployeeRequestAction = {
  type: typeof EMPLOYEE_ACTIONS.CREATE_REQUEST;
  payload: CreateEmployeeRequest;
};

export type CreateEmployeeSuccessAction = {
  type: typeof EMPLOYEE_ACTIONS.CREATE_SUCCESS;
  payload: CreateEmployeeResponse;
};

export type CreateEmployeeFailureAction = {
  type: typeof EMPLOYEE_ACTIONS.CREATE_FAILURE;
  payload: string;
};

export type ClearEmployeeErrorAction = {
  type: typeof EMPLOYEE_ACTIONS.CLEAR_ERROR;
};

export type ListEmployeesRequestAction = {
  type: typeof EMPLOYEE_ACTIONS.LIST_REQUEST;
  payload: { pageNumber: number; pageSize: number; search?: string; status?: string; joiningPeriod?: string };
};

export type ListEmployeesSuccessAction = {
  type: typeof EMPLOYEE_ACTIONS.LIST_SUCCESS;
  payload: EmployeeListResponse;
};

export type ListEmployeesFailureAction = {
  type: typeof EMPLOYEE_ACTIONS.LIST_FAILURE;
  payload: string;
};

export type UpdateEmployeeRequestAction = {
  type: typeof EMPLOYEE_ACTIONS.UPDATE_REQUEST;
  payload: { id: string; data: UpdateEmployeeRequest };
};

export type UpdateEmployeeSuccessAction = {
  type: typeof EMPLOYEE_ACTIONS.UPDATE_SUCCESS;
  payload: UpdateEmployeeResponse;
};

export type UpdateEmployeeFailureAction = {
  type: typeof EMPLOYEE_ACTIONS.UPDATE_FAILURE;
  payload: string;
};

export type UpdateEmployeeStatusRequestAction = {
  type: typeof EMPLOYEE_ACTIONS.UPDATE_STATUS_REQUEST;
  payload: { id: string; status: string };
};

export type UpdateEmployeeStatusSuccessAction = {
  type: typeof EMPLOYEE_ACTIONS.UPDATE_STATUS_SUCCESS;
  payload: UpdateEmployeeResponse;
};

export type UpdateEmployeeStatusFailureAction = {
  type: typeof EMPLOYEE_ACTIONS.UPDATE_STATUS_FAILURE;
  payload: string;
};

export type EmployeeAction =
  | { type: typeof EMPLOYEE_ACTIONS.RESET }
  | CreateEmployeeRequestAction
  | CreateEmployeeSuccessAction
  | CreateEmployeeFailureAction
  | ClearEmployeeErrorAction
  | ListEmployeesRequestAction
  | ListEmployeesSuccessAction
  | ListEmployeesFailureAction
  | UpdateEmployeeRequestAction
  | UpdateEmployeeSuccessAction
  | UpdateEmployeeFailureAction
  | UpdateEmployeeStatusRequestAction
  | UpdateEmployeeStatusSuccessAction
  | UpdateEmployeeStatusFailureAction;
