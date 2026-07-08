import { all, fork } from "redux-saga/effects";

import { attendanceSaga } from "./attendance";
import { authSaga } from "./auth";
import { branchSaga } from "./branch";
import { departmentSaga } from "./department";
import { designationSaga } from "./designation"; // ✅
import { employeeSaga } from "./employee";
import { leaveSaga } from "./leave";
import { payrollSaga } from "./payroll";
import { organizationSaga } from "./organization";

export function* rootSaga() {
  yield all([
    fork(authSaga),
    fork(branchSaga),
    fork(departmentSaga),
    fork(designationSaga), // ✅
    fork(employeeSaga),
    fork(leaveSaga),
    fork(attendanceSaga),
    fork(payrollSaga),
    fork(organizationSaga),
  ]);
}