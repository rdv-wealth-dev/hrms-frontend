import type { ReactNode } from "react";

import UnauthorizedScreen from "../../components/unauthorized/UnauthorizedScreen";
import { useRole } from "../hooks/use-role";
import type { RoleSlug } from "../../utils/roles";

type RoleGuardProps = {
  children: ReactNode;
  allow?: RoleSlug[];       // roles permitted — if omitted, permission check is used instead
  permission?: string;      // e.g. "employee.create" — checked against user.permissions
};

// ===========================================
// RoleGuard — blocks a specific PAGE for roles/permissions that shouldn't see it.
// Unlike AuthGuard/GuestGuard, this does NOT redirect — it stays on the same
// URL and shows an inline 403 screen with a "Go Back" button.
//
// Use `allow` for a fixed role allowlist, or `permission` for a granular
// permission-string check (matches your backend's checkPermission() pattern).
// If both are provided, the user must satisfy BOTH.
// If neither is provided, this guard passes everyone through (no-op).
// ===========================================

function RoleGuard({ children, allow, permission }: RoleGuardProps) {
  const { hasRole, hasPermission, role } = useRole();

  // ORG_ADMIN always passes, mirroring the backend's checkPermission() bypass
  if (role === "ORG_ADMIN") {
    return <>{children}</>;
  }

  if (allow && allow.length > 0 && !hasRole(allow)) {
    return <UnauthorizedScreen />;
  }

  if (permission && !hasPermission(permission)) {
    return <UnauthorizedScreen />;
  }

  return <>{children}</>;
}

export default RoleGuard;