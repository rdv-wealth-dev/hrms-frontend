import type { AttendanceAction, AttendanceState } from './attendance.types'
import { ATTENDANCE_ACTIONS } from './attendance.types'

const initialState: AttendanceState = {
  loading: false,
  error: null,
}

export function attendanceReducer(
  state = initialState,
  action: AttendanceAction,
): AttendanceState {
  switch (action.type) {
    case ATTENDANCE_ACTIONS.RESET:
      return initialState

    default:
      return state
  }
}
