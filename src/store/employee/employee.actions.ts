import type { EmployeeAction } from './employee.types'
import { EMPLOYEE_ACTIONS } from './employee.types'

export const resetEmployeeState = (): EmployeeAction => ({
  type: EMPLOYEE_ACTIONS.RESET,
})
