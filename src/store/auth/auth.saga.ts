import axios from "axios";
import type { SagaIterator } from "redux-saga";
import { call, put, takeLatest } from "redux-saga/effects";

import { registerCompany } from "../../api/auth.api";
import { registerFailure, registerSuccess } from "./auth.actions";
import { AUTH_ACTIONS, type RegisterRequestPayload } from "./auth.types";

function* handleRegisterRequest(action: {
  type: typeof AUTH_ACTIONS.REGISTER_REQUEST;
  payload: RegisterRequestPayload;
}): SagaIterator {
  try {
    const response = yield call(registerCompany, action.payload);
    yield put(registerSuccess(response));
    // ✅ No navigate here — React handles it via isRegisterSuccess flag
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      yield put(
        registerFailure(
          error.response?.data?.message ?? "Registration failed"
        )
      );
    } else {
      yield put(registerFailure("Something went wrong"));
    }
  }
}

function* handleLoginRequest() {
  // Login implementation will be added later.
}

export function* authSaga() {
  yield takeLatest(AUTH_ACTIONS.REGISTER_REQUEST, handleRegisterRequest);
  yield takeLatest(AUTH_ACTIONS.LOGIN_REQUEST, handleLoginRequest);
}