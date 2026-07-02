import { useSelector } from "react-redux";
import type { RootState } from "../../store/rootReducer";
import type { RoleSlug } from "../../utils/roles";

// ===========================================
// useRole — central place to read the current user's role/permissions
// ===========================================

export function useRole() {
  const user = useSelector((state: RootState) => state.auth?.user);

  const role = (user?.role ?? "") as RoleSlug | "";
  const permissions = user?.permissions ?? [];

  const hasRole = (allowedRoles: RoleSlug[]): boolean =>
    allowedRoles.includes(role as RoleSlug);

  const hasPermission = (permission: string): boolean =>
    permissions.includes(permission);

  return { role, permissions, hasRole, hasPermission };
}