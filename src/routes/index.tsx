import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { paths } from "./paths";

import AuthGuard from "../../src/auth/guards/AuthGuard";
import GuestGuard from "../../src/auth/guards/GuestGuard";

import SignUpPage from "../pages/auth/SignUp";
import LoginPage from "../pages/auth/Login";
import ForgotPasswordPage from "../pages/auth/ForgotPassword";
import ResetPasswordPage from "../pages/auth/ResetPassword";
import CheckEmailPage from "../pages/auth/CheckEmail";
import VerifyEmailPage from "../pages/auth/VerifyEmail";
import DashboardPage from "../pages/dashboard/DashboardView";
import DepartmentsPage from "../pages/departments";
import DesignationsPage from "../pages/designations";
import EmployeeDirectoryPage from "../pages/employees/directory";

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
        <Route path={paths.auth.resetPassword} element={<ResetPasswordPage />} />
        <Route path={paths.auth.verifyEmail} element={<VerifyEmailPage />} />

        {/* Protected — require a valid session */}
        <Route
          path={paths.dashboard}
          element={<AuthGuard><DashboardPage /></AuthGuard>}
        />
        <Route
          path={paths.departments}
          element={<AuthGuard><DepartmentsPage /></AuthGuard>}
        />
        <Route
          path={paths.designations}
          element={<AuthGuard><DesignationsPage /></AuthGuard>}
        />
        <Route
          path={paths.employees.directory}
          element={<AuthGuard><EmployeeDirectoryPage /></AuthGuard>}
        />

        <Route path="*" element={<Navigate to={paths.auth.login} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;