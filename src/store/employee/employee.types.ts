export type EmployeeState = {
  loading: boolean
  error: string | null
}

export const EMPLOYEE_ACTIONS = {
  RESET: 'employee/reset',
} as const

export type EmployeeAction = { type: typeof EMPLOYEE_ACTIONS.RESET }
