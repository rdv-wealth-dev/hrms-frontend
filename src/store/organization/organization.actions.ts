import { ORGANIZATION_ACTIONS } from "./organization.types";
import type {
  Organization,
  UpdateOrganizationRequest,
  UpdateModulesRequest,
  UpdateStatutoryRequest,
} from "./organization.types";

export const loadOrganizationRequest = () => ({
  type: ORGANIZATION_ACTIONS.LOAD_REQUEST,
});

export const loadOrganizationSuccess = (organization: Organization) => ({
  type: ORGANIZATION_ACTIONS.LOAD_SUCCESS,
  payload: organization,
});

export const loadOrganizationFailure = (error: string) => ({
  type: ORGANIZATION_ACTIONS.LOAD_FAILURE,
  payload: error,
});

export const updateOrganizationRequest = (payload: UpdateOrganizationRequest) => ({
  type: ORGANIZATION_ACTIONS.UPDATE_REQUEST,
  payload,
});

export const updateOrganizationSuccess = (organization: Organization) => ({
  type: ORGANIZATION_ACTIONS.UPDATE_SUCCESS,
  payload: organization,
});

export const updateOrganizationFailure = (error: string) => ({
  type: ORGANIZATION_ACTIONS.UPDATE_FAILURE,
  payload: error,
});

export const updateModulesRequest = (payload: UpdateModulesRequest) => ({
  type: ORGANIZATION_ACTIONS.UPDATE_MODS_REQUEST,
  payload,
});

export const updateModulesSuccess = (organization: Organization) => ({
  type: ORGANIZATION_ACTIONS.UPDATE_MODS_SUCCESS,
  payload: organization,
});

export const updateModulesFailure = (error: string) => ({
  type: ORGANIZATION_ACTIONS.UPDATE_MODS_FAILURE,
  payload: error,
});

export const updateStatutoryRequest = (payload: UpdateStatutoryRequest) => ({
  type: ORGANIZATION_ACTIONS.UPDATE_STATUTORY_REQUEST,
  payload,
});

export const updateStatutorySuccess = (organization: Organization) => ({
  type: ORGANIZATION_ACTIONS.UPDATE_STATUTORY_SUCCESS,
  payload: organization,
});

export const updateStatutoryFailure = (error: string) => ({
  type: ORGANIZATION_ACTIONS.UPDATE_STATUTORY_FAILURE,
  payload: error,
});

export const resetOrganizationStatus = () => ({
  type: ORGANIZATION_ACTIONS.RESET_STATUS,
});
