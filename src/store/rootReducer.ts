import { combineReducers } from "redux";

import { attendanceReducer } from "./attendance";
import { authReducer } from "./auth";
import { departmentReducer } from "./department";
import { designationReducer } from "./designation"; // ✅
import { employeeReducer } from "./employee";
import { leaveReducer } from "./leave";
import { payrollReducer } from "./payroll";

export const rootReducer = combineReducers({
  auth: authReducer,
  department: departmentReducer,
  designation: designationReducer, // ✅
  employee: employeeReducer,
  leave: leaveReducer,
  attendance: attendanceReducer,
  payroll: payrollReducer,
});

export type RootState = ReturnType<typeof rootReducer>;