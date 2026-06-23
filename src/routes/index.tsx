import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import { paths } from './paths'
import SignUpPage from '../pages/auth/SignUp'

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={paths.auth.signup} element={<SignUpPage />} />

        <Route
          path="*"
          element={<Navigate to={paths.auth.signup} replace />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
