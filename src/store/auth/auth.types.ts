import type {
  User,
  Organization,
  SignupRequest,
  SignupResponseData,
  LoginRequest,
  ActivateAccountRequest,
  ActivateAccountResponseData,
} from "../../auth/types";

// ===========================================
// Auth State
// ===========================================

export type AuthState = {
  user: User | null;
  organization: Organization | null;

  accessToken: string | null;

  isRegisterSuccess: boolean;
  registerMessage: string | null;

  isVerifyingEmail: boolean;
  isEmailVerified: boolean;
  verifyMessage: string | null;

  // Forgot Password
  isSendingResetLink: boolean;
  isResetLinkSent: boolean;
  forgotPasswordMessage: string | null;

  // Reset Password
  isResettingPassword: boolean;
  isPasswordReset: boolean;
  resetPasswordMessage: string | null;

  // ✅ New — session rehydration on app load (via /auth/me)
  isRestoringSession: boolean;
  sessionChecked: boolean; // true once the initial restore attempt has finished (success OR failure)

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

  VERIFY_EMAIL_REQUEST: "auth/verifyEmailRequest",
  VERIFY_EMAIL_SUCCESS: "auth/verifyEmailSuccess",
  VERIFY_EMAIL_FAILURE: "auth/verifyEmailFailure",

  LOGIN_REQUEST: "auth/loginRequest",
  LOGIN_SUCCESS: "auth/loginSuccess",
  LOGIN_FAILURE: "auth/loginFailure",

  // Forgot Password
  FORGOT_PASSWORD_REQUEST: "auth/forgotPasswordRequest",
  FORGOT_PASSWORD_SUCCESS: "auth/forgotPasswordSuccess",
  FORGOT_PASSWORD_FAILURE: "auth/forgotPasswordFailure",

  // Reset Password
  RESET_PASSWORD_REQUEST: "auth/resetPasswordRequest",
  RESET_PASSWORD_SUCCESS: "auth/resetPasswordSuccess",
  RESET_PASSWORD_FAILURE: "auth/resetPasswordFailure",

  // ✅ New — Restore Session
  RESTORE_SESSION_REQUEST: "auth/restoreSessionRequest",
  RESTORE_SESSION_SUCCESS: "auth/restoreSessionSuccess",
  RESTORE_SESSION_FAILURE: "auth/restoreSessionFailure",

  ACTIVATE_ACCOUNT_REQUEST: "auth/activateAccountRequest",
  ACTIVATE_ACCOUNT_SUCCESS: "auth/activateAccountSuccess",
  ACTIVATE_ACCOUNT_FAILURE: "auth/activateAccountFailure",

  LOGOUT: "auth/logout",
} as const;

// ===========================================
// Payload Types
// ===========================================

export type RegisterRequestPayload = SignupRequest;
export type RegisterSuccessPayload = SignupResponseData;

export type LoginRequestPayload = LoginRequest;

export type LoginSuccessPayload = {
  user: User;
  accessToken: string;
};

export type VerifyEmailRequestPayload = { token: string };
export type VerifyEmailSuccessPayload = { message: string };

// Forgot Password
export type ForgotPasswordRequestPayload = { email: string };
export type ForgotPasswordSuccessPayload = { message: string };

// Reset Password
export type ResetPasswordRequestPayload = { token: string; password: string };
export type ResetPasswordSuccessPayload = { message: string };

// ✅ New — Restore Session
export type RestoreSessionSuccessPayload = User;

export type ActivateAccountRequestPayload = ActivateAccountRequest;
export type ActivateAccountSuccessPayload = ActivateAccountResponseData;

// ===========================================
// Auth Actions
// ===========================================

export type AuthAction =
  | { type: typeof AUTH_ACTIONS.REGISTER_REQUEST; payload: RegisterRequestPayload }
  | { type: typeof AUTH_ACTIONS.REGISTER_SUCCESS; payload: RegisterSuccessPayload }
  | { type: typeof AUTH_ACTIONS.REGISTER_FAILURE; payload: string }
  | { type: typeof AUTH_ACTIONS.RESET_AUTH_STATE }
  | { type: typeof AUTH_ACTIONS.VERIFY_EMAIL_REQUEST; payload: VerifyEmailRequestPayload }
  | { type: typeof AUTH_ACTIONS.VERIFY_EMAIL_SUCCESS; payload: VerifyEmailSuccessPayload }
  | { type: typeof AUTH_ACTIONS.VERIFY_EMAIL_FAILURE; payload: string }
  | { type: typeof AUTH_ACTIONS.LOGIN_REQUEST; payload: LoginRequestPayload }
  | { type: typeof AUTH_ACTIONS.LOGIN_SUCCESS; payload: LoginSuccessPayload }
  | { type: typeof AUTH_ACTIONS.LOGIN_FAILURE; payload: string }
  // Forgot Password
  | { type: typeof AUTH_ACTIONS.FORGOT_PASSWORD_REQUEST; payload: ForgotPasswordRequestPayload }
  | { type: typeof AUTH_ACTIONS.FORGOT_PASSWORD_SUCCESS; payload: ForgotPasswordSuccessPayload }
  | { type: typeof AUTH_ACTIONS.FORGOT_PASSWORD_FAILURE; payload: string }
  // Reset Password
  | { type: typeof AUTH_ACTIONS.RESET_PASSWORD_REQUEST; payload: ResetPasswordRequestPayload }
  | { type: typeof AUTH_ACTIONS.RESET_PASSWORD_SUCCESS; payload: ResetPasswordSuccessPayload }
  | { type: typeof AUTH_ACTIONS.RESET_PASSWORD_FAILURE; payload: string }
  // ✅ New — Restore Session
  | { type: typeof AUTH_ACTIONS.RESTORE_SESSION_REQUEST }
  | { type: typeof AUTH_ACTIONS.RESTORE_SESSION_SUCCESS; payload: RestoreSessionSuccessPayload }
  | { type: typeof AUTH_ACTIONS.RESTORE_SESSION_FAILURE }
  | { type: typeof AUTH_ACTIONS.ACTIVATE_ACCOUNT_REQUEST; payload: ActivateAccountRequestPayload }
  | { type: typeof AUTH_ACTIONS.ACTIVATE_ACCOUNT_SUCCESS; payload: ActivateAccountSuccessPayload }
  | { type: typeof AUTH_ACTIONS.ACTIVATE_ACCOUNT_FAILURE; payload: string }
  | { type: typeof AUTH_ACTIONS.LOGOUT };