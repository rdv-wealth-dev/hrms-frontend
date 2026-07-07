import type { ReactNode } from "react";
import { usePermissions } from "../../hooks/usePermissions";
import type { RoleSlug } from "../../utils/roles";

type PermissionGuardProps = {
  permission?: string;
  permissions?: string[];
  allowRoles?: RoleSlug[];
  fallback?: ReactNode;
  children: ReactNode;
};

export function PermissionGuard({
  permission,
  permissions,
  allowRoles,
  fallback = null,
  children,
}: PermissionGuardProps) {
  const { hasPermission, hasAnyPermission, hasRole } = usePermissions();

  if (allowRoles && allowRoles.length > 0 && hasRole(allowRoles as RoleSlug[])) {
    return <>{children}</>;
  }

  if (permission && hasPermission(permission)) {
    return <>{children}</>;
  }

  if (permissions && permissions.length > 0 && hasAnyPermission(permissions)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

export default PermissionGuard;
