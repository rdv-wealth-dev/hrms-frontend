import axios from "axios";
import type { SagaIterator } from "redux-saga";
import { call, put, takeLatest } from "redux-saga/effects";

import {
  getOrganization,
  updateOrganization,
  updateModules,
  updateStatutory,
  updateMandatoryDocs,
} from "../../api/organization.api";
import {
  loadOrganizationSuccess,
  loadOrganizationFailure,
  updateOrganizationSuccess,
  updateOrganizationFailure,
  updateModulesSuccess,
  updateModulesFailure,
  updateStatutorySuccess,
  updateStatutoryFailure,
  updateMandatoryDocsSuccess,
  updateMandatoryDocsFailure,
} from "./organization.actions";
import { ORGANIZATION_ACTIONS } from "./organization.types";
import type {
  UpdateOrganizationRequestAction,
  UpdateModulesRequestAction,
  UpdateStatutoryRequestAction,
  UpdateMandatoryDocsRequestAction,
} from "./organization.types";

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

function* handleUpdateModules(
  action: UpdateModulesRequestAction
): SagaIterator {
  try {
    const response = yield call(updateModules, action.payload);

    if (!response || !response.succeeded || !response.data) {
      yield put(
        updateModulesFailure(
          response?.message ?? "Failed to update organization modules"
        )
      );
      return;
    }

    yield put(updateModulesSuccess(response.data));
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      yield put(
        updateModulesFailure(
          error.response?.data?.message ?? "Failed to update organization modules"
        )
      );
    } else if (error instanceof Error) {
      yield put(updateModulesFailure(error.message));
    } else {
      yield put(updateModulesFailure("Something went wrong"));
    }
  }
}

function* handleUpdateStatutory(
  action: UpdateStatutoryRequestAction
): SagaIterator {
  try {
    const response = yield call(updateStatutory, action.payload);

    if (!response || !response.succeeded || !response.data) {
      yield put(
        updateStatutoryFailure(
          response?.message ?? "Failed to update organization statutory settings"
        )
      );
      return;
    }

    yield put(updateStatutorySuccess(response.data));
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      yield put(
        updateStatutoryFailure(
          error.response?.data?.message ?? "Failed to update organization statutory settings"
        )
      );
    } else if (error instanceof Error) {
      yield put(updateStatutoryFailure(error.message));
    } else {
      yield put(updateStatutoryFailure("Something went wrong"));
    }
  }
}

function* handleUpdateMandatoryDocs(
  action: UpdateMandatoryDocsRequestAction
): SagaIterator {
  try {
    const response = yield call(updateMandatoryDocs, action.payload);

    if (!response || !response.succeeded || !response.data) {
      yield put(
        updateMandatoryDocsFailure(
          response?.message ?? "Failed to update organization mandatory documents"
        )
      );
      return;
    }

    yield put(updateMandatoryDocsSuccess(response.data));
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      yield put(
        updateMandatoryDocsFailure(
          error.response?.data?.message ?? "Failed to update organization mandatory documents"
        )
      );
    } else if (error instanceof Error) {
      yield put(updateMandatoryDocsFailure(error.message));
    } else {
      yield put(updateMandatoryDocsFailure("Something went wrong"));
    }
  }
}

export function* organizationSaga(): SagaIterator {
  yield takeLatest(ORGANIZATION_ACTIONS.LOAD_REQUEST, handleLoadOrganization);
  yield takeLatest(ORGANIZATION_ACTIONS.UPDATE_REQUEST, handleUpdateOrganization);
  yield takeLatest(ORGANIZATION_ACTIONS.UPDATE_MODS_REQUEST, handleUpdateModules);
  yield takeLatest(
    ORGANIZATION_ACTIONS.UPDATE_STATUTORY_REQUEST,
    handleUpdateStatutory
  );
  yield takeLatest(
    ORGANIZATION_ACTIONS.UPDATE_MANDATORY_DOCS_REQUEST,
    handleUpdateMandatoryDocs
  );
}
