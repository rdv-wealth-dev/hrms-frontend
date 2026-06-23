import { takeLatest } from 'redux-saga/effects'

import { AUTH_ACTIONS } from './auth.types'

function* handleLoginRequest() {
  // API integration will be added when auth endpoints are ready.
}

export function* authSaga() {
  yield takeLatest(AUTH_ACTIONS.LOGIN_REQUEST, handleLoginRequest)
}
