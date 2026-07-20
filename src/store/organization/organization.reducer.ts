import type { OrganizationState, OrganizationAction } from "./organization.types";
import { ORGANIZATION_ACTIONS } from "./organization.types";

const initialState: OrganizationState = {
  organization: null,
  loading: false,
  submitting: false,
  success: false,
  error: null,
};

export function organizationReducer(
  state = initialState,
  action: OrganizationAction
): OrganizationState {
  switch (action.type) {
    case ORGANIZATION_ACTIONS.LOAD_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case ORGANIZATION_ACTIONS.LOAD_SUCCESS:
      return {
        ...state,
        loading: false,
        organization: action.payload,
        error: null,
      };

    case ORGANIZATION_ACTIONS.LOAD_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case ORGANIZATION_ACTIONS.UPDATE_REQUEST:
    case ORGANIZATION_ACTIONS.UPDATE_MODS_REQUEST:
    case ORGANIZATION_ACTIONS.UPDATE_STATUTORY_REQUEST:
    case ORGANIZATION_ACTIONS.UPDATE_MANDATORY_DOCS_REQUEST:
      return {
        ...state,
        submitting: true,
        success: false,
        error: null,
      };

    case ORGANIZATION_ACTIONS.UPDATE_SUCCESS:
    case ORGANIZATION_ACTIONS.UPDATE_MODS_SUCCESS:
    case ORGANIZATION_ACTIONS.UPDATE_STATUTORY_SUCCESS:
    case ORGANIZATION_ACTIONS.UPDATE_MANDATORY_DOCS_SUCCESS:
      return {
        ...state,
        submitting: false,
        success: true,
        organization: action.payload,
        error: null,
      };

    case ORGANIZATION_ACTIONS.UPDATE_FAILURE:
    case ORGANIZATION_ACTIONS.UPDATE_MODS_FAILURE:
    case ORGANIZATION_ACTIONS.UPDATE_STATUTORY_FAILURE:
    case ORGANIZATION_ACTIONS.UPDATE_MANDATORY_DOCS_FAILURE:
      return {
        ...state,
        submitting: false,
        success: false,
        error: action.payload,
      };

    case ORGANIZATION_ACTIONS.RESET_STATUS:
      return {
        ...state,
        success: false,
        error: null,
      };

    default:
      return state;
  }
}
