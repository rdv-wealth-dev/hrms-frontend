import type {
  AuthAction,
  LoginRequestPayload,
  LoginSuccessPayload,
  RegisterRequestPayload,
  RegisterSuccessPayload,
  VerifyEmailRequestPayload,
  VerifyEmailSuccessPayload,
  ForgotPasswordRequestPayload,
  ForgotPasswordSuccessPayload,
  ResetPasswordRequestPayload,
  ResetPasswordSuccessPayload,
  RestoreSessionSuccessPayload,
} from "./auth.types";

import { AUTH_ACTIONS } from "./auth.types";

// ===========================================
// Register
// ===========================================

export const registerRequest = (payload: RegisterRequestPayload): AuthAction => ({
  type: AUTH_ACTIONS.REGISTER_REQUEST,
  payload,
});

export const registerSuccess = (payload: RegisterSuccessPayload): AuthAction => ({
  type: AUTH_ACTIONS.REGISTER_SUCCESS,
  payload,
});

export const registerFailure = (payload: string): AuthAction => ({
  type: AUTH_ACTIONS.REGISTER_FAILURE,
  payload,
});

export const resetAuthState = (): AuthAction => ({
  type: AUTH_ACTIONS.RESET_AUTH_STATE,
});

// ===========================================
// Verify Email
// ===========================================

export const verifyEmailRequest = (payload: VerifyEmailRequestPayload): AuthAction => ({
  type: AUTH_ACTIONS.VERIFY_EMAIL_REQUEST,
  payload,
});

export const verifyEmailSuccess = (payload: VerifyEmailSuccessPayload): AuthAction => ({
  type: AUTH_ACTIONS.VERIFY_EMAIL_SUCCESS,
  payload,
});

export const verifyEmailFailure = (payload: string): AuthAction => ({
  type: AUTH_ACTIONS.VERIFY_EMAIL_FAILURE,
  payload,
});

// ===========================================
// Login
// ===========================================

export const loginRequest = (payload: LoginRequestPayload): AuthAction => ({
  type: AUTH_ACTIONS.LOGIN_REQUEST,
  payload,
});

export const loginSuccess = (payload: LoginSuccessPayload): AuthAction => ({
  type: AUTH_ACTIONS.LOGIN_SUCCESS,
  payload,
});

export const loginFailure = (payload: string): AuthAction => ({
  type: AUTH_ACTIONS.LOGIN_FAILURE,
  payload,
});

// ===========================================
// Forgot Password
// ===========================================

export const forgotPasswordRequest = (payload: ForgotPasswordRequestPayload): AuthAction => ({
  type: AUTH_ACTIONS.FORGOT_PASSWORD_REQUEST,
  payload,
});

export const forgotPasswordSuccess = (payload: ForgotPasswordSuccessPayload): AuthAction => ({
  type: AUTH_ACTIONS.FORGOT_PASSWORD_SUCCESS,
  payload,
});

export const forgotPasswordFailure = (payload: string): AuthAction => ({
  type: AUTH_ACTIONS.FORGOT_PASSWORD_FAILURE,
  payload,
});

// ===========================================
// Reset Password
// ===========================================

export const resetPasswordRequest = (payload: ResetPasswordRequestPayload): AuthAction => ({
  type: AUTH_ACTIONS.RESET_PASSWORD_REQUEST,
  payload,
});

export const resetPasswordSuccess = (payload: ResetPasswordSuccessPayload): AuthAction => ({
  type: AUTH_ACTIONS.RESET_PASSWORD_SUCCESS,
  payload,
});

export const resetPasswordFailure = (payload: string): AuthAction => ({
  type: AUTH_ACTIONS.RESET_PASSWORD_FAILURE,
  payload,
});

// ===========================================
// Restore Session
// ===========================================

export const restoreSessionRequest = (): AuthAction => ({
  type: AUTH_ACTIONS.RESTORE_SESSION_REQUEST,
});

export const restoreSessionSuccess = (
  payload: RestoreSessionSuccessPayload
): AuthAction => ({
  type: AUTH_ACTIONS.RESTORE_SESSION_SUCCESS,
  payload,
});

export const restoreSessionFailure = (): AuthAction => ({
  type: AUTH_ACTIONS.RESTORE_SESSION_FAILURE,
});

// ===========================================
// Logout
// ===========================================

export const logout = (): AuthAction => ({
  type: AUTH_ACTIONS.LOGOUT,
});