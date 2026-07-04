import type { AuthAction, AuthState } from "./auth.types";
import { AUTH_ACTIONS } from "./auth.types";

// ✅ Fixed key name — saga writes to "persistent", this was reading "persistentToken"
// (mismatch meant this initial rehydration attempt never actually worked)
const storedUser = localStorage.getItem("persistent");
const storedToken = localStorage.getItem("accessToken");

const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  organization: null,

  accessToken: storedToken ?? null,

  isRegisterSuccess: false,
  registerMessage: null,

  isVerifyingEmail: false,
  isEmailVerified: false,
  verifyMessage: null,

  isSendingResetLink: false,
  isResetLinkSent: false,
  forgotPasswordMessage: null,

  isResettingPassword: false,
  isPasswordReset: false,
  resetPasswordMessage: null,

  // ✅ New — session rehydration tracking
  isRestoringSession: false,
  sessionChecked: false,

  isAuthenticated: !!storedToken,
  loading: false,
  error: null,
};

export function authReducer(state = initialState, action: AuthAction): AuthState {
  switch (action.type) {

    // ==========================
    // Register
    // ==========================

    case AUTH_ACTIONS.REGISTER_REQUEST:
      return { ...state, loading: true, error: null, isRegisterSuccess: false };

    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return {
        ...state,
        loading: false,
        isRegisterSuccess: true,
        registerMessage: action.payload.message,
        organization: action.payload.organization,
        error: null,
      };

    case AUTH_ACTIONS.REGISTER_FAILURE:
      return { ...state, loading: false, isRegisterSuccess: false, error: action.payload };

    case AUTH_ACTIONS.RESET_AUTH_STATE:
      return { ...state, isRegisterSuccess: false, error: null };

    // ==========================
    // Verify Email
    // ==========================

    case AUTH_ACTIONS.VERIFY_EMAIL_REQUEST:
      return { ...state, isVerifyingEmail: true, isEmailVerified: false, error: null };

    case AUTH_ACTIONS.VERIFY_EMAIL_SUCCESS:
      return {
        ...state,
        isVerifyingEmail: false,
        isEmailVerified: true,
        verifyMessage: action.payload.message,
        error: null,
      };

    case AUTH_ACTIONS.VERIFY_EMAIL_FAILURE:
      return { ...state, isVerifyingEmail: false, isEmailVerified: false, error: action.payload };

    // ==========================
    // Login
    // ==========================

    case AUTH_ACTIONS.LOGIN_REQUEST:
      return { ...state, loading: true, error: null };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // ==========================
    // Forgot Password
    // ==========================

    case AUTH_ACTIONS.FORGOT_PASSWORD_REQUEST:
      return {
        ...state,
        isSendingResetLink: true,
        isResetLinkSent: false,
        error: null,
      };

    case AUTH_ACTIONS.FORGOT_PASSWORD_SUCCESS:
      return {
        ...state,
        isSendingResetLink: false,
        isResetLinkSent: true,
        forgotPasswordMessage: action.payload.message,
        error: null,
      };

    case AUTH_ACTIONS.FORGOT_PASSWORD_FAILURE:
      return {
        ...state,
        isSendingResetLink: false,
        isResetLinkSent: false,
        error: action.payload,
      };

    // ==========================
    // Reset Password
    // ==========================

    case AUTH_ACTIONS.RESET_PASSWORD_REQUEST:
      return {
        ...state,
        isResettingPassword: true,
        isPasswordReset: false,
        error: null,
      };

    case AUTH_ACTIONS.RESET_PASSWORD_SUCCESS:
      return {
        ...state,
        isResettingPassword: false,
        isPasswordReset: true,
        resetPasswordMessage: action.payload.message,
        error: null,
      };

    case AUTH_ACTIONS.RESET_PASSWORD_FAILURE:
      return {
        ...state,
        isResettingPassword: false,
        isPasswordReset: false,
        error: action.payload,
      };

    // ==========================
    // Restore Session
    // ==========================

    case AUTH_ACTIONS.RESTORE_SESSION_REQUEST:
      return { ...state, isRestoringSession: true };

    case AUTH_ACTIONS.RESTORE_SESSION_SUCCESS:
      return {
        ...state,
        isRestoringSession: false,
        sessionChecked: true,
        isAuthenticated: true,
        user: action.payload,
      };

    case AUTH_ACTIONS.RESTORE_SESSION_FAILURE:
      return {
        ...state,
        isRestoringSession: false,
        sessionChecked: true,
        isAuthenticated: false,
        user: null,
        accessToken: null,
      };

    // ==========================
    // Activate Account
    // ==========================

    case AUTH_ACTIONS.ACTIVATE_ACCOUNT_REQUEST:
      return { ...state, loading: true, error: null };

    case AUTH_ACTIONS.ACTIVATE_ACCOUNT_SUCCESS:
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        error: null,
      };

    case AUTH_ACTIONS.ACTIVATE_ACCOUNT_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // ==========================
    // Logout
    // ==========================

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
        user: null,
        accessToken: null,
        isAuthenticated: false,
        sessionChecked: true, // ✅ stay "checked" — don't show the loading spinner again after logout
      };

    default:
      return state;
  }
}