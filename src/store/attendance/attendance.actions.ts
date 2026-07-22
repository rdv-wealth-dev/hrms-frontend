import type { AttendanceAction } from './attendance.types'
import { ATTENDANCE_ACTIONS } from './attendance.types'

export const resetAttendanceState = (): AttendanceAction => ({
  type: ATTENDANCE_ACTIONS.RESET,
})
