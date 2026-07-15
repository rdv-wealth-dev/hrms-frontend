import axios from "axios";
import type { SagaIterator } from "redux-saga";
import { call, put, takeLatest } from "redux-saga/effects";

import {
  listDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
} from "../../api/department.api";

import {
  listDepartmentsSuccess,
  listDepartmentsFailure,
  getDepartmentByIdSuccess,
  getDepartmentByIdFailure,
  createDepartmentSuccess,
  createDepartmentFailure,
  updateDepartmentSuccess,
  updateDepartmentFailure,
} from "./department.actions";

import {
  DEPARTMENT_ACTIONS,
  type CreateDepartmentPayload,
  type UpdateDepartmentPayload,
} from "./department.types";

// ==========================
// List
// ==========================

function* handleListDepartments(): SagaIterator {
  try {
    const response = yield call(listDepartments);

    if (!response?.data) {
      yield put(listDepartmentsFailure(response?.message ?? "Failed to load departments"));
      return;
    }

    yield put(
      listDepartmentsSuccess({
        items: response.data,
        total: response.totalRecords ?? 0,
        pageNumber: response.pageNumber ?? 1,
        pageSize: response.pageSize ?? 10,
        totalPages: response.totalPages ?? 0,
      })
    );
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      yield put(listDepartmentsFailure(error.response?.data?.message ?? "Failed to load departments"));
    } else {
      yield put(listDepartmentsFailure("Something went wrong"));
    }
  }
}

// ==========================
// Get By ID
// ==========================

function* handleGetDepartmentById(action: {
  type: typeof DEPARTMENT_ACTIONS.GET_BY_ID_REQUEST;
  payload: string;
}): SagaIterator {
  try {
    const response = yield call(getDepartmentById, action.payload);

    if (!response?.data) {
      yield put(getDepartmentByIdFailure(response?.message ?? "Department not found"));
      return;
    }

    yield put(getDepartmentByIdSuccess(response.data));
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      yield put(getDepartmentByIdFailure(error.response?.data?.message ?? "Department not found"));
    } else {
      yield put(getDepartmentByIdFailure("Something went wrong"));
    }
  }
}

// ==========================
// Create
// ==========================

function* handleCreateDepartment(action: {
  type: typeof DEPARTMENT_ACTIONS.CREATE_REQUEST;
  payload: CreateDepartmentPayload;
}): SagaIterator {
  try {
    const response = yield call(createDepartment, action.payload);

    if (!response?.data) {
      yield put(createDepartmentFailure(response?.message ?? "Failed to create department"));
      return;
    }

    yield put(createDepartmentSuccess(response.data));
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      yield put(createDepartmentFailure(error.response?.data?.message ?? "Failed to create department"));
    } else {
      yield put(createDepartmentFailure("Something went wrong"));
    }
  }
}

// ==========================
// Update
// ==========================

function* handleUpdateDepartment(action: {
  type: typeof DEPARTMENT_ACTIONS.UPDATE_REQUEST;
  payload: UpdateDepartmentPayload;
}): SagaIterator {
  try {
    const response = yield call(
      updateDepartment,
      action.payload?.id,
      action.payload?.data
    );

    if (!response?.data) {
      yield put(updateDepartmentFailure(response?.message ?? "Failed to update department"));
      return;
    }

    yield put(updateDepartmentSuccess(response.data));
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      yield put(updateDepartmentFailure(error.response?.data?.message ?? "Failed to update department"));
    } else {
      yield put(updateDepartmentFailure("Something went wrong"));
    }
  }
}

// ==========================
// Watchers
// ==========================

export function* departmentSaga(): SagaIterator {
  yield takeLatest(DEPARTMENT_ACTIONS.LIST_REQUEST, handleListDepartments);
  yield takeLatest(DEPARTMENT_ACTIONS.GET_BY_ID_REQUEST, handleGetDepartmentById);
  yield takeLatest(DEPARTMENT_ACTIONS.CREATE_REQUEST, handleCreateDepartment);
  yield takeLatest(DEPARTMENT_ACTIONS.UPDATE_REQUEST, handleUpdateDepartment);
}