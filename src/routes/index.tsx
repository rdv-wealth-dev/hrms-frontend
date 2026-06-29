import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import { paths } from './paths'

import SignUpPage from '../pages/auth/SignUp'
import LoginPage from '../pages/auth/Login'
import ForgotPasswordPage from '../pages/auth/ForgotPassword'
import ResetPasswordPage from "../pages/auth/ResetPassword";
import EmployeeDirectoryPage from "../pages/employees/directory";
import DashboardPage from "../pages/dashboard/DashboardView";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={paths.auth.signup} element={<SignUpPage />} />

        <Route path={paths.auth.login} element={<LoginPage />} />

        <Route path={paths.auth.forgotPassword} element={<ForgotPasswordPage />} />
        <Route path={paths.auth.resetPassword} element={<ResetPasswordPage />} />
        <Route path={paths.employees.directory} element={<EmployeeDirectoryPage />} />
        <Route path={paths.dashboard} element={<DashboardPage />} />
        <Route path="*" element={<Navigate to={paths.auth.signup} replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes