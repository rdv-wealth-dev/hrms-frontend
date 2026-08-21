import type { BranchState, BranchAction } from "./branch.types";
import { BRANCH_ACTIONS } from "./branch.types";

const initialState: BranchState = {
  branches: [],
  headOffice: null,
  loading: false,
  loadingHeadOffice: false,
  submitting: false,
  success: false,
  error: null,
};

export function branchReducer(
  state = initialState,
  action: BranchAction
): BranchState {
  switch (action.type) {
    case BRANCH_ACTIONS.LIST_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case BRANCH_ACTIONS.LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        branches: action.payload,
        error: null,
      };

    case BRANCH_ACTIONS.LIST_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case BRANCH_ACTIONS.CREATE_REQUEST:
      return {
        ...state,
        submitting: true,
        success: false,
        error: null,
      };

    case BRANCH_ACTIONS.CREATE_SUCCESS:
      return {
        ...state,
        submitting: false,
        success: true,
        branches: [...state.branches, action.payload],
        error: null,
      };

    case BRANCH_ACTIONS.CREATE_FAILURE:
      return {
        ...state,
        submitting: false,
        success: false,
        error: action.payload,
      };

    case BRANCH_ACTIONS.RESET_STATUS:
      return {
        ...state,
        submitting: false,
        success: false,
        error: null,
      };

    case BRANCH_ACTIONS.UPDATE_REQUEST:
      return {
        ...state,
        submitting: true,
        success: false,
        error: null,
      };

    case BRANCH_ACTIONS.UPDATE_SUCCESS:
      return {
        ...state,
        submitting: false,
        success: true,
        branches: state.branches.map((b) =>
          b._id === action.payload._id ? action.payload : b
        ),
        headOffice:
          state.headOffice && state.headOffice._id === action.payload._id
            ? action.payload
            : state.headOffice,
        error: null,
      };

    case BRANCH_ACTIONS.UPDATE_FAILURE:
      return {
        ...state,
        submitting: false,
        success: false,
        error: action.payload,
      };

    case BRANCH_ACTIONS.DELETE_REQUEST:
      return {
        ...state,
        submitting: true,
        success: false,
        error: null,
      };

    case BRANCH_ACTIONS.DELETE_SUCCESS:
      return {
        ...state,
        submitting: false,
        success: true,
        branches: state.branches.filter((b) => b._id !== action.payload),
        headOffice:
          state.headOffice && state.headOffice._id === action.payload
            ? null
            : state.headOffice,
        error: null,
      };

    case BRANCH_ACTIONS.DELETE_FAILURE:
      return {
        ...state,
        submitting: false,
        success: false,
        error: action.payload,
      };

    case BRANCH_ACTIONS.HEAD_OFFICE_REQUEST:
      return {
        ...state,
        loadingHeadOffice: true,
        error: null,
      };

    case BRANCH_ACTIONS.HEAD_OFFICE_SUCCESS:
      return {
        ...state,
        loadingHeadOffice: false,
        headOffice: action.payload,
        error: null,
      };

    case BRANCH_ACTIONS.HEAD_OFFICE_FAILURE:
      return {
        ...state,
        loadingHeadOffice: false,
      };

    case BRANCH_ACTIONS.SEED_REQUEST:
      return {
        ...state,
        submitting: true,
        success: false,
        error: null,
      };

    case BRANCH_ACTIONS.SEED_SUCCESS:
      return {
        ...state,
        submitting: false,
        success: true,
        error: null,
      };

    case BRANCH_ACTIONS.SEED_FAILURE:
      return {
        ...state,
        submitting: false,
        success: false,
        error: action.payload,
      };

    default:
      return state;
  }
}
