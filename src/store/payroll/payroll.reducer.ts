import type { PayrollAction, PayrollState } from './payroll.types'
import { PAYROLL_ACTIONS } from './payroll.types'

const initialState: PayrollState = {
  loading: false,
  error: null,
}

export function payrollReducer(
  state = initialState,
  action: PayrollAction,
): PayrollState {
  switch (action.type) {
    case PAYROLL_ACTIONS.RESET:
      return initialState

    default:
      return state
  }
}
