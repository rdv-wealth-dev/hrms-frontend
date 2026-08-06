import { useState, useEffect, useCallback } from "react";
import { getOnboardingStatus, type OnboardingStatusResponse } from "../api/onboarding.api";

export type OnboardingPhase = "GRACE" | "NUDGE" | "RESTRICTED" | "COMPLETE";

export function useOnboardingStatus() {
  const [statusData, setStatusData] = useState<OnboardingStatusResponse["data"] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const isProfileComplete = statusData?.isProfileComplete ?? statusData?.onboardingComplete ?? false;
  const phase: OnboardingPhase = statusData?.onboardingPhase ?? (isProfileComplete ? "COMPLETE" : "GRACE");
  const completionPct = statusData?.profileCompletionPct ?? (isProfileComplete ? 100 : 0);

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
