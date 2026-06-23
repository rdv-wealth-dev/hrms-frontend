import type { AuthAction, AuthState } from './auth.types'
import { AUTH_ACTIONS } from './auth.types'

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
}

export function authReducer(
  state = initialState,
  action: AuthAction,
): AuthState {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_REQUEST:
      return { ...state, loading: true, error: null }

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      }

    case AUTH_ACTIONS.LOGIN_FAILURE:
      return { ...state, loading: false, error: action.payload }

    case AUTH_ACTIONS.LOGOUT:
      return initialState

    default:
      return state
  }
}
