import { combineReducers } from 'redux'

import { attendanceReducer } from './attendance'
import { authReducer } from './auth'
import { employeeReducer } from './employee'
import { leaveReducer } from './leave'
import { payrollReducer } from './payroll'

export const rootReducer = combineReducers({
  auth: authReducer,
  employee: employeeReducer,
  leave: leaveReducer,
  attendance: attendanceReducer,
  payroll: payrollReducer,
})

export type RootState = ReturnType<typeof rootReducer>
