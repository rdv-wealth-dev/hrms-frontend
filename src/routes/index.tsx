import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { paths } from "./paths";

import AuthGuard from "../../src/auth/guards/AuthGuard";
import GuestGuard from "../../src/auth/guards/GuestGuard";
import RoleGuard from "../../src/auth/guards/RoleGuard";

import PageLoader from "../components/loader/PageLoader";

const SignUpPage = lazy(() => import("../pages/auth/SignUp"));
const LoginPage = lazy(() => import("../pages/auth/Login"));
const ForgotPasswordPage = lazy(() => import("../pages/auth/ForgotPassword"));
const ResetPasswordPage = lazy(() => import("../pages/auth/ResetPassword"));
const CheckEmailPage = lazy(() => import("../pages/auth/CheckEmail"));
const VerifyEmailPage = lazy(() => import("../pages/auth/VerifyEmail"));
const ActivateAccountPage = lazy(() => import("../pages/auth/ActivateAccount"));
const DashboardPage = lazy(() => import("../pages/dashboard/DashboardView"));
const DepartmentsPage = lazy(() => import("../pages/departments"));
const DesignationsPage = lazy(() => import("../pages/designations"));
const BranchesPage = lazy(() => import("../pages/branches/index"));
const EmployeeDirectoryPage = lazy(() => import("../pages/employees/directory"));
const EmployeeCreatePage = lazy(() => import("../pages/employees/create"));
const EmployeeListPage = lazy(() => import("../pages/employees/list"));
const EmployeeDetailPage = lazy(() => import("../pages/employees/detail"));
const SettingsPage = lazy(() => import("../pages/settings"));
const MyAttendancePage = lazy(() => import("../pages/attendance"));
const ProfilePage = lazy(() => import("../pages/profile"));
const RegularizationListPage = lazy(() => import("../pages/attendance/regularizations"));
const HolidaysPage = lazy(() => import("../pages/holidays"));
const MyLeavePage = lazy(() => import("../pages/leave"));
const LeaveApprovalsPage = lazy(() => import("../pages/leave-approvals"));
const ReportsPage = lazy(() => import("../pages/reports"));
const DocumentVerificationPage = lazy(() => import("../pages/hr/documents-verification"));

function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
        {/* Guest-only — redirect to /dashboard if already logged in */}
        <Route
          path={paths.auth.signup}
          element={<GuestGuard><SignUpPage /></GuestGuard>}
        />
        <Route
          path={paths.auth.login}
          element={<GuestGuard><LoginPage /></GuestGuard>}
        />
        <Route
          path={paths.auth.forgotPassword}
          element={<GuestGuard><ForgotPasswordPage /></GuestGuard>}
        />
        <Route
          path={paths.auth.checkEmail}
          element={<GuestGuard><CheckEmailPage /></GuestGuard>}
        />
        {/* Intentionally NOT wrapped in GuestGuard — see note in GuestGuard.tsx */}
        <Route path={paths.auth.activateAccount} element={<ActivateAccountPage />} />
        <Route path={paths.auth.resetPassword} element={<ResetPasswordPage />} />
        <Route path={paths.auth.verifyEmail} element={<VerifyEmailPage />} />

        {/* Protected — require a valid session */}
        <Route
          path={paths.dashboard}
          element={<AuthGuard><DashboardPage /></AuthGuard>}
        />
        <Route
          path={paths.departments}
          element={
            <AuthGuard>
              <RoleGuard permission="department.read">
                <DepartmentsPage />
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path={paths.designations}
          element={
            <AuthGuard>
              <RoleGuard permission="designation.read">
                <DesignationsPage />
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path={paths.branches}
          element={
            <AuthGuard>
              <RoleGuard permission="branch.read">
                <BranchesPage />
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path={paths.employees.directory}
          element={
            <AuthGuard>
              <RoleGuard permission="employee.read">
                <EmployeeDirectoryPage />
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path={paths.employees.create}
          element={
            <AuthGuard>
              <RoleGuard permission="employee.create">
                <EmployeeCreatePage />
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path={paths.employees.list}
          element={
            <AuthGuard>
              <RoleGuard permission="employee.read">
                <EmployeeListPage />
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path={paths.employees.detail}
          element={
            <AuthGuard>
              <RoleGuard permission="employee.read">
                <EmployeeDetailPage />
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path={paths.settings}
          element={
            <AuthGuard>
              <RoleGuard permission="settings.read">
                <SettingsPage />
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path={paths.attendance}
          element={
            <AuthGuard>
              <MyAttendancePage />
            </AuthGuard>
          }
        />
        <Route
          path={paths.leave}
          element={
            <AuthGuard>
              <MyLeavePage />
            </AuthGuard>
          }
        />
        <Route
          path={paths.profile}
          element={
            <AuthGuard>
              <ProfilePage />
            </AuthGuard>
          }
        />
        <Route
          path={paths.leaveApprovals}
          element={
            <AuthGuard>
              <RoleGuard permission="leave.approve">
                <LeaveApprovalsPage />
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path={paths.holidays}
          element={
            <AuthGuard>
              <RoleGuard permission="leave.read">
                <HolidaysPage />
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path={paths.attendanceRegularizations}
          element={
            <AuthGuard>
              <RoleGuard permission="attendance.approve">
                <RegularizationListPage />
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path={paths.reports}
          element={
            <AuthGuard>
              <RoleGuard permission="report.read">
                <ReportsPage />
              </RoleGuard>
            </AuthGuard>
          }
        />

        <Route
          path={paths.documentVerification}
          element={
            <AuthGuard>
              <RoleGuard permission="document.read">
                <DocumentVerificationPage />
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route path="*" element={<Navigate to={paths.auth.login} replace />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
  );
}

export default AppRoutes;