import axios from "axios";
import type { SagaIterator } from "redux-saga";
import { call, put, takeLatest } from "redux-saga/effects";

import { getOrganization, updateOrganization } from "../../api/organization.api";
import {
  loadOrganizationSuccess,
  loadOrganizationFailure,
  updateOrganizationSuccess,
  updateOrganizationFailure,
} from "./organization.actions";
import { ORGANIZATION_ACTIONS } from "./organization.types";
import type { UpdateOrganizationRequestAction } from "./organization.types";

function* handleLoadOrganization(): SagaIterator {
  try {
    const response = yield call(getOrganization);

    if (!response || !response.succeeded || !response.data) {
      yield put(
        loadOrganizationFailure(
          response?.message ?? "Failed to fetch organization settings"
        )
      );
      return;
    }

    yield put(loadOrganizationSuccess(response.data));
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      yield put(
        loadOrganizationFailure(
          error.response?.data?.message ?? "Failed to fetch organization settings"
        )
      );
    } else if (error instanceof Error) {
      yield put(loadOrganizationFailure(error.message));
    } else {
      yield put(loadOrganizationFailure("Something went wrong"));
    }
  }
}

function* handleUpdateOrganization(
  action: UpdateOrganizationRequestAction
): SagaIterator {
  try {
    const response = yield call(updateOrganization, action.payload);

    if (!response || !response.succeeded || !response.data) {
      yield put(
        updateOrganizationFailure(
          response?.message ?? "Failed to update organization settings"
        )
      );
      return;
    }

    yield put(updateOrganizationSuccess(response.data));
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      yield put(
        updateOrganizationFailure(
          error.response?.data?.message ?? "Failed to update organization settings"
        )
      );
    } else if (error instanceof Error) {
      yield put(updateOrganizationFailure(error.message));
    } else {
      yield put(updateOrganizationFailure("Something went wrong"));
    }
  }
}

export function* organizationSaga(): SagaIterator {
  yield takeLatest(ORGANIZATION_ACTIONS.LOAD_REQUEST, handleLoadOrganization);
  yield takeLatest(ORGANIZATION_ACTIONS.UPDATE_REQUEST, handleUpdateOrganization);
}
