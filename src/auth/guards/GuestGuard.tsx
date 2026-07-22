import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { paths } from "../../routes/paths";
import { useAuthStatus } from "../hooks/use-auth-status";

type GuestGuardProps = {
  children: ReactNode;
};

// ===========================================
// GuestGuard — blocks already-authenticated users from guest-only pages
// (login, signup, forgot-password, check-email)
// Redirects straight to the dashboard instead.
//
// NOTE: verify-email and reset-password are intentionally NOT wrapped with
// this guard anywhere in routes/index.tsx — a logged-in user (e.g. on
// another tab) may still need to complete verification or a password
// reset via a link, and bouncing them away would break that flow.
// ===========================================

function GuestGuard({ children }: GuestGuardProps) {
  const { hasSession } = useAuthStatus();

  if (hasSession) {
    return <Navigate to={paths.dashboard} replace />;
  }

  return <>{children}</>;
}

export default GuestGuard;