export type PayrollState = {
  loading: boolean
  error: string | null
}

export const PAYROLL_ACTIONS = {
  RESET: 'payroll/reset',
} as const

export type PayrollAction = { type: typeof PAYROLL_ACTIONS.RESET }
