import type { SagaIterator } from 'redux-saga';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { createLeaveType, listLeaveTypes, createHoliday, listHolidays } from '../../api/leave.api';
import {
  createLeaveTypeFailure,
  createLeaveTypeSuccess,
  listLeaveTypesFailure,
  listLeaveTypesSuccess,
  createHolidayFailure,
  createHolidaySuccess,
  listHolidaysFailure,
  listHolidaysSuccess,
} from './leave.actions';
import { LEAVE_ACTIONS } from './leave.types';
import type { CreateLeaveTypeRequestAction, CreateHolidayRequestAction } from './leave.types';

function* listLeaveTypesSaga(): SagaIterator {
  try {
    const response = yield call(listLeaveTypes);
    const data = response?.data || [];
    yield put(listLeaveTypesSuccess(data));
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch leave types';
    yield put(listLeaveTypesFailure(message));
  }
}

function* createLeaveTypeSaga(action: CreateLeaveTypeRequestAction): SagaIterator {
  try {
    const response = yield call(createLeaveType, action.payload);
    yield put(createLeaveTypeSuccess(response.data));
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || 'Failed to create leave type';
    yield put(createLeaveTypeFailure(message));
  }
}

function* listHolidaysSaga(): SagaIterator {
  try {
    const response = yield call(listHolidays);
    const data = response?.data || [];
    yield put(listHolidaysSuccess(data));
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch holidays';
    yield put(listHolidaysFailure(message));
  }
}

function* createHolidaySaga(action: CreateHolidayRequestAction): SagaIterator {
  try {
    const response = yield call(createHoliday, action.payload);
    yield put(createHolidaySuccess(response.data));
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || 'Failed to create holiday';
    yield put(createHolidayFailure(message));
  }
}

export function* leaveSaga(): SagaIterator {
  yield all([
    takeLatest(LEAVE_ACTIONS.LIST_REQUEST, listLeaveTypesSaga),
    takeLatest(LEAVE_ACTIONS.CREATE_REQUEST, createLeaveTypeSaga),
    takeLatest(LEAVE_ACTIONS.LIST_HOLIDAYS_REQUEST, listHolidaysSaga),
    takeLatest(LEAVE_ACTIONS.CREATE_HOLIDAY_REQUEST, createHolidaySaga),
  ]);
}
