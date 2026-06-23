import type { EmployeeAction, EmployeeState } from './employee.types'
import { EMPLOYEE_ACTIONS } from './employee.types'

const initialState: EmployeeState = {
  loading: false,
  error: null,
}

export function employeeReducer(
  state = initialState,
  action: EmployeeAction,
): EmployeeState {
  switch (action.type) {
    case EMPLOYEE_ACTIONS.RESET:
      return initialState

    default:
      return state
  }
}
