import { useSelector } from "react-redux";
import type { RootState } from "../store/rootReducer";

/**
 * Resolves the most appropriate branchId for the currently logged-in user.
 *
 * Priority order:
 *  1. user.branchIds[0]  — branch-scoped roles (HR_ADMIN, BRANCH_ADMIN)
 *  2. branch.headOffice._id — ORG_ADMIN / SUPER_ADMIN: fall back to head office
 *  3. branch.branches[0]._id — if head office not yet loaded, use first branch
 *  4. "" — last resort (form validation will catch this before submission)
 *
 * Uses only already-loaded Redux state — zero API calls, zero side effects.
 */
export function useActiveBranchId(): string {
  const userBranchId  = useSelector((state: RootState) => state.auth?.user?.branchIds?.[0]);
  const headOfficeId  = useSelector((state: RootState) => state.branch?.headOffice?._id);
  const firstBranchId = useSelector((state: RootState) => state.branch?.branches?.[0]?._id);

  return userBranchId ?? headOfficeId ?? firstBranchId ?? "";
}
