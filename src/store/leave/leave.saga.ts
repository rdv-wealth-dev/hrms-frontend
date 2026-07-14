import type { SagaIterator } from 'redux-saga';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import {
  createLeaveType,
  listLeaveTypes,
  createHoliday,
  listHolidays,
  getMyLeaveBalances,
  applyForLeave,
  getPendingLeaveRequests,
  reviewLeaveRequest,
  getMyLeaveRequests,
} from '../../api/leave.api';
import {
  createLeaveTypeFailure,
  createLeaveTypeSuccess,
  listLeaveTypesFailure,
  listLeaveTypesSuccess,
  createHolidayFailure,
  createHolidaySuccess,
  listHolidaysFailure,
  listHolidaysSuccess,
  getMyLeaveBalancesFailure,
  getMyLeaveBalancesSuccess,
  applyLeaveFailure,
  applyLeaveSuccess,
  getPendingLeaveRequestsFailure,
  getPendingLeaveRequestsSuccess,
  reviewLeaveRequestFailure,
  reviewLeaveRequestSuccess,
  getMyLeaveRequestsFailure,
  getMyLeaveRequestsSuccess,
} from './leave.actions';
import { LEAVE_ACTIONS } from './leave.types';
import type {
  CreateLeaveTypeRequestAction,
  CreateHolidayRequestAction,
  ListHolidaysRequestAction,
  GetMyLeaveBalancesRequestAction,
  ApplyLeaveRequestAction,
  GetPendingLeaveRequestsRequestAction,
  ReviewLeaveRequestRequestAction,
  GetMyLeaveRequestsRequestAction,
} from './leave.types';

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

function* listHolidaysSaga(action: ListHolidaysRequestAction): SagaIterator {
  try {
    const response = yield call(listHolidays, action.payload);
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

function* getMyBalancesSaga(action: GetMyLeaveBalancesRequestAction): SagaIterator {
  try {
    const response = yield call(getMyLeaveBalances, action.payload);
    const data = response?.data || [];
    yield put(getMyLeaveBalancesSuccess(data));
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch leave balances';
    yield put(getMyLeaveBalancesFailure(message));
  }
}

function* applyLeaveSaga(action: ApplyLeaveRequestAction): SagaIterator {
  try {
    yield call(applyForLeave, action.payload);
    yield put(applyLeaveSuccess());
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || 'Failed to submit leave request';
    yield put(applyLeaveFailure(message));
  }
}

function* getPendingLeaveRequestsSaga(action: GetPendingLeaveRequestsRequestAction): SagaIterator {
  try {
    const response = yield call(getPendingLeaveRequests, action.payload.pageNumber, action.payload.pageSize);
    yield put(getPendingLeaveRequestsSuccess(response));
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch pending leave requests';
    yield put(getPendingLeaveRequestsFailure(message));
  }
}

function* reviewLeaveRequestSaga(action: ReviewLeaveRequestRequestAction): SagaIterator {
  try {
    yield call(reviewLeaveRequest, action.payload.id, action.payload.status, action.payload.reviewComments);
    yield put(reviewLeaveRequestSuccess());
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || 'Failed to review leave request';
    yield put(reviewLeaveRequestFailure(message));
  }
}

function* getMyLeaveRequestsSaga(action: GetMyLeaveRequestsRequestAction): SagaIterator {
  try {
    const response = yield call(getMyLeaveRequests, action.payload.pageNumber, action.payload.pageSize);
    yield put(getMyLeaveRequestsSuccess(response));
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch my leave requests';
    yield put(getMyLeaveRequestsFailure(message));
  }
}

export function* leaveSaga(): SagaIterator {
  yield all([
    takeLatest(LEAVE_ACTIONS.LIST_REQUEST, listLeaveTypesSaga),
    takeLatest(LEAVE_ACTIONS.CREATE_REQUEST, createLeaveTypeSaga),
    takeLatest(LEAVE_ACTIONS.LIST_HOLIDAYS_REQUEST, listHolidaysSaga),
    takeLatest(LEAVE_ACTIONS.CREATE_HOLIDAY_REQUEST, createHolidaySaga),
    takeLatest(LEAVE_ACTIONS.GET_MY_BALANCES_REQUEST, getMyBalancesSaga),
    takeLatest(LEAVE_ACTIONS.APPLY_LEAVE_REQUEST, applyLeaveSaga),
    takeLatest(LEAVE_ACTIONS.GET_PENDING_REQUESTS_REQUEST, getPendingLeaveRequestsSaga),
    takeLatest(LEAVE_ACTIONS.REVIEW_REQUEST_REQUEST, reviewLeaveRequestSaga),
    takeLatest(LEAVE_ACTIONS.GET_MY_REQUESTS_REQUEST, getMyLeaveRequestsSaga),
  ]);
}
