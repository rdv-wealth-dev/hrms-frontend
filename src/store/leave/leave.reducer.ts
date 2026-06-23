import type { LeaveAction, LeaveState } from './leave.types'
import { LEAVE_ACTIONS } from './leave.types'

const initialState: LeaveState = {
  loading: false,
  error: null,
}

export function leaveReducer(
  state = initialState,
  action: LeaveAction,
): LeaveState {
  switch (action.type) {
    case LEAVE_ACTIONS.RESET:
      return initialState

    default:
      return state
  }
}
