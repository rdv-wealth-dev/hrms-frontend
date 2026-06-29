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

export interface SignupResponseData {
  accessToken: string;
  refreshToken: string;
  user: User;
  organization: Organization;
  branch: Branch;
}

export interface SignupResponse {
  succeeded: boolean;
  message: string;
  errors: string[];
  data: SignupResponseData | null;
}