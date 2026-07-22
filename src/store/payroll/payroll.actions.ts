import type { PayrollAction } from './payroll.types'
import { PAYROLL_ACTIONS } from './payroll.types'

export const resetPayrollState = (): PayrollAction => ({
  type: PAYROLL_ACTIONS.RESET,
})
