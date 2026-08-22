import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { paths } from "../../routes/paths";
import { useAuthStatus } from "../hooks/use-auth-status";

type AuthGuardProps = {
  children: ReactNode;
};

// ===========================================
// AuthGuard — blocks unauthenticated users from protected pages
// Redirects to /login, preserving the page they were trying to reach
// ===========================================

function AuthGuard({ children }: AuthGuardProps) {
  const { hasSession } = useAuthStatus();
  const location = useLocation();

  if (!hasSession) {
    return (
      <Navigate to={paths.auth.login} state={{ from: location?.pathname ?? "" }} replace />
    );
  }

  return <>{children}</>;
}

export default AuthGuard;