import axios from "axios";
import type { SagaIterator } from "redux-saga";
import { call, put, takeLatest } from "redux-saga/effects";

import {
  registerCompany,
  loginUser,
} from "../../api/auth.api";

import {
  registerFailure,
  registerSuccess,
  loginFailure,
  loginSuccess,
} from "./auth.actions";

import {
  AUTH_ACTIONS,
  type RegisterRequestPayload,
  type LoginRequestPayload,
} from "./auth.types";

// ===========================================
// Register
// ===========================================

function* handleRegisterRequest(action: {
  type: typeof AUTH_ACTIONS.REGISTER_REQUEST;
  payload: RegisterRequestPayload;
}): SagaIterator {
  try {
    const response = yield call(registerCompany, action.payload);

    yield put(registerSuccess(response));

    // React handles navigation using isRegisterSuccess
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

// ===========================================
// Login
// ===========================================

function* handleLoginRequest(action: {
  type: typeof AUTH_ACTIONS.LOGIN_REQUEST;
  payload: LoginRequestPayload;
}): SagaIterator {
  try {
    const response = yield call(loginUser, action.payload);

    console.log("Login API Response:", response);

    if (!response.data) {
      yield put(loginFailure(response.message ?? "Login failed"));
      return;
    }

    yield put(
      loginSuccess({
        user: response.data.user,
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
      })
    );

    // ✅ Persist tokens to localStorage
    localStorage.setItem("accessToken", response.data.accessToken);
    localStorage.setItem("refreshToken", response.data.refreshToken);

    // React handles navigation using isAuthenticated
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      yield put(
        loginFailure(error.response?.data?.message ?? "Login failed")
      );
    } else {
      yield put(loginFailure("Something went wrong"));
    }
  }
}

// ===========================================
// Watchers
// ===========================================

export function* authSaga(): SagaIterator {
  yield takeLatest(
    AUTH_ACTIONS.REGISTER_REQUEST,
    handleRegisterRequest
  );

  yield takeLatest(
    AUTH_ACTIONS.LOGIN_REQUEST,
    handleLoginRequest
  );
}