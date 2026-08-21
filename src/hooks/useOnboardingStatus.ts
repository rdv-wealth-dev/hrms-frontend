import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { getOnboardingStatus, type OnboardingStatusResponse } from "../api/onboarding.api";
import { useRole } from "../auth/hooks/use-role";
import type { RootState } from "../store/rootReducer";

export type OnboardingPhase = "GRACE" | "NUDGE" | "RESTRICTED" | "COMPLETE";

export function useOnboardingStatus() {
  const { role } = useRole();
  const isOrgAdmin = role === "ORG_ADMIN";
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth?.isAuthenticated ?? false
  );

  const [statusData, setStatusData] = useState<OnboardingStatusResponse["data"] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    if (isOrgAdmin) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await getOnboardingStatus();
      if (res?.data) {
        setStatusData(res.data);
      } else {
        setError(res?.message || "Failed to load onboarding status");
      }
    } catch (err: any) {
      setError(err?.message || "Error fetching onboarding status");
    } finally {
      setLoading(false);
    }
  }, [isOrgAdmin]);

  useEffect(() => {
    if (isAuthenticated && !isOrgAdmin) {
      fetchStatus();
    } else {
      setLoading(false);
    }
  }, [fetchStatus, isOrgAdmin, isAuthenticated]);

  const isProfileComplete = isOrgAdmin ? true : (statusData?.isProfileComplete ?? statusData?.onboardingComplete ?? false);
  const phase: OnboardingPhase = isOrgAdmin ? "COMPLETE" : (statusData?.onboardingPhase ?? (isProfileComplete ? "COMPLETE" : "GRACE"));
  const completionPct = isOrgAdmin ? 100 : (statusData?.profileCompletionPct ?? (isProfileComplete ? 100 : 0));

  return {
    statusData,
    loading,
    error,
    phase,
    isProfileComplete,
    completionPct,
    refetchStatus: fetchStatus,
  };
}

export default useOnboardingStatus;
