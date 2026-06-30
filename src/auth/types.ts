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
  role: string;
  isSuperAdmin: boolean;
  branchIds: string[];
  permissions: string[];
}

export interface Organization {
  id: string;
  companyName: string;
  slug: string;

  subscription: {
    plan: string;
    status: string;
    trialEndsAt: string;
    maxEmployees: number;
    maxBranches: number;
  };

  modules: {
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
  role: string;
  isSuperAdmin: boolean;
  branchIds: string[];
  permissions: string[];
}

export interface Organization {
  id: string;
  companyName: string;
  slug: string;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
}

// ✅ Matches actual /auth/register response
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

// ✅ Matches actual /auth/login response
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

// ✅ New — matches /auth/verify-email
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

// ✅ Forgot Password
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

// ✅ Reset Password
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