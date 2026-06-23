export type AttendanceState = {
  loading: boolean
  error: string | null
}

export const ATTENDANCE_ACTIONS = {
  RESET: 'attendance/reset',
} as const

export type AttendanceAction = { type: typeof ATTENDANCE_ACTIONS.RESET }
