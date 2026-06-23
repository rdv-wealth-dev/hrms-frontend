export type AuthUser = {
  id: string
  name: string
  email: string
}

export type AuthState = {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

export const AUTH_ACTIONS = {
  LOGIN_REQUEST: 'auth/loginRequest',
  LOGIN_SUCCESS: 'auth/loginSuccess',
  LOGIN_FAILURE: 'auth/loginFailure',
  LOGOUT: 'auth/logout',
} as const

export type LoginRequestPayload = {
  email: string
  password: string
}

export type LoginSuccessPayload = {
  user: AuthUser
  token: string
}

export type AuthAction =
  | { type: typeof AUTH_ACTIONS.LOGIN_REQUEST; payload: LoginRequestPayload }
  | { type: typeof AUTH_ACTIONS.LOGIN_SUCCESS; payload: LoginSuccessPayload }
  | { type: typeof AUTH_ACTIONS.LOGIN_FAILURE; payload: string }
  | { type: typeof AUTH_ACTIONS.LOGOUT }
