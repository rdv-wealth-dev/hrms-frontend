import { useMemo } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../store/rootReducer";

export function useUserOrgData() {
  const { user, organization: authOrg, onboardingCompleted } = useSelector(
    (state: RootState) => state.auth
  );
  const storeOrg = useSelector(
    (state: RootState) => state.organization?.organization
  );

  const org = (storeOrg || authOrg || {}) as any;

  return useMemo(() => ({
    user,
    organization: org,
    onboardingCompleted,
    phone: user?.phone ?? org?.phone ?? "",
    employeeCountRange: org?.employeeCountRange ?? (org?.employeeStrength ? String(org.employeeStrength) : ""),
    countryCode: org?.locale?.countryCode ?? "",
    timezone: org?.locale?.timezone ?? "",
    baseCurrency: org?.locale?.currencyCode ?? "",
    fiscalYearStart: org?.locale?.fiscalYearStart ?? "",
    industry: org?.industry ?? "",
    companyName: org?.companyName ?? "",
    workspaceSlug: org?.workspaceSlug ?? org?.slug ?? "",
  }), [user, org, onboardingCompleted]);
}

export default useUserOrgData;

