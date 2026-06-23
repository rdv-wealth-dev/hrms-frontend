import type {
  AuthAction,
  LoginRequestPayload,
  LoginSuccessPayload,
} from './auth.types'
import { AUTH_ACTIONS } from './auth.types'

export const loginRequest = (payload: LoginRequestPayload): AuthAction => ({
  type: AUTH_ACTIONS.LOGIN_REQUEST,
  payload,
})

export const loginSuccess = (payload: LoginSuccessPayload): AuthAction => ({
  type: AUTH_ACTIONS.LOGIN_SUCCESS,
  payload,
})

export const loginFailure = (payload: string): AuthAction => ({
  type: AUTH_ACTIONS.LOGIN_FAILURE,
  payload,
})

export const logout = (): AuthAction => ({
  type: AUTH_ACTIONS.LOGOUT,
})
