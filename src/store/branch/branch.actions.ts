import { BRANCH_ACTIONS } from "./branch.types";
import type { Branch, CreateBranchRequest, UpdateBranchRequest } from "./branch.types";

export const listBranchesRequest = () => ({
  type: BRANCH_ACTIONS.LIST_REQUEST,
});

export const listBranchesSuccess = (branches: Branch[]) => ({
  type: BRANCH_ACTIONS.LIST_SUCCESS,
  payload: branches,
});

export const listBranchesFailure = (error: string) => ({
  type: BRANCH_ACTIONS.LIST_FAILURE,
  payload: error,
});

export const createBranchRequest = (payload: CreateBranchRequest) => ({
  type: BRANCH_ACTIONS.CREATE_REQUEST,
  payload,
});

export const createBranchSuccess = (branch: Branch) => ({
  type: BRANCH_ACTIONS.CREATE_SUCCESS,
  payload: branch,
});

export const createBranchFailure = (error: string) => ({
  type: BRANCH_ACTIONS.CREATE_FAILURE,
  payload: error,
});

export const resetBranchStatus = () => ({
  type: BRANCH_ACTIONS.RESET_STATUS,
});

export const updateBranchRequest = (id: string, data: UpdateBranchRequest) => ({
  type: BRANCH_ACTIONS.UPDATE_REQUEST,
  payload: { id, data },
});

export const updateBranchSuccess = (branch: Branch) => ({
  type: BRANCH_ACTIONS.UPDATE_SUCCESS,
  payload: branch,
});

export const updateBranchFailure = (error: string) => ({
  type: BRANCH_ACTIONS.UPDATE_FAILURE,
  payload: error,
});

export const getHeadOfficeRequest = () => ({
  type: BRANCH_ACTIONS.HEAD_OFFICE_REQUEST,
});

export const getHeadOfficeSuccess = (branch: Branch) => ({
  type: BRANCH_ACTIONS.HEAD_OFFICE_SUCCESS,
  payload: branch,
});

export const getHeadOfficeFailure = (error: string) => ({
  type: BRANCH_ACTIONS.HEAD_OFFICE_FAILURE,
  payload: error,
});

export const deleteBranchRequest = (id: string) => ({
  type: BRANCH_ACTIONS.DELETE_REQUEST,
  payload: id,
});

export const deleteBranchSuccess = (id: string) => ({
  type: BRANCH_ACTIONS.DELETE_SUCCESS,
  payload: id,
});

export const deleteBranchFailure = (error: string) => ({
  type: BRANCH_ACTIONS.DELETE_FAILURE,
  payload: error,
});
