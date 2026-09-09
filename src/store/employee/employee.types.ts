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
  teamId?: string;
  managerId?: string;
  secondaryManagerIds?: string[];
  role?: string;
  employeeType: string;
  joiningDate: string;
  probationEndDate?: string;
  currentAddress?: Address;
  permanentAddress?: Address;
  emergencyContacts?: EmergencyContact[];
  salarySetup?: SalarySetup;
  shiftId?: string;
  bankAccount?: {
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    accountType?: "SALARY" | "SAVINGS" | "CURRENT" | string;
    accountHolderName?: string;
  };
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
  aadhaar?: string;
  countryCode?: string;
  avatarUrl?: string;
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
  selectedEmployee: EmployeeDetail | null;
  loadingDetail: boolean;
  detailError: string | null;
}

export interface PopulatedEntityRef {
  _id: string;
  name?: string;
  code?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  employeeCode?: string;
  email?: string;
  designationTitle?: string;
  startTime?: string;
  endTime?: string;
  level?: number;
  isHeadOffice?: boolean;
}

export interface EmployeeDetail {
  _id: string;
  tenantId?: string;
  branchId?: string | PopulatedEntityRef;
  departmentId?: string | PopulatedEntityRef;
  designationId?: string | PopulatedEntityRef;
  teamId?: string | PopulatedEntityRef | null;
  managerId?: string | PopulatedEntityRef | null;
  secondaryManagerIds?: Array<string | PopulatedEntityRef>;
  shiftId?: string | PopulatedEntityRef | null;
  employeeCode: string;
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
  passportNo?: string;
  drivingLicense?: string;
  voterId?: string;
  role?: string;
  isOrgAdmin?: boolean;
  employeeType: string;
  status: string;
  joiningDate: string;
  confirmationDate?: string;
  probationEndDate?: string;
  currentAddress?: Address & { _id?: string };
  permanentAddress?: Address & { _id?: string };
  emergencyContacts?: EmergencyContact[];
  avatarUrl?: string;
  pfOnActuals?: boolean;
  isActive?: boolean;
  isProfileComplete?: boolean;
  onboardingComplete?: boolean;
  onboardingStep?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetEmployeeByIdResponse {
  succeeded: boolean;
  message: string;
  errors: string[];
  data: EmployeeDetail | null;
}

export interface UpdateEmployeeRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  countryCode?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  maritalStatus?: string;
  nationality?: string;
  pan?: string;
  aadhaar?: string;
  passportNo?: string;
  drivingLicense?: string;
  voterId?: string;
  departmentId?: string;
  designationId?: string;
  branchId?: string;
  teamId?: string | null;
  managerId?: string | null;
  secondaryManagerIds?: string[];
  role?: string;
  employeeType?: string;
  confirmationDate?: string;
  probationEndDate?: string;
  currentAddress?: Address;
  permanentAddress?: Address;
  emergencyContacts?: EmergencyContact[];
  pfOnActuals?: boolean;
  avatarUrl?: string;
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

  GET_BY_ID_REQUEST: 'employee/get_by_id_request',
  GET_BY_ID_SUCCESS: 'employee/get_by_id_success',
  GET_BY_ID_FAILURE: 'employee/get_by_id_failure',
  CLEAR_SELECTED: 'employee/clear_selected',

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
  payload: {
    pageNumber: number;
    pageSize: number;
    search?: string;
    status?: string;
    joiningPeriod?: string;
    designationId?: string;
    departmentId?: string;
    branchId?: string;
  };
};

export type ListEmployeesSuccessAction = {
  type: typeof EMPLOYEE_ACTIONS.LIST_SUCCESS;
  payload: EmployeeListResponse;
};

export type ListEmployeesFailureAction = {
  type: typeof EMPLOYEE_ACTIONS.LIST_FAILURE;
  payload: string;
};

export type GetEmployeeByIdRequestAction = {
  type: typeof EMPLOYEE_ACTIONS.GET_BY_ID_REQUEST;
  payload: string;
};

export type GetEmployeeByIdSuccessAction = {
  type: typeof EMPLOYEE_ACTIONS.GET_BY_ID_SUCCESS;
  payload: EmployeeDetail;
};

export type GetEmployeeByIdFailureAction = {
  type: typeof EMPLOYEE_ACTIONS.GET_BY_ID_FAILURE;
  payload: string;
};

export type ClearSelectedEmployeeAction = {
  type: typeof EMPLOYEE_ACTIONS.CLEAR_SELECTED;
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
  | GetEmployeeByIdRequestAction
  | GetEmployeeByIdSuccessAction
  | GetEmployeeByIdFailureAction
  | ClearSelectedEmployeeAction
  | UpdateEmployeeRequestAction
  | UpdateEmployeeSuccessAction
  | UpdateEmployeeFailureAction
  | UpdateEmployeeStatusRequestAction
  | UpdateEmployeeStatusSuccessAction
  | UpdateEmployeeStatusFailureAction;

