import axios from "axios";
import type { SagaIterator } from "redux-saga";
import { call, put, takeLatest } from "redux-saga/effects";

import {
  createEmployee,
  listEmployees,
  updateEmployee,
  updateEmployeeStatus,
} from "../../api/employee.api";
import {
  createEmployeeSuccess,
  createEmployeeFailure,
  listEmployeesSuccess,
  listEmployeesFailure,
  updateEmployeeSuccess,
  updateEmployeeFailure,
  updateEmployeeStatusSuccess,
  updateEmployeeStatusFailure,
} from "./employee.actions";
import {
  EMPLOYEE_ACTIONS,
  type CreateEmployeeRequestAction,
  type ListEmployeesRequestAction,
  type UpdateEmployeeRequestAction,
  type UpdateEmployeeStatusRequestAction,
} from "./employee.types";

function* handleCreateEmployee(action: CreateEmployeeRequestAction): SagaIterator {
  try {
    const response = yield call(createEmployee, action.payload);

    if (!response || !response.succeeded) {
      yield put(
        createEmployeeFailure(response?.message ?? "Failed to create employee")
      );
      return;
    }

    yield put(createEmployeeSuccess(response));
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const serverData = error.response?.data;
      const serverMsg = serverData?.message || (Array.isArray(serverData?.errors) && serverData.errors.length > 0 ? serverData.errors.join(", ") : undefined);
      yield put(
        createEmployeeFailure(
          serverMsg ?? error.message ?? "Failed to create employee"
        )
      );
    } else if (error instanceof Error) {
      yield put(createEmployeeFailure(error.message));
    } else {
      yield put(createEmployeeFailure("Something went wrong"));
    }
  }
}

function* handleListEmployees(action: ListEmployeesRequestAction): SagaIterator {
  try {
    const response = yield call(
      listEmployees,
      action.payload.pageNumber,
      action.payload.pageSize,
      action.payload.search,
      action.payload.status,
      action.payload.joiningPeriod
    );

    if (!response || !response.succeeded) {
      yield put(
        listEmployeesFailure(response?.message ?? "Failed to load employees")
      );
      return;
    }

    yield put(listEmployeesSuccess(response));
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      yield put(
        listEmployeesFailure(
          error.response?.data?.message ?? "Failed to load employees"
        )
      );
    } else if (error instanceof Error) {
      yield put(listEmployeesFailure(error.message));
    } else {
      yield put(listEmployeesFailure("Something went wrong"));
    }
  }
}

function* handleUpdateEmployee(action: UpdateEmployeeRequestAction): SagaIterator {
  try {
    const response = yield call(
      updateEmployee,
      action.payload.id,
      action.payload.data
    );

    if (!response || !response.succeeded) {
      yield put(
        updateEmployeeFailure(response?.message ?? "Failed to update employee")
      );
      return;
    }

    yield put(updateEmployeeSuccess(response));
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      yield put(
        updateEmployeeFailure(
          error.response?.data?.message ?? "Failed to update employee"
        )
      );
    } else if (error instanceof Error) {
      yield put(updateEmployeeFailure(error.message));
    } else {
      yield put(updateEmployeeFailure("Something went wrong"));
    }
  }
}

function* handleUpdateEmployeeStatus(action: UpdateEmployeeStatusRequestAction): SagaIterator {
  try {
    const response = yield call(
      updateEmployeeStatus,
      action.payload.id,
      action.payload.status
    );

    if (!response || !response.succeeded) {
      yield put(
        updateEmployeeStatusFailure(response?.message ?? "Failed to update employee status")
      );
      return;
    }

    yield put(updateEmployeeStatusSuccess(response));
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      yield put(
        updateEmployeeStatusFailure(
          error.response?.data?.message ?? "Failed to update employee status"
        )
      );
    } else if (error instanceof Error) {
      yield put(updateEmployeeStatusFailure(error.message));
    } else {
      yield put(updateEmployeeStatusFailure("Something went wrong"));
    }
  }
}

export function* employeeSaga(): SagaIterator {
  yield takeLatest(EMPLOYEE_ACTIONS.CREATE_REQUEST, handleCreateEmployee);
  yield takeLatest(EMPLOYEE_ACTIONS.LIST_REQUEST, handleListEmployees);
  yield takeLatest(EMPLOYEE_ACTIONS.UPDATE_REQUEST, handleUpdateEmployee);
  yield takeLatest(EMPLOYEE_ACTIONS.UPDATE_STATUS_REQUEST, handleUpdateEmployeeStatus);
}
