import { useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../store/rootReducer";
import { useRole } from "../auth/hooks/use-role";
import { ROLE_PERMISSIONS } from "../utils/permissions";

const EMPTY_PERMISSIONS: string[] = [];

export const canAccess = (userPermissions: string[], permission: string): boolean => {
  if (!Array.isArray(userPermissions)) return false;
  return userPermissions.includes(permission);
};

export function usePermissions() {
  const { role, permissions: userPermissions, hasRole } = useRole();
  const user = useSelector((state: RootState) => state.auth?.user);

  const isSuperAdmin = role === "ORG_ADMIN" || role === "HR_ADMIN" || (role as string) === "HR" || user?.isSuperAdmin === true;

  // Resolve permissions from either user payload or fallback role mapping
  const permissions = useMemo(() => {
    if (userPermissions && userPermissions.length > 0) return userPermissions;
    if (role && ROLE_PERMISSIONS[role]) return ROLE_PERMISSIONS[role];
    return EMPTY_PERMISSIONS;
  }, [userPermissions, role]);

  const hasPermission = useCallback(
    (perm: string): boolean => {
      if (isSuperAdmin) return true;
      const isManagerOrLead =
        role === "MANAGER" ||
        role === "PRODUCT_MANAGER" ||
        role === "TEAM_LEADER" ||
        (role as string) === "TEAM_LEAD";
      if (isManagerOrLead && (perm === "attendance.approve" || perm === "leave.approve" || perm === "attendance.read")) return true;
      return permissions.includes(perm);
    },
    [isSuperAdmin, role, permissions]
  );

  const hasAnyPermission = useCallback(
    (perms: string[]): boolean => {
      if (isSuperAdmin) return true;
      return perms.some((p) => permissions.includes(p));
    },
    [isSuperAdmin, permissions]
  );

  const hasAllPermissions = useCallback(
    (perms: string[]): boolean => {
      if (isSuperAdmin) return true;
      return perms.every((p) => permissions.includes(p));
    },
    [isSuperAdmin, permissions]
  );

  return {
    role,
    permissions,
    isSuperAdmin,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    canCreateEmployee: hasPermission("employee.create"),
    canUpdateEmployee: hasPermission("employee.update"),
    canDeleteEmployee: hasPermission("employee.delete"),
    canCreateTeam: hasPermission("team.create"),
    canUpdateTeam: hasPermission("team.update"),
    canDeleteTeam: hasPermission("team.delete"),
    canReadTeam: hasPermission("team.read"),
    canApproveLeave: hasPermission("leave.approve"),
    canCreateLeave: hasPermission("leave.create"),
    canApproveAttendance: hasPermission("attendance.approve"),
  };
}
