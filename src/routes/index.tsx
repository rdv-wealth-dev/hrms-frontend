import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { paths } from "./paths";

import AuthGuard from "../../src/auth/guards/AuthGuard";
import GuestGuard from "../../src/auth/guards/GuestGuard";
import RoleGuard from "../../src/auth/guards/RoleGuard";

import SignUpPage from "../pages/auth/SignUp";
import LoginPage from "../pages/auth/Login";
import ForgotPasswordPage from "../pages/auth/ForgotPassword";
import ResetPasswordPage from "../pages/auth/ResetPassword";
import CheckEmailPage from "../pages/auth/CheckEmail";
import VerifyEmailPage from "../pages/auth/VerifyEmail";
import ActivateAccountPage from "../pages/auth/ActivateAccount";
import DashboardPage from "../pages/dashboard/DashboardView";
import DepartmentsPage from "../pages/departments";
import DesignationsPage from "../pages/designations";
import EmployeeDirectoryPage from "../pages/employees/directory";
import EmployeeCreatePage from "../pages/employees/create";
import EmployeeListPage from "../pages/employees/list";
import SettingsPage from "../pages/settings";
import MyAttendancePage from "../pages/attendance";

function AppRoutes() {
  return (
    <BrowserRouter>
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
          path={paths.settings}
          element={
            <AuthGuard>
              <SettingsPage />
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

        <Route path="*" element={<Navigate to={paths.auth.login} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;