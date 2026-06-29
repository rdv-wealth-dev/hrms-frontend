import type {
  AuthAction,
  LoginRequestPayload,
  LoginSuccessPayload,
  RegisterRequestPayload,
  RegisterSuccessPayload,
} from "./auth.types";

import { AUTH_ACTIONS } from "./auth.types";

// ===========================================
// Register
// ===========================================

export const registerRequest = (
  payload: RegisterRequestPayload
): AuthAction => ({
  type: AUTH_ACTIONS.REGISTER_REQUEST,
  payload,
});

export const registerSuccess = (
  payload: RegisterSuccessPayload
): AuthAction => ({
  type: AUTH_ACTIONS.REGISTER_SUCCESS,
  payload,
});

export const registerFailure = (
  payload: string
): AuthAction => ({
  type: AUTH_ACTIONS.REGISTER_FAILURE,
  payload,
});

// ✅ Added — resets isRegisterSuccess after navigation
export const resetAuthState = (): AuthAction => ({
  type: AUTH_ACTIONS.RESET_AUTH_STATE,
});

// ===========================================
// Login
// ===========================================

export const loginRequest = (
  payload: LoginRequestPayload
): AuthAction => ({
  type: AUTH_ACTIONS.LOGIN_REQUEST,
  payload,
});

export const loginSuccess = (
  payload: LoginSuccessPayload
): AuthAction => ({
  type: AUTH_ACTIONS.LOGIN_SUCCESS,
  payload,
});

export const loginFailure = (
  payload: string
): AuthAction => ({
  type: AUTH_ACTIONS.LOGIN_FAILURE,
  payload,
});

// ===========================================
// Logout
// ===========================================

export const logout = (): AuthAction => ({
  type: AUTH_ACTIONS.LOGOUT,
});