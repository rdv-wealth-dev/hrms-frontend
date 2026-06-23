import type { LeaveAction } from './leave.types'
import { LEAVE_ACTIONS } from './leave.types'

export const resetLeaveState = (): LeaveAction => ({
  type: LEAVE_ACTIONS.RESET,
})
