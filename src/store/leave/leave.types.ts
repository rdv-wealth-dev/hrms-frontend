export type LeaveState = {
  loading: boolean
  error: string | null
}

export const LEAVE_ACTIONS = {
  RESET: 'leave/reset',
} as const

export type LeaveAction = { type: typeof LEAVE_ACTIONS.RESET }
