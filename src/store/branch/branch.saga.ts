import axios from "axios";
import type { SagaIterator } from "redux-saga";
import { call, put, takeLatest } from "redux-saga/effects";

import { listBranches, createBranch, getHeadOffice, updateBranch, deleteBranch, seedBranchMasterData } from "../../api/branch.api";
import {
  listBranchesSuccess,
  listBranchesFailure,
  createBranchSuccess,
  createBranchFailure,
  getHeadOfficeSuccess,
  getHeadOfficeFailure,
  updateBranchSuccess,
  updateBranchFailure,
  deleteBranchSuccess,
  deleteBranchFailure,
  seedBranchSuccess,
  seedBranchFailure,
} from "./branch.actions";
import {
  BRANCH_ACTIONS,
  type CreateBranchRequestAction,
  type UpdateBranchRequestAction,
  type DeleteBranchRequestAction,
  type SeedBranchRequestAction,
} from "./branch.types";

function* handleListBranches(): SagaIterator {
  try {
    const response = yield call(listBranches);

    if (!response || !response.succeeded) {
      yield put(
        listBranchesFailure(response?.message ?? "Failed to load branches")
      );
      return;
    }

    yield put(listBranchesSuccess(response.data));
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      yield put(
        listBranchesFailure(
          error.response?.data?.message ?? "Failed to load branches"
        )
      );
    } else if (error instanceof Error) {
      yield put(listBranchesFailure(error.message));
    } else {
      yield put(listBranchesFailure("Something went wrong"));
    }
  }
}

function* handleCreateBranch(action: CreateBranchRequestAction): SagaIterator {
  try {
    const response = yield call(createBranch, action.payload);

    if (!response || !response.succeeded || !response.data) {
      yield put(
        createBranchFailure(response?.message ?? "Failed to create branch")
      );
      return;
    }

    yield put(createBranchSuccess(response.data));
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      yield put(
        createBranchFailure(
          error.response?.data?.message ?? "Failed to create branch"
        )
      );
    } else if (error instanceof Error) {
      yield put(createBranchFailure(error.message));
    } else {
      yield put(createBranchFailure("Something went wrong"));
    }
  }
}

function* handleUpdateBranch(action: UpdateBranchRequestAction): SagaIterator {
  try {
    const response = yield call(updateBranch, action.payload.id, action.payload.data);

    if (!response || !response.succeeded || !response.data) {
      yield put(
        updateBranchFailure(response?.message ?? "Failed to update branch")
      );
      return;
    }

    yield put(updateBranchSuccess(response.data));
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      yield put(
        updateBranchFailure(
          error.response?.data?.message ?? "Failed to update branch"
        )
      );
    } else if (error instanceof Error) {
      yield put(updateBranchFailure(error.message));
    } else {
      yield put(updateBranchFailure("Something went wrong"));
    }
  }
}

function* handleDeleteBranch(action: DeleteBranchRequestAction): SagaIterator {
  try {
    const response = yield call(deleteBranch, action.payload);

    if (!response || !response.succeeded) {
      yield put(
        deleteBranchFailure(response?.message ?? "Failed to delete branch")
      );
      return;
    }

    yield put(deleteBranchSuccess(action.payload));
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      yield put(
        deleteBranchFailure(
          error.response?.data?.message ?? "Failed to delete branch"
        )
      );
    } else if (error instanceof Error) {
      yield put(deleteBranchFailure(error.message));
    } else {
      yield put(deleteBranchFailure("Something went wrong"));
    }
  }
}

function* handleGetHeadOffice(): SagaIterator {
  try {
    const response = yield call(getHeadOffice);

    if (!response || !response.succeeded || !response.data) {
      yield put(
        getHeadOfficeFailure(response?.message ?? "Failed to fetch head office")
      );
      return;
    }

    yield put(getHeadOfficeSuccess(response.data));
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      yield put(
        getHeadOfficeFailure(
          error.response?.data?.message ?? "Failed to fetch head office"
        )
      );
    } else if (error instanceof Error) {
      yield put(getHeadOfficeFailure(error.message));
    } else {
      yield put(getHeadOfficeFailure("Something went wrong"));
    }
  }
}

function* handleSeedBranch(action: SeedBranchRequestAction): SagaIterator {
  try {
    const response = yield call(seedBranchMasterData, action.payload);
    if (response && response.succeeded === false) {
      yield put(seedBranchFailure(response.message || "Failed to seed branch master data"));
      return;
    }
    yield put(seedBranchSuccess());
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.errors?.[0] ||
      error?.message ||
      "Failed to seed branch master data";
    yield put(seedBranchFailure(message));
  }
}

export function* branchSaga(): SagaIterator {
  yield takeLatest(BRANCH_ACTIONS.LIST_REQUEST, handleListBranches);
  yield takeLatest(BRANCH_ACTIONS.CREATE_REQUEST, handleCreateBranch);
  yield takeLatest(BRANCH_ACTIONS.UPDATE_REQUEST, handleUpdateBranch);
  yield takeLatest(BRANCH_ACTIONS.DELETE_REQUEST, handleDeleteBranch);
  yield takeLatest(BRANCH_ACTIONS.HEAD_OFFICE_REQUEST, handleGetHeadOffice);
  yield takeLatest(BRANCH_ACTIONS.SEED_REQUEST, handleSeedBranch);
}
