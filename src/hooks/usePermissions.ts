import { useSelector } from "react-redux";
import type { RootState } from "../store/rootReducer";
import { useRole } from "../auth/hooks/use-role";
import { ROLE_PERMISSIONS } from "../utils/permissions";

export function usePermissions() {
  const { role, permissions: userPermissions, hasRole } = useRole();
  const user = useSelector((state: RootState) => state.auth?.user);

  const isSuperAdmin = role === "ORG_ADMIN" || role === "HR_ADMIN" || (role as string) === "HR" || user?.isSuperAdmin === true;

  // Resolve permissions from either user payload or fallback role mapping
  const permissions = userPermissions.length > 0
    ? userPermissions
    : (ROLE_PERMISSIONS[role] ?? []);

  const hasPermission = (perm: string): boolean => {
    if (isSuperAdmin) return true;
    if ((role === "MANAGER" || role === "PRODUCT_MANAGER") && (perm === "attendance.approve" || perm === "leave.approve" || perm === "attendance.read")) return true;
    return permissions.includes(perm);
  };

  const hasAnyPermission = (perms: string[]): boolean => {
    if (isSuperAdmin) return true;
    return perms.some((p) => permissions.includes(p));
  };

  const hasAllPermissions = (perms: string[]): boolean => {
    if (isSuperAdmin) return true;
    return perms.every((p) => permissions.includes(p));
  };

  return {
    role,
    permissions,
    isSuperAdmin,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
  };
}
