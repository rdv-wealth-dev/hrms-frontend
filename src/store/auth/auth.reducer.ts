import type { AuthAction, AuthState } from "./auth.types";
import { AUTH_ACTIONS } from "./auth.types";

const initialState: AuthState = {
  user: null,
  organization: null,
  branch: null,

  accessToken: null,
  refreshToken: null,

  isRegisterSuccess: false, // ✅ added
  isAuthenticated: false,
  loading: false,
  error: null,
};

export function authReducer(
  state = initialState,
  action: AuthAction,
): AuthState {
  switch (action.type) {

    // ==========================
    // Register
    // ==========================

    case AUTH_ACTIONS.REGISTER_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
        isRegisterSuccess: false, // ✅ reset on every new request
      };

    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return {
        ...state,
        loading: false,
        isRegisterSuccess: true, // ✅ triggers navigation in SignupView
        error: null,
      };

    case AUTH_ACTIONS.REGISTER_FAILURE:
      return {
        ...state,
        loading: false,
        isRegisterSuccess: false,
        error: action.payload,
      };

    // ✅ Added — clears isRegisterSuccess after navigation
    case AUTH_ACTIONS.RESET_AUTH_STATE:
      return {
        ...state,
        isRegisterSuccess: false,
        error: null,
      };

    // ==========================
    // Login
    // ==========================

    case AUTH_ACTIONS.LOGIN_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        loading: false,
        isAuthenticated: true,

        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,

        error: null,
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // ==========================
    // Logout
    // ==========================

    case AUTH_ACTIONS.LOGOUT:
      return initialState;

    default:
      return state;
  }
}