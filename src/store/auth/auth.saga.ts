import axios from "axios";
import type { SagaIterator } from "redux-saga";
import { call, put, takeLatest } from "redux-saga/effects";

import {
  registerCompany,
  loginUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getMe,
} from "../../api/auth.api";

import {
  registerFailure,
  registerSuccess,
  loginFailure,
  loginSuccess,
  verifyEmailSuccess,
  verifyEmailFailure,
  forgotPasswordSuccess,
  forgotPasswordFailure,
  resetPasswordSuccess,
  resetPasswordFailure,
  restoreSessionSuccess,
  restoreSessionFailure,
} from "./auth.actions";

import {
  AUTH_ACTIONS,
  type RegisterRequestPayload,
  type LoginRequestPayload,
  type VerifyEmailRequestPayload,
  type ForgotPasswordRequestPayload,
  type ResetPasswordRequestPayload,
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

    if (!response.data) {
      yield put(registerFailure(response.message ?? "Registration failed"));
      return;
    }

    yield put(registerSuccess(response.data));
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      yield put(registerFailure(error.response?.data?.message ?? "Registration failed"));
    } else {
      yield put(registerFailure("Something went wrong"));
    }
  }
}

// ===========================================
// Verify Email
// ===========================================

function* handleVerifyEmailRequest(action: {
  type: typeof AUTH_ACTIONS.VERIFY_EMAIL_REQUEST;
  payload: VerifyEmailRequestPayload;
}): SagaIterator {
  try {
    const response = yield call(verifyEmail, action.payload);

    if (!response.succeeded || !response.data) {
      yield put(verifyEmailFailure(response.message ?? "Verification failed"));
      return;
    }

    yield put(verifyEmailSuccess(response.data));
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      yield put(verifyEmailFailure(error.response?.data?.message ?? "Verification failed"));
    } else {
      yield put(verifyEmailFailure("Something went wrong"));
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

    if (!response.data) {
      yield put(loginFailure(response.message ?? "Login failed"));
      return;
    }

    yield put(
      loginSuccess({
        user: response.data.user,
        accessToken: response.data.accessToken,
      })
    );

    localStorage.setItem("accessToken", response.data.accessToken);
    localStorage.setItem("persistent", JSON.stringify(response.data.user));
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      yield put(loginFailure(error.response?.data?.message ?? "Login failed"));
    } else {
      yield put(loginFailure("Something went wrong"));
    }
  }
}

// ===========================================
// Forgot Password
// ===========================================

function* handleForgotPasswordRequest(action: {
  type: typeof AUTH_ACTIONS.FORGOT_PASSWORD_REQUEST;
  payload: ForgotPasswordRequestPayload;
}): SagaIterator {
  try {
    const response = yield call(forgotPassword, action.payload);

    if (!response.succeeded || !response.data) {
      yield put(forgotPasswordFailure(response.message ?? "Something went wrong"));
      return;
    }

    yield put(forgotPasswordSuccess(response.data));
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      yield put(forgotPasswordFailure(error.response?.data?.message ?? "Something went wrong"));
    } else {
      yield put(forgotPasswordFailure("Something went wrong"));
    }
  }
}

// ===========================================
// Reset Password
// ===========================================

function* handleResetPasswordRequest(action: {
  type: typeof AUTH_ACTIONS.RESET_PASSWORD_REQUEST;
  payload: ResetPasswordRequestPayload;
}): SagaIterator {
  try {
    const response = yield call(resetPassword, action.payload);

    if (!response.succeeded || !response.data) {
      yield put(resetPasswordFailure(response.message ?? "Password reset failed"));
      return;
    }

    yield put(resetPasswordSuccess(response.data));
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      yield put(resetPasswordFailure(error.response?.data?.message ?? "Password reset failed"));
    } else {
      yield put(resetPasswordFailure("Something went wrong"));
    }
  }
}

// ===========================================
// Restore Session (on app load)
// ===========================================

function* handleRestoreSession(): SagaIterator {
  const token = localStorage.getItem("accessToken");

  // No token at all — nothing to restore, don't even call the API
  if (!token) {
    yield put(restoreSessionFailure());
    return;
  }

  try {
    const response = yield call(getMe);

    if (!response.succeeded || !response.data) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("persistent");
      yield put(restoreSessionFailure());
      return;
    }

    // ⚠️ NOTE: /auth/me does not return `permissions`. Defaulting to [] until
    // the backend includes it here too — permission-based RoleGuard checks
    // will fail-closed after a refresh until that's added.
    yield put(
      restoreSessionSuccess({
        ...response.data,
        permissions: [],
      })
    );

    // Keep the "persistent" cache in sync with the freshest server data
    localStorage.setItem("persistent", JSON.stringify(response.data));
  } catch (error: unknown) {
    // Token invalid/expired/rejected — clear it, don't leave a dead session lying around
    localStorage.removeItem("accessToken");
    localStorage.removeItem("persistent");
    yield put(restoreSessionFailure());
  }
}

// ===========================================
// Logout
// ===========================================

function* handleLogout(): SagaIterator {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("persistent");
}

// ===========================================
// Watchers
// ===========================================

export function* authSaga(): SagaIterator {
  yield takeLatest(AUTH_ACTIONS.REGISTER_REQUEST, handleRegisterRequest);
  yield takeLatest(AUTH_ACTIONS.VERIFY_EMAIL_REQUEST, handleVerifyEmailRequest);
  yield takeLatest(AUTH_ACTIONS.LOGIN_REQUEST, handleLoginRequest);
  yield takeLatest(AUTH_ACTIONS.FORGOT_PASSWORD_REQUEST, handleForgotPasswordRequest);
  yield takeLatest(AUTH_ACTIONS.RESET_PASSWORD_REQUEST, handleResetPasswordRequest);
  yield takeLatest(AUTH_ACTIONS.RESTORE_SESSION_REQUEST, handleRestoreSession);
  yield takeLatest(AUTH_ACTIONS.LOGOUT, handleLogout);
}