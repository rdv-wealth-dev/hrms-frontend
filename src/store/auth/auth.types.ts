import type {
  User,
  Organization,
  Branch,
  SignupRequest,
  SignupResponse,
  LoginRequest,
  LoginResponse,
} from "../../auth/types";

// ===========================================
// Auth State
// ===========================================

export type AuthState = {
  user: User | null;
  organization: Organization | null;
  branch: Branch | null;

  accessToken: string | null;
  refreshToken: string | null;

  isRegisterSuccess: boolean;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
};

// ===========================================
// Action Names
// ===========================================

export const AUTH_ACTIONS = {
  REGISTER_REQUEST: "auth/registerRequest",
  REGISTER_SUCCESS: "auth/registerSuccess",
  REGISTER_FAILURE: "auth/registerFailure",

  RESET_AUTH_STATE: "auth/resetAuthState",

  LOGIN_REQUEST: "auth/loginRequest",
  LOGIN_SUCCESS: "auth/loginSuccess",
  LOGIN_FAILURE: "auth/loginFailure",

  LOGOUT: "auth/logout",

  REFRESH_TOKEN_REQUEST: "auth/refreshTokenRequest",
  REFRESH_TOKEN_SUCCESS: "auth/refreshTokenSuccess",
  REFRESH_TOKEN_FAILURE: "auth/refreshTokenFailure",
} as const;

// ===========================================
// Payload Types
// ===========================================

export type RegisterRequestPayload = SignupRequest;

export type RegisterSuccessPayload = SignupResponse;

export type LoginRequestPayload = LoginRequest;

export type LoginSuccessPayload = LoginResponse;

// ===========================================
// Auth Actions
// ===========================================

export type AuthAction =
  | {
      type: typeof AUTH_ACTIONS.REGISTER_REQUEST;
      payload: RegisterRequestPayload;
    }
  | {
      type: typeof AUTH_ACTIONS.REGISTER_SUCCESS;
      payload: RegisterSuccessPayload;
    }
  | {
      type: typeof AUTH_ACTIONS.REGISTER_FAILURE;
      payload: string;
    }
  | {
      type: typeof AUTH_ACTIONS.RESET_AUTH_STATE;
    }
  | {
      type: typeof AUTH_ACTIONS.LOGIN_REQUEST;
      payload: LoginRequestPayload;
    }
  | {
      type: typeof AUTH_ACTIONS.LOGIN_SUCCESS;
      payload: LoginSuccessPayload;
    }
  | {
      type: typeof AUTH_ACTIONS.LOGIN_FAILURE;
      payload: string;
    }
  | {
      type: typeof AUTH_ACTIONS.LOGOUT;
    };