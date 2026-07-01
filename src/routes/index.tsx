import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { paths } from "./paths";

import SignUpPage from "../pages/auth/SignUp";
import LoginPage from "../pages/auth/Login";
import ForgotPasswordPage from "../pages/auth/ForgotPassword";
import ResetPasswordPage from "../pages/auth/ResetPassword";
import CheckEmailPage from "../pages/auth/CheckEmail";
import VerifyEmailPage from "../pages/auth/VerifyEmail";
import DashboardPage from "../pages/dashboard/DashboardView";
import DepartmentsPage from "../pages/departments"; // ✅
import EmployeeDirectoryPage from "../pages/employees/directory";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path={paths.auth.signup} element={<SignUpPage />} />
        <Route path={paths.auth.login} element={<LoginPage />} />
        <Route path={paths.auth.forgotPassword} element={<ForgotPasswordPage />} />
        <Route path={paths.auth.resetPassword} element={<ResetPasswordPage />} />
        <Route path={paths.auth.checkEmail} element={<CheckEmailPage />} />
        <Route path={paths.auth.verifyEmail} element={<VerifyEmailPage />} />

        {/* Dashboard */}
        <Route path={paths.dashboard} element={<DashboardPage />} />

        {/* Departments */}
        <Route path={paths.departments} element={<DepartmentsPage />} />

        {/* Employees */}
        <Route path={paths.employees.directory} element={<EmployeeDirectoryPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to={paths.auth.login} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;