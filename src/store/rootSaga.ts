import { all, fork } from "redux-saga/effects";

import { attendanceSaga } from "./attendance";
import { authSaga } from "./auth";
import { departmentSaga } from "./department"; 
import { employeeSaga } from "./employee";
import { leaveSaga } from "./leave";
import { payrollSaga } from "./payroll";

export function* rootSaga() {
  yield all([
    fork(authSaga),
    fork(departmentSaga), // ✅
    fork(employeeSaga),
    fork(leaveSaga),
    fork(attendanceSaga),
    fork(payrollSaga),
  ]);
}