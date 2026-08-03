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
  refreshToken: localStorage.getItem("refreshToken") ?? null,
  requiresPasswordReset: false,
  onboardingCompleted: true,
  branch: null,

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

  checkEmailLoading: false,
  checkEmailResult: null,

  loginCooldownSeconds: null,

  isAuthenticated: !!storedToken,
  loading: false,
  error: null,
  checkEmailError: null,
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
      return { ...state, loading: true, error: null, checkEmailError: null, loginCooldownSeconds: null };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken ?? null,
        requiresPasswordReset: action.payload.requiresPasswordReset,
        onboardingCompleted: action.payload.onboardingCompleted,
        organization: action.payload.organization ?? state.organization,
        branch: action.payload.branch ?? null,
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
    // Check Email
    // ==========================

    case AUTH_ACTIONS.CHECK_EMAIL_REQUEST:
      return { ...state, checkEmailLoading: true, checkEmailResult: null, checkEmailError: null };

    case AUTH_ACTIONS.CHECK_EMAIL_SUCCESS:
      return { ...state, checkEmailLoading: false, checkEmailResult: action.payload, checkEmailError: null };

    case AUTH_ACTIONS.CHECK_EMAIL_FAILURE:
      return { ...state, checkEmailLoading: false, checkEmailResult: null, checkEmailError: action.payload };

    // ==========================
    // Login Cooldown
    // ==========================

    case AUTH_ACTIONS.SET_LOGIN_COOLDOWN:
      return { ...state, loginCooldownSeconds: action.payload };

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

    case AUTH_ACTIONS.UPDATE_USER_AVATAR: {
      if (!state.user) return state;
      const updatedUser = { ...state.user, avatarUrl: action.payload };
      try {
        localStorage.setItem("persistent", JSON.stringify(updatedUser));
      } catch (err) {
        // ignore storage quota errors
      }
      return {
        ...state,
        user: updatedUser,
      };
    }

    // ==========================
    // Logout
    // ==========================

    case AUTH_ACTIONS.LOGOUT:
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("persistent");
      }
      return {
        ...initialState,
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        sessionChecked: true,
      };

    default:
      return state;
  }
}