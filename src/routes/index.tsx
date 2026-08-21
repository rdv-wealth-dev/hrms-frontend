import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { paths } from "./paths";

import AuthGuard from "../../src/auth/guards/AuthGuard";
import GuestGuard from "../../src/auth/guards/GuestGuard";
import RoleGuard from "../../src/auth/guards/RoleGuard";

import PageLoader from "../components/loader/PageLoader";
import DashboardLayout from "../layouts/dashboard/DashboardLayout";

const SignUpPage = lazy(() => import("../pages/auth/SignUp"));
const LoginPage = lazy(() => import("../pages/auth/Login"));
const ForgotPasswordPage = lazy(() => import("../pages/auth/ForgotPassword"));
const ResetPasswordPage = lazy(() => import("../pages/auth/ResetPassword"));
const CheckEmailPage = lazy(() => import("../pages/auth/CheckEmail"));
const VerifyEmailPage = lazy(() => import("../pages/auth/VerifyEmail"));
const ActivateAccountPage = lazy(() => import("../pages/auth/ActivateAccount"));
const ChangePasswordPage   = lazy(() => import("../pages/auth/ChangePassword"));
const DashboardPage = lazy(() => import("../pages/dashboard/DashboardView"));
const DepartmentsPage = lazy(() => import("../pages/departments"));
const DesignationsPage = lazy(() => import("../pages/designations"));
const BranchesPage = lazy(() => import("../pages/branches/index"));
const EmployeeDirectoryPage = lazy(() => import("../pages/employees/directory"));
const EmployeeCreatePage = lazy(() => import("../pages/employees/create"));
const EmployeeListPage = lazy(() => import("../pages/employees/list"));
const EmployeeDetailPage = lazy(() => import("../pages/employees/detail"));
const SettingsPage = lazy(() => import("../pages/settings"));

const ProfilePage = lazy(() => import("../pages/profile"));
const OnboardingPage = lazy(() => import("../pages/onboarding"));
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

        {/* Change password — authenticated but must change before proceeding */}
        <Route
          path={paths.auth.changePassword}
          element={<AuthGuard><ChangePasswordPage /></AuthGuard>}
        />

        {/* Protected Dashboard Routes — wrapped globally with AuthGuard and DashboardLayout */}
        <Route
          element={
            <AuthGuard>
              <DashboardLayout />
            </AuthGuard>
          }
        >
          <Route path={paths.dashboard} element={<DashboardPage />} />
          <Route path={paths.onboarding} element={<OnboardingPage />} />
          <Route
            path={paths.departments}
            element={
              <RoleGuard permission="department.read">
                <DepartmentsPage />
              </RoleGuard>
            }
          />
          <Route
            path={paths.designations}
            element={
              <RoleGuard permission="designation.read">
                <DesignationsPage />
              </RoleGuard>
            }
          />
          <Route
            path={paths.branches}
            element={
              <RoleGuard permission="branch.read">
                <BranchesPage />
              </RoleGuard>
            }
          />
          <Route
            path={paths.employees.directory}
            element={
              <RoleGuard permission="employee.read">
                <EmployeeDirectoryPage />
              </RoleGuard>
            }
          />
          <Route
            path={paths.employees.create}
            element={
              <RoleGuard permission="employee.create">
                <EmployeeCreatePage />
              </RoleGuard>
            }
          />
          <Route
            path={paths.employees.list}
            element={
              <RoleGuard permission="employee.read">
                <EmployeeListPage />
              </RoleGuard>
            }
          />
          <Route
            path={paths.employees.detail}
            element={
              <RoleGuard permission="employee.read">
                <EmployeeDetailPage />
              </RoleGuard>
            }
          />
          <Route
            path={paths.settings}
            element={
              <RoleGuard permission="settings.read">
                <SettingsPage />
              </RoleGuard>
            }
          />
          <Route path={paths.leave} element={<MyLeavePage />} />
          <Route path={paths.profile} element={<ProfilePage />} />
          <Route
            path={paths.leaveApprovals}
            element={
              <RoleGuard permission="leave.approve">
                <LeaveApprovalsPage />
              </RoleGuard>
            }
          />
          <Route
            path={paths.holidays}
            element={
              <RoleGuard permission="leave.read">
                <HolidaysPage />
              </RoleGuard>
            }
          />
          <Route
            path={paths.attendanceRegularizations}
            element={<RegularizationListPage />}
          />
          <Route
            path={paths.reports}
            element={
              <RoleGuard permission="report.read">
                <ReportsPage />
              </RoleGuard>
            }
          />
          <Route
            path={paths.documentVerification}
            element={
              <RoleGuard permission="document.read">
                <DocumentVerificationPage />
              </RoleGuard>
            }
          />
        </Route>

        <Route
          path={paths.attendance}
          element={
            <Navigate to={`${paths.profile}?tab=attendance`} replace />
          }
        />
        <Route path="*" element={<Navigate to={paths.auth.login} replace />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
  );
}

export default AppRoutes;