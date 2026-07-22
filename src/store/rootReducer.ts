import { combineReducers } from "redux";

import { attendanceReducer } from "./attendance";
import { authReducer } from "./auth";
import { branchReducer } from "./branch";
import { departmentReducer } from "./department";
import { designationReducer } from "./designation"; // ✅
import { employeeReducer } from "./employee";
import { leaveReducer } from "./leave";
import { payrollReducer } from "./payroll";
import { organizationReducer } from "./organization";

export const rootReducer = combineReducers({
  auth: authReducer,
  branch: branchReducer,
  department: departmentReducer,
  designation: designationReducer, // ✅
  employee: employeeReducer,
  leave: leaveReducer,
  attendance: attendanceReducer,
  payroll: payrollReducer,
  organization: organizationReducer,
});

export type RootState = ReturnType<typeof rootReducer>;