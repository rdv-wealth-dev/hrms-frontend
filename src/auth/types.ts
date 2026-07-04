export interface SignupRequest {
  companyName: string;
  industry: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  countryCode: string;
  timezone: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  phone?: string;
  role: string;
  isSuperAdmin: boolean;
  isActive?: boolean;
  isEmailVerified?: boolean;
  branchIds: string[];
  permissions: string[];
  tenantId?: string;
}

export interface Organization {
  id: string;
  companyName: string;
  slug: string;
  subscription?: {
    plan: string;
    status: string;
    trialEndsAt: string;
    maxEmployees: number;
    maxBranches: number;
  };
  modules?: {
    attendance: boolean;
    leave: boolean;
    payroll: boolean;
    performance: boolean;
    recruitment: boolean;
    assets: boolean;
  };
}

export interface Branch {
  id: string;
  name: string;
  code: string;
}

// ===========================================
// Signup
// ===========================================

export interface SignupResponseData {
  message: string;
  organization: Organization;
}

export interface SignupResponse {
  succeeded: boolean;
  message: string;
  errors: string[];
  data: SignupResponseData | null;
}

// ===========================================
// Login
// ===========================================

export interface LoginResponseData {
  accessToken: string;
  user: User;
}

export interface LoginResponse {
  succeeded: boolean;
  message: string;
  errors: string[];
  data: LoginResponseData | null;
}

// ===========================================
// Verify Email
// ===========================================

export interface VerifyEmailRequest {
  token: string;
}

export interface VerifyEmailResponseData {
  message: string;
}

export interface VerifyEmailResponse {
  succeeded: boolean;
  message: string;
  errors: string[];
  data: VerifyEmailResponseData | null;
}

// ===========================================
// Forgot Password
// ===========================================

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponseData {
  message: string;
}

export interface ForgotPasswordResponse {
  succeeded: boolean;
  message: string;
  errors: string[];
  data: ForgotPasswordResponseData | null;
}

// ===========================================
// Reset Password
// ===========================================

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface ResetPasswordResponseData {
  message: string;
}

export interface ResetPasswordResponse {
  succeeded: boolean;
  message: string;
  errors: string[];
  data: ResetPasswordResponseData | null;
}

// ===========================================
// Department
// ===========================================

export interface Department {
  _id: string;
  name: string;
  code: string;
  description?: string;
  branchId: string;
  parentId?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDepartmentRequest {
  name: string;
  code: string;
  description?: string;
  branchId: string;
  parentId?: string;
}

export interface UpdateDepartmentRequest {
  name?: string;
  code?: string;
  description?: string;
  isActive?: boolean;
}

export interface DepartmentListResponse {
  succeeded: boolean;
  message: string | null;
  errors: string[];
  data: Department[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
  firstPage: number | null;
  lastPage: number | null;
  nextPage: number | null;
  previousPage: number | null;
}

export interface DepartmentResponse {
  succeeded: boolean;
  message: string;
  errors: string[];
  data: Department | null;
}

// ===========================================
// Designation
// ===========================================

export interface Designation {
  _id: string;
  tenantId: string;
  branchId: string;
  name: string;
  code: string;
  description?: string;
  departmentId: string;
  level: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDesignationRequest {
  name: string;
  code: string;
  description?: string;
  departmentId: string;
  branchId: string;
  level: number;
}

export interface UpdateDesignationRequest {
  name?: string;
  code?: string;
  description?: string;
  level?: number;
  isActive?: boolean;
}

export interface DesignationResponse {
  succeeded: boolean;
  message: string | null;
  errors: string[];
  data: Designation | null;
}

// ✅ New — matches actual /designations list response shape
export interface DesignationListResponse {
  succeeded: boolean;
  message: string | null;
  errors: string[];
  data: Designation[] | null;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
  firstPage: string | null;
  lastPage: string | null;
  nextPage: string | null;
  previousPage: string | null;
}

// ===========================================
// Get Current User (/auth/me)
// ===========================================

export interface MeResponseData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  phone?: string;
  role: string;
  isSuperAdmin: boolean;
  isActive?: boolean;
  isEmailVerified?: boolean;
  branchIds: string[];
  tenantId?: string;
  lastLoginAt?: string;
  createdAt?: string;
}

export interface MeResponse {
  succeeded: boolean;
  message: string;
  errors: string[];
  data: MeResponseData | null;
}

// ===========================================
// Activate Account
// ===========================================

export interface ActivateAccountRequest {
  token: string;
  password: string;
}

export interface ActivateAccountResponseData {
  accessToken: string;
  refreshToken: string;
  user: User;
  message?: string;
}

export interface ActivateAccountResponse {
  succeeded: boolean;
  message: string;
  errors: string[];
  data: ActivateAccountResponseData | null;
}