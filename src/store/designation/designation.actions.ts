import type {
  DesignationAction,
  CreateDesignationPayload,
  ListDesignationsRequestPayload,
  ListDesignationsSuccessPayload,
  UpdateDesignationPayload,
} from "./designation.types";

import { DESIGNATION_ACTIONS } from "./designation.types";
import type { Designation } from "../../auth/types";

export const createDesignationRequest = (
  payload: CreateDesignationPayload
): DesignationAction => ({
  type: DESIGNATION_ACTIONS.CREATE_REQUEST,
  payload,
});

export const createDesignationSuccess = (
  payload: Designation
): DesignationAction => ({
  type: DESIGNATION_ACTIONS.CREATE_SUCCESS,
  payload,
});

export const createDesignationFailure = (payload: string): DesignationAction => ({
  type: DESIGNATION_ACTIONS.CREATE_FAILURE,
  payload,
});

export const listDesignationsRequest = (
  payload: ListDesignationsRequestPayload = {}
): DesignationAction => ({
  type: DESIGNATION_ACTIONS.LIST_REQUEST,
  payload,
});

export const listDesignationsSuccess = (
  payload: ListDesignationsSuccessPayload
): DesignationAction => ({
  type: DESIGNATION_ACTIONS.LIST_SUCCESS,
  payload,
});

export const listDesignationsFailure = (payload: string): DesignationAction => ({
  type: DESIGNATION_ACTIONS.LIST_FAILURE,
  payload,
});

export const getDesignationByIdRequest = (id: string): DesignationAction => ({
  type: DESIGNATION_ACTIONS.GET_BY_ID_REQUEST,
  payload: id,
});

export const getDesignationByIdSuccess = (
  payload: Designation
): DesignationAction => ({
  type: DESIGNATION_ACTIONS.GET_BY_ID_SUCCESS,
  payload,
});

export const getDesignationByIdFailure = (payload: string): DesignationAction => ({
  type: DESIGNATION_ACTIONS.GET_BY_ID_FAILURE,
  payload,
});

// ✅ New
export const updateDesignationRequest = (
  payload: UpdateDesignationPayload
): DesignationAction => ({
  type: DESIGNATION_ACTIONS.UPDATE_REQUEST,
  payload,
});

export const updateDesignationSuccess = (
  payload: Designation
): DesignationAction => ({
  type: DESIGNATION_ACTIONS.UPDATE_SUCCESS,
  payload,
});

export const updateDesignationFailure = (payload: string): DesignationAction => ({
  type: DESIGNATION_ACTIONS.UPDATE_FAILURE,
  payload,
});

export const clearSelectedDesignation = (): DesignationAction => ({
  type: DESIGNATION_ACTIONS.CLEAR_SELECTED,
});

export const clearDesignationError = (): DesignationAction => ({
  type: DESIGNATION_ACTIONS.CLEAR_ERROR,
});