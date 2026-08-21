import { useCallback } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/rootReducer";
import type { RoleSlug } from "../../utils/roles";

// ===========================================
// useRole — central place to read the current user's role/permissions
// ===========================================

const EMPTY_PERMISSIONS: string[] = [];

export function useRole() {
  const user = useSelector((state: RootState) => state.auth?.user);

  const role = (user?.role ?? "") as RoleSlug | "";
  const permissions = user?.permissions ?? EMPTY_PERMISSIONS;

  const hasRole = useCallback(
    (allowedRoles: RoleSlug[]): boolean => allowedRoles.includes(role as RoleSlug),
    [role]
  );

  const hasPermission = useCallback(
    (permission: string): boolean => permissions.includes(permission),
    [permissions]
  );

  return { role, permissions, hasRole, hasPermission };
}