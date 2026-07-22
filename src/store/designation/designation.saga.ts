import axios from "axios";
import type { SagaIterator } from "redux-saga";
import { call, put, takeLatest } from "redux-saga/effects";

import {
  createDesignation,
  listDesignations,
  getDesignationById,
  updateDesignation,
} from "../../api/designation.api";

import {
  createDesignationSuccess,
  createDesignationFailure,
  listDesignationsSuccess,
  listDesignationsFailure,
  getDesignationByIdSuccess,
  getDesignationByIdFailure,
  updateDesignationSuccess,
  updateDesignationFailure,
} from "./designation.actions";

import {
  DESIGNATION_ACTIONS,
  type CreateDesignationPayload,
  type ListDesignationsRequestPayload,
  type UpdateDesignationPayload,
} from "./designation.types";

// ==========================
// Create
// ==========================

function* handleCreateDesignation(action: {
  type: typeof DESIGNATION_ACTIONS.CREATE_REQUEST;
  payload: CreateDesignationPayload;
}): SagaIterator {
  try {
    const response = yield call(createDesignation, action.payload);

    if (!response?.data) {
      yield put(createDesignationFailure(response?.message ?? "Failed to create designation"));
      return;
    }

    yield put(createDesignationSuccess(response.data));
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      yield put(createDesignationFailure(error.response?.data?.message ?? "Failed to create designation"));
    } else {
      yield put(createDesignationFailure("Something went wrong"));
    }
  }
}

// ==========================
// List
// ==========================

function* handleListDesignations(action: {
  type: typeof DESIGNATION_ACTIONS.LIST_REQUEST;
  payload: ListDesignationsRequestPayload;
}): SagaIterator {
  try {
    const response = yield call(
      listDesignations,
      action.payload?.pageNumber ?? 1,
      action.payload?.pageSize ?? 10
    );

    if (!response?.data) {
      yield put(listDesignationsFailure(response?.message ?? "Failed to load designations"));
      return;
    }

    yield put(
      listDesignationsSuccess({
        items: response.data ?? [],
        total: response.totalRecords ?? 0,
        pageNumber: response.pageNumber ?? 1,
        pageSize: response.pageSize ?? 10,
        totalPages: response.totalPages ?? 0,
      })
    );
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      yield put(listDesignationsFailure(error.response?.data?.message ?? "Failed to load designations"));
    } else {
      yield put(listDesignationsFailure("Something went wrong"));
    }
  }
}

// ==========================
// Get By ID
// ==========================

function* handleGetDesignationById(action: {
  type: typeof DESIGNATION_ACTIONS.GET_BY_ID_REQUEST;
  payload: string;
}): SagaIterator {
  try {
    const response = yield call(getDesignationById, action.payload);

    if (!response?.data) {
      yield put(getDesignationByIdFailure(response?.message ?? "Designation not found"));
      return;
    }

    yield put(getDesignationByIdSuccess(response.data));
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      yield put(getDesignationByIdFailure(error.response?.data?.message ?? "Designation not found"));
    } else {
      yield put(getDesignationByIdFailure("Something went wrong"));
    }
  }
}

// ==========================
// Update
// ==========================

function* handleUpdateDesignation(action: {
  type: typeof DESIGNATION_ACTIONS.UPDATE_REQUEST;
  payload: UpdateDesignationPayload;
}): SagaIterator {
  try {
    const response = yield call(
      updateDesignation,
      action.payload?.id,
      action.payload?.data
    );

    if (!response?.data) {
      yield put(updateDesignationFailure(response?.message ?? "Failed to update designation"));
      return;
    }

    yield put(updateDesignationSuccess(response.data));
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      yield put(updateDesignationFailure(error.response?.data?.message ?? "Failed to update designation"));
    } else {
      yield put(updateDesignationFailure("Something went wrong"));
    }
  }
}

// ==========================
// Watchers
// ==========================

export function* designationSaga(): SagaIterator {
  yield takeLatest(DESIGNATION_ACTIONS.CREATE_REQUEST, handleCreateDesignation);
  yield takeLatest(DESIGNATION_ACTIONS.LIST_REQUEST, handleListDesignations);
  yield takeLatest(DESIGNATION_ACTIONS.GET_BY_ID_REQUEST, handleGetDesignationById);
  yield takeLatest(DESIGNATION_ACTIONS.UPDATE_REQUEST, handleUpdateDesignation); // ✅
}