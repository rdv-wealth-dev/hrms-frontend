import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import { paths } from './paths'

import SignUpPage from '../pages/auth/SignUp'
import LoginPage from '../pages/auth/Login'
import ForgotPasswordPage from '../pages/auth/ForgotPassword'
import ResetPasswordPage from "../pages/auth/ResetPassword";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={paths.auth.signup} element={<SignUpPage />} />

        <Route path={paths.auth.login} element={<LoginPage />} />

        <Route path="*" element={<Navigate to={paths.auth.signup} replace />} />
        <Route path={paths.auth.forgotPassword} element={<ForgotPasswordPage />} />
        <Route path={paths.auth.resetPassword} element={<ResetPasswordPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes