import { ORGANIZATION_ACTIONS } from "./organization.types";
import type { Organization, UpdateOrganizationRequest } from "./organization.types";

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

export const resetOrganizationStatus = () => ({
  type: ORGANIZATION_ACTIONS.RESET_STATUS,
});
