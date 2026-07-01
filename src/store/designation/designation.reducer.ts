import type { DesignationAction, DesignationState } from "./designation.types";
import { DESIGNATION_ACTIONS } from "./designation.types";

const initialState: DesignationState = {
  designations: [],
  selectedDesignation: null,
  total: 0,
  pageNumber: 1,
  pageSize: 10,
  totalPages: 0,
  submitting: false,
  loading: false,
  error: null,
};

export function designationReducer(
  state = initialState,
  action: DesignationAction
): DesignationState {
  switch (action.type) {

    // ==========================
    // Create
    // ==========================

    case DESIGNATION_ACTIONS.CREATE_REQUEST:
      return { ...state, submitting: true, error: null };

    case DESIGNATION_ACTIONS.CREATE_SUCCESS:
      return {
        ...state,
        submitting: false,
        designations: [action.payload, ...state.designations],
        total: state.total + 1,
        error: null,
      };

    case DESIGNATION_ACTIONS.CREATE_FAILURE:
      return { ...state, submitting: false, error: action.payload };

    // ==========================
    // List
    // ==========================

    case DESIGNATION_ACTIONS.LIST_REQUEST:
      return { ...state, loading: true, error: null };

    case DESIGNATION_ACTIONS.LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        designations: action.payload?.items ?? [],
        total: action.payload?.total ?? 0,
        pageNumber: action.payload?.pageNumber ?? 1,
        pageSize: action.payload?.pageSize ?? 10,
        totalPages: action.payload?.totalPages ?? 0,
        error: null,
      };

    case DESIGNATION_ACTIONS.LIST_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // ==========================
    // Get By ID
    // ==========================

    case DESIGNATION_ACTIONS.GET_BY_ID_REQUEST:
      return { ...state, loading: true, error: null, selectedDesignation: null };

    case DESIGNATION_ACTIONS.GET_BY_ID_SUCCESS:
      return { ...state, loading: false, selectedDesignation: action.payload, error: null };

    case DESIGNATION_ACTIONS.GET_BY_ID_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // ==========================
    // Update
    // ==========================

    case DESIGNATION_ACTIONS.UPDATE_REQUEST:
      return { ...state, submitting: true, error: null };

    case DESIGNATION_ACTIONS.UPDATE_SUCCESS:
      return {
        ...state,
        submitting: false,
        designations: state.designations.map((d) =>
          d._id === action.payload?._id ? action.payload : d
        ),
        selectedDesignation:
          state.selectedDesignation?._id === action.payload?._id
            ? action.payload
            : state.selectedDesignation,
        error: null,
      };

    case DESIGNATION_ACTIONS.UPDATE_FAILURE:
      return { ...state, submitting: false, error: action.payload };

    // ==========================
    // Misc
    // ==========================

    case DESIGNATION_ACTIONS.CLEAR_SELECTED:
      return { ...state, selectedDesignation: null };

    case DESIGNATION_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };

    default:
      return state;
  }
}