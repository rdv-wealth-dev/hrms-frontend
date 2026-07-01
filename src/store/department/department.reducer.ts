import type { DepartmentAction, DepartmentState } from "./department.types";
import { DEPARTMENT_ACTIONS } from "./department.types";

const initialState: DepartmentState = {
  departments: [],
  selectedDepartment: null,
  total: 0,
  totalPages: 0,
  pageNumber: 1,
  pageSize: 10,
  loading: false,
  submitting: false,
  error: null,
};

export function departmentReducer(
  state = initialState,
  action: DepartmentAction
): DepartmentState {
  switch (action.type) {

    // ==========================
    // List
    // ==========================

    case DEPARTMENT_ACTIONS.LIST_REQUEST:
      return { ...state, loading: true, error: null };

    case DEPARTMENT_ACTIONS.LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        departments: action.payload.items ?? [],
        total: action.payload.total ?? 0,
        totalPages: action.payload.totalPages ?? 0,
        pageNumber: action.payload.pageNumber ?? 1,
        pageSize: action.payload.pageSize ?? 10,
        error: null,
      };

    case DEPARTMENT_ACTIONS.LIST_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // ==========================
    // Get By ID
    // ==========================

    case DEPARTMENT_ACTIONS.GET_BY_ID_REQUEST:
      return { ...state, loading: true, error: null, selectedDepartment: null };

    case DEPARTMENT_ACTIONS.GET_BY_ID_SUCCESS:
      return { ...state, loading: false, selectedDepartment: action.payload };

    case DEPARTMENT_ACTIONS.GET_BY_ID_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // ==========================
    // Create
    // ==========================

    case DEPARTMENT_ACTIONS.CREATE_REQUEST:
      return { ...state, submitting: true, error: null };

    case DEPARTMENT_ACTIONS.CREATE_SUCCESS:
      return {
        ...state,
        submitting: false,
        // ✅ prepend new department to list
        departments: [action.payload, ...state.departments],
        total: state.total + 1,
        error: null,
      };

    case DEPARTMENT_ACTIONS.CREATE_FAILURE:
      return { ...state, submitting: false, error: action.payload };

    // ==========================
    // Update
    // ==========================

    case DEPARTMENT_ACTIONS.UPDATE_REQUEST:
      return { ...state, submitting: true, error: null };

    case DEPARTMENT_ACTIONS.UPDATE_SUCCESS:
      return {
        ...state,
        submitting: false,
        // ✅ replace updated department in list
        departments: state.departments.map((d) =>
          d._id === action.payload?._id ? action.payload : d
        ),
        selectedDepartment:
          state.selectedDepartment?._id === action.payload?._id
            ? action.payload
            : state.selectedDepartment,
        error: null,
      };

    case DEPARTMENT_ACTIONS.UPDATE_FAILURE:
      return { ...state, submitting: false, error: action.payload };

    // ==========================
    // Misc
    // ==========================

    case DEPARTMENT_ACTIONS.CLEAR_SELECTED:
      return { ...state, selectedDepartment: null };

    case DEPARTMENT_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };

    default:
      return state;
  }
}